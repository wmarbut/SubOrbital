/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
enyo.kind({
	kind: "ModalDialog",
	name: "readMe",
	style: "width: 75%",
	lazy: false,
	components: [
		{
			kind: "HFlexBox",
			pack: "end",
			components: [
				{
					flex: 1,
					content: "Read Me"
				},
				{
					kind: "Button",
					caption: "X",
					popupHandler: true
				}
			]
		},
		{
			kind: "VFlexBox",
			components: [
				{
					kind: "BasicScroller",
					components: [
						{
							kind: "HtmlContent", srcId: "readMe"
						},
					]
				},	
			]
		}
	],
	firstLaunch: function(fl) {
		if (fl) {
			this.$.button.hide();
			setTimeout(enyo.bind(this,function(){
				this.$.button.show();
			}),3000);
		}
	}
});