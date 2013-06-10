var irc = require('./irc-stub'),
	user = require('../lib/user'),
	should = require('should');

describe('Users', function() {
	var config = {};
	var _irc;

	beforeEach(function() {
		_irc = new irc.Irc(config);

		// start with a new users object
		_irc.users = new Users(_irc);
	})


})
