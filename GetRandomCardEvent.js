"use strict";

module.exports = {
	Action: function(json, ws, mysqlConnection) {
		require('array-sugar');
		var jsonReply, cardAmount, query;
		var cardAmount;
		try {
			query = "SELECT idcard FROM card";
			console.log(query);
			mysqlConnection.query(query, function (err, result) {
				if (err) {
					throw err;
				} 
				else {
					console.log(result);
					cardAmount = result.length;
					console.log(cardAmount);
				}
			});
			
		/*	query = "SELECT 1 FROM card WHERE idcard = " + rand;
			console.log(query);
			mysqlConnection.query(query , function (err, result) {
					if (err) {
						throw err;
					} 
					else {
						jsonReply = {
							event: "getRandomCard",
							idcard: result[0].idcard,
							cardname: result[0].cardname,
							picture: result[0].picture,
							stats: result[0].stats,
							email: result[0].email
						};
						
						console.log("idcard: " + result[0].idcard);
						console.log("cardname: " + result[0].cardname);
						console.log("picture: " + result[0].picture);
						console.log("stats: " + result[0].stats);
						console.log("email: " + result[0].email);
						
						console.log(JSON.stringify(jsonReply));
						ws.send(JSON.stringify(jsonReply));
					}
				});*/

		} catch (err) {
			console.log(err);
		}
	}
};