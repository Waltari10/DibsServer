"use strict";

function restoreSessionEvent(json, ws, sessionID) {
	var jsonReply;
	console.log('SELECT * FROM session WHERE sessionid = "' + decoder.write(json.sessionid) + '"');
	mysqlConnection.query('SELECT * FROM session WHERE sessionid = "' + decoder.write(json.sessionid) + '"', function (err, rows, fields) {
			if (err) {
				jsonReply = {
						event: "restoresession",
						error: "server sql error"
					};
				ws.send(JSON.stringify(jsonReply));
				throw err;
			}
			if (rows.length !== 0) {
					jsonReply = {
						event: "restoresession",
						sessionid: sessionID
					};
					ws.send(JSON.stringify(jsonReply));
			} else {
				jsonReply = {
						event: "restoresession",
						error: "sessionid not found"
					};
				ws.send(JSON.stringify(jsonReply));
			}
		});
}