"use strict";

module.exports = {
	Action: function(json, ws, mysqlConnection) {
		var jsonReply, query;
		try {
			query = 'SELECT * FROM card WHERE email = ' + mysqlConnection.escape(json.email) + ', AND profileCard = 1';
			console.log(query);
			mysqlConnection.query(query, function (err, rows, fields) {
				if (err) {
					throw err;
				}
				if (fields.length !== 0) {
					jsonReply = {
						event: "getProfileCard",
						cardname: rows[0].cardname,
						picture: rows[0].picture,
						rank: rows[0].rank,
						value: rows[0].value,
						email: rows[0].email,
						description: rows[0].description,
						color: rows[0].color
					};
					console.log(JSON.stringify(jsonReply));
					ws.send(JSON.stringify(jsonReply));
				} else { //ProfileCard with given email doesn't exist
					jsonReply = {
						event: "getProfileCard",
						error: "no profileCard set"
					};
					ws.send(JSON.stringify(jsonReply));
				}
			});
		} catch (err) {
			jsonReply = {
					event: "getProfileCard",
					error: "server error on getCard"
				};
			ws.send(JSON.stringify(jsonReply));
			console.log(err);
		}
	}
}