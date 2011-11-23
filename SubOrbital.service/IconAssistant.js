/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
var libraries = MojoLoader.require({ name: "foundations", version: "1.0" }, {name:"foundations.json", version: "1.0"});
var fs = IMPORTS.require('fs');
//IMPORTS.require('/media/cryptofs/apps/usr/palm/services/com.whitm.suborbital.service/ParseAndWrite.js');

var IconAssistant = function() {
	
}

IconAssistant.prototype.run = function(future) {
	console.log("***Icon Assistant - running")
	var action = this.controller.args.action;
	if (!action) {
		action = "rd";
	}
	console.log("***Icon Assistant - action: " + action);
	var file = fs.readFileSync("/var/luna/preferences/launcher3/launcher_fixed.msave", encoding='utf8');
	var conf = new LauncherConf();
	if (this.controller.args.debug) {
		console.log("***IconAssistant - debug mode");
		conf.debug = true;
	}
	conf.handleRawData(file);
	
	switch (action) {
		case "rd":
			this.getIcons(future, conf);
			break;
		case "mv":
			break;
		default:
			future.result = {"error": true, "description": "unknown action"};
			break;
	}
}

IconAssistant.prototype.getIcons = function(future, conf) {
	console.log("***Icon Assistant: getting icons");
	future.result = conf.getIcons();
}

IconAssistant.prototype.moveIcon = function(future) {
	
}
