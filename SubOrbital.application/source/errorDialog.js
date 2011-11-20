/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
enyo.kind({
	kind: "ModalDialog",
	name: "errorDialog",
	style: "width: 90%",
	components: [
		{
			content: "An Error has occurred",
			style: "text-align:center; font-size:1.5em"
		},
		{
			content: "Any changes requested were not saved. An error log has been created:"
		},
		{
			name: "filePath",
			content: "error data"
		},
		{
			kind: "Button",
			caption: "Ok",
			popupHandler: true
		}
	],
	setFilePath: function(filePath) {
		this.$.filePath.setContent(" /media/internal/SubOrbital/" + filePath);
	}
});