/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
enyo.kind({
	kind: "Dialog",
	name: "confirmRestoreDialog",
	events: {
		onConfirm: ""
	},
	backup_file: "",
	components: [
		{
			content: "Are you sure you wish to restore your launcher tabs and icons to a backup?",
			style: "text-align: center; font-size: 1.25em"
		},
		{
			content: "Doing so will delete your current tabs and icon placement. There is no undo button.",
			style: "text-align: center"
		},
		{
			content: "",
			name: "backupFileField",
			style: "text-align: center"
		},
		{
			kind: "Button",
			caption: "Restore",
			popupHandler: true, 
			className: "enyo-button-negative",
			onclick: "confirmed"
		},
		{
			kind: "Button",
			caption: "Cancel",
			popupHandler: true
		}
	],
	confirmed: function(inSender, inEvent) {
		this.doConfirm(this.backup_file);
	},
	setBackupFile: function(backup_file) {
		this.backup_file = backup_file;
		this.$.backupFileField.setContent("Backup name: " + this.backup_file);
	}
});