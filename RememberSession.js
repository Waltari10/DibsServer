"use strict";

module.exports = {
	Action: function(event, ws, json, sessionid, mysqlConnection) {
		var jsonReply;
		console.log('INSERT INTO session (sessionid, email) VALUES ("' + sessionid + '", ' + mysqlConnection.escape(json.email) + ')');
		mysqlConnection.query('INSERT INTO session (sessionid, email) VALUES ("' + sessionid + '", ' + mysqlConnection.escape(json.email) + ')', function (err, rows, fields)  {
			if (err) {
				jsonReply = {
					event: event,
					error: "session save server error"
				};
				ws.send(JSON.stringify(jsonReply));
				throw err;
			} else {
				return true;
			}
		});
	}
};