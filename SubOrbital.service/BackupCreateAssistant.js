/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
var libraries = MojoLoader.require({ name: "foundations", version: "1.0" }, {name:"foundations.json", version: "1.0"});
var Future    = libraries["foundations"].Control.Future; 
var PalmCall  = libraries["foundations"].Comms.PalmCall;
var exec = IMPORTS.require("child_process").exec;

var BackupCreateAssistant = function() {
}

BackupCreateAssistant.prototype.run = function(future) {
    /* Backup name */
    var backup_name = (this.controller.args.backup_name)? 
        this.controller.args.backup_name : "backup" ;
    
    /* Sanitize backup name */
    var valid_text_regex = /^[a-zA-Z0-9\-\_]*$/;
    if (!backup_name.match(valid_text_regex)) {
        backup_name = "backup";
    }
    
    /* Add backup timestamp */
    backup_name = this.getTimestamp() + "_" + backup_name;
    
    
    /* Verify / Create the backup directory */
    if (!this.verifyDirectory()) {
        this.createDirectory();
    }
    
    /* Create backup */
    var cmd = "tar --create --file=/media/internal/SubOrbitalBackups/" + backup_name + " -C /var/luna/preferences/launcher3/ ./";
    console.log("Creating backup with command: " + cmd)
    exec(cmd, function(error, stdout, stderr){
        if (error)
            console.log("An error occurred making the backup archive: " + error)
        if (stderr)
            console.log("Stderr: " + stderr);
	if (!error && !stderr)
	    future.result = {"success":true};
	else
	    future.result = {"success":false}
    });
    
}

BackupCreateAssistant.prototype.verifyDirectory = function() {
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

BackupCreateAssistant.prototype.createDirectory = function() {
	fs.mkdirSync('/media/internal/SubOrbitalBackups', 777);
}

BackupCreateAssistant.prototype.getTimestamp = function() {
	var date = new Date();
	var date_string = "";
	var month = date.getMonth() + 1;
	var day = date.getDate();
	var hours = date.getHours();
	var minutes = date.getMinutes();
	var seconds = date.getSeconds();
	var year = date.getFullYear();
	if (minutes < 10) {
		minutes = "0" + minutes;
	}
	
	return month + "-" + day + "-" + year + "-" + hours + "-" + minutes + "-" + seconds;
}