"use strict";

var StringDecoder		= require('string_decoder').StringDecoder,  //Package for decoding buffers. Needed to decode server communication and passwords from database(buffers)
	bcrypt				= require('bcrypt'),
	mysql				= require('mysql'),
	express				= require('express'),
	session				= require('express-session'),
	crypto				= require('crypto'),
	server_port			= process.env.OPENSHIFT_NODEJS_PORT || 8080,
	server_ip_address	= process.env.OPENSHIFT_NODEJS_IP || '127.0.0.1',
	mysql_port			= process.env.OPENSHIFT_MYSQL_DB_PORT || 8080,
	mysql_host			= process.env.OPENSHIFT_MYSQL_DB_HOST || '127.0.0.1',
	mysql_user			= process.env.OPENSHIFT_MYSQL_DB_USERNAME || 'root',
	mysql_database		= 'dibsserver',
	decoder				= new StringDecoder('utf8'), //Client send UTF8 buffer which this is used to decode
	app					= express(),
	expressWs			= require('express-ws')(app);

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

app.use(function (req, res, next) {
	console.log("middleware");
	console.log(req.sessionID);
	
	
	return next();
});



app.ws('/', function (ws, req) {
	ws.on('message', function (textChunk) {
		var message = decoder.write(textChunk), json = JSON.parse(message);
		console.log(message);
		console.log(json.event);
		if (json.event === "login") {
			loginEvent(json, ws, req);
		} else if (json.event === "register") {
			registerEvent(json, ws, req);
		} else if (json.event === "getProfile") {
			getProfileEvent(json, ws);
		} else if (json.event === "setProfile") {
			setProfileEvent(json, ws);
		} else if (json.event === "logout") {
			logoutEvent(json, ws, req);
		} else if (json.event === "ping") {
			pingEvent(json, ws);
		} else if (json.event === "restoresession") {
			restoreSessionEvent(json, ws, req.sessionID);
		}
	});
});

app.listen(server_port, server_ip_address);

function restoreSessionEvent(json, ws, sessionID) {
	var jsonReply;
	mysqlConnection.query('SELECT * FROM session WHERE sessionid = ' + mysqlConnection.escape(json.sessionid), function (err, rows, fields) {
			if (err) {
				throw err;
			}
			if (rows.length !== 0) {
					jsonReply = {
						event: "restoresession",
						sessionid: sessionID
					};
					ws.send(JSON.stringify(jsonReply));
			} else {
				jsonReply = {
						event: "restoreSession",
						error: "sessionid not found"
					};
				ws.send(JSON.stringify(jsonReply));
			}
		});
}

function pingEvent(json, ws) {
	console.log("ping event");
	var jsonReply;
	try {
		jsonReply = {
				event: "pong"
			};
		ws.send(JSON.stringify(jsonReply));
	} catch (err) {
		jsonReply = {
				event: "error",
				error: "server error on pong"
			};
		ws.send(JSON.stringify(jsonReply));
		console.log(err);
	}
}

function logoutEvent(json, ws, req) {
	var jsonReply;
	try {
		req.session.destroy(function(err) {
			if (err) {
				throw err;
			}
                });
		jsonReply = {
				event: "logout"
			};
		ws.send(JSON.stringify(jsonReply));
	} catch (err) {
		jsonReply = {
				event: "error",
				error: "server error on logout"
			};
		ws.send(JSON.stringify(jsonReply));
		console.log(err);
	}
}

function rememberSession(event, ws, json, sessionid) {
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

function loginEvent(json, ws, req) {
	var jsonReply;
	try {
		console.log("query: " + 'SELECT * FROM user WHERE email = ' + mysqlConnection.escape(json.email));
		mysqlConnection.query('SELECT * FROM user WHERE email = ' + mysqlConnection.escape(json.email), function (err, rows, fields) {
			if (err) {
				throw err;
			}
			if (rows.length !== 0) {
				if (bcrypt.compareSync(json.password, decoder.write(rows[0].password))) {
					
					rememberSession("login", ws, json, req.sessionID);
					jsonReply = {
						event: "login",
						email: json.email,
						sessionid: req.sessionID
					};
					ws.send(JSON.stringify(jsonReply));
				} else {
					jsonReply = {
						event: "login",
						error: "wrong password"
					};
					ws.send(JSON.stringify(jsonReply));
				}
			} else {
				jsonReply = {
						event: "login",
						error: "wrong email"
					};
				ws.send(JSON.stringify(jsonReply));
			}
		});
	} catch (err) {
		jsonReply = {
				event: "login",
				error: "server error"
			};
		ws.send(JSON.stringify(jsonReply));
		console.log(err);
	}
}

function registerEvent(json, ws, req) {
	var jsonReply;
	try {
		var salt = bcrypt.genSaltSync(10);
		console.log('SELECT 1 FROM user WHERE email = ' + mysqlConnection.escape(json.email));
		mysqlConnection.query('SELECT 1 FROM user WHERE email= ' + mysqlConnection.escape(json.email), function (err, fields, rows) {
			if (err) {
				throw err;
			}
			if (fields.length === 0) { //user with this email doesn't exist
				console.log('INSERT INTO user (email, nickname, password) VALUES (' + mysqlConnection.escape(json.email) + ', ' + mysqlConnection.escape(json.nickname) + ', "' + bcrypt.hashSync(json.password, salt) + '")');
				mysqlConnection.query('INSERT INTO user (email, nickname, password) VALUES (' + mysqlConnection.escape(json.email) + ', ' + mysqlConnection.escape(json.nickname) + ', "' + bcrypt.hashSync(json.password, salt) + '")', function (err, result) {
					if (err) {
						jsonReply = {
							event: "register",
							error: "server error"
						};
						ws.send(JSON.stringify(jsonReply));
						throw err;
					} else {
						rememberSession("register", ws, json, req.sessionID);
						jsonReply = {
							event: "register",
							email: json.email,
							sessionid: req.sessionID
						};
						ws.send(JSON.stringify(jsonReply));
					}
				});
			} else {
				jsonReply = {
						event: "register",
						error: "email taken"
					};
				ws.send(JSON.stringify(jsonReply));
			}
		});

	} catch (err) {
		var jsonReply = {
				event: "register",
				error: "server error"
			};
		ws.send(JSON.stringify(jsonReply));
		console.log(err);
	}
}

function getProfileEvent(json, ws) {
	var jsonReply;
	try {
		console.log('SELECT * FROM card WHERE email = ' + mysqlConnection.escape(json.email));
		mysqlConnection.query('SELECT * FROM card WHERE email = ' + mysqlConnection.escape(json.email), function (err, rows, fields) {
			if (err) {
				throw err;
			}
			
			if (fields.length !== 0) {
				jsonReply = {
					event: "getProfile",
					cardname: rows[0].cardname,
					picture: rows[0].picture,
					stats: rows[0].stats,
					email: rows[0].email
				};
				console.log(JSON.stringify(jsonReply));
				ws.send(JSON.stringify(jsonReply));
			} else { //Profile with given email doesn't exist
				jsonReply = {
					event: "error",
					error: "no profile on getProfile"
				};
				ws.send(JSON.stringify(jsonReply));
			}
		});
	} catch (err) {
		jsonReply = {
				event: "error",
				error: "server error on getProfile"
			};
		ws.send(JSON.stringify(jsonReply));
		console.log(err);
	}
}

function setProfileEvent(json, ws) {
	var jsonReply;
	try {
		console.log('INSERT INTO card (cardname, picture, stats, email) VALUES (' + mysqlConnection.escape(json.cardname) + ', ' + mysqlConnection.escape(json.picture) + ', ' + mysqlConnection.escape(json.stats) + ', ' + mysqlConnection.escape(json.email) + ')');
		mysqlConnection.query('INSERT INTO card (cardname, picture, stats, email) VALUES (' + mysqlConnection.escape(json.cardname) + ', ' + mysqlConnection.escape(json.picture) + ', ' + mysqlConnection.escape(json.stats) + ', ' + mysqlConnection.escape(json.email) + ')', function (err, result) {
			if (err) {
				jsonReply = {
					event: "error",
					error: "server error on setProfile SQL"
				};
				ws.send(JSON.stringify(jsonReply));
				throw err;
			} else {
				jsonReply = {
					event: "setProfile",
					error: "true"
				};
				ws.send(JSON.stringify(jsonReply));
			}
		});
	} catch (err) {
		jsonReply = {
				event: "error",
				error: "server error on setProfile"
			};
		ws.send(JSON.stringify(jsonReply));
		console.log(err);
	}
}