/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
enyo.kind({
	kind: "Dialog",
	name: "newBackupDialog",
	events: {
		onSave: ""
	},
	components: [
		{kind: "Group", caption: "Name (alphanumeric. no spaces)", components: [
			{kind: "Input", name: "newBackup", hint: "backup"}
		]},
		{layoutKind: "HFlexLayout", pack: "center", components: [
			{kind: "Button", caption: "Create", onclick: "save" ,popupHandler: true, className: "enyo-button-affirmative"},
			{kind: "Button", caption: "Cancel", popupHandler: true}
		]}
	],
	save: function(inSender, inEvent) {
		var new_name = this.$.newBackup.getValue();
		this.doSave(new_name);
	}
});