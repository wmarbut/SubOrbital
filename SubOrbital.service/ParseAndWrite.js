/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
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
	
	//make sure no other entires with the same name exist
	for (var entry_i in this.entries) {
		if (this.entries[entry_i].name.toUpperCase == name.toUpperCase()) {
			this.addErr(this, "Unable to add duplicate entry");
			return false;
		}
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
LauncherConf.prototype.deleteEntry = function(entry_name, moveTo) {
	if (!entry_name) {
		this.addErr(this, "Unable to delete entry. Invalid object");
		console.log("Unable to delete entry");
		return false;
	}

	var entry = false;
	for (var entry_i in this.entries) {
		if (this.entries[entry_i].name.toUpperCase() == entry_name.toUpperCase()) {
			entry = this.entries[entry_i];
		}
	}
	if (!entry) {
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
			if (moveToEntry.icons && entry.icons) {
				console.log("***Moving icons (" + entry.icons.length + ") from: " + entry.name + " to " + moveToEntry.name);
				moveToEntry.addIcons(entry.icons);
				console.log("***Moved icons. New total: " + moveToEntry.icons.length);
			} else {
				console.log("***Moving raw data from: " + entry.name + " to " + moveToEntry.name);
				moveToEntry._raw_data = moveToEntry._raw_data.concat(entry._raw_data);
				moveToEntry.parseRawData();
			}
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
		if (entry.icons) {
			for (var icon_i in entry.icons) {
				var icon = entry.icons[icon_i];
				var icon_entry = [
					(icon.index + "\\id=" + icon.id),
					(icon.index + "\\launchid=" + icon.launchid),
					(icon.index + "\\launchtype=" + icon.launchtype),
					(icon.index + "\\type=" + icon.type)
				];
				entry_file = entry_file.concat(icon_entry);
			}
			entry_size = entry.icons.length;
		} else if (entry._raw_data) {
			for (var raw_line in entry._raw_data) {
				entry_file.push(entry._raw_data[raw_line]);
			}
			entry_size = Math.floor(entry._raw_data.length/4);
		}
		entry_file.push("size=" + entry_size);
		entry_file.push("");
		fs.writeFileSync((filePath+entry.file_name), entry_file.join("\n"));
	}
	
	/* Bug 6. Whit WebOs
	 * The launcher promptly changes from 777 back to
	 * 644
	 *  */
	exec('chmod 777 /var/luna/preferences/launcher3/*');
	
	return true;
}
LauncherConf.prototype.getIcons = function() {
	var icons = {};
	var tabs = {};
	for (var entry_i in this.entries) {
		var entry = this.entries[entry_i];
		tabs[entry.name] = [];
		if (entry.icons && entry.icons.length > 0) {
			for (var icon_i in entry.icons) {
				icons[entry.icons[icon_i].id] = (entry.icons[icon_i].cloneSelf());
				tabs[entry.name].push(entry.icons[icon_i].id)
			}
		}
	}
	return {
		"icons": icons,
		"tabs": tabs
	};
}
LauncherConf.prototype.moveIcons = function(fromTab, toTab, icons) {
	if (!icons || 
		(Object.prototype.toString.call(icons) != '[object Array]') ||
		fromTab.kind != "Entry" ||
		toTab.kind != "Entry") {
		var error_spec = (Object.prototype.toString.call(icons) != '[object Array]')? " (icon array not array type)" : "";
		error_spec += (fromTab.kind != "IconEntry")? " (invalid fromTab)" : "";
		error_spec += (toTab.kind != "IconEntry")? " (invalid toTab)" : "";
		this.addErr(this, "Invalid argument to moveIcons " + error_spec);
		console.log("invalid argument to moveIcons");
		return false;
	}
	fromTab.removeIcons(icons);
	toTab.addIcons(icons);
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
	this.icons = new Array();
}
Entry.prototype.parseRawData = function() {
	if (!this._raw_data) {
		console.log("No raw data to parse");
		return;
	}
	this.icons = new Array();
	var icon;
	console.log("Parsing raw data for " + this.name + ": " + this._raw_data.length);
	for (var raw_i in this._raw_data) {
		if (raw_i%4 == 0) {
			if (icon) {
				this.icons.push(icon);
			}
			icon = new IconEntry(this.__conf);
		}
		icon.parseLine(this._raw_data[raw_i]);
	}
	if (icon) {
		this.icons.push(icon);
	}
}
Entry.prototype.removeIcons = function(icons) {
	if (!icons || (Object.prototype.toString.call(icons) != '[object Array]')) {
		this.__conf.addErr(this, "Invalid argument to removeIcons");
		console.log("invalid argument to removeIcons");
		return false;
	}
	for (var icon_i in icons) {
		var icon = icons[icon_i];
		for (var t_icon_i in this.icons) {
			if (icon.id == this.icons[t_icon_i].id) {
				this.icons.splice(t_icon_i, 1);
			}
		}	
	}
}
Entry.prototype.addIcons = function(icons) {
	if (!icons || (Object.prototype.toString.call(icons) != '[object Array]')) {
		this.__conf.addErr(this, "Invalid argument to addIcons");
		console.log("invalid argument to addIcons");
		return false;
	}
	
	var index_cache = new Array();
	for (var icon_i in this.icons) {
		index_cache.push(parseInt(this.icons[icon_i].index));
	}
	
	for (var icon_i in icons) {
		var icon = icons[icon_i];
		icon.index = parseInt(icon.index);
		if (index_cache.indexOf(icon.index) >= 0) {
			icon.index = 1;
			console.log("Index conflict on moved icon: " + icon.id + ". Reserved indexes: " + index_cache.join(', '));
		}
		while (index_cache.indexOf(icon.index) >= 0) {
			icon.index += 1;
			console.log("--index conflict still exists. incrementing. " + icon.index);
		}
		this.icons.push(icon);
	}
	return true;
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
	this.parseRawData();
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

var IconEntry = function(conf) {
	this.kind = "IconEntry";
	this.index = 0;
	this.id = "";
	this.launchid = "";
	this.launchtype = "";
	this.type = "";
	this.__conf = (conf)? conf : false;
}
IconEntry.prototype.cloneSelf = function() {
	var icon = new IconEntry();
	icon.index = this.index;
	icon.id = this.id;
	icon.launchid = this.launchid;
	icon.launchtype = this.launchtype;
	icon.type = this.type;
	return icon;
}
IconEntry.objectify = function(obj, conf) {
	var new_obj = new IconEntry(conf);
	new_obj.index = obj.index;
	new_obj.id = obj.id;
	new_obj.launchid = obj.launchid;
	new_obj.launchtype = obj.launchtype;
	new_obj.type = obj.type;
	return new_obj;
}
IconEntry.prototype.parseLine = function(line) {
	l1 = /^([0-9]{1,3})[\\]{1}id\=([a-zA-Z0-9\.\-\_]*)$/;
	l2 = /^([0-9]{1,3})[\\]{1}launchid\=([a-zA-Z0-9\.\-\_]*)$/;
	l3 = /^([0-9]{1,3})[\\]{1}launchtype\=([0-9]{1,4})$/;
	l4 = /^([0-9]{1,3})[\\]{1}type\=([a-zA-Z0-9\.\-\_\:]*)$/;
	var match = false
	if ((match = line.match(l1))) {
		this.index = match[1]
		this.id = match[2];
	} else if((match = line.match(l2))) {
		this.launchid = match[2];
	} else if ((match = line.match(l3))) {
		this.launchtype = match[2];
	} else if ((match = line.match(l4))) {
		this.type = match[2];
	} else {
		console.log("Parse error on IconEntry line: '" + line + "'");
		this.__conf.addErr(this, "Unable to parse line: '" + line + "''");
	}
}
IconEntry.prototype.toString = function() {
	var str = "[#IconEntry:";
	str += " (index: " + this.index + ")";
	str += " (id: " + this.id + ")";
	str += " (launchid: " + this.launchid + ")";
	str += " (launchtype: " + this.launchtype + ")";
	str += " (type: " + this.type + ")";
	str += "]";
	return str;
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