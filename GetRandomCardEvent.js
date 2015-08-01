"use strict";

module.exports = {
	Action: function(json, ws, mysqlConnection) {
		
		var Type = require('type-of-is');
		
		var jsonReply;
		try {
			console.log("SELECT COUNT(*) AS count from card");
			mysqlConnection.query('SELECT COUNT(*) AS count from card', function (err, result) {
				if (err) {
					throw err;
				} 
				else {
					console.log(Type.of(result));
					console.log("card count is as: " + result[0].count);
					console.log("Card count is: " + result["COUNT(*)"]);
					console.log(result.count);
					console.log(result[0].count);
					console.log(result[0]['COUNT(*)']);
				}
			});
		} catch (err) {
			console.log(err);
		}
	}
};