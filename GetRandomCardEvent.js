"use strict";

module.exports = {
	Action: function(json, ws, mysqlConnection) {
		require('array-sugar');
		var jsonReply, cardAmount, query, rand;
		var cardIds = [];
		try {
			query = "SELECT idcard FROM card";
			console.log(query);
			mysqlConnection.query(query, function (err, result) {
				if (err) {
					throw err;
				} 
				else {
					cardAmount = result.length;
					result.forEach(function(item) {
							cardIds.push(item.idcard);
						} );
					console.log(cardIds);
					
				}
			});
			
			if (json.seenCards === "") {
				rand = Math.floor((Math.random() * cardIds.length));

				console.log("rand: " + rand);

				console.log("cardIds[rand]: " + cardIds[rand]);
				
			} else {
				
				
			}
			
			query = "SELECT 1 FROM card WHERE idcard = " + cardIds[rand];
			console.log(query);
			mysqlConnection.query(query , function (err, rows, fields) {
					if (err) {
						throw err;
					} 
					else {
						jsonReply = {
							event: "getRandomCard",
							cardname: rows[0].cardname,
							picture: rows[0].picture,
							rank: rows[0].rank,
							value: rows[0].value,
							email: rows[0].email,
							description: rows[0].description,
							color: rows[0].color,
							idcard: rows[0].idcard
						};
						
						console.log(JSON.stringify(jsonReply));
						ws.send(JSON.stringify(jsonReply));
					}
				});

		} catch (err) {
			console.log(err);
		}
	}
};