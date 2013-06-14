/**
 * IRC Class
 */

var util = require('util'),
	net = require('net'),
	fs = require('fs'),
	path = require('path'),
	libChannel = require('./channel'),
	libUser = require('./user'),
	message = require('./message');

Irc = exports.Irc = function(config) {
	this.initialize(config);
};

util.inherits(Irc, process.EventEmitter);

Irc.prototype.initialize = function(config) {
	this.host = config.host;
	this.port = config.port;
	this.nick = config.nick;
	this.pass = config.pass;

	this.username = config.username;
	this.realname = config.realname;

	// carry over config object to allow plugins to access it
	this.config = config;

	// channels
	this.channels = new libChannel.Channels(this);

	// users
	this.users = new libUser.Users(this);

	// hook and callback arrays
	this.hooks = [];
	this.triggers = [];

	this.connection = null;
	this.buffer = "";
	this.encoding = "utf8";
	this.timeout = 60*60*1000;

	this.logger = config.logger;

	/*
	 * Boot Plugins
	 */
	this.plugins = [];

	for(var i = 0, z = config.plugins.length; i < z; i++) {
		var p = config.plugins[i];
		this.loadPlugin(p);
	}
};

Irc.prototype.connect = function() {
	this.logger.info('connecting to "%s:%s"', this.host, this.port);

	var c = this.connection = net.createConnection(this.port, this.host);
	c.setEncoding(this.encoding);
	c.setTimeout(this.timeout);

	this.initListeners();
};

Irc.prototype.dummyConnect = function(connection) {
	var c = this.connection = connection;

	this.initListeners();
};

// Connection listeners
Irc.prototype.initListeners = function() {
	var self = this;

	function addConnectionListener(ev, f) {
		self.connection.addListener(ev, (function() {
			return function() {
				f.apply(self, arguments);
			};
		})());
	}

	addConnectionListener('connect', this.onConnect);
	addConnectionListener('data', this.onReceive);

	// Anonymous functions
	addConnectionListener('timeout', function() {
		this.connection.end();
		this.logger.warn('Connection timed out');
	});
	addConnectionListener('close', function() {
		this.logger.info('Connection closed');
	});
};

Irc.prototype.onConnect = function() {
	this.logger.info('connected');

	if (this.pass !== undefined && this.pass !== '') {
		this.raw('PASS ' + this.pass);
	}

	this.raw('NICK', this.nick);
	this.raw('USER', this.username, 8, '*', ':' + this.realname);

	this.emit('connect');
};

Irc.prototype.onReceive = function(chunk) {
	this.buffer += chunk;
	while(this.buffer) {
		var offset = this.buffer.indexOf("\r\n");
		if (offset < 0) {
			return;
		}

		var msg = this.buffer.slice(0, offset);
		this.buffer = this.buffer.slice(offset + 2);

		if (this.config.showRaw === true) {
			console.log('\033[1;32m>>\033[0m', msg);
		}

		msg = new message.Message(msg);
		this.onMessage(msg);
	}
};

// When a message is recevied from the server
Irc.prototype.onMessage = function(msg) {

	// Define variables used
	var channel;

	switch(msg.command) {
		case 'PING':
			this.raw('PONG', msg.arguments);
			break;

		case '001':
			// Set nick to whatever the server decided it really is
			// (normally this is because you chose something too long and
			// the server has shortened it
			this.nick = msg.arguments[0];
			break;

		case 'err_nicknameinuse':
			this.logger.warn('Name in use. Choosing different one.');
			this.nick = this.nick + '_';

			this.raw('NICK', this.nick);
			break;

		case 'err_nomotd':
		case 'rpl_endofmotd':
			var userchans = this.config.channels;

			for (var i = 0, z = userchans.length; i < z; i++) {
				var channelName = userchans[i],
					password;

				if (typeof(channelName) == "object") {
					channelName = channelName.name;
					password = channelName.password;
				}

				// create new instance of the channel and join it.
				channel = this.channels.new(channelName, password);
				channel.join();

			}
			break;

		case 'rpl_namreply':
			channel = this.channels.find(msg.arguments[2]);
			if ( channel ) {
				msg.arguments[3].trim().split(" ").forEach(function(u) {
					var match = u.match(/^([@+]?)(.+)$/);
					if ( match ) {
						// add new user
						user = this.users.add(match[2], channel.name);

						// set their mode
						if (match[1] == '@') {
							user.isOp = true;
						}
						else if (match[1] == '+') {
							user.isVoice = true;
						}
					}
				}, this);
			}
			break;

		case "rpl_topic":
			channel = this.channels.find(msg.arguments[1]);
			if ( channel ) {
				channel.topic = msg.arguments[2];
			}
			break;

		case "TOPIC":
			channel = this.channels.find(msg.arguments[0]);
			if ( channel ) {
				channel.topic = msg.arguments[1];
			}
			break;

		case "MODE":
			channel = this.channels.find(msg.arguments[0]);

			var modes = msg.arguments[1].split(''),
				modparams = msg.arguments.slice(2),
				adding, user;

			modes.forEach(function(mode){
				switch (mode) {
					case '+': adding = true; break;
					case '-': adding = false; break;

					case 'o':
						user = modparams.shift();
						user = this.users.find(user, channel.name);
						user.isOp = adding;
						break;

					case 'v':
						user = modparams.shift();
						user = this.users.find(user, channel.name);
						user.isVoice = adding;
						break;
				}

			}, this);
			break;

		case 'PRIVMSG':
			// Look for triggers
			var m = msg.arguments[1];
			if (m.substring( 0, 1 ) == this.config.command) {
				var trigger = m.split(' ')[0].substring( 1, m.length);
				if (typeof this.triggers[trigger] != 'undefined') {
					var trig = this.triggers[trigger];

					// try to call the trigger so we dont crash
					try {
						this.logger.info('Command triggered:', trigger, msg.rawText);
						trig.callback.call(this.plugins[trig.plugin], msg);
					} catch (err) {
						this.logger.error('Error calling trigger: "%s"', trig.plugin);
						console.log(err);
					}

				}
			}

			if (msg.arguments[0] == this.nick) {
				this.logger.info('Private Message from "%s": "%s"', msg.nick, msg.arguments[1]);
				this.emit('privateMessage', msg);
			} else {
				this.emit('message', msg);
			}
			break;

		case 'JOIN':
			this.users.add(msg.nick, msg.arguments[0]);

			// Did we just join the channel?
			if (msg.nick == this.nick) {
				channel = this.channels.new(msg.arguments[0]);
				channel.inRoom = true;
			}
			break;

		case 'PART':
			this.users.remove(msg.nick, msg.arguments[0]);

			// Did we leave the channel
			if (msg.nick == this.nick) {
				channel = this.channels.find(msg.arguments[0]);
				if (channel) {
					channel.inRoom = false;
					channel.clearUsers();
				}
			}
			break;

		case 'QUIT':
			this.users.removeAll(msg.nick);

			// did we quit?
			if (msg.nick == this.nick) {
				channel = this.channels.find(msg.arguments[0]);
				if (channel) {
					channel.inRoom = false;
					channel.clearUsers();
				}
			}
			break;

		case 'KICK':
			this.users.remove(msg.arguments[1], msg.arguments[0]);

			// Were we kicked?
			if (msg.arguments[1] == this.nick) {
				channel = this.channels.find(msg.arguments[0]);
				if (channel) {
					var reason = msg.arguments[2] || "No Reason Given";
					this.logger.warn('Kicked from Channel:', reason);
					channel.inRoom = false;
					channel.clearUsers();
				}
			}
			break;

		case 'NICK':
			this.users.changeNick(msg.nick, msg.arguments[0]);

			// Did we change our nick?
			if (msg.nick == this.nick) {
				this.nick = msg.arguments[0];
			}
			break;

		default:
			if (msg.commandType == 'error') {
				this.logger.error(msg.rawText);
			}
	}

	// If its a numeric command.
	if (/^\d+$/.test(msg.rawCommand)) {
		this.emit('numeric', msg);
	}
	// ... Otherwise
	else {
		this.emit(msg.rawCommand.toLowerCase());
	}

	// Always emit data.
	this.emit('data', msg);
};

// Write raw data to the connection
Irc.prototype.raw = function() {
	if (this.connection.readyState !== 'open') { return; }

	// Convert arguments to string
	var msg = Array.prototype.slice.call(arguments).join(' ');

	if (this.config.showRaw === true) {
		console.log('\033[31m<<\033[0m', msg);
	}

	this.connection.write(msg + "\r\n", this.encoding);
};

// public method to send PRIVMSG cleanly
Irc.prototype.say = function(target, msg) {

	// Convert arguments to string minus target
	msg = Array.prototype.slice.call(arguments, 1).join(' ');

	if (arguments.length > 1) {
		this.raw('PRIVMSG', target, ':' + msg);
	}
};

// public method to send an action
Irc.prototype.action = function(target, msg) {

	// Convert arguments to string minus target
	msg = Array.prototype.slice.call(arguments, 1).join(' ');

	if (arguments.length > 1) {
		this.say(target, '\001ACTION', msg, '\001');
	}
};



/**
 * Plugin methods
 */
Irc.prototype.loadPlugin = function(name) {
	this.unloadPlugin(name);
	var that = this;

	try {
		this.logger.verbose('Loading Plugin:', name);

		var p = require('../plugins/' + name);
		this.plugins[name] = new p.Plugin(this, name);

		/*
		 * Hooks
		 */
		['connect', 'data', 'numeric', 'message', 'join', 'part', 'quit', 'nick', 'privateMessage'].forEach(function(event) {
			var onEvent = 'on' + event.charAt(0).toUpperCase() + event.substr(1),
				callback = this.plugins[name][onEvent];

			if (typeof callback == 'function') {
				this.logger.verbose('-- adding event:', onEvent);
				this.addPluginListener(name, event, callback);
			}
		}, this);

	} catch (err) {
		this.logger.error('Cannot load Plugin %s : %s', name, err.message);
		throw 'Error loading plugin';
	}
};

Irc.prototype.unloadPlugin = function(name) {
	if (typeof this.plugins[name] != 'undefined') {
		delete this.plugins[name];

		// remove hooks
		if (typeof this.hooks[name] != 'undefined') {
			for (var hook in this.hooks[name]) {
				this.removeListener(this.hooks[name][hook].event, this.hooks[name][hook].callback);
			}
		}

		// remove triggeres
		for (var trig in this.triggers) {
			if (this.triggers[trig].plugin == name) {
				delete this.triggers[trig];
			}
		}

		// remove the 'require' cache
		var p = path.normalize(__dirname + '/../plugins/' + name);
		delete require.cache[p + '.js'];
	}
};

Irc.prototype.addPluginListener = function(plugin, ev, f) {

	if (typeof this.hooks[plugin] == 'undefined') {
		this.hooks[plugin] = [];
	}

	var callback = (function() {
		return function() {
			try {
				f.apply(that, arguments);
			} catch (err) {
				this.logger.error('Error in plugin: "%s"', that.title);
				console.log(err);
			}
		};
	})();

	this.hooks[plugin].push({event: ev, callback: callback});

	var that = this.plugins[plugin];
	return this.on(ev, callback);
};

Irc.prototype.addTrigger = function(plugin, trigger, callback) {
	if (typeof this.triggers[trigger] == 'undefined') {
		this.triggers[trigger] = { plugin: plugin.name, callback: callback};
	}
};


// Overriden method of eventEmitter
Irc.prototype.emit = function(event) {
	Irc.super_.prototype.emit.apply(this, arguments);

	this.logger.silly('Event emitted:', event);
};
