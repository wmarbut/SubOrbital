/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
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
