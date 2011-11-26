/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
enyo.kind({
	kind: "SlidingView",
	name: "BackupSlider",
	layoutKind: "VFlexLayout",
	width: "320px",
	backup_data: [
		{name:"test1", fileName: "test1.bak"},
		{name:"test2", fileName: "test2.bak"}
	],
	events: {
		onRestore: ""
	},
	ready: function() {
		if (window.PalmSystem) {
			this.backup_data = [];
			this.$.backupmanager.getBackups(enyo.bind(this, this.receiveList));
		}
	},
	components: [
		{
			kind: "PageHeader",
			content: "SubOrbital - Backup Manager"
		},
		{
			name: "backupsList",
			kind: enyo.VirtualList,
			width: "320px",
			flex: 1,
			onSetupRow: "setupRow",
			components: [
				{
					kind: "Item", 
					name: "listItem",
					layoutKind: "HFlexLayout",
					onclick: "selectItem",
					components: [
						{name:"backup_name"}
					],
				}
			]
		},
		{
			kind:"Group",
			caption:"Backup Controls",
			components: [
				{
					kind: "Button",
					caption: "New Backup",
					onclick: "newBackup"
				},
				{
					kind: "Button",
					caption: "Restore Selected Backup",
					onclick: "confirmRestore",
					onConfirm: "doRestore"
				}
			]
		},
		{kind: "Toolbar", components: [
			{kind: "GrabButton"},
		]},
		{kind: "confirmRestoreDialog", onConfirm: "performRestore"},
		{kind: "BackupManager", name: "backupmanager"},
		{kind: "newBackupDialog", onSave: "newBackupCall"}
	],
	setupRow: function(inSender, inIndex) {
		if (inIndex < this.backup_data.length && inIndex >= 0) {
			var backup = this.backup_data[inIndex];
			var display_name = backup.name + " (" + backup.month + "/" + backup.day + "/" + backup.year + " " + backup.hour + ":" + backup.minute +")"
			this.$.backup_name.setContent(display_name);
			this.$.listItem.applyStyle("background", inSender.isSelected(inIndex)? "lightblue": null);
			return true;
		}
		return false;
	},
	selectItem: function(inSender, inEvent) {
		this.$.backupsList.select(inEvent.rowIndex);
	},
	confirmRestore: function(inSender, inEvent) {
		var selection = this.$.backupsList.getSelection().lastSelected;
		//console.log("confirm restore " + selection);
		if (selection) {
			this.$.confirmRestoreDialog.open();
			this.$.confirmRestoreDialog.setBackupFile(this.backup_data[selection].fileName);
		}
	},
	performRestore: function(inSender, name) {
		this.$.backupmanager.restoreBackup(name);
	},
	restorePerformedCallbackup: function(inSender, inResponse) {
		this.doRestore(); //fire onRestore event
	},
	receiveList: function(inResponse) {
		var backups = inResponse.backups;
		if (!backups) {
			console.log("No backups found");
			return;
		}
		this.backup_data = backups;
		this.$.backupsList.refresh();
	},
	newBackup: function(inSender, inEvent) {
		this.$.newBackupDialog.open();
	},
	newBackupCall: function(inSender, name) {
		name = (name)? name: "backup";
		this.$.backupmanager.newBackup(enyo.bind(this, this.receiveList), name);
	}
});