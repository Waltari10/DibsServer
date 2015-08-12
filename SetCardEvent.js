"use strict";

module.exports = {
	Action: function(json, ws, mysqlConnection) {
	var query, jsonReply;
	try {
			console.log("Making new regular card");
			query = 'INSERT INTO card (cardname, picture, stats, email, rank, profilecard) VALUES (' + mysqlConnection.escape(json.cardname) + ', ' + mysqlConnection.escape(json.picture) + ', ' + mysqlConnection.escape(json.stats) + ', ' + mysqlConnection.escape(json.email) + ', ' + mysqlConnection.escape(json.email) + ', ' + 0 +')';
			
			console.log(query);
			
			mysqlConnection.query(query, function (err, result) {
				if (err) {
					jsonReply = {
						event: "error",
						error: "server error on new regular card SQL"
					};
					ws.send(JSON.stringify(jsonReply));
					throw err;
				} else {
					jsonReply = {
						event: "cardSaved"
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