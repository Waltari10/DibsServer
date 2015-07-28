"use strict";

module.exports = {
	Action: function (json, ws, req, mysqlConnection, bcrypt, decoder, rememberSession) {
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
}