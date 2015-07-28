"use strict";

module.exports = {
	Action: function(json, ws, req) {
		var jsonReply;
		try {
			req.session.destroy(function(err) {
				if (err) {
					throw err;
				}
					});
			jsonReply = {
					event: "logout"
				};
			ws.send(JSON.stringify(jsonReply));
		} catch (err) {
			jsonReply = {
					event: "error",
					error: "server error on logout"
				};
			ws.send(JSON.stringify(jsonReply));
			console.log(err);
		}
	}
}