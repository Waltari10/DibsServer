"use strict";

module.exports = {
		Action: function(json, ws, mysqlConnection) {
		var jsonReply;
		try {
			if (jsonReply.profilecard == "0") {
				
				var query = 'INSERT INTO card (cardname, picture, stats, email, rank, profilecard) VALUES (' + mysqlConnection.escape(json.cardname) + ', ' + mysqlConnection.escape(json.picture) + ', ' + mysqlConnection.escape(json.stats) + ', ' + mysqlConnection.escape(json.email) + ', ' + 1 + ', ' + 0 +')';
				
				console.log(query);
				
				mysqlConnection.query(query, function (err, result) {
					if (err) {
						jsonReply = {
							event: "error",
							error: "server error on insert setCard SQL"
						};
						ws.send(JSON.stringify(jsonReply));
						throw err;
					} else {
						jsonReply = {
							event: "profileSaved"
						};
						ws.send(JSON.stringify(jsonReply));
					}
				});
			} else {
				
				var query = 'INSERT INTO card (cardname, picture, stats, email, rank, profilecard) VALUES (' 
				+ mysqlConnection.escape(json.cardname) 
				+ ', ' + mysqlConnection.escape(json.picture) 
				+ ', ' + mysqlConnection.escape(json.stats) 
				+ ', ' + mysqlConnection.escape(json.email) 
				+ ', 1'
				+ ', 1' 
				+ ') ON DUPLICATE KEY UPDATE cardname=VALUES(' + mysqlConnection.escape(json.cardname)
				+ '), picture=VALUES(' + mysqlConnection.escape(json.picture) 
				+ '), stats=VALUES(' + mysqlConnection.escape(json.stats) 
				+ '), email=VALUES(' + mysqlConnection.escape(json.email) 
				+ '), rank=VALUES(1'
				+ '), profilecard=VALUES(1' 
				+ ')';
				
				console.log(query);
				
				mysqlConnection.query(query, function (err, result) {
					if (err) {
						jsonReply = {
							event: "error",
							error: "server error on update setCard SQL"
						};
						ws.send(JSON.stringify(jsonReply));
						throw err;
					} else {
						jsonReply = {
							event: "profileSaved"
						};
						ws.send(JSON.stringify(jsonReply));
					}
				});
			}
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