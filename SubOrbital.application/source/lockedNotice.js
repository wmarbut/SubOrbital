enyo.kind({
	kind: "Dialog",
	name: "lockedNotice",
	components: [
		{
			style: "text-align:center",
			content: "This tab is a built in tab and cannot be renamed or deleted."
		},
		{
			kind: "Button",
			caption: "Ok",
			popupHandler: true
		}
	]
});
