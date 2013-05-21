/**
 * 8 Ball Plugin
 */
var util = require('util'),
	basePlugin = require('./basePlugin');

Plugin = exports.Plugin = function(irc, name) {
	Plugin.super_.call(this, irc, name);

	this.title = '8Ball';
	this.version = '0.0.1';

	this.irc.addTrigger(this, '8ball', this.trig8Ball);
};
util.inherits(Plugin, basePlugin.BasePlugin);

Plugin.prototype.trig8Ball = function(msg) {
	var irc = this.irc,          // irc object
		nick = msg.nick,         // nick
		c = msg.arguments[0],    // channel
		chan = irc.channels[c],  // channel object
		m = msg.arguments[1],    // message
		params = m.split(' ');   // params

	params.shift();

	if (typeof params[0] == 'undefined') {
		return chan.send('\002Example:\002 ' + irc.config.command + '8ball <question>');
	}

	var lines = [
		"Ask again later.",
		"Better not tell you now.",
		"Concentrate and ask again.",
		"Don't count on it.",
		"It is certain.",
		"Most likely.",
		"My reply is no.",
		"My sources say no.",
		"No.",
		"Outlook good.",
		"Outlook not so good.",
		"Reply hazy, try again.",
		"Signs point to yes.",
		"Yes.",
		"Yes, definitely.",
		"You may rely on it."
	];

	var item = lines[Math.floor(Math.random()*lines.length)];
	chan.send(item);


};
