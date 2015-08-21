"use strict";

module.exports = {
	Action: function(json, ws, mysqlConnection) {
		require('array-sugar');
		var jsonReply, cardAmount, query, rand;
		
		try {
			query = "SELECT idcard FROM card";
			console.log(query);
			mysqlConnection.query(query, function (err, result) {
				if (err) {
					throw err;
				} 
				else {
					cardAmount = result.length;
					var cardIds = [];
					result.forEach(function(item) {
							cardIds.push(item.idcard);
						
						} );
					console.log(cardIds);
					
				}
			});
			
			
			
			if (jsonReply.cardIds === "") {
				
				
			} else {
				rand = Math.floor((Math.random() * cardIds.length));

				console.log("rand: " + rand);

				console.log("cardIds[rand]: " + cardIds[rand]);
				
			}
			
			query = "SELECT 1 FROM card WHERE idcard = " + rand;
			console.log(query);
			mysqlConnection.query(query , function (err, result) {
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
						
						console.log("idcard: " + result[0].idcard);
						console.log("cardname: " + result[0].cardname);
						console.log("picture: " + result[0].picture);
						console.log("stats: " + result[0].stats);
						console.log("email: " + result[0].email);
						
						console.log(JSON.stringify(jsonReply));
						ws.send(JSON.stringify(jsonReply));
					}
				});

		} catch (err) {
			console.log(err);
		}
	}
};