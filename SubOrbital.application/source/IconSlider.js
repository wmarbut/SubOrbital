enyo.kind({
	name: "IconSlider",
	kind: "SlidingView",
	layoutKind: "VFlexLayout",
	width: "320px",
	ready: function() {
		this.createComponent({kind:"TabList"})
	},
	currentRow: 0,
	iconData: {
		
	},
	currentList: false,
	chooseList: [
	],
	moveList: [
	],
	ready: function() {
		if (!window.PalmSystem) {
			this.iconData = {
				"icons": {
			        "com.palm.app.browser": {
			            "kind": "IconEntry",
			            "index": "1",
			            "id": "com.palm.app.browser",
			            "launchid": "com.palm.app.browser",
			            "launchtype": "1",
			            "type": "DimensionsSystemInterface::WebOSApp",
			            "__conf": false
			        },
			        "com.palm.app.phone": {
			            "kind": "IconEntry",
			            "index": "10",
			            "id": "com.palm.app.phone",
			            "launchid": "com.palm.app.phone",
			            "launchtype": "1",
			            "type": "DimensionsSystemInterface::WebOSApp",
			            "__conf": false
			        },
			        "com.palm.app.musicplayer": {
			            "kind": "IconEntry",
			            "index": "11",
			            "id": "com.palm.app.musicplayer",
			            "launchid": "com.palm.app.musicplayer",
			            "launchtype": "1",
			            "type": "DimensionsSystemInterface::WebOSApp",
			            "__conf": false
			        },
			        "com.palm.app.camera": {
			            "kind": "IconEntry",
			            "index": "12",
			            "id": "com.palm.app.camera",
			            "launchid": "com.palm.app.camera",
			            "launchtype": "1",
			            "type": "DimensionsSystemInterface::WebOSApp",
			            "__conf": false
			        },
			        "com.palm.app.photos": {
			            "kind": "IconEntry",
			            "index": "13",
			            "id": "com.palm.app.photos",
			            "launchid": "com.palm.app.photos",
			            "launchtype": "1",
			            "type": "DimensionsSystemInterface::WebOSApp",
			            "__conf": false
			        },
			        "org.webosinternals.wirc-enyo": {
			            "kind": "IconEntry",
			            "index": "1",
			            "id": "org.webosinternals.wirc-enyo",
			            "launchid": "org.webosinternals.wirc-enyo",
			            "launchtype": "1",
			            "type": "DimensionsSystemInterface::WebOSApp",
			            "__conf": false
			        },
			        "org.webosinternals.preware": {
			            "kind": "IconEntry",
			            "index": "2",
			            "id": "org.webosinternals.preware",
			            "launchid": "org.webosinternals.preware",
			            "launchtype": "1",
			            "type": "DimensionsSystemInterface::WebOSApp",
			            "__conf": false
			        }
				},
				"tabs": {
			        "APPS": [
			            "com.palm.app.browser",
			            "com.palm.app.phone",
			            "com.palm.app.musicplayer",
			            "com.palm.app.camera",
			            "com.palm.app.photos"
			        ],
			        "HOMEBREW": [
			            "org.webosinternals.wirc-enyo",
			            "org.webosinternals.preware"
			        ]
				}
			}
		}
		this.callIconSvcRead();
	},
	components: [
		{
			kind: "Group",
			caption: "Tab",
			components: [
				{
					kind: "ListSelector",
					content: " ",
					name: "chooseList",
					style: "height: 2em",
					flex: 1,
					items: [
						{caption: "Home"},
						{caption: "Settings"}
					],
					onChange: "selectedTabChanged"
				}
			]
		},
		{
			kind: enyo.VirtualList,
			onSetupRow: "setupRow",
			name: "iconList",
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
					name: "moveList",
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
		{
			name: "iconSvc",
			kind: "PalmService",
			service: "palm://com.whitm.suborbital.service/",
			method: "icons",
			onSuccess: "iconSvcSuccess",
			onFailure: "iconSvcFailure"
		}
	],
	callIconSvcRead: function() {
		if (window.PalmSystem) {
			this.$.iconSvc.call({"action":"rd"});
		} else {
			this.iconSvcSuccess(this, this.iconData);
		}
	},
	iconSvcSuccess: function(inSender, inResponse) {
		this.iconData = inResponse;
		//is the currentList attribute set?
		this.currentList = (this.currentList)? this.currentList : this.getFirstTab();
		//is the currentList attribute valid?
		this.currentList = (this.iconData.tabs[this.currentList])? this.currentList : this.getFirstTab();
		this.$.chooseList.setValue(this.currentList)
		this.updateLists();
	},
	iconSvcFailure: function(inSender, inResponse) {
		//TODO error has occurred
	},
	setupRow: function(inSender, inIndex) {
		if (this.iconData.tabs[this.currentList].length > 0 &&
			inIndex >= 0 &&
			inIndex < this.iconData.tabs[this.currentList].length) {
			this.$.iconItem.setContent('test: ' + this.iconData.tabs[this.currentList][inIndex]);
			return true;
		}
		return false;
	},
	selectedTabChanged: function(inSender, inValue, inOldValue) {
		this.currentList = inValue;
   		this.updateLists();
	},
	getFirstTab: function() {
		var ft = false;
		if (this.iconData) {
			for (var tab in this.iconData.tabs) {
				ft = tab;
				break;
			}
		}
		return ft;
	},
	updateLists: function() {
		//setup choose list
		this.chooseList = new Array();
		//setup move list
		this.moveList = new Array();
		//provide values to both lists
		for (var tab in this.iconData.tabs) {
			this.chooseList.push(tab);
			if (tab != this.currentList) {
				this.moveList.push(tab);
			}
		}
		//update the lists
		this.$.chooseList.setItems(this.chooseList);
		this.$.chooseList.setValue(this.currentList)
		this.$.moveList.setItems(this.moveList);
		this.$.moveList.setValue(this.moveList[0]);
		
		this.$.iconList.refresh();
	}
});
