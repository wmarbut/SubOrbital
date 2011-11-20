/*
	This work is licensed under a Creative Commons Attribution, Non-Commercial, Share-a-like license
	It can be found here http://creativecommons.org/licenses/by-nc-sa/3.0/
	Copyright @grep_awesome 2011
*/
var libraries = MojoLoader.require({ name: "foundations", version: "1.0" }, {name:"foundations.json", version: "1.0"});
var PalmCall  = libraries["foundations"].Comms.PalmCall;
var exec = IMPORTS.require("child_process").exec;
var RestartAssistant = function() {
}
RestartAssistant.prototype.run = function(future) {
	console.log("Restart assistant called");
	exec('luna-send -n 1 palm://ca.canucksoftware.systoolsmgr/lunaRestart \'{}\'', function(error, stdout, stderr) {
		if (error)
			console.log("Restart Error: " +error);
		if (stdout)
			console.log("Restart Stdout: " + stdout);
		if (stderr)
			console.log("Restart Stderr: " + stderr);
	});
}