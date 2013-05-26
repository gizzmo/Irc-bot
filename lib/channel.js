/**
 * Channels Class
 *
 * The purpose of this class is to remove a 'named key' array.
 * This way we can keep the channel names in one place, no as a key
 * and a property of Channel object.
 */
Channels = exports.Channels = function(irc) {
	this.irc = irc;
	this.channels = [];
}

// Create a new channel object.
Channels.prototype.new = function(name, join, password) {
	if (typeof name !== 'string' || name === '') { return; };

	// Does the channel already exists
	var channel = this.find(name);
	if (typeof channel !== 'undefined') {
		return channel;
	};

	// Create a new channel
	var newChannel = new Channel(this.irc, name, join, password);

	this.channels.push(newChannel);

	return newChannel;
}

Channels.prototype.find = function(name) {
	if (typeof name !== 'string' || name === '') { return; };

	var channels = this.channels;

	for (var i = channels.length - 1; i >= 0; i--){
		var chan = channels[i];
		if (chan.name == name) {
			return chan;
			break;
		}
	}
}

/**
 * Channel Class
 */
Channel = exports.Channel = function(irc, name, join, password) {
	this.irc = irc;
	this.name = name;
	this.inRoom = false;
	this.password = password;
	this.users = [];

	if (join) {
		this.join();
	}

	this.irc.logger.verbose('New channel object created:', this.name);
};

// have the bot join this channel
Channel.prototype.join = function() {
	var chans = this.irc.channels,
		name = this.name;

	chans[name] = this;
	this.irc.raw('JOIN', name, this.password);
	this.inRoom = true;

	// trigger who list to get list of users in the channel
};

// have the bot leave this channel
Channel.prototype.part = function(reason) {
	var user = null,
		users = [].concat(this.users),
		userCount = users.length,
		allusers = this.irc.users,
		chans = this.irc.channels;

	this.irc.raw('PART', this.name, ':' + reason);
	this.inRoom = false;

	// Update the users in this channel
	for(var i=0; i<userCount;i++) {
		user = allusers[users[i]];
		// if user exists and is this channel
		if (typeof user !== 'undefined' && user.isOn(this.name)) {
			user.part(this);
		}
	}
};

// send message to this channel
Channel.prototype.send = function(msg) {
	this.irc.send(this.name, msg);
};

// Send an action to this channel
Channel.prototype.action = function(msg) {
	this.irc.action(this.name, msg)
}
