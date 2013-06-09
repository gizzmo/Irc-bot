/**
 * Users Class
 *
 * Stores all the known users
 */
Users = exports.Users = function(irc) {
	this.irc = irc;
};

// make this object array like
Users.prototype = Object.create(Array.prototype);

// Add new user
Users.prototype.add = function(name, channel) {
	// dont dupe users
	var user = this.find(name, channel);
	if (user === undefined) {
		var newUser = new User(name, channel);
		this.push(newUser);
	}
};

Users.prototype.find = function(name, channel) {

	for (var i = this.length - 1; i >= 0; i--) {
		var user = this[i];

		// Match user.name and user.channel
		if (user.name == name || user.name.toLowerCase() == name.toLowerCase()) {
			if (user.channel == channel || user.channel.toLowerCase() == channel.toLowerCase()) {
				return user;
			}
		}
	}
};

Users.prototype.findAll = function(name) {
	var found = [];

	for (var i = this.length - 1; i >= 0; i--) {
		var user = this[i];

		if (user.name == name || user.name.toLowerCase() == name.toLowerCase()) {
			found.push(user);
		}
	}

	return found.length === 0 ? undefined : found;
};

Users.prototype.remove = function(name, channel) {

	for (var i = this.length - 1; i >= 0; i--) {
		var user = this[i];

		if (user.name == name || user.name.toLowerCase() == name.toLowerCase()) {
			if (user.channel == channel || user.channel.toLowerCase() == channel.toLowerCase()) {
				this.splice(i, 1);
			}
		}
	}
};

Users.prototype.removeAll = function(name) {

	for (var i = this.length - 1; i >= 0; i--) {
		var user = this[i];

		if (user.name == name || user.name.toLowerCase() == name.toLowerCase()) {
			this.splice(i, 1);
		}
	}
};

Users.prototype.changeNick = function(name, newName) {
	var users = this.findAll(name);

	users.forEach(function(user, i) {
		user.name = newName;
	});
};

/**
 * User Class
 */
User = exports.User = function(name, channel) {
	this.name = name;
	this.channel = channel;
};
