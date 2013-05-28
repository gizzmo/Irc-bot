/**
 * Dummy Plugin
 */
var util = require('util'),
	basePlugin = require('./basePlugin');

Plugin = exports.Plugin = function(irc, name) {
	Plugin.super_.call(this, irc, name);

	this.title = 'Dummy Plugin';
	this.version = '0.1';

	// Help info with info on the commands
	this.help = 'This is a dummy plugin to aid in making plugins easyer.';
	this.helpCommands = [
		this.irc.config.command + 'dummy - does something.'
	];

	// Triggers are messages that start with `!`
	this.irc.addTrigger(this, 'trigger', this.trigTrigger);
};

util.inherits(Plugin, basePlugin.BasePlugin)

Plugin.prototype.trigTrigger = function(msg) {};

/**
 * List all possible Event Listeners
Plugin.prototype.onConnect = function(msg) {};
Plugin.prototype.onData = function(msg) {};
Plugin.prototype.onNumeric = function(msg) {};
Plugin.prototype.onMessage = function(msg) {};
Plugin.prototype.onJoin = function(msg) {};
Plugin.prototype.onPart = function(msg) {};
Plugin.prototype.onQuit = function(msg) {};
Plugin.prototype.onNick = function(msg) {};
Plugin.prototype.onPrivateMessage = function(msg) {};
 */
