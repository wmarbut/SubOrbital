/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
enyo.kind({
	kind: enyo.VFlexBox,
	name: "SubOrbitalMain",
	components: [
		{
			kind: "SlidingPane",
			flex: 1,
			components: [
				{kind:"MainSlider"},
				{kind:"BackupSlider"},
				{kind:"IconSlider"}
			]
		}
	]
})