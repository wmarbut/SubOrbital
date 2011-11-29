enyo.kind({
	name: "TabList",
	kind: "VFlexBox",
	width: "200px",
	height: "200px",
	style:"background: blue;border: solid black 1px",
	components: [
		{
			kind: "PageHeader",
			content: "Tab"
		},
		{
			kind: enyo.VirtualList,
			name: "iconList",
			onSetupRow: "setupRow",
			components: [
				{
					kind: "Item",
					layoutKind: "HFlexLayout",
					components: [
						{name: "listItem"}
					]
				}
			]
		}
	],
	setupRow: function(inSender, inIndex) {
		if (inIndex > 0 && inIndex < 10) {
			console.log("icon: " + inIndex);
			this.$.listItem.setContent("Icon: " + inIndex);
			return true;
		}
		return false;
	}
})
