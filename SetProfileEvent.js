"use strict";

module.exports = {
		Action: function(json, ws, mysqlConnection) {
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
};