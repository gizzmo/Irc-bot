/**
 * Users Class
 */
Users = exports.Users = function(irc) {
	this.irc = irc;
	this.users = [];
}

// Create a new user object.
Users.prototype.new = function(name) {
	if (typeof name !== 'string' || name === '') { return; };

	// Does the user already exists
	var user = this.find(name);
	if (typeof user !== 'undefined') {
		return user;
	};

	// Create a new user
	var newUser = new User(this.irc, name);

	this.users.push(newUser);

	return newUser;
}

// Find users
Users.prototype.find = function(name) {
	if (typeof name !== 'string' || name === '') { return; };

	var users = this.users;

	for (var i = users.length - 1; i >= 0; i--){
		var user = users[i];
		if (user.nick == name || user.ident == name) {
			return user;
			break;
		}
	}
}

/**
 * User Class
 */
User = exports.User = function(irc, mask) {
	this.irc = irc;
	this.channels = [];

	this.nick = '';
	this.ident = '';
	this.host = '';

	this.update(mask);

	this.irc.logger.verbose('Found new user:', this.nick);
};

User.prototype.update = function(mask) {
	var match = mask.match(/([^!]+)!([^@]+)@(.+)/);

	if (!match) {
		this.nick = mask;
		this.ident = '';
		this.host = '';
	} else {
		this.nick = match[1];
		this.ident = match[2];
		this.host = match[3];
	}
};

// This user is now part of that channel
User.prototype.join = function(channel) {
	if (typeof channel !== "object") {
		channel = this.irc.channels.find(channel)
	}

	if (!channel) {
		this.irc.logger.warn('FAIL USER JOIN:', this.nick);
		return;
	}

	if (!this.isOn(channel)) {
		// add this user to the channel user list
		channel.users.push(this);

		// add the channel to this users channels list
		this.channels.push(channel);
	}
};

// This user is no longer part of the channel
User.prototype.leave = function(channel) {
	if (typeof channel !== "object") {
		channel = this.irc.channels.find(channel)
	}

	if (!channel) {
		this.irc.logger.warn('FAIL USER PART:', this.nick);
		return;
	}

	if (this.isOn(channel)) {
		// remove this user from that channel's user list
		channel.users.splice(channel.users.indexOf(this), 1);

		// remove the channel from this users list
		this.channels.splice(this.channels.indexOf(channel), 1);
	}
};

User.prototype.isOn = function(channel) {
	if (typeof channel !== "object") {
		channel = this.irc.channels.find(channel)
	}

	// is the channel in this users channels list.
	return !(this.channels.indexOf(channel) === -1)

	/**
	 * NOTE:
	 * There could be a chance of `channel.users` and `this.channels`
	 * being out of synch. May just store the data in one place
	 */
};

// Send a message to this user
User.prototype.say = function(msg) {
	this.irc.say(this.nick, msg);
};

// Send an action to this user
User.prototype.action = function(msg) {
	this.irc.action(this.nick, msg)
}
