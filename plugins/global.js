/**
 * Global Functionalities and Boot Up
 */
var util = require('util'),
	basePlugin = require('./basePlugin');

Plugin = exports.Plugin = function(irc, name) {
	Plugin.super_.call(this, irc, name);

	this.title = 'Global';
	this.version = '0.1';
};

util.inherits(Plugin, basePlugin.BasePlugin)

Plugin.prototype.onNumeric = function(msg) {
	var irc = this.irc,
		command = msg.rawCommand,
		userchans = irc.userchannels;

	// 376 is end of MOTD/modes
	if (command === '376') {
		this.irc.logger.info('Joining channels: ' + JSON.stringify(userchans));

		for (var i = 0; i < userchans.length; i++) {
			var channelName = userchans[i],
				password;

			if (typeof(channelName) == "object") {
				channelName = channelName.name;
				password = channelName.password;
			}

			var chan = new irc.channelObj(irc, channelName, true, password);
			irc.channels[chan.name] = chan;

			// send who request
		}
	}
	// can register other numeric events here
};

// Users
Plugin.prototype.onData = function(msg){

	var irc = this.irc,
		target = msg.arguments[0],
		nick = (msg.user || '').toLowerCase(),
		users = irc.users,
		user = users[nick];

	// if nick exists and a user object doesnt...
	if ( nick && !user) {
		user = users[nick] = new irc.userObj(irc, msg.prefix);
	}

	switch(msg.rawCommand) {
		case 'PRIVMSG':
			if (user) {
				user.update(msg.prefix);
				user.join(target);
			}
			break;

		case 'JOIN':
			if (user) {
				user.update(msg.prefix);
				user.join(target);
			}
			break;

		case 'PART':
			if (user) {
				user.update(msg.prefix);
				user.part(target);
			}
			break;

		case 'QUIT':
			if (user) {
				user.update(msg.prefix);
				user.quit(msg)
			}
			break;

		case 'NICK':
			if (user) {
				user.update(msg.prefix);
			}
			break;
	}
}
