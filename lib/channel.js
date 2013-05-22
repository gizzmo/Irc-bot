/**
 * Channel Class
 *
 * @author      Karl Tiedt
 * @website     http://twitter.com/ktiedt
 * @copyright
 *
 * @author		Michael Owens
 * @website		http://www.michaelowens.nl
 * @copyright	Michael Owens 2011
 */

Channel = exports.Channel = function(irc, room, join, password) {
	this.irc = irc;
	this.name = room;
	this.inRoom = false;
	this.password = password;
	this.users = [];

	if (join) {
		this.join();
	}

	this.irc.logger.verbose('New channel object created:', this.name);
};

Channel.prototype.join = function() {
	var chans = this.irc.channels,
		name = this.name;

	chans[name] = this;
	this.irc.raw('JOIN', name, this.password);
	this.inRoom = true;
};

Channel.prototype.part = function(msg) {
	var user = null,
		users = [].concat(this.users),
		userCount = users.length,
		allusers = this.irc.users,
		chans = this.irc.channels;

	this.irc.raw('PART', this.name, ':' + msg);
	this.inRoom = false;

	for(var i=0; i<userCount;i++) {
		user = allusers[users[i]];
		// if user is only in 1 channel and channel is this one
		if (typeof user !== 'undefined' && user.isOn(this.name)) {
			user.part(this);
		}
	}
};

Channel.prototype.send = function(msg) {
	this.irc.send(this.name, msg);
};
