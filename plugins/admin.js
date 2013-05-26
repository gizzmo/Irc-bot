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
	var irc = this.irc,
		chan = irc.channels.find(msg.arguments[0]),
		m = msg.arguments[1],
		params = m.split(' ');

	//
	if (typeof params[1] == 'undefined') {
		return chan.send('\002Example:\002 ' + irc.config.command + 'admin <command> <options>');
	}

	//
	var command = params[1].toLowerCase(),
		options = params.splice(2);

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
}
