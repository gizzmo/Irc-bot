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
	this.help = 'This plugin tells knock-knock jokes (right now only one, maybe more soon).';

	// current joke progress
	this.progress = 0;
	this._reset;
};

util.inherits(Plugin, basePlugin.BasePlugin);

Plugin.prototype.onMessage = function(line) {
	var irc = this.irc,
		user = line.nick,
		chan = irc.channels.find(line.arguments[0]),
		msg = line.arguments[1];

	// start proccess
	var regex = new RegExp('^'+irc.nick+'[\\s,.]+(?:will\\s+you\\s+)?(?:tell\\s+me\\s+a\\s+joke)(?:[\\s,.]+please)?[\\s.?!]*$', 'i'),
		match = msg.match(regex);

	if (match) {
		if (this.progress === 0) {
			++this.progress;
			this.setReset();

			chan.say('Ok, i\'ve got a joke for you. Knock Knock!');
		}
		else {
			return chan.say('Shush '+user+', I\'m already telling a joke! Try again in a bit.');
		}

	}

	if (this.progress === 1) {
		if ( msg.match(/^who(\'?s| is) there/i) ) {
			++this.progress;
			this.setReset();

			chan.say('Doris.');
		}
	}
	else if (this.progress == 2) {
		if ( msg.match(/doris who/i) ) {
			this.progress = 0;
			this.clearReset();

			chan.say('Doris locked, that\'s why im knocking!');
		}
	}
};


/**
 * Set `setTimeout` to reset the progress of the joke
 */
Plugin.prototype.setReset = function(time) {
	var self = this,
		time = time || 30*1000; // 30 seconds

	// Clear the timeout, if one exists;
	clearTimeout(this._reset);

	// Set a timeout to reset progress
	this._reset = setTimeout(function() {
		self.progress = 0;
	}, time);
};

/**
 * Remove `setTimeout` for joke process
 */
Plugin.prototype.clearReset = function() {
	clearTimeout(this._reset);
};
