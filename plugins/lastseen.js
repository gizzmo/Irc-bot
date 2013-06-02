/**
 * Last Seen Plugin
 */
var util = require('util'),
	basePlugin = require('./basePlugin');

Plugin = exports.Plugin = function(irc, name) {
	Plugin.super_.call(this, irc, name);

	// Plugin name and version
	this.title = 'Last Seen';
	this.version = '0.1';

	// Help info with info on the commands
	this.help = 'Keeps track of people, and informs other people of the last time they were seen.';
	this.helpCommands = [
		this.irc.config.command + 'lastseen <user>.'
	];

	// last seen info
	this.seen = [];

	// Triggers are messages that start with `!`
	this.irc.addTrigger(this, 'lastseen', this.trigLastSeen);
};
util.inherits(Plugin, basePlugin.BasePlugin);

Plugin.prototype.onMessage = function(line) {
	this.updateUser(line);
};

Plugin.prototype.onJoin = function(line) {
	this.updateUser(line);
};

Plugin.prototype.onPart = function(line) {
	this.updateUser(line);
};

Plugin.prototype.onQuit = function(line) {
	this.updateUser(line);
};

Plugin.prototype.onNick = function(line) {
	this.updateUser(line, true);
};

Plugin.prototype.updateUser = function(line, argument) {
	var u = line.nick;
	this.seen[u.toLowerCase()] = new Date();

	if (typeof argument != 'undefined') {
		var u = line.arguments[0];

		this.seen[u.toLowerCase()] = new Date();
	}
}

Plugin.prototype.trigLastSeen = function(line) {
	var c = line.arguments[0], // channel
		u = line.nick, // user
		m = line.arguments[1], // message
		chan = this.irc.channels[c], // channel object
		params = m.split(' ');

	params.shift();

	if (typeof params[0] == 'undefined') {
		chan.say('\002Example:\002 '+ this.helpCommands[0]);
	} else {
		var seek = params[0].toLowerCase();

		if (typeof this.seen[seek] == 'undefined') {
			chan.say('I have not seen \002' + params[ 0] + '\002 around here!');
		} else {
			var dat = this.seen[seek],
				lastDate = dat.getDate() + '-' + (dat.getMonth() + 1) + '-' + dat.getFullYear(),
				lastTime = dat.getHours() + ':' + dat.getMinutes() + ':' + dat.getSeconds();

			chan.say('I have seen \002' + params[ 0] + '\002 around here the last time on the: \002' + lastDate + '\002 at \002' + lastTime + '\002');
		}
	}
};
