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
					
					for (var i = 0; i < result.length; i++) {
						cardIds.push(result[i].idcard);
					}
					
					if (json.seenCards === "") {
						rand = Math.floor((Math.random() * cardIds.length));
						getCardById(cardIds);
						
					} else {
						
						
					}
					
					
				}
			});
		} catch (err) {
			console.log(err);
		}
		
		////////////////////////////////////////////////////////////////////////////////////////////////////
		
		function getCardById(cardIds) {
			
			query = "SELECT * FROM card WHERE idcard = " + cardIds[rand];
			console.log(query);
			
			mysqlConnection.query(query , function (err, rows, fields) {
				if (err) {
					throw err;
				} 
				else {
					console.log("sql rows: ");
					console.log(rows);
					
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
		}
	}
};