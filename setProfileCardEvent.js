"use strict";

module.exports = {
		Action: function(json, ws, mysqlConnection) {
		var query, jsonReply;
		try {
			console.log("Making new profile card");
			query = 'INSERT INTO card (cardname, picture, rank, value, email, description, color, profilecard) VALUES (' + mysqlConnection.escape(json.cardname) + ', ' + mysqlConnection.escape(json.picture) + ', ' + mysqlConnection.escape(json.rank) + ', ' + mysqlConnection.escape(json.value) + ', ' + mysqlConnection.escape(json.email) + ', ' + mysqlConnection.escape(json.description) + ', ' + mysqlConnection.escape(json.color) + ', ' + 1 + ')';
			console.log(query);
			mysqlConnection.query(query, function (err, result) {
				if (err) {
					jsonReply = {
						event: "setProfileCard",
						error: "server error on new profile card SQL"
					};
					ws.send(JSON.stringify(jsonReply));
					throw err;
				} else {
					jsonReply = {
						event: "setProfileCard"
					};
					ws.send(JSON.stringify(jsonReply));
				}
			});
		} catch (err) {
		jsonReply = {
				event: "setProfileCard",
				error: "server error on setCard"
			};
		ws.send(JSON.stringify(jsonReply));
		console.log(err);
		}
	}
};