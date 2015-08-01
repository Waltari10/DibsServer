"use strict";

module.exports = {
	Action: function(json, ws, mysqlConnection) {
		
		var Type = require('type-of-is');
		
		var jsonReply;
		try {
			console.log("SELECT COUNT(*) from card AS count");
			mysqlConnection.query('SELECT COUNT(*) from card AS count', function (err, result) {
				if (err) {
					throw err;
				} 
				else {
					console.log(Type.of(result));
					console.log("card count is as: " + result[0].count);
					console.log("Card count is: " + result["COUNT(*)"]);
					console.log(result);
					console.log(result[0]);
				}
			});
		} catch (err) {
			console.log(err);
		}
	}
};