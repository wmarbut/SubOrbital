/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
enyo.kind({
	kind: "Control",
	name: "errorLogger",
	events: {
		onSuccess: "",
		onFailure: ""
	},
	components: [
		{
			name: "logError",
			kind: "PalmService",
			service: "palm://com.whitm.suborbital.service/",
			method: "logError",
			onSuccess: "logSuccess",
			onFailure: "logFailure"
		}
	],
	writeLog: function(json_object) {
		this.$.logError.call({"error_data": json_object});
	},
	logSuccess: function(inSender, inResponse) {
		if (inResponse.error) {
			this.logFailure(this, inResponse);
			console.log("logger error: " + enyo.json.stringify(inResponse.error));
			return;
		}	
		console.log("Logging success");
		this.doSuccess({"file_name":inResponse.file_name});
	},
	logFailure: function(inSender, inResponse) {
		console.log("Logging failure - sender(" + inSender + ") response: " + enyo.json.stringify(inResponse));
		this.doFailure();
	}
});