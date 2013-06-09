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
	// Loop though all known users
	for (var i = 0, z = this.length; i < z; i++) {
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
	var list = [];

	for (var i = 0, z = this.length; i < z; i++) {
		var user = this[i];

		if (user.name == name || user.name.toLowerCase() == name.toLowerCase()) {
			list.push(user);
		}
	}

	return list.length == 0 ? undefined : list;
};

Users.prototype.remove = function(name, channel) {
	for (var i = 0, z = this.length; i < z; i++) {
		var user = this[i];

		if (user.name == name || user.name.toLowerCase() == name.toLowerCase()) {
			if (user.channel == channel || user.channel.toLowerCase() == channel.toLowerCase()) {
				delete this[i];
			}
		}
	}
};

Users.prototype.removeAll = function(name) {
	for (var i = 0, z = this.length; i < z; i++) {
		var user = this[i];

		if (user.name == name || user.name.toLowerCase() == name.toLowerCase()) {
			delete this[i];
		}
	}
}

Users.prototype.changeUserName = function(name, newName) {
	var users = this.findAll(name);

	for (var i = 0, z = users.length; i < z; i++) {
		users[i].name = newName;
	}
};

/**
 * User Class
 */
User = exports.User = function(name, channel) {
	this.name = name;
	this.channel = channel;
};
