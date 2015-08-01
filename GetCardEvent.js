"use strict";

module.exports = {
	Action: function(json, ws, mysqlConnection) {
		var jsonReply;
		try {
			console.log('SELECT * FROM card WHERE email = ' + mysqlConnection.escape(json.email));
			mysqlConnection.query('SELECT * FROM card WHERE email = ' + mysqlConnection.escape(json.email), function (err, rows, fields) {
				if (err) {
					throw err;
				}
				if (fields.length !== 0) {
					jsonReply = {
						event: "getCard",
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
						error: "no card on getCard"
					};
					ws.send(JSON.stringify(jsonReply));
				}
			});
		} catch (err) {
			jsonReply = {
					event: "error",
					error: "server error on getCard"
				};
			ws.send(JSON.stringify(jsonReply));
			console.log(err);
		}
	}
}