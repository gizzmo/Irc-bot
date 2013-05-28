/**
 * Ping Plugin
 */
var util = require('util'),
	basePlugin = require('./basePlugin');

Plugin = exports.Plugin = function(irc, name) {
	Plugin.super_.call(this, irc, name);

	// Plugin name and version
	this.title = 'Ping';
	this.version = '0.1';

	// Help info with info on the commands
	this.help = 'Simple ping test.';
	this.helpCommands = [
		this.irc.config.command + 'ping'
	];

	// Triggers are messages that start with `!`
	this.irc.addTrigger(this, 'ping', this.trigPing);
};
util.inherits(Plugin, basePlugin.BasePlugin);

Plugin.prototype.trigPing = function(line) {
	var irc = this.irc,
		chan = irc.channels.find(line.arguments[0]);

	chan.send('Pong!');

};
