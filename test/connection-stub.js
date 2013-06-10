/**
 * Connection Class Stub
 */
var util = require('util');

Connection = exports.Connection = function() {
	this.name = "TestStub";
	this.readyState = "open";
};

util.inherits(Connection, process.EventEmitter);

Connection.prototype.write = function(message, encoding) {
	this.message = message;
};
