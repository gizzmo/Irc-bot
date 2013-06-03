/**
 * Knock-Knock joke Plugin
 */
var util = require('util'),
	basePlugin = require('./basePlugin');

Plugin = exports.Plugin = function(irc, name) {
	Plugin.super_.call(this, irc, name);

	// Plugin name and version
	this.title = 'Knock Knock Plugin';
	this.version = '0.1';

	// Help info with info on the commands
	this.help = 'This plugin tells knock-knock jokes (right now only one, maye more soon).';
	this.helpCommands = [
		this.irc.config.command + 'joke - starts the knock-knock joke.'
	];

	// Triggers are messages that start with `!`
	this.irc.addTrigger(this, 'joke', this.trigJoke);

	// current joke progress
	this.progress = 0;
};

util.inherits(Plugin, basePlugin.BasePlugin);

Plugin.prototype.trigJoke = function(line) {
	var irc = this.irc,
		user = irc.users.find(line.nick),
		chan = irc.channels.find(line.arguments[0]), // the channel it was sent to
		msg = line.arguments[1]; // the message its self

	if (this.progress === 0){
		++this.progress;
		return chan.say('Ok, i\'ve got a joke for you. Knock Knock!');
	}
	else {
		return chan.say('Shush '+user.nick+', I\'m already telling a joke! Try again in a min.');
	}

	// reset progress after 1 minutes
	var self = this;
	this.reset = setTimeout(function() { that.progress = 0; }, 60*1000);
};

Plugin.prototype.onMessage = function(line) {
	var irc = this.irc,
		user = irc.users.find(line.nick),
		chan = irc.channels.find(line.arguments[0]),
		msg = line.arguments[1];

	if (this.progress === 1) {
		if ( msg.match(/^who(\'?s| is) there/i) ) {
			++this.progress;

			return chan.say('Doris!');
		}
	}
	else if (this.progress == 2) {
		if ( msg.match(/doris who/i) ) {
			this.progress = 0;
			clearTimeout(this.reset);

			return chan.say('Doris locked, that\'s why im knocking!');
		}
	}
};
