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
	var cookie = req.cookies.cokkieName;
	if (cookie === undefined)
	{
		// no: set a new cookie
		var randomNumber=Math.random().toString();
		randomNumber=randomNumber.substring(2,randomNumber.length);
		res.cookie('cokkieName',randomNumber, { maxAge: 900000, httpOnly: true });
		console.log('cookie have created successfully');
	} 
	else
	{
		// yes, cookie was already present 
		console.log('cookie exists', cookie);
	} 
  
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
	var jsonReply;
	try {
		console.log("query: " + 'SELECT * FROM user WHERE email = ' + mysqlConnection.escape(json.email));
		mysqlConnection.query('SELECT * FROM user WHERE email = ' + mysqlConnection.escape(json.email), function (err, rows, fields) {
			if (err) {
				throw err;
			}
			if (rows.length !== 0) {
				
				if (bcrypt.compareSync(json.password, decoder.write(rows[0].password))) {
					jsonReply = {
						event: "login",
						email: json.email
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

function registerEvent(json, ws) {
	var jsonReply;
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
						jsonReply = {
							event: "register",
							error: "server error"
						};
						ws.send(JSON.stringify(jsonReply));
						throw err;
					} else {
						jsonReply = {
							event: "register",
							email: json.email
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
					event: "getProfile",
					error: "no profile"
				};
				ws.send(JSON.stringify(jsonReply));
			}
		});
	} catch (err) {
		jsonReply = {
				event: "getProfile",
				error: "server error"
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
					event: "setProfile",
					error: "false"
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
				event: "setProfile",
				error: "server error"
			};
		ws.send(JSON.stringify(jsonReply));
		console.log(err);
	}
}