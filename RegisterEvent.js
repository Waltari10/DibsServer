"use strict";



module.exports = {
	Action: function(json, ws, req, mysqlConnection, bcrypt, RememberSession) {
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
							new RememberSession("register", ws, json, req.sessionID);
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
};