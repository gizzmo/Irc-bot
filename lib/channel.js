/**
 * Channels Class
 *
 * The purpose of this class is to remove a 'named key' array.
 * This way we can keep the channel names in one place, not as a key
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

		// was join requested
		if (join && channel.inRoom === false)
			channel.join();

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
		if (chan.name == name || chan.name.toLowerCase() == name.toLowerCase()) {
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
	this.users = [];

	this.name = name;
	this.inRoom = false;
	this.password = password;

	if (join) {
		this.join();
	}

	this.irc.logger.verbose('New channel object created:', this.name);
};

// have the bot join this channel
Channel.prototype.join = function() {
	this.irc.logger.info('Joining Channel:', this.name);
	this.irc.raw('JOIN', this.name, this.password);
	this.inRoom = true;
};

// have the bot leave this channel
Channel.prototype.leave = function(reason) {
	this.irc.logger.info('Leaving Channel:', this.name);
	this.irc.raw('PART', this.name, ':' + reason);
	this.inRoom = false;

	this.clearUsers();
};

//
Channel.prototype.kicked = function(by) {
	this.irc.logger.warn('Kicked from Channel:', this.name);
	this.inRoom = false;

	this.clearUsers();
}

Channel.prototype.clearUsers = function() {
	// Remove all the users from this channel
	for (var i = this.users.length - 1; i >= 0; i--) {
		var user = this.users[i];
		if(user !== undefined && user.isOn(this.name)) {
			user.leave();
		}
	}
}

// send message to this channel
Channel.prototype.send = function(msg) {
	this.irc.send(this.name, msg);
};

// Send an action to this channel
Channel.prototype.action = function(msg) {
	this.irc.action(this.name, msg)
}
