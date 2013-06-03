/**
 * Dummy Plugin
 */
var util = require('util'),
	basePlugin = require('./basePlugin');

Plugin = exports.Plugin = function(irc, name) {
	Plugin.super_.call(this, irc, name);

	// Plugin name and version
	this.title = 'Dummy Plugin';
	this.version = '0.0.1';

	// Help info with info on the commands
	this.help = 'This is a dummy plugin to aid in making plugins easyer.';
	this.helpCommands = [
		this.irc.config.command + 'dummy - does something.'
	];

	// Triggers are messages that start with `!`
	this.irc.addTrigger(this, 'trigger', this.trigTrigger);
};
util.inherits(Plugin, basePlugin.BasePlugin);

Plugin.prototype.trigTrigger = function(line) {
	var irc = this.irc,
		user = irc.users.find(line.user),
		// this could be the botname if a private message
		chan = irc.channels.find(line.arguments[0]),
		msg = line.arguments[1],
		params = msg.split(' ');

	// The first params is always the trigger (ie !command)
	params.shift();

};

/**
 * List all possible Event Listeners

// When this bot connects to a server
Plugin.prototype.onConnect = function(line) {};

// When data is recieved from the server
Plugin.prototype.onData = function(line) {};

// The the line from the server is numerical
Plugin.prototype.onNumeric = function(line) {};

// When somone in a channel says something
Plugin.prototype.onMessage = function(line) {};

// When somone sends a private message to the bot
Plugin.prototype.onPrivateMessage = function(line) {};

// When a user joins/parts/quits from a channel
// (this could include the bot its self)
Plugin.prototype.onJoin = function(line) {};
Plugin.prototype.onPart = function(line) {};
Plugin.prototype.onQuit = function(line) {};

// When someone changes their nick
Plugin.prototype.onNick = function(line) {};
 */
