"use strict";

module.exports = {
	Action: function (json, ws, req, mysqlConnection, bcrypt, decoder, RememberSession) {
		var jsonReply;
		try {
			console.log("query: " + 'SELECT * FROM user WHERE email = ' + mysqlConnection.escape(json.email));
			mysqlConnection.query('SELECT * FROM user WHERE email = ' + mysqlConnection.escape(json.email), function (err, rows, fields) {
				if (err) {
					throw err;
				}
				if (rows.length !== 0) {
					if (bcrypt.compareSync(json.password, decoder.write(rows[0].password))) {
						
						mysqlConnection.query('SELECT * FROM card WHERE email = ' + mysqlConnection.escape(json.email), function (err, rows, fields) { //Check if user has a profile card
						if (err) {
							jsonReply = {
									event: "error",
									error: "server error on checking whether cards exist"
								};
							ws.send(JSON.stringify(jsonReply));
							throw err;
						}
						
						if (rows.length === 0) {  //No profile card set
							jsonReply = {
							event: "login",
							email: json.email,
							sessionid: req.sessionID,
							profile: false
						};
						} else {
							jsonReply = {
							event: "login",
							email: json.email,
							sessionid: req.sessionID,
							profile: true
							};
						}
						ws.send(JSON.stringify(jsonReply));
						new RememberSession("login", ws, json, req.sessionID, mysqlConnection);
						});
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
	
	
};
