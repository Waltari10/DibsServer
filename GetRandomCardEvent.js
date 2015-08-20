"use strict";

module.exports = {
	Action: function(json, ws, mysqlConnection) {
		require('array-sugar');
		var jsonReply;
		var cardAmount;
		try {
			console.log("SELECT COUNT(*) AS count from card");
			mysqlConnection.query('SELECT COUNT(*) AS count from card', function (err, result) {
				if (err) {
					throw err;
				} 
				else {
					cardAmount = result[0].count;
					console.log("card count is as: " + result[0].count);
				}
			});
			
			var rand = Math.floor((Math.random() * cardAmount ) + 1 ); //Rand number between 1 and amount of cards
			console.log("rand: " + rand);
			
			while (json.cardIds.contains(rand)) {
				console.log("rand: " + rand);
				rand = Math.floor((Math.random() * cardAmount ) + 1 );
			}
			
			
			console.log("SELECT 1 FROM card WHERE idcard = " + rand);
			mysqlConnection.query("SELECT * FROM card WHERE idcard = " + rand, function (err, result) {
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
				});

				} catch (err) {
			console.log(err);
		}
	}
};