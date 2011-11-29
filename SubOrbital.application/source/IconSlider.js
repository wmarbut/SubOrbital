enyo.kind({
	name: "IconSlider",
	kind: "SlidingView",
	layoutKind: "VFlexLayout",
	width: "320px",
	ready: function() {
		this.createComponent({kind:"TabList"})
	},
	currentRow: 0,
	ready: function() {
	},
	components: [
		{
			kind: "Group",
			caption: "Tab",
			components: [
				{
					kind: "ListSelector",
					content: " ",
					style: "height: 2em",
					flex: 1,
					items: [
						{caption: "Home"},
						{caption: "Settings"}
					]
				}
			]
		},
		{
			kind: enyo.VirtualList,
			onSetupRow: "setupRow",
			flex: 1,
			components: [
				{
					kind: "Item",
					layoutKind: "HFlexLayout",
					components: [
						{name: "iconItem", flex: 1},
						{
							kind: "CheckBox"
						}
					]
				}
			]
		},
		{
			kind: "Group",
			caption: "Move To",
			layoutKind: "HFlexLayout",
			components: [
				{
					kind: "ListSelector",
					content: " ",
					style: "height: 2em",
					flex: 1,
					items: [
						{caption: "Home"},
						{caption: "Settings"}
					]
				},
				{
					kind: "Button",
					caption: "Move"
				}
			]
		},
		{kind: "Toolbar", components: [
			{kind: "GrabButton"},
		]},
	],
	setupRow: function(inSender, inIndex) {
		if (inIndex >= 0 && inIndex <6) {
			this.$.iconItem.setContent('test: ' + inIndex);
			return true;
		}
		return false;
	}
});
