/* inclide the static file webserver library */

var static = require('node-static');

/*Include http server library */

var http = require('http');

/* Assume that we are running on Heroku*/

var port = process.env.PORT;
var directory = __dirname +'/public';

/* If we aren't on Heroku then we need to readjust the port and directory information and we know that because port won't be set */
if(typeof port == 'undefined' || !port){
	director = './public';
	port = 8080;
}

/* set up a static web-server that will deliver files from the filesystem */
var file = new static.Server(directory);

/*Construct an http server that gets file from the file server */
var app = http.createServer(
		function(request, response){
			request.addListener('end',
				function(){
					file.serve(request, response);
				}
			).resume();
		}
	).listen(port);	

console.log('The server is running');

/*****************************************/
/*Set up the web socket server*/

var io = require('socket.io').listen(app);

io.sockets.on('connection',function(socket){
	function log(arguments){
		var array = ['*** Server Log Message: '];
		for(var i = 0; i <arguments.length; i++){
			array.push(arguments[i]);
			console.log(arguments[i]);
		}
		socket.emit('log', array);
		socket.broadcast.emit('log', array);
	}
	log(['A website connected to the server']);

	socket.on('disconnect', function(socket){
		log(['A website disconnected from the server']);
	})

	/*this is the join room command*/
	socket.on('join_room', function(payload){
		log('server received a command', 'join_room',payload);
		if(('undefined' === typeof payload) || !payload){
			var error_message = 'join_room had no payload, command aboarted';
			log(error_message);
			socket.emit('join_room_response',	{
													result: 'fail',
													message: error_messagel
												});
			return;
		}
		var room = payload.room; 
		if(('undefined' === typeof room) || !room){
			var error_message = 'join_room did not specify a room, command aboarted';
			log(error_message);
			socket.emit('join_room_response',	{
													result: 'fail',
													message: error_messagel
												});
			return;
		}
		var username = payload.username; 
		if(('undefined' === typeof username) || !username){
			var error_message = 'join_room did not specify a username, command aboarted';
			log(error_message);
			socket.emit('join_room_response',	{
													result: 'fail',
													message: error_messagel
												});
			return;
		}
		socket.join(room);
		var roomObject = io.sockets.adapter.rooms[room]; 
		if(('undefined' === typeof roomObject) || !roomObject){
			var error_message = 'join_room could not create a room (internal error), command aboarted';
			log(error_message);
			socket.emit('join_room_response',	{
													result: 'fail',
													message: error_messagel
												});
			return;
		}

		var numClients = roomObject.length;
		var success_data = {
								result: 'success',
								room: room,
								username: username,
								membership: (numClients +1),
							};
		io.sockets.in(room).emit('join_room_response',success_data);
		log ('Room '+ room + ' was just joined by '+username);
	});

/*Send message command*/
	socket.on('send_message', function(payload){
		log('server received a command', 'send_message',payload);
		if(('undefined' === typeof payload) || !payload){
			var error_message = 'send_message had no payload, command aboarted';
			log(error_message);
			socket.emit('send_message_response',	{
													result: 'fail',
													message: error_messagel
												});
			return;
		}
		var room = payload.room; 
		if(('undefined' === typeof room) || !room){
			var error_message = 'send_message did not specify a room, command aboarted';
			log(error_message);
			socket.emit('send_message_response',	{
													result: 'fail',
													message: error_messagel
												});
			return;
		}
		var username = payload.username; 
		if(('undefined' === typeof username) || !username){
			var error_message = 'send_message did not specify a username, command aboarted';
			log(error_message);
			socket.emit('send_message_response',	{
													result: 'fail',
													message: error_messagel
												});
			return;
		}
		var message = payload.message; 
		if(('undefined' === typeof message) || !message){
			var error_message = 'send_message did not specify a message, command aboarted';
			log(error_message);
			socket.emit('send_message_response',	{
													result: 'fail',
													message: error_messagel
												});
			return;
		}

		var success_data = 	{
								result: 'success',
								room: room,
								username: username,
								message: message
							};
		io.sockets.in(room).emit('send_message_response',success_data);
		log('Message sent to room '+ room + ' by ' +username)
	});
});