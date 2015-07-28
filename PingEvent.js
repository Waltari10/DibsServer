"use strict";

module.exports = {
	Action: function(json, ws) {
		console.log("ping event");
		var jsonReply;
		try {
			jsonReply = {
					event: "pong"
				};
			ws.send(JSON.stringify(jsonReply));
		} catch (err) {
			jsonReply = {
					event: "error",
					error: "server error on pong"
				};
			ws.send(JSON.stringify(jsonReply));
			console.log(err);
		}
	}
};