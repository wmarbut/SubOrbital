/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
var libraries = MojoLoader.require({ name: "foundations", version: "1.0" }, {name:"foundations.json", version: "1.0"});
var fs = IMPORTS.require('fs');
var exec = IMPORTS.require("child_process").exec;
//IMPORTS.require('/media/cryptofs/apps/usr/palm/services/com.whitm.suborbital.service/ParseAndWrite.js');
var LauncherAssistant = function() {
}

LauncherAssistant.prototype.run = function(future) {
	console.log("***LauncherAssistant - running");
	var args = this.controller.args.tabArgs;
	console.log("***LauncherAssistant: " + JSON.stringify(args));
	var file = fs.readFileSync("/var/luna/preferences/launcher3/launcher_fixed.msave", encoding='utf8');
	var conf = new LauncherConf();
	if (this.controller.args.debug) {
		console.log("***LauncherAssistant - debug mode");
		conf.debug = true;
	}
	conf.handleRawData(file);
	args.conf = conf;
	
	console.log("***LauncherAssistant: switching action");
	switch (args.action) {
		case 'mv':
			this.moveTab(future, args);
			break;
		case 'new':
			this.newTab(future, args);
			break;
		case 'rnm':
			this.renameTab(future, args);
			break;
		case 'del':
			this.deleteTab(future, args);
			break;
		case 'rd':
			this.returnData(future, args);
			break;
		default:
			future.result = {"error":true,"description":"unrecognized action"}
	}
}
LauncherAssistant.prototype.moveTab = function(future, args) {
	console.log("***LauncherAssistant moving tab");
	if (!args.name || !args.delta) {
		future.result = {"error":true,"description":"insufficient arguments to move tabs"};
		return false;
	}
	console.log("***LauncherAssistant searching for tab named: " + args.name);
	var entry = false;
	for (var entry_i in args.conf.entries) {
		if (args.conf.entries[entry_i].name.toUpperCase() == args.name.toUpperCase()) {
			entry = args.conf.entries[entry_i];
		}
	}
	
	if (!entry) {
		future.result = {"error":true,"description":"no tab found to move"};
		return false;
	}
	console.log("***LauncherAssistant Move entry: " + entry.name + " delta: " + args.delta);
	args.conf.moveEntry(entry, entry.index+args.delta);
	args.newIndex = entry.index;
	this.returnData(future, args);
}
LauncherAssistant.prototype.renameTab = function(future, args) {
	var valid_text_regex = /^[a-zA-Z0-9\-\_]*$/;
	console.log("***LauncherAssistant renaming tab");
	
	var nameMatch = args.name.match(valid_text_regex);
	if (nameMatch) {
		if (args.conf.canChange(args.name)) {
			args.conf.entries[args.index].name = args.name;
			args.conf.entries[args.index].defaultFileName(args.name);
		}
	}
	this.returnData(future, args);
}
LauncherAssistant.prototype.newTab = function(future, args) {
	console.log("***Creating a tab");
	var valid_text_regex = /^[a-zA-Z0-9\-\_]*$/;
	var nameMatch = args.name.match(valid_text_regex);
	if (nameMatch) {
		args.conf.addNewEntryAtEnd(args.name);
	}
	this.returnData(future, args);
}
LauncherAssistant.prototype.deleteTab = function(future, args) {
	console.log("***LauncherAssistant delete a tab");
	args.conf.deleteEntry(args.item, args.moveTo);
	this.returnData(future, args);
}
LauncherAssistant.prototype.returnData = function(future, args) {
	console.log("***LauncherAssistant returning data");
	if (this.controller.args.save) {
		args.conf.writeFiles();
	}
	future.result = {
		"action": args.action,
		"data": args.conf.exportEntries(),
		"error":args.conf.errors,
		"newIndex":(args.newIndex)? args.newIndex : false
	}
}