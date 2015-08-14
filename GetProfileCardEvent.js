"use strict";

module.exports = {
	Action: function(json, ws, mysqlConnection) {
		var jsonReply, query;
		try {
			query = 'SELECT * FROM card WHERE email = ' + mysqlConnection.escape(json.email) + ' AND profilecard = 1';
			console.log(query);
			mysqlConnection.query(query, function (err, rows, fields) {
				if (err) {
					throw err;
				}
				if (fields.length !== 0) {
					
					var pictureBuffer = new buffer(rows[0].picture);  //Transforming picture from blob binary array to base64 string
					var pictureBase64 = buffer.toString('base64');
					
					console.log(pictureBase64);
					
					jsonReply = {
						event: "getProfileCard",
						cardname: rows[0].cardname,
						picture: pictureBase64,
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