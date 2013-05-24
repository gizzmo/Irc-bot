/**
 * Reload Plugin
 */
var util = require('util'),
	basePlugin = require('./basePlugin');

Plugin = exports.Plugin = function(irc, name) {
	Plugin.super_.call(this, irc, name);

	this.title = 'Plugin Reloader';
	this.version = '0.1';

	this.irc.addTrigger(this, 'reload', this.loadPlugin);
	this.irc.addTrigger(this, 'unload', this.unloadPlugin);
};
util.inherits(Plugin, basePlugin.BasePlugin);

Plugin.prototype.loadPlugin = function(msg) {
	var irc = this.irc,          // irc object
		chan = irc.channels.find(msg.arguments[0]),  // channel object
		u = msg.nick,            // user
		m = msg.arguments[1],    // message
		params = m.split(' ');

	params.shift();
	irc.send(chan && chan.name || u, 'Reloading plugin: ' + params[0]);

	// dont crash on failure
	try {
		irc.loadPlugin(params[0]);
	} catch (err) {
		chan.send(err)
	}

};

Plugin.prototype.unloadPlugin = function(msg) {
	var irc = this.irc,          // irc object
		chan = irc.channels.find(msg.arguments[0]),  // channel object
		u = msg.nick,            // user
		m = msg.arguments[1],    // message
		params = m.split(' ');

	params.shift();
	irc.send(chan && chan.name || u, 'unloading plugin: ' + params[ 0]);
	irc.unloadPlugin(params[0]);
};
