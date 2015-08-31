"use strict";
module.exports = {
	Action: function(mysqlConnection) {
		var createUser = "CREATE TABLE IF NOT EXISTS `dibsserver`.`user` (`email` VARCHAR(25) NOT NULL COMMENT '',`password` BINARY(60) NOT NULL COMMENT '',`firstname` VARCHAR(45) NOT NULL COMMENT '',`lastname` VARCHAR(45) NOT NULL COMMENT '',PRIMARY KEY (`email`)  COMMENT '')ENGINE = InnoDB";
		var createSession = "CREATE TABLE IF NOT EXISTS `dibsserver`.`session` (`sessionid` VARCHAR(60) NOT NULL COMMENT '', `email` VARCHAR(25) NOT NULL COMMENT '',PRIMARY KEY (`sessionid`, `email`)  COMMENT '',INDEX `fk_session_user1_idx` (`email` ASC)  COMMENT '', CONSTRAINT `fk_session_user1` FOREIGN KEY (`email`) REFERENCES `dibsserver`.`user` (`email`) ON DELETE NO ACTION ON UPDATE NO ACTION) ENGINE = InnoDB";
		var createCard = "CREATE TABLE IF NOT EXISTS `dibsserver`.`card` (`idcard` INT NOT NULL AUTO_INCREMENT COMMENT '', `cardname` VARCHAR(45) NOT NULL COMMENT '', `picture` MEDIUMTEXT NOT NULL COMMENT '', `rank` INT NOT NULL COMMENT '', `value` INT NOT NULL COMMENT '', `email` VARCHAR(25) NOT NULL COMMENT '', `description` TEXT(300) NOT NULL COMMENT '', `color` TEXT(300) NOT NULL COMMENT '', `profilecard` TINYINT(1) NOT NULL COMMENT '', PRIMARY KEY (`idcard`)  COMMENT '', INDEX `fk_card_User_idx` (`email` ASC)  COMMENT '', UNIQUE INDEX `idcard_UNIQUE` (`idcard` ASC)  COMMENT '', CONSTRAINT `fk_card_User` FOREIGN KEY (`email`) REFERENCES `dibsserver`.`user` (`email`) ON DELETE NO ACTION ON UPDATE NO ACTION) ENGINE = InnoDB";

		mysqlConnection.query(createUser, function (err, result) {
			if (err) {
				console.log("Failed to create user table or check its existence");
			} else {
				//User table created or it already existed
				mysqlConnection.query(createSession, function (err, result) {
					if (err) {
						console.log("Failed to create session table or check its existence");
					} //else {
						//Session table created or it already existed
					//}
				});
				mysqlConnection.query(createCard, function (err, result) {
					if (err) {
						console.log("Failed to create card table or check its existence");
					} //else {
						//Card table created or it already existed
					//}
				});
			}
		});
	}
}

