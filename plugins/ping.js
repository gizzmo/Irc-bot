/**
 * Ping Plugin
 */
var util = require('util'),
	basePlugin = require('./basePlugin');

Plugin = exports.Plugin = function(irc, name) {
	Plugin.super_.call(this, irc, name);

	this.title = 'Ping';
	this.version = '0.1';

	this.irc.addTrigger(this, 'ping', this.trigPing);
};
util.inherits(Plugin, basePlugin.BasePlugin);

Plugin.prototype.trigPing = function(msg) {
	var irc = this.irc,          // irc object
		chan = irc.channels.find(msg.arguments[0]);  // channel object

	chan.send('Pong!');
};
