/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
enyo.kind({
	//kind: "VFlexBox",
	kind: "SlidingView",
	layoutKind: "VFlexLayout",
	name: "MainSlider",
	tab_data: [
	
	],
	svcDebug: false,
	built_in_tabs: {
		"APPS": {
			"name":"APPS",
			"index":0
		},
		"DOWNLOADS": {
			"name":"DOWNLOADS",
			"index":1
		},
		"FAVORITES": {
			"name":"FAVORITES",
			"index":2
		},
		"SETTINGS": {
			"name":"SETTINGS",
			"index":3
		},
	},
	ready: function() {
		if (window.PalmSystem) {
			this.$.launcherSvc.call({
				"tabArgs": {
					"action":"rd"
				}
			});
			this.$.prefs.getLaunched(enyo.bind(this,this.prefsReturn));
		} else {
			this.tab_data = [
				{name:"Apps", index:0},
				{name:"Downloads",index:1},
				{name:"Favorites",index:2},
				{name:"Settings", index:3}
			];
			this.$.tabsList.refresh();
		}
	},
	components: [
		{
			kind: "PageHeader",
			content: "SubOrbital - Beta 1"
		},
		{
			kind: "HFlexBox",
			pack: "center",
			style: "text-align: center",
			content: "Add/Customize additional launcher tabs. Use the readme if you have questions<br/>Written by @grep_awesome",
		},
		{
			kind: enyo.VirtualList, 
			name: "tabsList", 
			flex: 1,
			onSetupRow: "setupRow", 
			components: [
				{
					kind: "Item", 
					layoutKind: "HFlexLayout",
					onclick: "selectItem",
					Xonmousedown: "selectItem",
					name: "listItem",
					components: [
						{name: "tab_name", flex: 1},
						{name: "tab_index", flex: 1}
					]
				}
			]
		},
		{
			kind: "Prefs"
		},
		{
			name: "errorLogger",
			kind: "errorLogger",
			onSuccess: "showErrorDialog"
		},
		{
			name: "launcherSvc",
			kind: "PalmService",
			service: "palm://com.whitm.suborbital.service/",
			method: "launcher",
			onSuccess: "launcherSuccess",
			onFailure: "launcherFailure"
		}, 
		{
			name: "restartSvc",
			kind: "PalmService",
			service: "palm://com.whitm.suborbital.service/",
			method: "restartLuna",
			onSuccess: "restartSuccess",
			onFailure: "restartFailure"
		},
		{
			kind: "Group",
			layoutKind: "HFlexLayout",
			components: [
				{
					kind: "Group",
					flex: 1,
					caption: "Move",
					components: [
						{
							kind: "Button",
							caption: "Up",
							className: "enyo-button-blue",
							onclick: "moveUpButton"
						},
						{
							kind: "Button",
							caption: "Down",
							className: "enyo-button-blue",
							onclick: "moveDownButton"
						}
					]
				},
				{
					kind: "Group",
					flex: 1,
					caption: "Edit",
					components: [
						{
							kind: "Button",
							caption: "New",
							className: "enyo-button-affirmative",
							onclick: "newButton"
						},
						{
							kind: "Button",
							caption: "Rename",
							onclick: "renameButton"
						},
						{
							kind: "Button",
							caption: "Delete",
							className: "enyo-button-negative",
							onclick: "deleteButton"
						}
					]
				},
				{
					kind:"Group",
					flex: 1,
					caption:"App",
					components: [
						{
							kind: "Button",
							caption: "Readme",
							className: "enyo-button-blue",
							onclick: "openReadMe"
						},
						{
							kind: "Button",
							caption: "Luna Restart",
							className: "enyo-button-blue",
							onclick: "confirmRestart"
						}
					]
				}
			]
		},
		{
			kind: "renameDialog",
			onSave: "renameTab"
		},
		{
			kind: "newDialog",
			onSave: "newTab"
		},
		{
			kind: "deleteDialog",
			onSave: "deleteTab"
		},
		{
			kind: "errorDialog"
		},
		{
			kind: "lockedNotice"
		},
		{
			kind: "Dialog",
			name: "restartConfirmDialog",
			components: [
				{content: "Are you sure you want to restart Luna?", style: "padding-left:10px; text-align:center"},
				{
					kind: "HFlexBox",
					pack: "center",
					components:[
						{kind: "Button", caption: "Yes, Restart" ,onclick: "performRestart", className: "enyo-button-negative", popupHandler: true},
						{kind: "Button", caption: "Cancel", popupHandler: true}
					]
				}
			]
		},
		{
			kind: "readMe"
		}
	],
	setupRow: function(inSender, inIndex) {
		if (inIndex < this.tab_data.length && inIndex >= 0) {
			this.$.tab_name.setContent(this.tab_data[inIndex].name);
			this.$.listItem.applyStyle("background", inSender.isSelected(inIndex)? "lightblue" : null);
			return true;
		}
		return false;
	},
	newButton: function(inSender, inEvent) {
		this.$.newDialog.open();
	},
	newTab: function(inSender,name) {
		var debug = this.svcDebug;
		console.log("Create: " + name);
		if (window.PalmSystem) {
			this.$.launcherSvc.call({
				"tabArgs": {
					"action":"new",
					"name":name
				},
				"save":true,
				"debug":debug
			});
		} else {
			this.tab_data.push({"name":name,"index":this.tab_data.length});
			this.$.tabsList.refresh();
		}
	},
	renameButton: function(inSender, inEvent) {
		var selection = this.$.tabsList.getSelection().lastSelected;
		var tab = (selection)? this.tab_data[selection]: false;
		if (tab && !this.built_in_tabs[tab.name.toUpperCase()]) {
			this.$.renameDialog.open();
			this.$.renameDialog.setName(tab);
		} else {
			this.$.lockedNotice.open();
		}
	},
	renameTab: function(inSender, item) {
		var debug = this.svcDebug;
		if (window.PalmSystem) {
			this.$.launcherSvc.call({
				"tabArgs": {
					"action":"rnm",
					"index":item.index,
					"name":item.name
				},
				"save":true,
				"debug":debug
			});
		} else {
			console.log(item);
			this.tab_data[item.index].name = item.name;
			this.$.tabsList.refresh();
		}
	},
	deleteButton: function(inSender, inEvent) {
		var selection = this.$.tabsList.getSelection().lastSelected;
		var selection = this.$.tabsList.getSelection().lastSelected;
		var tab = (selection)? this.tab_data[selection]: false;
		if (tab && !this.built_in_tabs[tab.name.toUpperCase()]) {
			this.$.deleteDialog.open();
			this.$.deleteDialog.setItem(tab);
			var del_tab_list = this.tab_data.slice(0);
			for (var en in this.built_in_tabs) {
				del_tab_list.push(this.built_in_tabs[en]);
			}
			this.$.deleteDialog.setTabList(del_tab_list);
		} else {
			this.$.lockedNotice.open();
		}
	},
	deleteTab: function(inSender, inEvent) {
		var index = inEvent.index;
		var item = inEvent.item;
		var moveTo = inEvent.moveTo;
		var debug = this.svcDebug;
		console.log("Delete: " + item + " move to: " + moveTo);
		if (window.PalmSystem) {
			this.$.launcherSvc.call({
				"tabArgs": {
					"action":"del",
					"item":item,
					"moveTo":moveTo
				},
				"save":true,
				"debug":debug
			});
		} else {
			this.tab_data.splice(index,1);
			this.$.tabsList.refresh();
		}
	},
	moveUpButton: function(inSender, inEvent) {
		var selection = this.$.tabsList.getSelection().lastSelected;
		console.log("Moving up: " + this.tab_data[selection].name);
		var debug = this.svcDebug;
		if (window.PalmSystem) {
			this.$.launcherSvc.call({
				"tabArgs": {
					"action":"mv",
					"name":this.tab_data[selection].name,
					"delta":-1
				},
				"save": true,
				"debug":debug
			})
		}
	},
	moveDownButton: function(inSender, inEvent) {
		var selection = this.$.tabsList.getSelection().lastSelected;
		console.log("Moving down: " + this.tab_data[selection].name);
		var debug = this.svcDebug;
		if (window.PalmSystem) {
			this.$.launcherSvc.call({
				"tabArgs": {
					"action":"mv",
					"name":this.tab_data[selection].name,
					"delta":1
				},
				"save": true,
				"debug":debug
			})
		}
	},
	launcherSuccess: function(inSender, inResponse) {
		console.log("launcher service succeeded");
		console.log(enyo.json.stringify(inResponse.data));
		this.tab_data = new Array();
		for (var entry_i in inResponse.data) {
			var entry = inResponse.data[entry_i];
				this.tab_data.push(entry);
		}
		if (inResponse.error && inResponse.error.length > 0) {
			this.$.errorLogger.writeLog(inResponse.error)
		}
		this.$.tabsList.refresh();
		if (inResponse.newIndex) {
			this.selectItem(this, {rowIndex: inResponse.newIndex});
		}
	},
	launcherFailure: function(inSender, inResponse) {
		console.error("The launcher service call failed");
		console.error(inSender);
		console.error(enyo.json.stringify(inResponse));
	},
	selectItem: function(inSender, inEvent) {
		this.$.tabsList.select(inEvent.rowIndex);
	},
	openReadMe: function(inSender, inEvent) {
		this.$.readMe.openAtCenter();
	},
	prefsReturn: function(launched) {
		console.log("prefs loaded: " + enyo.json.stringify(launched));
		if (!launched.value) {
			setTimeout(enyo.bind(this, function() {
				this.$.readMe.openAtCenter();
				this.$.readMe.firstLaunch(true);
			}), 300);
			this.$.prefs.setLaunched(true);
		}
	},
	confirmRestart: function(inSender, inEvent) {
		this.$.restartConfirmDialog.open();
	},
	performRestart: function(inSender, inEvent) {
		if (window.PalmSystem) {
			this.$.restartSvc.call({});
		}
	},
	restartSuccess: function(inSender, inResponse) {
		console.log("going down for a restart");
	},
	restartFailure: function(inSender, inResponse) {
		console.log("unable restart")
	},
	showErrorDialog: function(inSender, inEvent) {
		console.log("Show error dialog");
		console.log(inSender);
		console.log(enyo.json.stringify(inEvent));
		this.$.errorDialog.openAtCenter();
		this.$.errorDialog.setFilePath(inEvent.file_name);
	}
});