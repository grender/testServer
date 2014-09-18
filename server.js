var https = require('https');
var connect = require('connect');
var util=require('util');

var ListenPort=10572;
var SendingRequestPort=12560;

function routes(app){
    app.get('*', saveToFile);
    app.post('*', saveToFile);
}

var server = connect.createServer()
//							.use(connect.logger())
							.use(connect.router(routes));
    server.listen(ListenPort);

var respNo=0;

function print(respNo,str)
{
	str.split("\n").forEach(function(s) {
	    console.log("Response NO:"+respNo,s);
	});
	
}
							
function saveToFile(req,res,next)
{
	respNo=respNo+1;
	print(respNo,util.format('%s %s %j',req.method,req.url,req.headers));

	var requestToNginx=https.request(
	{
		    hostname: '127.0.0.1',
		    port: SendingRequestPort,
		    path: req.url,
		    method: req.method
		},function(nginxRes) {
			print(respNo,util.format('nginx headers:%j',nginxRes.headers));
			res.writeHead(nginxRes.statusCode,nginxRes.headers);
			var data="";
		nginxRes.on('data', function (chunk) {
			data=data+chunk;
			res.write(chunk);
			});
		nginxRes.on('end', function () {
			    print(respNo,util.format('Result code:%d', nginxRes.statusCode));
			    print(respNo,util.format('%s', data));
				res.end();
			});
			nginxRes.on('error',function(e) {
				print(respNo,util.format('Nginx response error:%j', e));
			});
	    });
	requestToNginx.on('error',function(e) {
	    print(respNo,util.format('Nginx request error:%j', e));
	});
	if(req.method=="POST") {
		var data="";
		req.on('data', function (chunk) {
			data=data+chunk;
			requestToNginx.write(chunk);
		});
		req.on('end', function () {
		    requestToNginx.end();
		    print(respNo,util.format('POST DATA:%s', data));
		});
	}else
		requestToNginx.end();
	//next();
	
}