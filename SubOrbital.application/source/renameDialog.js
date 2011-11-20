/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
enyo.kind({
	kind: "Dialog",
	name: "renameDialog",
	lazy: false,
	events: {
		onSave: ""
	},
	itemIndex: 0,
	components: [
		{kind: "Group", caption: "Rename", components: [
			{kind: "Input", name: "renameField"}
		]},
		{layoutKind: "HFlexLayout", pack: "center", components: [
			{kind: "Button", caption: "Save", onclick:"save" ,popupHandler: true, className: "enyo-button-affirmative"},
			{kind: "Button", caption: "Cancel", popupHandler: true}
		]}
	],
	setName: function(entry) {
		this.itemIndex = entry.index;
		this.$.renameField.setValue(entry.name);
	},
	save: function(inSender, inEvent) {
		this.doSave({index: this.itemIndex, name: this.$.renameField.getValue()});
	}
})