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
		user = irc.users.find(line.nick),
		chan = irc.channels.find(line.arguments[0]),
		msg = line.arguments[1],
		params = msg.split(' ');

	// The first params is always the trigger (ie !command)
	if (typeof params[1] == 'undefined') {
		return chan.say('\002Example:\002 '+ this.helpCommands[0]);
	}

	// 1 in 100 chance for insult instead of 8ball usage
	if (Math.floor(Math.random()*1000) === 1) {

		var insults = [
			'Seriously, thats the question you\'re going to ask?',
			'Couldn\'t think of a better question?'
		]

		var insult = insults[Math.floor(Math.random()*insults.length)];
		return chan.say(insult);
	};

	var responses = [
		"Ask again later",
		"Better not tell you now",
		"Concentrate and ask again",
		"Don't count on it",
		"It is certain",
		"Most likely",
		"My reply is no",
		"My sources say no",
		"No",
		"Outlook good",
		"Outlook not so good",
		"Reply hazy, try again",
		"Signs point to yes",
		"Yes",
		"Yes, definitely",
		"You may rely on it"
	];

	var response = responses[Math.floor(Math.random()*responses.length)];

	// Shake the ball first then send the result
	chan.action('shakes the magic 8-ball...');

	setTimeout(function() { chan.say(response +', '+ user.nick) }, '1500');

};
