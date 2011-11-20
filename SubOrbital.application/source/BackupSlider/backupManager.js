/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
enyo.kind({
	kind: "Control",
	name: "BackupManager",
	restoreCallbacks: [
	
	],
	createCallbacks: [
	
	],
	callListAfterCreate: false,
	components: [
		{
			name: "backupCreate",
			kind: "PalmService",
			service: "palm://com.whitm.suborbital.service/",
			method: "backupCreate",
			onSuccess: "createSuccess",
			onFailure: "createFailure"
		},
		{
			name: "backupRestore",
			kind: "PalmService",
			service: "palm://com.whitm.suborbital.service/",
			method: "backupRestore",
			onSuccess: "backupSuccess",
			onFailure: "backupFailure"
		}
	],
	createSuccess: function(inSender, inResponse) {
		if (this.callListAfterCreate) {
			this.callListAfterCreate = false;
			this.$.backupRestore.call({"action":"list"});
		}
	},
	restoreBackup: function(name) {
		this.$.backupRestore.call({"action":"restore","backup_name":name});
	},
	createFailure: function(inSender, inResponse) {
	
	},
	backupSuccess: function(inSender, inResponse) {
		var cb;
		console.log("Restore success: " + enyo.json.stringify(inResponse));
		console.log("callbackups: " + this.restoreCallbacks.length);
		while ((cb = this.restoreCallbacks.shift())) {
			cb(inResponse);
		}
	},
	backupFailure: function(inSender, inResponse) {
		console.log("backupRestore call failed: " + enyo.json.stringify(inResponse));
	},
	getBackups: function(callback) {
		this.restoreCallbacks.push(callback);
		this.$.backupRestore.call({"action":"list"});
	},
	newBackup: function(callback, name) {
		var call_obj = (name)? {"backup_name":name} : {};
		this.restoreCallbacks.push(callback);
		this.callListAfterCreate = true;
		this.$.backupCreate.call(call_obj);
	}
});