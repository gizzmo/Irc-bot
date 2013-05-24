/**
 * IRC Class
 */

var util = require('util'),
	net = require('net'),
	fs = require('fs'),
	path = require('path'),
	user = require ('./user' ),
	channel = require('./channel'),
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
	this.command = config.command;

	// carry over config object to allow plugins to access it
	this.config = config;

	// channel constructor and channel hash
	this.channelObj = channel.Channel;
	this.channels = {};

	// user constructor and user hash
	this.userObj = user.User;
	this.users = {};

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
	var c = this.connection = net.createConnection(this.port, this.host);
	c.setEncoding(this.encoding);
	c.setTimeout(this.timeout);

	this.initListeners();
};

Irc.prototype.dummyConnect = function(connection) {
	var c = this.connection = connection;

	this.initListeners();
}

// Overriden method of eventEmitter
Irc.prototype.addListener = function(ev, f) {
	var that = this;
	return this.connection.addListener(ev, (function() {
		return function() {
			f.apply(that, arguments);
		};
	})());
};

// Connection listeners
Irc.prototype.initListeners = function() {
	this.addListener('connect', this.onConnect);
	this.addListener('data', this.onReceive);
	this.addListener('eof', this.onEOF);
	this.addListener('timeout', this.onTimeout);
	this.addListener('close', this.onClose);
};

Irc.prototype.onConnect = function() {
	this.logger.info('connected');

	if(this.pass != '') {
		this.raw('PASS ' + this.pass);
	}

	this.raw('NICK', this.nick);
	this.raw('USER', this.username, '0', '*', ':' + this.realname);

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

		this.logger.verbose( "<< " + msg);

		msg = new message.Message(msg);
		this.onMessage(msg);
	}
};

Irc.prototype.onEOF = function() {
	this.disconnect('EOF');
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
		this.logger.info('disconnected (' + reason + ')');
	}
};

// When a message is recevied from the server
Irc.prototype.onMessage = function(msg) {

	switch(msg.command){
		case 'PING':
			this.raw('PONG', msg.arguments);
			break;

		case 'PRIVMSG':
			// Look for triggers
			var m = msg.arguments[1];
			if (m.substring( 0, 1 ) == this.command) {
				var trigger = m.split(' ' )[0].substring( 1, m.length);
				if (typeof this.triggers[trigger] != 'undefined') {
					var trig = this.triggers[trigger];

					// try to call the trigger so we dont crash
					try {
						trig.callback.apply(this.plugins[trig.plugin], arguments);
					} catch (err) {
						this.logger.error('Error calling trigger ' + trig.plugin + ': ', err);
					}

				}
			}

			if (msg.user == this.nick) {
				// emit "privateMessage", if the message is send by the bot itself
				console.log("===========================privateMessage");
				this.emit('privateMessage', msg);
			} else {
				this.emit('message', msg);
			}
			break;



		default:
			if (/^\d+$/.test(msg.rawCommand)) {
				this.emit('numeric', msg);
			}

			this.emit(msg.command, msg);
			break;
	}

	// always send data event
	this.emit('data', msg);
};

// Write raw data to the connection
Irc.prototype.raw = function(cmd) {
	if (this.connection.readyState !== "open") {
		return this.disconnect("cannot send with readyState " + this.connection.readyState);
	}

	// Convert arguments to string minus cmd
	var msg = Array.prototype.slice.call(arguments, 1).join(' ');

	this.logger.verbose('>> ' + cmd + ' ' + msg);

	this.connection.write(cmd + " " + msg + "\r\n", this.encoding);
};

// public method to send PRIVMSG cleanly
Irc.prototype.send = function(target, msg) {

	// Convert arguments to string minus target
	var msg = Array.prototype.slice.call(arguments, 1).join(' ');

	if (arguments.length > 1) {
		this.raw('PRIVMSG', target, ':' + msg);
	}
};


/**
 * Plugin methods
 */
Irc.prototype.loadPlugin = function(name) {
	this.unloadPlugin(name);
	var that = this;

	try {
		this.logger.verbose('Loading Plugin: ', name);

		var p = require('../plugins/' + name);
		this.plugins[name] = new p.Plugin(this, name);

		/*
		 * Hooks
		 */
		['connect', 'data', 'numeric', 'message', 'join', 'part', 'quit', 'nick', 'privateMessage'].forEach(function(event) {
			var onEvent = 'on' + event.charAt(0).toUpperCase() + event.substr(1),
				callback = this.plugins[name][onEvent];

			if (typeof callback == 'function') {
				this.logger.verbose("-- adding event: ", onEvent);
				this.addPluginListener(name, event, callback);
			}
		}, this);

	} catch (err) {
		this.logger.error('Cannot load Plugin "' + name + '": ', err.message);
		throw 'Error loading plugin';
	}
};

Irc.prototype.unloadPlugin = function(name) {
	if (typeof this.plugins[name] != 'undefined') {
		delete this.plugins[name];

		if (typeof this.hooks[name] != 'undefined') {
			for(var hook in this.hooks[name]) {
				this.removeListener(this.hooks[name ][ hook ].event, this.hooks[ name ][ hook].callback);
			}
		}

		for(var trig in this.triggers) {
			if (this.triggers[trig].plugin == name) {
				delete this.triggers[trig];
			}
		}

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
			this.logger.silly('apply callback for plugin: ' + plugin + ' and event ' + ev + ' with arguments: ', arguments);
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
