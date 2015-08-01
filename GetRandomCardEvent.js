"use strict";

module.exports = {
	Action: function(json, ws, mysqlConnection) {
		var jsonReply;
		try {
			console.log("SELECT COUNT(*) from card");
			mysqlConnection.query('SELECT COUNT(*) from card', function (err, result) {
				if (err) {
					throw err;
				} 
				else {
					console.log("Card count is" + result);
				}
			});
		} catch (err) {
			console.log(err);
		}
	}
};