"use strict";

module.exports = {
	Action: function(json, ws, mysqlConnection) {
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
					for (var i = 0; i < result.length; i++) {
						cardIds.push(result[i].idcard);
					}
					rand = Math.floor((Math.random() * cardIds.length));
					
					if (json.seenCards.length < cardIds.length) {  //If user has already seen all cards just give him an old one at random
						if (json.seenCards.length !== 0 || json.seenCards !== "") {
							while(json.seenCards.contains(cardIds[rand])) {
								rand = Math.floor((Math.random() * cardIds.length));
								console.log(rand);
							}
						}
					}
					getCardById();
					
					
				}
			});
		} catch (err) {
			console.log(err);
		}
		
		////////////////////////////////////////////////////////////////////////////////////////////////////
		
		function getCardById() {
			
			query = "SELECT * FROM card WHERE idcard = " + cardIds[rand];
			console.log(query);
			
			mysqlConnection.query(query , function (err, rows, fields) {
				if (err) {
					throw err;
				} 
				else {
					jsonReply = {
						event: "getRandomCard",
						cardname: rows[0].cardname,
						rank: rows[0].rank,
						value: rows[0].value,
						email: rows[0].email,
						description: rows[0].description,
						color: rows[0].color,
						idcard: rows[0].idcard,
						picture: rows[0].picture
					};
					
					//console.log(JSON.stringify(jsonReply));
					ws.send(JSON.stringify(jsonReply));
				}
			});
		}
	}
};