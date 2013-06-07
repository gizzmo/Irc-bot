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

// Overriden method of eventEmitter
Irc.prototype.addListener = function(ev, f) {
	var that = this;
	return this.connection.addListener(ev, (function() {
		return function() {
			f.apply(that, arguments);
		};
	})());
};
Irc.prototype.emit = function(event) {
	Irc.super_.prototype.emit.apply(this, arguments);

	this.logger.silly('Event emitted:', event);
};

// Connection listeners
Irc.prototype.initListeners = function() {
	this.addListener('connect', this.onConnect);
	this.addListener('data', this.onReceive);
	this.addListener('timeout', this.onTimeout);
	this.addListener('close', this.onClose);
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

		this.logger.debug('\033[1;32m>>\033[0m', msg);

		msg = new message.Message(msg);
		this.onMessage(msg);
	}
};

Irc.prototype.onTimeout = function() {
	this.disconnect('timeout');
};

Irc.prototype.onClose = function() {
	this.disconnect('close');
};

Irc.prototype.disconnect = function(reason) {
	if (this.connection.readyState !== 'closed') {
		this.connection.close();
		this.logger.info('disconnected (%s)', reason);
	}
};

// When a message is recevied from the server
Irc.prototype.onMessage = function(msg) {

	// Define variables used
	var user, channel;

	// Setup user object
	if (msg.nick !== undefined) {
		user = this.users.new(msg.nick);
		if (user) {
			user.update(msg.prefix);
		}
	}

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
				this.channels.new(channelName, true, password);
			}
			break;

		case 'rpl_namreply':
			// get a rough list of users
			// it wont be the complete user info "nick!ident@host"
			// they will be updated on later events.
			channel = this.channels.find(msg.arguments[2]);
			if ( channel ) {
				msg.arguments[3].trim().split(/ +/).forEach(function(u) {
					var match = u.match(/^[@+]?(.+)$/);
					if ( match ) {
						u = this.users.new(match[1]);
						u.join(channel);
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
						this.logger.error('Error calling trigger: "%s" : %s', trig.plugin, err.message);
					}

				}
			}

			if (msg.arguments[0] == this.nick) {
				this.logger.info('Private Message from "%s": "%s"', user.nick, msg.arguments[1]);
				this.emit('privateMessage', msg);
			} else {
				this.emit('message', msg);
			}
			break;

		case 'JOIN':
			if (user) {
				user.join(msg.arguments[0]);
			}

			// Did we just join the channel?
			if (user.nick == this.nick) {
				channel = this.channels.new(msg.arguments[0]);
				channel.inRoom = true;
			}
			break;

		case 'PART':
			if (user) {
				user.leave(msg.arguments[0]);
			}

			// Did we leave the channel
			if (user.nick == this.nick) {
				channel = this.channels.new(msg.arguments[0]);
				channel.inRoom = false;
				channel.clearUsers();
			}
			break;

		case 'QUIT':
			if (user) {
				user.leave(msg);
			}

			// did we quit?
			if (user.nick == this.nick) {
				channel = this.channels.find(msg.arguments[0]);
				channel.inRoom = false;
				channel.clearUsers();
			}
			break;

		case 'KICK':
			// Update the user who was kicked
			var kicked = this.users.find(msg.arguments[1]);
			if (kicked) {
				kicked.leave(msg.arguments[0]);
			}

			// Were we kicked?
			if (msg.arguments[1] == this.nick) {
				var chan = this.channels.find(msg.arguments[0]);
				this.logger.warn('Kicked from Channel:', msg.arguments[2]);
				chan.inRoom = false;
				chan.clearUsers();
			}
			break;

		case 'NICK':
			// Update the user who send the message
			if (user) {
				user.nick = msg.arguments[0];
			}

			// Did we change our nick?
			if (user.nick == this.nick) {
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
	if (this.connection.readyState !== "open") {
		return this.disconnect("cannot send with readyState " + this.connection.readyState);
	}

	// Convert arguments to string
	var msg = Array.prototype.slice.call(arguments).join(' ');

	this.logger.debug('\033[31m<<\033[0m', msg);

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
			f.apply(that, arguments);
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
