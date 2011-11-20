/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
var libraries = MojoLoader.require({ name: "foundations", version: "1.0" }, {name:"foundations.json", version: "1.0"});
var fs = IMPORTS.require('fs');

var LauncherAssistant = function() {
}

LauncherAssistant.prototype.run = function(future) {
	console.log("***LauncherAssistant - running");
	var args = this.controller.args.tabArgs;
	console.log("***LauncherAssistant: " + JSON.stringify(args));
	var file = fs.readFileSync("/var/luna/preferences/launcher3/launcher_fixed.msave", encoding='utf8');
	var conf = new LauncherConf();
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
	}
}
LauncherAssistant.prototype.moveTab = function(future, args) {
	console.log("***LauncherAssistant moving tab");
	args.conf.moveEntry(args.conf.entries[args.currentIndex], args.newIndex);
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
	args.conf.deleteEntry(args.conf.entries[args.index], args.moveTo);
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
		"error":args.conf.errors
	}
}

var LauncherConf = function() {
	this.debug = false;
	this.unchangeable = [
		"APPS",
		"FAVORITES",
		"DOWNLOADS",
		"SETTINGS"
	];
	this.kind = "LauncherConf";
	this.path = '/var/luna/preferences/launcher3/';
	this.debug_write_path = '/media/internal/suborbital/';
	//this.path = "/home/wmarbut/Dropbox/Dev/SubOrbital/test_dir/";
	this.__validated = false;
	this.errors = new Array();
	this.entries = new Array();
}
LauncherConf.prototype.canChange = function(name) {
	name = name.toUpperCase();
	var ret_val = true;
	for (var uc in this.unchangeable) {
		if (this.unchangeable[uc] == name) {
			ret_val = false;
		}
	}
	return ret_val;
}
LauncherConf.prototype.exportEntries = function() {
	var exportArr = new Array();
	for (var en in this.entries) {
		exportArr.push(this.entries[en].exportSelf());
	}
	return exportArr;
}
LauncherConf.prototype.addErr = function(sender, text) {
	if (sender.kind) {
		sender = sender.kind
	}
	this.errors.push(new Err(sender, text));
}
LauncherConf.prototype.addNewEntryAtEnd = function(name) {
	if (!this.__validated) {
		return false;
	}
	//this.__validated = false;
	var entry = new Entry();
	name = name.toUpperCase();
	entry.name = name;
	entry.guid = this.generateGuid();
	entry.index = this.entries.length;
	entry.defaultFileName(name);
	//entry.file_name = 'page_ReorderablePage_' + name + '_{' + entry.guid + '}';
	entry.__conf = this;
	this.entries.push(entry);
	return true;
}
LauncherConf.prototype.generateGuid = function() {
	//8-4-4-4-12
	var str = "";
	while (str.length < 36) {
		switch (str.length) {
			case 8: //dash after first 8 (8-)
				str += '-' + this.randHex();
				break;
			case 13: //dash after set of 4 (8-4-)
				str += '-' + this.randHex();
				break;
			case 18: //dash after set of 4 (8-4-4-)
				str += '-' + this.randHex();
				break;
			case 23: //dash after set of 4 (8-4-4-4-)
				str += '-' + this.randHex();
				break;
			default:
				str += this.randHex();
		}
	}
	return str;
}
LauncherConf.prototype.randHex = function() {
	var chars = "abcdef0123456789".split('');
	return chars[(Math.floor(Math.random()*chars.length))];
}
LauncherConf.prototype.handleRawData = function(data) {
	data = data.split("\n");
	this.handleData(data);
}
LauncherConf.prototype.handleData = function(data) {
	if (!data) {
		data = this.entries;
	}
	
	if (data.length <= 10) {
		this.addErr(this, "Insufficient data supplied");
		return false;
	}
	
	var entry_lines = data.slice(10, (data.length -2));

	for (var i=0; i<entry_lines.length; i++) {
		var n = i%3;
		switch (n) {
			case 0:
				this.entries.push(new Entry(this));
				this.entries[(this.entries.length-1)].processLine(entry_lines[i]);
				this.entries[(this.entries.length-1)].index = Math.floor((i/3));
				if (!this.entries[(this.entries.length-1)].checkFileExists()) {
					this.addErr(this.entries[(this.entries.length-1)], "Descriptor file doesn't exist on disk for " + this.entries[(this.entries.length-1)].file_name);
				}
				this.entries[(this.entries.length-1)].readFile();
				break;
			case 1:
				this.entries[(this.entries.length-1)].validateLine2(entry_lines[i], i);
				break;
			case 2:
				break;
		}
		//_on_disk
	}
	
	//validate size
	if (data.length > 0) {
		//bottom size line
		var size_line = data[data.length-2];
		begin_size = size_line.indexOf("size=");
		if (begin_size < 0) {
			size_line = data[data.length-1];
			begin_size = size_line.indexOf("size=");
		}
		if (begin_size >= 0) {
			size = size_line.substring((begin_size+5), begin_size.length)
			if (parseInt(size) != this.entries.length) {
				this.addErr(this, "Last size doesn't match actual size. Expected " + Math.floor(entry_lines.length/3) + " but found " + size);
			}
		} else {
			console.log("Last size line not found\nline-2: " + data[data.length-2] + "\nline: " + data[data.length--]);
			this.addErr(this, "Last size line entry not found!");
		}
		//top size line
		if (data.length > 4) {
			size_line = data[4];
			begin_size = size_line.indexOf("num_pages=");
			if (begin_size >=0) {
				size = size_line.substring((begin_size+10), size_line.length);
				var expected_size = this.entries.length;
				if (parseInt(size) != expected_size) {
					this.addErr(this, "First size doesn't match actual size. Expected " + expected_size + " but found " + size);
				}
			} else {
				this.addErr(this, "First size line entry not found!");
			}
		}
	}
	if (this.errors.length == 0) {
		this.__validated = true;
		console.log("Validated");
	} else {
		//console.log(this.entries);
		console.log(JSON.stringify(this.errors));
	}
}
LauncherConf.prototype.moveEntry = function(entry, position) {
	console.log("Moving " + entry.name + " (" + entry.index + ") to " + position);
	entries_bak = JSON.parse(JSON.stringify(this.entries, function(k,v) {
		if (k.indexOf('__') == 0)
			return undefined;
		return v;
	}));
	for (var entry_i in entries_bak) {
		var entry_obj = new Entry();
		entry_obj.extend(entries_bak[entry_i]);
		entries_bak[entry_i] = entry_obj;
	}
	try {
		if (position > parseInt(entry.index)) {
			this._moveEntryDown(entry, position);
		} else if (position < parseInt(entry.index)) {
			this._moveEntryUp(entry, position);
		}
	} catch (exception) {
		console.log("Exception occurred: " + exception);
		this.entries = entries_bak;
	}
}
LauncherConf.prototype._moveEntryDown = function(entry, position) {
	console.log("Moving entry down");
	if (position > this.entries.length) {
		position = this.entries.length;
	}
	
	var top_position = entry.index
	var new_position = position;
	
	var middle_entries = this.entries.slice(top_position, new_position + 1);
	for (var mi in middle_entries) {
		middle_entries[mi].index -= 1;
	}
	
	entry.index = position;
	
	this.entries = this.entries.sort(compareEntries);
	
	for (var ei in this.entries) {
		console.log(this.entries[ei].name + " -- " + this.entries[ei].index);
	}
}
LauncherConf.prototype._moveEntryUp = function(entry, position) {
	console.log("Moving entry up");
	if (position < 0) {
		position = 0;
	}
	
	var middle_entries = this.entries.slice(position, entry.index);
	for (var mi in middle_entries) {
		middle_entries[mi].index += 1;
	}
	
	entry.index = position;
	
	this.entries = this.entries.sort(compareEntries);
	
	for (var ei in this.entries) {
		console.log(this.entries[ei].name + " -- " + this.entries[ei].index);
	}
	
}
LauncherConf.prototype.deleteEntry = function(entry, moveTo) {
	if (!entry || !entry.name) {
		this.addErr(this, "Unable to delete entry. Invalid object");
		console.log("Unable to delete entry");
		return false;
	}
	if (!this.canChange(entry.name)) {
		this.addErr(entry, "Unable to delete entry. Entry is a preset");
		return false;
	}
	
	if (moveTo) {
		var moveToEntry = false;
		for (var en in this.entries) {
			if (this.entries[en].name == moveTo) {
				moveToEntry = this.entries[en];
			}
		}
		if (moveToEntry) {
			moveToEntry._raw_data = entry._raw_data;
		}
	}
	
	console.log("Deleting entry: " + entry.name + " (" + entry.index + ")");
	this.entries.splice(entry.index, 1);
	var lower_entries = this.entries.slice((entry.index), (this.entries.length));
	for (var le in lower_entries) {
		lower_entries[le].index -= 1;
	}
	
	for (var ei in this.entries) {
		console.log(this.entries[ei].name + " -- " + this.entries[ei].index);
	}
}
LauncherConf.prototype.writeFiles = function() {
	if (this.errors.length != 0) {
		console.log("Unable to write files, errors present");
		console.log(this.errors);
		return false;
	}
	
	var filePath = (this.debug)? this.debug_write_path : this.path;
	
	console.log("Writing files to: " + filePath);
	/*
	* Writing main file
	*/
	var main_file = [
		"[General]",
		"nul=0",
		"",
		"[header]",
		"num_pages=" + this.entries.length,
		"save_sys_version=7",
		"simple_name=default",
		"time_created=" + (new Date()).getTime(),
		"",
		"[pages]"
	];
	for (var entry_i in this.entries) {
		var entry = this.entries[entry_i];
		main_file = main_file.concat([
			((entry.index+1).toString() + "\\filepath=" + filePath + "/" + entry.file_name),
			((entry.index+1).toString()+ '\\pageindex='+ entry.index),
			((entry.index+1).toString() + '\\pagetype=ReorderablePage')
		]);
	}
	main_file = main_file.concat(['size=' + this.entries.length]);
	fs.writeFileSync((filePath+'launcher_fixed.msave'), main_file.join("\n"));
	
	
	/*
	* Write individual files
	*/
	for (var entry_i in this.entries) {
		var entry = this.entries[entry_i];
		/*
			Fix for bug with incompatibility with preware patch
		*/
		var page_designator = (entry.name.toUpperCase() == "SETTINGS")? "prefs" : entry.name.toLowerCase();
		var entry_file = [
			'[header]',
			'pagedesignator=' + page_designator,
			'pagename=' + entry.name.toUpperCase(),
			'pagetype=ReorderablePage',
			'pageuid={' + entry.guid + '}',
			'',
			'[icons]'
		]
		var entry_size = 0;
		if (entry._raw_data) {
			for (var raw_line in entry._raw_data) {
				entry_file.push(entry._raw_data[raw_line]);
			}
			entry_size = Math.floor(entry._raw_data.length/4);
		}
		entry_file.push("size=" + entry_size);
		entry_file.push("");
		fs.writeFileSync((filePath+entry.file_name), entry_file.join("\n"));
	}
	
	return true;
}


var Entry = function(conf) {
	this.kind = "Entry";
	this.__conf = conf;
	this._on_disk = false;
	this._raw_data = false;
	this.file_name;
	this.name;
	this.index;
	this.guid;
}
Entry.prototype.processLine = function(line) {
	if (line.length == 0) {
		this.__conf.addErr(this, "Unexpected first line empty");
		return;
	}
	var begin_name = line.indexOf("Page_");
	var end_name = line.indexOf("_{");
	if (begin_name > 0 && end_name > 0) {
		this.name = line.substring((begin_name+5), (end_name));
	} else {
		this.__conf.addErr(this, "Unable to parse name");
	}
	var begin_guid = line.indexOf("_{");
	var end_guid = line.indexOf("}");
	if (begin_guid > 0 && end_guid > 0) {
		this.guid = line.substring((begin_guid+2), end_guid);
	} else {
		this.__conf.addErr(this, "Unable to parse guid");
	}
	var begin_file_name = line.indexOf("//");
	var end_file_name = line.length;
	if (begin_file_name > 0) {
		this.file_name = line.substring((begin_file_name+2), end_file_name);
	} else {
		this.__conf.addErr(this, "Unable to parse filename");
	}
}
Entry.prototype.defaultFileName = function(name) {
	this.file_name = 'page_ReorderablePage_' + name.toUpperCase() + '_{' + this.guid + '}'
}
Entry.prototype.validateLine2 = function(line, number) {
	if (line.length == 0) {
		this.__conf.addErr(this, "Unexpected empty line");
		return;
	}
	var first_char = parseInt(line.substring(0,1))
	if (first_char != Math.floor(number/3)+1) {
		this.__conf.addErr(this, "Launcher entry out of sequence. Expected " + number + ", but found " + first_char);
	}
}
Entry.prototype.checkFileExists = function() {
	var exists = true; 
	//An exception will be thrown if it doesn't exist
	try {
		var fid = fs.openSync((this.__conf.path + this.file_name), 'r+');
		fs.closeSync(fid);
	} catch (exception) {
		exists = false;
	}
	this._on_disk = exists;
	
	return exists
}
Entry.prototype.readFile = function() {
	if (!this._on_disk) {
		this.__conf.addErr(this, "Unable to read file for (" + this.file_name + ") because on_disk was false");
		return false;
	}
	var data = fs.readFileSync((this.__conf.path + this.file_name), encoding='utf8');
	data = data.split("\n");
	if (data.length < 7) {
		this.__conf.addErr(this, "File entry for (" + this.file_name + ") invalid.");
		return false;
	}
	this._raw_data = data.slice(7,(data.length-2));
}
Entry.prototype.exportSelf = function() {
	var e = {};
	e.name = this.name;
	e.index = this.index;
	/*
		Fix for overflowing return data
	*/
	//e.file_name = this.file_name;
	//e.guid = this.guid;
	return e;
}

var Err = function(sender, text) {
	this.kind = "Err";
	this.text = text;
	this.sender = sender;
}

function compareEntries(a,b) {
	if (a.index < b.index)
		return -1;
	if (a.index > b.index)
		return 1;
	return 0;
}

/*
* Node.js extend method by David Coallier
* public domain
*/
Object.defineProperty(Object.prototype, "extend", {
    enumerable: false,
    value: function(from) {
        var props = Object.getOwnPropertyNames(from);
        var dest = this;
        props.forEach(function(name) {
            //if (name in dest) {
                var destination = Object.getOwnPropertyDescriptor(from, name);
                Object.defineProperty(dest, name, destination);
            //}
        });
        return this;
    }
});


/*
* Borrowed Trim functions
* from somwhere 'bout the web in public domain
*/

function trim(str, chars) {
	return ltrim(rtrim(str, chars), chars);
}
 
function ltrim(str, chars) {
	chars = chars || "\\s";
	return str.replace(new RegExp("^[" + chars + "]+", "g"), "");
}
 
function rtrim(str, chars) {
	chars = chars || "\\s";
	return str.replace(new RegExp("[" + chars + "]+$", "g"), "");
}