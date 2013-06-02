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

// Send the join command
Channel.prototype.join = function() {
	if (this.inRoom == false) {
		this.irc.logger.info('Joining Channel:', this.name);
		this.irc.raw('JOIN', this.name, this.password);
	}
	else {
		this.irc.logger.warn('Tried to join channel currently in:', this.name);
	}
}

// Send the leave command
Channel.prototype.leave = function(reason) {
	if (this.inRoom == true) {
		this.irc.logger.info('Leaving Channel:', this.name);
		this.irc.raw('PART', this.name, ':' + reason);
	}
	else {
		this.irc.logger.warn('Tried to leave channel not currently in:', this.name);
	}
}

// Update the users in this channel to have them leave
Channel.prototype.clearUsers = function() {
	for (var i = this.users.length - 1; i >= 0; i--) {
		var user = this.users[i];
		if(user !== undefined && user.isOn(this)) {
			user.leave(this);
		}
	}
}

// send message to this channel
Channel.prototype.send = function(msg) {
	if (this.inRoom == true) {
		this.irc.send(this.name, msg);
	}
};

// Send an action to this channel
Channel.prototype.action = function(msg) {
	if (this.inRoom == true) {
		this.irc.action(this.name, msg);
	}
}
