/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
var libraries = MojoLoader.require({ name: "foundations", version: "1.0" }, {name:"foundations.json", version: "1.0"});
var Future    = libraries["foundations"].Control.Future;
var PalmCall  = libraries["foundations"].Comms.PalmCall;
var exec = IMPORTS.require("child_process").exec;  
var fs = IMPORTS.require('fs');

var BackupRestoreAssistant = function() {
    this.isDebug = true;
}

BackupRestoreAssistant.prototype.run = function(future) {
    this.debug("BackupRestore: Beginning Restore Assistant")
    /* Determine what the user wishes to do */
    var action = (this.controller.args.action)? this.controller.args.action : false;
    if (!action) {
	future.result = {"error": true, "description":"no action provided"};
	return;
    }
    
    /* Verify the directory structure */
    this.debug("BackupRestore: Verifying backup directory");
    if (!this.verifyDirectory()) {
	this.createDirectory();
	this.debug("BackupRestore: Created backup directory");
    }
    
    /* Switch to the appropriate logic */
    switch (action) {
	case "list":
	    this.listAction(future);
	    break;
	case "restore":
	    this.restoreAction(future);
	    break;
	default:
	    future.result = {"error": true, "description":"no valid action provided. received: " + action};
	    return;
    }
}

BackupRestoreAssistant.prototype.listAction = function(future) {
    console.log("BackupRestore: Listing existing backups")
	var parseName = this.parseName
    fs.readdir("/media/internal/SubOrbitalBackups", function(err, files){
		if (err) {
			console.log("Error reading files")
			future.result = {"error": true, "description":"error occurred reading the backup directory", "obj":err};
			return;
		}
		console.log("BackupRestore: Loaded files: " + JSON.stringify(files));
		var backup_list = new Array();
		for (var bak_i in files) {
			var backup = parseName(files[bak_i]);
			if (backup)
				backup_list.push(backup)
		}
		future.result = {"backups":backup_list};
    });
}

BackupRestoreAssistant.prototype.restoreAction = function(future) {
	/* Verify the backup name */
	var valid_text_regex = /^[a-zA-Z0-9\-\_]*$/;
	var backup_name = this.controller.args.backup_name
	var backup_match = backup_name.match(valid_text_regex);
	if (!backup_match) {
		console.log("Illegal characters found in backup name");
		future.result = {"error":true,"description":"illegal characters in backup filename"};
		return;
	}
	
    /* Create tmp directory */
	fs.mkdirSync('/media/internal/SubOrbitalBackups/tmp', 777);
	exec('cd /media/internal/SubOrbitalBackups/tmp;tar -xf /media/internal/SubOrbitalBackups/' + backup_name + ';rm -rf /var/luna/preferences/launcher3/*; mv ./* /var/luna/preferences/launcher3/;cd /media/internal/SubOrbitalBackups; rm -r tmp;', function(error,stdout,stderr){
		if (error)
			console.log(error)
		if (stderr)
			console.log(stderr)
		if (!error && !stderr) {
			console.log("Backup expansion success");
		}	
	})
}

BackupRestoreAssistant.prototype.verifyDirectory = function() {
	var dir_exists = false;
	var dir_contents = fs.readdirSync('/media/internal');
	if (dir_contents && dir_contents.length > 0) {
		for (var dir_i in dir_contents) {
			if (dir_contents[dir_i] == "SubOrbitalBackups") {
				dir_exists = true;
			}
		}
	}
	return dir_exists;
}

BackupRestoreAssistant.prototype.createDirectory = function() {
	fs.mkdirSync('/media/internal/SubOrbitalBackups', 777);
}

BackupRestoreAssistant.prototype.parseName = function(name) {
    var name_regex = /^([0-9]{1,2})\-([0-9]{1,2})\-([0-9]{4})\-([0-9]{1,2})\-([0-9]{1,2})\-([0-9]{1,2})\_([a-zA-Z\-\_0-9]*)$/;
    var name_match = name.match(name_regex);
    if (name_match && name_match.length >= 7) {
		return {
			"month":name_match[1],
			"day":name_match[2],
			"year":name_match[3],
			"hour":name_match[4],
			"minute":name_match[5],
			"second":name_match[6],
			"name": name_match[7],
			"fileName":name
		}
    } else {
		return false;
    }
}

BackupRestoreAssistant.prototype.debug = function(msg) {
    if (this.isDebug)
	console.log(msg);
}
