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