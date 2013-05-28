/**
 * IRC Class Stub - provide only functions used by plugins
 */
var util = require('util'),
	winston = require('winston'),
	channel = require('../lib/channel'),
	user = require('../lib/user');


Irc = exports.Irc = function(config) {
	var logger = new (winston.Logger)({
		transports: [
		  new (winston.transports.Console)({ level: "error" })
		]
	});
	this.logger = logger;

	// make sure configs are set!
	config.command = "!";

	this.initialize(config);
};

util.inherits(Irc, process.EventEmitter);

Irc.prototype.initialize = function(config) {
	// user constructor and user hash
	this.nick = 'stubBotNick';

	// Initialize channels
	this.channels = new channel.Channels(this);
	this.channels.new('#stubChannel', false);

	// initialize users
	this.users = new user.Users(this);
	this.users.new('stubBotNick');
	this.users.new('stubUser');

	this.triggers = {};

	this.resultMessage = 'NOTHING HAPPENED';

	this.config = config;
};

Irc.prototype.addTrigger = function(plugin, trigger, callback) {
	if (typeof this.triggers[trigger] == 'undefined') {
		this.triggers[trigger ] = { plugin: plugin.name, callback: callback};
	}
};

Irc.prototype.raw = function() {
	var msg = Array.prototype.slice.call(arguments).join(' ');
	this.resultMessage = msg;
};

// public method to send PRIVMSG cleanly
Irc.prototype.send = function(target, msg) {

	msg = Array.prototype.slice.call(arguments, 1).join(' ') + "";

	if (arguments.length > 1) {
		this.raw('PRIVMSG', target, ':' + msg);
	}
};
