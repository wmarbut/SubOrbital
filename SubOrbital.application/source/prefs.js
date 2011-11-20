/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
enyo.kind({
	kind: "Control",
	name: "Prefs",
	__getLaunchedCallbacks: [
	
	],
	components: [
		{
			name: "getPreferencesCall",
			kind: "PalmService",
			service: "palm://com.palm.systemservice/",
			method: "getPreferences",
			onSuccess: "getPreferencesSuccess",
			onFailure: "getPreferencesFailure"
		},
		{
			name: "setPreferencesCall",
			kind: "PalmService",
			service: "palm://com.palm.systemservice/",
			method: "setPreferences",
			onSuccess: "setPreferencesSuccess",
			onFailure: "setPreferencesFailure"
		}
	],
	getPreferencesSuccess: function(inSender, inResponse) {
		var response = (inResponse.launched)? true : false;
		this.notifyLaunchedCallbacks({"value": response});
	},
	getPreferencesFailure: function(inSender, inResponse) {
		this.notifyLaunchedCallbacks({"error":true});
	},
	setPreferencesSuccess: function(inSender, inResponse) {
		console.log("Successfully set launched preference");
	},
	setPreferencesFailure: function(inSender, inResponse) {
		console.log("Failed to set launched preference");
	},
	setLaunched: function(launched) {
		console.log("Setting launched pref: " + launched);
		if (window.PalmSystem) {
			this.$.setPreferencesCall.call({
			"launched":launched
			});
		}
	},
	getLaunched: function(callback) {
		this.__getLaunchedCallbacks.push(callback);
		if (window.PalmSystem) {
			this.$.getPreferencesCall.call({
				"keys":["launched"]
			})
		} else {
			var rand = (Math.round(Math.random()) == 1)? true: false;
			this.getPreferencesSuccess(this, {"launched":rand});
		}
	},
	notifyLaunchedCallbacks: function(message) {
		while (this.__getLaunchedCallbacks.length >0) {
			var cb = this.__getLaunchedCallbacks.shift();
			cb(message);
		}
	}
})