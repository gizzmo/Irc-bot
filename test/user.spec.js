var irc = require('./irc-stub'),
	user = require('../lib/user'),
	should = require('should');

describe('Users', function() {
	var config = {};
	var _irc;

	beforeEach(function() {
		_irc = new irc.Irc(config);
	})

	it('users object should have users object', function() {
		(typeof _irc.users).should.equal('object');
		_irc.users.should.be.an.instanceof(user.Users)
	})

	describe('#new', function() {
		it('should return a instance of User', function() {
			var result = _irc.users.new('stubNewUser');

			(result instanceof user.User).should.be.true;
		})

		it('should add to Users array', function() {
			var newUser = _irc.users.new('stubNewUser');

			(_irc.users.users[2]).should.equal(newUser);
		})

		it('should return the old object of it already exists',function() {
			var oldUser = _irc.users.new('stubNewUser');
			var newUser = _irc.users.new('stubNewUser');

			(newUser).should.equal(oldUser);
		})

		it('should return nothing (undefined) no name passed, or name is an empty string', function() {
			var test1 = _irc.users.new();
			should.not.exist(test2);

			var test2 = _irc.users.new('');
			should.not.exist(test2);
		})
	})


	describe('#find', function() {

		// setup a few users
		var user1, user2;
		beforeEach(function() {
			user1 = _irc.users.new('stubUser');
			user2 = _irc.users.new('stubUser2');
		})

		it('should return a user if it exists', function() {
			var result = _irc.users.find('stubUser');
			(result).should.equal(user1);

			var result = _irc.users.find('stubUser2');
			(result).should.equal(user2);
		})

		it('should return nothing (undefined) if user doesnt exist', function() {
			var result = _irc.users.find('userDoesntExist');
			should.not.exist(result);
		})

		it('should return nothing (undefined) no name passed, or name is an empty string', function() {
			var test1 = _irc.users.find();
			should.not.exist(test2);

			var test2 = _irc.users.find('');
			should.not.exist(test2);
		})
	})
})

describe('User', function() {
	var config = {};
	var _irc, user1, channel1;

	beforeEach(function() {
		_irc = new irc.Irc(config);

		user1 = _irc.users.find('stubUser');
		channel1 = _irc.channels.find('#stubChannel');
	})

	describe('#update', function() {
		it('should update the all the users info', function() {

			// info started with
			(user1.nick).should.equal('stubUser');
			(user1.ident).should.be.empty;
			(user1.host).should.be.empty;

			// update the user with their full mask
			user1.update('stubUser!~stubUser@host.whatever.net');

			(user1.nick).should.equal('stubUser');
			(user1.ident).should.equal('~stubUser');
			(user1.host).should.equal('host.whatever.net');
		})
	}),
	describe('#join', function() {

		it('should add the user to the channel\'s user list, and the channel to the user\'s channel list', function() {
			user1.join('#stubChannel');

			channel1.users.should.include(user1);
			user1.channels.should.include(channel1);

		})
	}),
	describe('#leave', function() {
		beforeEach(function() {
			user1.join('#stubChannel');
		})

		it('should remove this user from the channl\'s user list, and the channel from the users\' channel list', function() {
			user1.leave('#stubChannel');

			channel1.users.should.not.include(user1);
			user1.channels.should.not.include(channel1);
		})

	}),
	describe('#isOn', function() {
		beforeEach(function() {
			user1.join('#stubChannel');
		}),

		it('should return true/false value', function() {
			user1.isOn('#stubChannel').should.be.true;
			user1.isOn('#NotInChannel').should.be.false	;
		})
	})
})
