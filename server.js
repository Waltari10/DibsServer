"use strict";

var StringDecoder		= require('string_decoder').StringDecoder; //Package for decoding buffers. Needed to decode server communication and passwords from database(buffers)
var bcryp				= require('bcrypt');
var mysql				= require('mysql');
var express				= require('express');
var session				= require('express-session');
var crypto				= require('crypto');

var server_port			= process.env.OPENSHIFT_NODEJS_PORT || 8080;
var server_ip_address	= process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1';
var mysql_port			= process.env.OPENSHIFT_MYSQL_DB_PORT || 8080;
var mysql_host			= process.env.OPENSHIFT_MYSQL_DB_HOST || '127.0.0.1';
var mysql_user			= process.env.OPENSHIFT_MYSQL_DB_USERNAME || 'root';
var mysql_database		= 'dibsserver';
var decoder				= new StringDecoder('utf8'); //Client send UTF8 buffer which this is used to decode
var app					= express();
var expressWs			= require('express-ws')(app);

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

app.use(session({
	maxAge: null,
	secure: false,
	resave: false,
	saveUninitialized: false,
	genid: function (req) {
		return genUuid();
	},
	secret: 'keyboard cat'
}));

app.use(function (req, res, next) {
	console.log('middleware');
	req.testing = 'testing';
	return next();
});

app.ws('/', function (ws, req) {
	ws.on('message', function (textChunk) {
		var message = decoder.write(textChunk), json = JSON.parse(message);
		console.log(message);
		console.log(json.event);
		if (json.event === "login") {
			loginEvent(json, ws);
		} else if (json.event === "register") {
			registerEvent(json, ws);
		} else if (json.event === "getProfile") {
			getProfileEvent(json, ws);
		} else if (json.event === "setProfile") {
			setProfileEvent(json, ws);
		}
	});
});

app.listen(server_port, server_ip_address);

function loginEvent(json, ws) {
	try {
		console.log("query: " + 'SELECT * FROM user WHERE email = ' + mysqlConnection.escape(json.email));
		mysqlConnection.query('SELECT * FROM user WHERE email = ' + mysqlConnection.escape(json.email), function (err, rows, fields) {
			if (err) {
				throw err;
			}
			if (rows.length !== 0) {
				if (bcrypt.compareSync(json.password, decoder.write(rows[0].password))) {
					var jsonReply = {
						email: json.email
					};
					ws.send(JSON.stringify(jsonReply));
				} else {
					var jsonReply = {
						error: "wrong password"
					};
					ws.send(JSON.stringify(jsonReply));
				}
			} else {
				var jsonReply = {
						error: "wrong email"
					};
				ws.send(JSON.stringify(jsonReply));
			}
		});
	} catch (err) {
		var jsonReply = {
				error: "server error"
			};
		ws.send(JSON.stringify(jsonReply));
		console.log(err);
	}
}

function registerEvent(json, ws) {
	try {
		var salt = bcrypt.genSaltSync(10);
		console.log('SELECT 1 FROM user WHERE email = ' + mysqlConnection.escape(json.email));
		mysqlConnection.query('SELECT 1 FROM user WHERE email= ' + mysqlConnection.escape(json.email), function (err, fields, rows) {
			if (err) {
				throw err;
			}
			if (fields.length === 0) { //user with this email doesn't exist
				console.log('INSERT INTO user (email, nickname, password) VALUES (' + mysqlConnection.escape(json.email) + ', ' + mysqlConnection.escape(json.nickname) + ', "' + bcrypt.hashSync(json.password, salt) + '"');
				mysqlConnection.query('INSERT INTO user (email, nickname, password) VALUES (' + mysqlConnection.escape(json.email) + ', ' + mysqlConnection.escape(json.nickname) + ', "' + bcrypt.hashSync(json.password, salt) + '")', function (err, result) {
					if (err) {
						var jsonReply = {
							error: "server error"
						};
						ws.send(JSON.stringify(jsonReply));
						throw err;
					} else {
						var jsonReply = {
							email: json.email
						};
						ws.send(JSON.stringify(jsonReply));
					}
				});
			} else {
				var jsonReply = {
						error: "email taken"
					};
				ws.send(JSON.stringify(jsonReply));
			}
		});

	} catch (err) {
		var jsonReply = {
				error: "server error"
			};
		ws.send(JSON.stringify(jsonReply));
		console.log(err);
	}
}

function getProfileEvent(json, ws) {
	try {
		console.log('SELECT * FROM card WHERE email = ' + mysqlConnection.escape(json.email));
		mysqlConnection.query('SELECT * FROM card WHERE email = ' + mysqlConnection.escape(json.email), function (err, rows, fields) {
			if (err) {
				throw err;
			}
			if (fields.length !== 0) {
				var jsonReply = {
					cardname: rows[0].cardname,
					picture: rows[0].picture,
					stats: rows[0].stats,
					email: rows[0].email
				};
				console.log(JSON.stringify(jsonReply));
				ws.send(JSON.stringify(jsonReply));
			} else { //Profile with given email doesn't exist
				var jsonReply = {
					error: "no profile"
				};
				ws.send(JSON.stringify(jsonReply));
			}
		});
	} catch (err) {
		var jsonReply = {
				error: "server error"
			};
		ws.send(JSON.stringify(jsonReply));
		console.log(err);
	}
}

function setProfileEvent(json, ws) {
	try {
		console.log('INSERT INTO card (cardname, picture, stats, email) VALUES (' + mysqlConnection.escape(json.cardname) + ', ' + mysqlConnection.escape(json.picture) + ', ' + mysqlConnection.escape(json.stats) + ', ' + mysqlConnection.escape(json.email) + ')');
		mysqlConnection.query('INSERT INTO card (cardname, picture, stats, email) VALUES (' + mysqlConnection.escape(json.cardname) + ', ' + mysqlConnection.escape(json.picture) + ', ' + mysqlConnection.escape(json.stats) + ', ' + mysqlConnection.escape(json.email) + ')', function (err, result) {
			if (err) {
				var jsonReply = {
					error: "false"
				};
				ws.send(JSON.stringify(jsonReply));
				throw err;
			} else {
				var jsonReply = {
					error: "true"
				};
				ws.send(JSON.stringify(jsonReply));
			}
		});
	} catch (err) {
		var jsonReply = {
				error: "server error"
			};
		ws.send(JSON.stringify(jsonReply));
		console.log(err);
	}
}

