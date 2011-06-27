var sys = require('sys');
var fs = require('fs');
var path = require('path');
var http = require('http');
var haml = require('haml');
var connect = require('connect');
var url=require('url');
var formidable = require('formidable');

var Q = require("q");

function routes(app){
    app.post('/add', postFile);
 //   app.get('/', showBodyPage);
}

var server = connect.createServer()
							//.use(connect.logger())
							.use(connect.cookieParser())
							.use(connect.session({secret: "secret"}))
							.use(connect.bodyParser())   
							.use(connect.router(routes));
							//.use(connect.static(__dirname + "/public"));
    server.listen(8090);
							
function postFile(req,res,next)
{
	var form = new formidable.IncomingForm();
	form.uploadDir = "./tmp";
    form.on('end', function() {
        res.writeHead(200);
        res.end();
      });
	form.parse(req);
	next();
	
}