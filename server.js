var https = require('https');
var connect = require('connect');
var util = require('util');
var connectRoute = require("connect-route");
var fs = require('fs');

var ListenAddress= process.env.OPENSHIFT_NODEJS_IP;
var ListenPort   = process.env.OPENSHIFT_NODEJS_PORT || 10572;
if(ListenAddress===undefined)
  ListenAddress="127.0.0.1"
var SendingRequestPort = 443;

function routes(app) {
	app.get('*/*', saveToFile);
	app.post('*/*', saveToFile);
}

var server = connect()

//server.use(connect.logger())
// server.use(connectRoute(routes));
server.use(saveToFile);
server.listen(ListenPort,ListenAddress);

var respNo = 0;

function print(respNo, str) {
	str.split("\n").forEach(function(s) {
		console.log("Response NO:" + respNo, s);
	});

}

function saveToFile(reqA, resA, next) {
	var req=reqA
	var res=resA
	respNo = respNo + 1;
	
	console.log("VVVVVV"+ respNo + "VVVVVV")
	// print(respNo, util.format('%s %s %j', req.method, req.url, req.headers));


	req.headers.host='t.srv4pos.com'
	
	//if(!req.headers.accept)
	//	req.headers.accept="image/png,image/*;q=0.8,*/*;q=0.5"
		
	var isImage=req.url.indexOf("images")>-1
	console.log("---request Header")
	for(h in req.headers) {
		console.log(h+":"+req.headers[h])
	}
	var requestToNginx = https.request({
		hostname : 't.srv4pos.com',
		port : SendingRequestPort,
		path : req.url,
		method : req.method,
		headers: req.headers
	}, function(nginxRes) {
		// print(respNo, util.format('nginx headers:%j', nginxRes.headers));
		console.log(nginxRes.statusCode)
		console.log("---response Header")
		for(h in nginxRes.headers) {
			console.log(h+":"+nginxRes.headers[h])
		}
		//res.writeHead(nginxRes.statusCode,nginxRes.headers);
		res.writeHead(nginxRes.statusCode)
		var data = "";
		var buffer=new Buffer(0,'binary')
		nginxRes.on('data', function(chunk) {
			data = data + chunk;
			buffer=Buffer.concat([buffer,chunk])		
		});
		nginxRes.on('end', function() {
			// print(respNo, util.format('Result code:%d', nginxRes.statusCode));
			// print(respNo, util.format('%s', data));
			// console.log(buffer)
			
			parsedBuffer=buffer
			if(isImage) {
			 parsedBuffer=new Buffer(parsedBuffer.toString("utf-8"),'base64')		
			}
			res.write(parsedBuffer);
			fs.writeFileSync("C:\\Users\\webDev\\Documents\\"+respNo+".png", parsedBuffer);
			res.end();
			console.log("^^^^^^"+ respNo + "^^^^^^")
		});
		nginxRes.on('error', function(e) {
			// print(respNo, util.format('Nginx response error:%j', e));
			console.log("^^ERR "+ respNo + "^^^^^^")
		});
	});
	requestToNginx.on('error', function(e) {
		// print(respNo, util.format('Nginx request error:%j', e));
		console.log("^^^^^^"+ respNo + "^^^^^^")
	});
	if (req.method == "POST") {
		var data = "";
		req.on('data', function(chunk) {
			data = data + chunk;
			requestToNginx.write(chunk);
		});
		req.on('end', function() {
			requestToNginx.end();
			// print(respNo, util.format('POST DATA:%s', data));
		});
	} else {
		requestToNginx.end();
	}
	//next();

}