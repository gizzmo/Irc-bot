/**
 * Help Plugin - Prints differnt help messages on the
 * IRC channel (as a privmessage)
 */

var util = require('util'),
	basePlugin = require('./basePlugin');

Plugin = exports.Plugin = function(irc, name) {
	Plugin.super_.call(this, irc, name)

	// Plugin name and version
	this.title = 'Help Messages';
	this.version = '0.1';

	// Help info with info on the commands
	this.help = 'This plugin provides the functionality to use the ' + this.irc.config.command + 'help command';
	this.helpCommands = [
		this.irc.config.command + 'help - lists the existing plugins and their commands'
	];

	// Triggers are messages that start with `!`
	this.irc.addTrigger(this, 'help', this.trigHelp);
};
util.inherits(Plugin, basePlugin.BasePlugin);

Plugin.prototype.trigHelp = function(msg) {
	var irc = this.irc,
		user = irc.users.find(msg.user),
		chan = irc.channels.find(msg.arguments[0]),
		m = msg.arguments[1],
		params = m.split(' ');

	// first is always the trigger (ie !command)
	params.shift();

	user.send('\002Available Plugins\002 and their commands:');
	for(var name in irc.plugins) {
		var plugin = irc.plugins[name];
		user.send('Plugin: ' + plugin.name + ' - ' + plugin.title +
			' - v' + plugin.version);

		var helpMessage = plugin.help;
		if (typeof helpMessage !== 'undefined') {
			user.send(helpMessage);
		}

		var helpCommands = plugin.helpCommands;
		if (typeof helpCommands !== 'undefined') {
			for (i in helpCommands) {
				user.send(helpCommands[i]);
			}
		}
	}
};
