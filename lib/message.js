/**
 * Message Class
 */

var util = require('util'),
	replyFor = require('./codes');

Message = exports.Message = function(text) {
	this.rawText = text;
	this.parseMessage(text);
};

/**
 * parseMessage(line)
 *
 * cloned from https://raw.github.com/martynsmith/node-irc/master/lib/irc.js
 *
 * takes a raw "line" from the IRC server and turns it into an object with
 * useful keys
 */
Message.prototype.parseMessage = function(text) {
	var match;

	// Parse prefix
	match = text.match(/^:([^ ]+) +/);
	if ( match ) {
		this.prefix = match[1];
		text = text.replace(/^:[^ ]+ +/, '');
		match = this.prefix.match(/^([_a-zA-Z0-9\[\]\\`^{}|-]*)(!([^@]+)@(.*))?$/);
		if ( match ) {
			this.nick = match[1];
			this.ident = match[3];
			this.host = match[4];
		} else {
			this.server = this.prefix;
		}
	}

	// Parse command
	match = text.match(/^([^ ]+) */);
	this.command = match[1];
	this.rawCommand = match[1];
	this.commandType = 'normal';
	text = text.replace(/^[^ ]+ +/, '');

	if ( replyFor[this.rawCommand] ) {
		this.command     = replyFor[this.rawCommand].name;
		this.commandType = replyFor[this.rawCommand].type;
	}

	this.arguments = [];
	var middle, trailing;

	// Parse parameters
	if ( text.search(/^:|\s+:/) != -1 ) {
		match = text.match(/(.*?)(?:^:|\s+:)(.*)/);
		middle = match[1].trimRight();
		trailing = match[2];
	}
	else {
		middle = text;
	}

	if ( middle.length )
		this.arguments = middle.split(/ +/);

	if ( typeof(trailing) != 'undefined' && trailing.length )
		this.arguments.push(trailing);
};
