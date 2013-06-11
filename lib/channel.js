/**
 * Channels Class
 *
 * Store all channel instances
 */
Channels = exports.Channels = function(irc) {
	this.irc = irc;
};

// make this object array like
Channels.prototype = Object.create(Array.prototype);

// Create a new channel object.
Channels.prototype.new = function(name, password) {
	if (typeof name !== 'string' || name === '') { return; }

	// insure channel starts with '#'
	if (name.indexOf("#") == -1) {
		name = "#" + name;
	}

	// Dont dupe channels
	var channel = this.find(name);
	if (channel === undefined) {
		channel =  new Channel(this.irc, name, password);

		this.push(channel);
	}

	return channel;
};

Channels.prototype.find = function(name) {
	if (typeof name !== 'string' || name === '') { return; }

	// insure channel starts with '#'
	if (name.indexOf("#") == -1) {
		name = "#" + name;
	}

	for (var i = 0, z = this.length; i < z; i++) {
		var chan = this[i];
		if (chan.name == name || chan.name.toLowerCase() == name.toLowerCase()) {
			return chan;
		}
	}
};

/**
 * Channel Class
 */
Channel = exports.Channel = function(irc, name, password) {
	this.irc = irc;

	this.name = name;
	this.inRoom = false;
	this.password = password;
	this.topic = '';

	this.irc.logger.verbose('New channel object created:', this.name);
};

// Send the join command
Channel.prototype.join = function() {
	if (this.inRoom !== true) {
		this.irc.logger.info('Joining Channel:', this.name);
		this.irc.raw('JOIN', this.name, this.password);
	}
	else {
		this.irc.logger.warn('Tried to join channel currently in:', this.name);
	}
};

// Send the leave command
Channel.prototype.leave = function(reason) {
	if (this.inRoom === true) {
		reason = reason || 'No Reason Given';
		this.irc.logger.info('Leaving Channel:', this.name);
		this.irc.raw('PART', this.name, ':' + reason);
	}
	else {
		this.irc.logger.warn('Tried to leave channel not currently in:', this.name);
	}
};

// Delete all the known users in this channel
Channel.prototype.clearUsers = function() {
	if (this.inRoom === false) {

		for (var i = this.irc.users.length - 1; i >= 0; i--) {
			var user = this.irc.users[i];

			// if they are part of this channel, delete them.
			if (user.channel == this.name || user.channel.toLowerCase() == this.name.toLowerCase()) {
				this.irc.users.splice(i, 1);
			}
		}
	}
};


// send message to this channel
Channel.prototype.say = function(msg) {
	if (this.inRoom === true) {
		this.irc.say(this.name, msg);
	}
};

// Send an action to this channel
Channel.prototype.action = function(msg) {
	if (this.inRoom === true) {
		this.irc.action(this.name, msg);
	}
};
