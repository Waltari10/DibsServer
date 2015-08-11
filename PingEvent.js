"use strict";

module.exports = {
	Action: function(json, ws) {
		console.log("pong event received");
		/*var jsonReply;
		try {
			jsonReply = {
					event: "ping"
				};
			ws.send(JSON.stringify(jsonReply));
		} catch (err) {
			jsonReply = {
					event: "error",
					error: "server error on ping"
				};
			ws.send(JSON.stringify(jsonReply));
			console.log(err);
		}*/
	}
};