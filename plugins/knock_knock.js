/**
 * Know Knock joke Plugin
 */
var util = require('util'),
	basePlugin = require('./basePlugin');

Plugin = exports.Plugin = function(irc, name) {
	Plugin.super_.call(this, irc, name);

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

util.inherits(Plugin, basePlugin.BasePlugin)

Plugin.prototype.trigJoke = function(msg) {
	var irc = this.irc,
		user = irc.users.find(msg.nick), // the user who send the message
		chan = irc.channels.find(msg.arguments[0]), // the channel it was sent to
		m = msg.arguments[1]; // the message its self

	if (this.progress === 0){
		++this.progress;
		return chan.send('Ok, i\'ve got a joke for you. Knock Knock!');
	}
	else {
		return chan.send('I\'m already telling a joke, '+ user.nick);
	}
};

Plugin.prototype.onMessage = function(msg) {
	var irc = this.irc,
		user = irc.users.find(msg.nick), // the user who send the message
		chan = irc.channels.find(msg.arguments[0]), // the channel it was sent to
		m = msg.arguments[1]; // the message its self

	if (this.progress === 1) {
		if ( m.match(/^who(\'?s| is) there/i) ) {
			++this.progress;

			return chan.send('Doris!');
		}
	}
	else if (this.progress == 2) {
		if ( m.match(/doris who/i) ) {
			this.progress = 0;

			return chan.send('Doris locked, that\'s why im knocking!');
		};
	}
};
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
