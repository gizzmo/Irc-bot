/**
 * Admin Plugin
 */
var util = require('util'),
	basePlugin = require('./basePlugin');

Plugin = exports.Plugin = function(irc, name) {
	Plugin.super_.call(this, irc, name);

	this.title = 'Admin Services';
	this.version = '0.1';

	this.irc.addTrigger(this, 'admin', this.trigAdmin);
};
util.inherits(Plugin, basePlugin.BasePlugin);

Plugin.prototype.trigAdmin = function(msg) {
	var irc = this.irc,          // irc object
		c = msg.arguments[0],    // channel
		chan = irc.channels[c],  // channel object
		u = msg.nick;            // user;

	try {
		var commandObj = this.parseTriggerMessage(msg);
	} catch (e) {
		return chan.send('\002Example:\002 ' + irc.config.command + 'admin <command> <options>');
	}

	var command = commandObj.command;
	var options = commandObj.options;

	if (command === 'nick') {
		irc.raw('NICK', options[0]);
	}
	else if (command === 'join') {
		if (typeof options[0] !== 'undefined') {
			var chan = new irc.channelObj(irc, options[0], true, options[1]);
			irc.channels[chan.name] = chan;
		}
	}
	else if (command === 'part') {
		if (typeof options[0] !== 'undefined') {
			var chan = irc.channels[options[0]];
			if (typeof chan !== 'undefined') {
				// could lead to errors, need to fix
				chan.part('admin requested me to leave!');
				delete irc.channels[options[0]];
			}
		}
	}
	else if (seek === 'readnewmemo') {
		irc.send('MemoServ', 'READ NEW');
	}
}
