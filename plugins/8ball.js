/**
 * 8 Ball Plugin
 */
var util = require('util'),
	basePlugin = require('./basePlugin');

Plugin = exports.Plugin = function(irc, name) {
	Plugin.super_.call(this, irc, name);

	// Plugin name and version
	this.title = '8Ball';
	this.version = '0.0.1';

	// Help info with info on the commands
	this.help = 'Ask the Magic 8 Ball a question.';
	this.helpCommands = [
		this.irc.config.command + '8ball <question>'
	];

	// Triggers are messages that start with `!`
	this.irc.addTrigger(this, '8ball', this.trig8Ball);
};
util.inherits(Plugin, basePlugin.BasePlugin);

Plugin.prototype.trig8Ball = function(line) {
	var irc = this.irc,
		user = line.nick,
		chan = irc.channels.find(line.arguments[0]),
		msg = line.arguments[1],
		params = msg.split(' ');

	// The first params is always the trigger (ie !command)
	if (typeof params[1] == 'undefined') {
		return chan.say('You should ask a question. \002Example:\002 '+ this.helpCommands[0]);
	}

	var responses = [
		// Classic
		'Ask again later.',
		'Better not tell you now.',
		'Concentrate and ask again.',
		'Don\'t count on it.',
		'It is certain.',
		'Most likely.',
		'My reply is no.',
		'My sources say no.',
		'No.',
		'Outlook good.',
		'Outlook not so good.',
		'Reply hazy, try again.',
		'Signs point to yes.',
		'Yes.',
		'Yes, definitely.',
		'You may rely on it.',

		// Positive
		'It is possible.',
		'Yes!',
		'Of course.',
		'Naturally.',
		'Obviously.',
		'One would be wise to think so.',
		'The outlook is good.',
		'It shall be.',
		'The answer is certainly yes.',
		'It is so.',

		// Negative
		'In your dreams.',
		'No.',
		'No chance.',
		'Unlikely.',
		'About as likely as pigs flying.',
		'The outlook is poor.',
		'I doubt it very much.',
		'The answer is a resounding no.',
		'NO!',
		'NO.',

		// Neutral
		'Maybe...',
		'The outlook is hazy, please ask again later.',
		'No clue.'
	];

	var response = responses[Math.floor(Math.random()*responses.length)];

	chan.action('shakes the magic 8 ball...');

	// respond after a few seconds.
	setTimeout(function() {
		chan.say(response);
	}, 1000);
};
