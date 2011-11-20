/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
enyo.kind({
	kind: "Dialog",
	name: "newDialog",
	events: {
		onSave: ""
	},
	components: [
		{kind: "Group", caption: "Name", components: [
			{kind: "Input", name: "newField"}
		]},
		{layoutKind: "HFlexLayout", pack: "center", components: [
			{kind: "Button", caption: "Add", onclick: "save" ,popupHandler: true, className: "enyo-button-affirmative"},
			{kind: "Button", caption: "Cancel", popupHandler: true}
		]}
	],
	save: function(inSender, inEvent) {
		var new_name = this.$.newField.getValue();
		//TODO: validate name
		if (new_name.length > 0) {
			this.doSave(new_name.toUpperCase());
		}
	}
});