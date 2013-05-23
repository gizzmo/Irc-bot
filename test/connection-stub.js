/**
 * Connection Class Stub
 */
var util = require('util');

Connection = exports.Connection = function() {
	this.name = "TestStub";
	this.readyState = "open";
};

util.inherits(Connection, process.EventEmitter);

// just a method stub
Connection.prototype.close = function() {
	this.readyState = "closed";
};

Connection.prototype.write = function(message, encoding) {
	this.message = message;
};
