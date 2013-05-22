var irc  = require('./irc-stub.js'),
	lastseen = require('../plugins/lastseen.js'),
	should = require('should');

describe("Lastseen", function(){
	var config = {};
	var _irc, _lastseen;

	beforeEach(function() {
		_irc = new irc.Irc(config);
		_lastseen = new lastseen.Plugin(_irc, 'lastseen');
	})

	it('should have a name', function() {
		JSON.stringify(_lastseen.name).should.equal(JSON.stringify('lastseen'));
	}),
	it('should have a version', function() {
		JSON.stringify(_lastseen.version).should.not.equal(JSON.stringify('undefined'));
	}),
	it('should have a title', function() {
		JSON.stringify(_lastseen.title).should.not.equal(JSON.stringify('undefined'));
	})

});
