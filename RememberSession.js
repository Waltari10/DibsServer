"use strict";

module.exports = {
	Action: function(event, ws, json, sessionid, mysqlConnection) {
		var jsonReply, query;
		query = 'INSERT INTO session (sessionid, email) VALUES ("' + sessionid + '", ' + mysqlConnection.escape(json.email) + ')';
		console.log(query);
		mysqlConnection.query(query, function (err, rows, fields)  {
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