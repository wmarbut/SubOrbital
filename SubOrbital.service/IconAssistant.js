/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
var libraries = MojoLoader.require({ name: "foundations", version: "1.0" }, {name:"foundations.json", version: "1.0"});
var fs = IMPORTS.require('fs');
var exec = IMPORTS.require("child_process").exec;
//IMPORTS.require('/media/cryptofs/apps/usr/palm/services/com.whitm.suborbital.service/ParseAndWrite.js');

var IconAssistant = function() {
	
}

IconAssistant.prototype.run = function(future) {
	console.log("***Icon Assistant - running");
	var action = this.controller.args.action;
	if (!action) {
		action = "rd";
	}
	var debug = false;
	if (this.controller.args.debug) {
		debug = true;
	}
	console.log("***Icon Assistant - action: " + action);
	var file = fs.readFileSync("/var/luna/preferences/launcher3/launcher_fixed.msave", encoding='utf8');
	var conf = new LauncherConf();
	conf.debug = debug;
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
			this.moveIcons(future, conf)
			break;
		default:
			future.result = {"error": true, "description": "unknown action"};
			break;
	}
}

IconAssistant.prototype.getIcons = function(future, conf) {
	console.log("***Icon Assistant: getting icons");
	if (this.controller.args.save) {
		conf.writeFiles();
	}
	var ret_obj = conf.getIcons();
	ret_obj.action = this.controller.args.action;
	future.result = ret_obj;
}

IconAssistant.prototype.moveIcons = function(future, conf) {
	if (!this.controller.args.toTab || 
		!this.controller.args.fromTab || 
		!this.controller.args.icons || 
		(Object.prototype.toString.call(this.controller.args.icons) != '[object Array]')) {
		console.log("***Icon Assistant: Error. Invalid parameters");
		future.result = {"error": true, "description": "invalid parameters passed to method"};
		return false;
	}
	
	//get tab objs from names
	var toTab = false;
	var fromTab = false;
	for (var tab_i in conf.entries) {
		var entry = conf.entries[tab_i];
		if (entry.name ==  this.controller.args.toTab) {
			toTab = entry;
		}
		if (entry.name ==  this.controller.args.fromTab) {
			fromTab = entry;
		}
	}
	
	//verify the tab objs
	if (toTab == fromTab || !toTab || !fromTab) {
		console.log("***Icon Assistant: Error. Tabs not found or tabs were same");
		future.result = {"error": true, "description": "Tabs not found or tabs were same"};
		return false;
	}
	
	//make objects from icon array
	var icons = new Array();
	for (var icon_i in this.controller.args.icons) {
		var icon = this.controller.args.icons[icon_i];
		icons.push(IconEntry.objectify(icon, conf));
	}
	
	//move the icons
	console.log("****Icon Assistant: Moving icons from (" + fromTab.name + ") to (" + toTab.name + "): " + icons.length);
	conf.moveIcons(fromTab, toTab, icons);
	
	if (conf.errors && conf.errors.length > 0) {
		console.log("***Icon Assistant: Error. Errors present after trying to move icons");
		future.result = {"error": true, "description": "Errors present after moving icons", "errors":conf.errors}
		return false;
	}
	
	this.getIcons(future, conf);
}
