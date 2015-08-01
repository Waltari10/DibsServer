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
						error: "server error on setCard SQL"
					};
					ws.send(JSON.stringify(jsonReply));
					throw err;
				} else {
					jsonReply = {
						event: "setCard"
					};
					ws.send(JSON.stringify(jsonReply));
				}
			});
		} catch (err) {
			jsonReply = {
					event: "error",
					error: "server error on setCard"
				};
			ws.send(JSON.stringify(jsonReply));
			console.log(err);
		}
	}
};