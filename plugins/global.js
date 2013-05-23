/**
 * Global Functionalities and Boot Up
 */
var util = require('util'),
	basePlugin = require('./basePlugin');

Plugin = exports.Plugin = function(irc, name) {
	Plugin.super_.call(this, irc, name);

	this.title = 'Global';
	this.version = '0.1';
};

util.inherits(Plugin, basePlugin.BasePlugin)

Plugin.prototype.onNumeric = function(msg) {
	var irc = this.irc,
		command = msg.rawCommand,
		userchans = irc.userchannels;

	// 376 is end of MOTD/modes
	if (command !== '376') {
		return;
	}

	this.irc.logger.info('Joining channels: ', userchans);

	for (var i = 0; i < userchans.length; i++) {
		var channelName = userchans[i],
			password;

		if (typeof(channelName) == "object") {
			channelName = channelName.name;
			password = channelName.password;
		}

		var chan = new irc.channelObj(irc, channelName, true, password);
		irc.channels[chan.name] = chan;
	}
};
