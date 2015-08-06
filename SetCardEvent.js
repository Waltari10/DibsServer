"use strict";

module.exports = {
		Action: function(json, ws, mysqlConnection) {
		var query, jsonReply, initialProfileCreation;
		try {
			query = 'SELECT * FROM card WHERE email = ' + mysqlConnection.escape(json.email);
			console.log(query);
			
			mysqlConnection.query('SELECT * FROM card WHERE email = ' + mysqlConnection.escape(json.email), function (err, rows, fields) {
				if (err) {
					jsonReply = {
							event: "error",
							error: "server error on checking whether cards exist"
						};
					ws.send(JSON.stringify(jsonReply));
					throw err;
				}
				if (rows.length !== 0) { //If no rows this is the initial profile creation. When initializing a profile the user cannot have any cards pounds to his name
					console.log('initialProfileCreation = true;')
					initialProfileCreation = true;
				}
			});
			console.log(json.profilecard + " | " + initialProfileCreation);
			if (json.profilecard === "0") { //Works
				console.log("Making new regular card");
				query = 'INSERT INTO card (cardname, picture, stats, email, rank, profilecard) VALUES (' + mysqlConnection.escape(json.cardname) + ', ' + mysqlConnection.escape(json.picture) + ', ' + mysqlConnection.escape(json.stats) + ', ' + mysqlConnection.escape(json.email) + ', ' + mysqlConnection.escape(json.email) + ', ' + 0 +')';
				
				console.log(query);
				
				mysqlConnection.query(query, function (err, result) {
					if (err) {
						jsonReply = {
							event: "error",
							error: "server error on new regular card SQL"
						};
						ws.send(JSON.stringify(jsonReply));
						throw err;
					} else {
						jsonReply = {
							event: "cardSaved"
						};
						ws.send(JSON.stringify(jsonReply));
					}
				});
			} else if (json.profilecard === "1") {
				mysqlConnection.query('SELECT * FROM card WHERE email = ' + mysqlConnection.escape(json.email), function (err, rows, fields) {
				if (err) {
					jsonReply = {
							event: "error",
							error: "server error on checking whether cards exist"
						};
					ws.send(JSON.stringify(jsonReply));
					throw err;
				}
				if (rows.length !== 0) { //If no rows this is the initial profile creation. When initializing a profile the user cannot have any cards pounds to his name
					console.log("Making new profile card");
				
					query = 'INSERT INTO card (cardname, picture, stats, email, rank, profilecard) VALUES (' + mysqlConnection.escape(json.cardname) + ', ' + mysqlConnection.escape(json.picture) + ', ' + mysqlConnection.escape(json.stats) + ', ' + mysqlConnection.escape(json.email) + ', ' + mysqlConnection.escape(json.rank) + ', ' + 1 +')';
					
					console.log(query);
					
					mysqlConnection.query(query, function (err, result) {
						if (err) {
							jsonReply = {
								event: "error",
								error: "server error on new profile card SQL"
							};
							ws.send(JSON.stringify(jsonReply));
							throw err;
						} else {
							jsonReply = {
								event: "profileSaved"
							};
							ws.send(JSON.stringify(jsonReply));
						}
					});
					
				} else {
					console.log("Updating profile card");

					query = 'UPDATE card SET cardname=' + mysqlConnection.escape(json.cardname) + ', stats=' + mysqlConnection.escape(json.stats) + ', picture=' + mysqlConnection.escape(json.picture) + ', email=' + mysqlConnection.escape(json.email) + ', rank=' + mysqlConnection.escape(json.rank) + ' WHERE email=' + mysqlConnection.escape(json.email) + ' AND profilecard=1';
					
					console.log(query);
					
					mysqlConnection.query(query, function (err, result) {
						if (err) {
							jsonReply = {
								event: "error",
								error: "server error on update profile card SQL"
							};
							ws.send(JSON.stringify(jsonReply));
							throw err;
						} else {
							jsonReply = {
								event: "profileUpdated"
							};
							ws.send(JSON.stringify(jsonReply));
						}
					});
				}
			});
			}
				
			/*} else if (json.profilecard === "1" && initialProfileCreation) { 
				console.log("Making new profile card");
				
				query = 'INSERT INTO card (cardname, picture, stats, email, rank, profilecard) VALUES (' + mysqlConnection.escape(json.cardname) + ', ' + mysqlConnection.escape(json.picture) + ', ' + mysqlConnection.escape(json.stats) + ', ' + mysqlConnection.escape(json.email) + ', ' + mysqlConnection.escape(json.rank) + ', ' + 1 +')';
				
				console.log(query);
				
				mysqlConnection.query(query, function (err, result) {
					if (err) {
						jsonReply = {
							event: "error",
							error: "server error on new profile card SQL"
						};
						ws.send(JSON.stringify(jsonReply));
						throw err;
					} else {
						jsonReply = {
							event: "profileSaved"
						};
						ws.send(JSON.stringify(jsonReply));
					}
				});
			} else if (json.profilecard === "1" && !initialProfileCreation) {
				console.log("Updating profile card");

				query = 'UPDATE card SET cardname=' + mysqlConnection.escape(json.cardname) + ', stats=' + mysqlConnection.escape(json.stats) + ', picture=' + mysqlConnection.escape(json.picture) + ', email=' + mysqlConnection.escape(json.email) + ', rank=' + mysqlConnection.escape(json.rank) + ' WHERE email=' + mysqlConnection.escape(json.email) + ' AND profilecard=1';
				
				console.log(query);
				
				mysqlConnection.query(query, function (err, result) {
					if (err) {
						jsonReply = {
							event: "error",
							error: "server error on update profile card SQL"
						};
						ws.send(JSON.stringify(jsonReply));
						throw err;
					} else {
						jsonReply = {
							event: "profileUpdated"
						};
						ws.send(JSON.stringify(jsonReply));
					}
				});
			}*/
		} catch (err) {
		jsonReply = {
				event: "error",
				error: "server error on setCard"
			};
		ws.send(JSON.stringify(jsonReply));
		console.log(err);
		}
	}
};