/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
enyo.kind({
	kind: "Dialog",
	name: "deleteDialog",
	events: {
		onSave: ""
	},
	itemIndex: 0,
	components: [
		{
		name: "deleteHeader",
		style: "padding-left: 10px;text-align:center; font-weigth: bold; font-size: 1.5em",
		content: "Delete: "
		},
		{
			kind: "Group",
			caption: "Where should the icons from the deleted tab be moved?",
			components: [
				{
					kind: "Picker",
					items: [
						"Choose One"
					]
				}
			]
		},
		{layoutKind: "HFlexLayout", pack: "center", components: [
			{kind: "Button", caption: "Delete", onclick: "save", popupHandler: true, className: "enyo-button-negative"},
			{kind: "Button", caption: "Cancel", popupHandler: true}
		]}
	],
	setTabList: function(tabs) {
		if (tabs && tabs.length >0) {
			var items = [];
			for (var ti in tabs) {
				items.push(tabs[ti].name);
			}
			this.$.picker.setItems(items);
			this.$.picker.setValue(items[0]);
		}
	},
	setItem: function(item) {
		this.$.deleteHeader.setContent("Delete: " + item.name);
		this.itemIndex = item.index;
	},
	save: function(inSender, inEvent) {
		this.doSave({"index": this.itemIndex, "moveTo": this.$.picker.getValue()});
	}
});