var https = require('https');
var connect = require('connect');
var util = require('util');
var connectRoute = require("connect-route");

var ListenPort = 10572;
var SendingRequestPort = 443;

function routes(app) {
	app.get('*/*', saveToFile);
	app.post('*/*', saveToFile);
}

var server = connect()

//server.use(connect.logger())
// server.use(connectRoute(routes));
server.use(saveToFile);
server.listen(ListenPort);

var respNo = 0;

function print(respNo, str) {
	str.split("\n").forEach(function(s) {
		console.log("Response NO:" + respNo, s);
	});

}

function saveToFile(req, res, next) {
	respNo = respNo + 1;
	
	console.log("VVVVVV"+ respNo + "VVVVVV")
	// print(respNo, util.format('%s %s %j', req.method, req.url, req.headers));


	req.headers.host='t.srv4pos.com'
	
	//if(!req.headers.accept)
	//	req.headers.accept="image/png,image/*;q=0.8,*/*;q=0.5"
		
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
		console.log("---response Header")
		for(h in nginxRes.headers) {
			console.log(h+":"+nginxRes.headers[h])
		}
		res.writeHead(nginxRes.statusCode, nginxRes.headers);
		var data = "";
		nginxRes.on('data', function(chunk) {
			data = data + chunk;
			res.write(chunk);
		});
		nginxRes.on('end', function() {
			// print(respNo, util.format('Result code:%d', nginxRes.statusCode));
			// print(respNo, util.format('%s', data));
			res.end();
			console.log("^^^^^^"+ respNo + "^^^^^^")
		});
		nginxRes.on('error', function(e) {
			// print(respNo, util.format('Nginx response error:%j', e));
			console.log("^^^^^^"+ respNo + "^^^^^^")
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