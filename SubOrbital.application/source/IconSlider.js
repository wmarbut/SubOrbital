enyo.kind({
	name: "IconSlider",
	kind: "SlidingView",
	width: "320px",
	ready: function() {
		this.createComponent({kind:"TabList"})
	},
	currentRow: 0,
	ready: function() {
		this.loadRows()
	},
	components: [
		{
			kind: "VFlexBox",
			name: "tablists",
			components: [
				
			]
		},
		{kind: "Toolbar", components: [
			{kind: "GrabButton"},
		]},
	],
	loadRows: function() {
		count = 2;
		for (var i=0; i< count; i++) {
			if (i%2 == 0) {
				this.currentRow += 1;
				var currentRow = this.currentRow;
				this.$.tablists.createComponent({
					kind: "HFlexBox",
					name: ("row" + currentRow)
				});
			}
			rowName = "row"+this.currentRow;
			this.$.tablists.$[rowName].createComponent({kind: "TabList"});
		}
	}
});
