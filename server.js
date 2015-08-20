"use strict";

var StringDecoder			= require('string_decoder').StringDecoder,  //Package for decoding buffers. Needed to decode server communication and passwords from database(buffers)
	bcrypt					= require('bcrypt'),
	mysql					= require('mysql'),
	express					= require('express'),
	session					= require('express-session'),
	crypto					= require('crypto'),
	server_port				= process.env.OPENSHIFT_NODEJS_PORT || 8080,
	server_ip_address		= process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
	mysql_port				= process.env.OPENSHIFT_MYSQL_DB_PORT || 8080,
	mysql_host				= process.env.OPENSHIFT_MYSQL_DB_HOST || '127.0.0.1',
	mysql_user				= process.env.OPENSHIFT_MYSQL_DB_USERNAME || 'root',
	mysql_database			= 'dibsserver',
	decoder					= new StringDecoder('utf8'), //Client send UTF8 buffer which this is used to decode
	app						= express(),
	expressWs				= require('express-ws')(app),
	loginEvent				= require('./LoginEvent.js'),
	restoreSessionEvent		= require('./RestoreSessionEvent.js'),
	setCardEvent			= require('./SetCardEvent.js'),
	getProfileCardEvent		= require('./GetProfileCardEvent.js'),
	registerEvent			= require('./RegisterEvent.js'),
	logoutEvent				= require('./LogoutEvent.js'),
	pingEvent				= require('./PingEvent.js'),
	getRandomCardEvent 		= require('./GetRandomCardEvent'),
	toobusy 				= require('toobusy-js'),
	setProfileCardEvent		= require('./SetProfileCardEvent.js');

console.log("ip: " + server_ip_address + ":" + server_port);
console.log("mysql_ip: " + mysql_host + ":" + mysql_port);
console.log("mysql_user: " + mysql_user);
console.log("mysql_database_name: " + mysql_database);

var mysqlConnection = mysql.createConnection({ //connect to mysql database
	host		: mysql_host,
	user		: mysql_user,
	password	: process.env.OPENSHIFT_MYSQL_DB_PASSWORD || "password",
	port		: mysql_port,
	database	: mysql_database
});

module.exports = genUuid;

function genUuid(callback) {
	if (typeof (callback) !== 'function') {
		return uuidFromBytes(crypto.randomBytes(16));
	}

	crypto.randomBytes(16, function (err, rnd) {
		if (err) {
			return callback(err);
		}
		callback(null, uuidFromBytes(rnd));
	});
}

function uuidFromBytes(rnd) {
	rnd[6] = (rnd[6] & 0x0f) | 0x40;
	rnd[8] = (rnd[8] & 0x3f) | 0x80;
	rnd = rnd.toString('hex').match(/(.{8})(.{4})(.{4})(.{4})(.{12})/);
	rnd.shift();
	return rnd.join('-');
}

app.use(function(req, res, next) { //HTTP
	if (toobusy()) res.send(503, "Server busy, try again soon. Sorry for the inconvenience"); //Client doesn't receive message
	else next();
});

app.use(
	session({
	cookie: { secure: false, maxAge: null },  //True requires ssl
	maxAge: null,
	secure: false,
	resave: false,
	saveUninitialized: false,
	genid: function (req) {
		return genUuid();
	},
	secret: 'keyboard cat'
}));


app.get('/', function(req, res, next) {
  res.send('Hello World!'); //Client doesn't receive message
  next();
});

app.ws('/', function (ws, req) { //Websocket yhteys
	ws.on('close', function() { //Cant send stuff cus iz closed dummy
		console.log('closed connection');
	});

	ws.on('message', function (textChunk) {
		var message = decoder.write(textChunk), json = JSON.parse(message);
		console.log(message);
		console.log(json.event);
		
		switch(json.event) {
			case "login":
				loginEvent.Action(json, ws, req, mysqlConnection, bcrypt, decoder, RememberSession);
				break;
			case "register":
				registerEvent.Action(json, ws, req, mysqlConnection, bcrypt, RememberSession);
				break;
			case "getProfileCard":
				getProfileCardEvent.Action(json, ws, mysqlConnection);
				break;
			case "setProfileCard":
				setProfileCardEvent.Action(json, ws, mysqlConnection);
				break;
			case "getRandomCard":
				getRandomCardEvent.Action(json, ws, mysqlConnection);
				break;
			case "logout":
				logoutEvent.Action(json, ws, req);
				break;
			case "pong":
				pingEvent.Action(json, ws);
				break;
			case "restoreSession":
				restoreSessionEvent.Action(json, ws, req.sessionID, decoder, mysqlConnection);
				break;
		}
	});
});

app.listen(server_port, server_ip_address);

/*function pingClient(time, ws) {
	setInterval(function() {
		console.log("pinging client");
		var jsonReply = {
			event: "ping",
		};
		ws.send(JSON.stringify(jsonReply));
	}, time); //ping client every 10 seconds
}*/

function RememberSession (event, ws, json, sessionid) {
		var jsonReply;
		console.log('INSERT INTO session (sessionid, email) VALUES ("' + sessionid + '", ' + mysqlConnection.escape(json.email) + ')');
		mysqlConnection.query('INSERT INTO session (sessionid, email) VALUES ("' + sessionid + '", ' + mysqlConnection.escape(json.email) + ')', function (err, rows, fields)  {
			if (err) {
				jsonReply = {
					event: event,
					error: "session save server error"
				};
				ws.send(JSON.stringify(jsonReply));
				throw err;
			} else {
				return true;
			}
		});
	}