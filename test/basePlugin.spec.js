var irc  = require('./irc-stub.js'),
	message = require('../lib/message'),
	basePlugin = require('../plugins/basePlugin.js'),
	should = require('should');

describe("basePlugin", function(){
	var config = {};
	var _irc, _basePlugin;

	beforeEach(function() {
		_irc = new irc.Irc(config);
		_basePlugin = new basePlugin.BasePlugin(_irc, 'basePlugin');
	}),

	describe("#getPluginProperty", function() {
		beforeEach(function() {
			// setup test value
			_irc.config.pluginConfigs = {
				basePlugin: {
					testProperty: 'testValue'
				}
			};
		}),
		it('should return config property if it exists', function() {
			var test = _basePlugin.getPluginProperty('testProperty');
			var result = 'testValue';
			JSON.stringify(result).should.equal(JSON.stringify(test));
		}),
		it('should return nothing if propery dosn\'t exist', function() {
			var test = _basePlugin.getPluginProperty('undefinedProperty');

			should.not.exist(test);
		})
	}),

	describe("#checkUser", function() {		var user;
		beforeEach(function() {
			_irc.config.userCheck = true;
			_irc.config.userGroups = [
				'admin',
				'moderator',
				'superuser',
				'user',
			];

			user = _irc.users.new('aNick');
		})
		it('should return true, if the config.userCheck option doesn\'t exist, or is set to anything else then true', function() {
			_irc.config.userCheck = undefined;
			_basePlugin.checkUser("aNick", "aGroup").should.true;

			_irc.config.userCheck = false;
			_basePlugin.checkUser("aNick", "aGroup").should.true;

			_irc.config.userCheck = 'string';
			_basePlugin.checkUser("aNick", "aGroup").should.true;
		})
		// it('should return true if the config.userGroups option doesn\'t exist, or is empty', function() {
		// 	_irc.config.userCheck = true;

		// 	// test "doesnt exist"
		// 	_basePlugin.checkUser("aNick", "aGroup").should.equal(true);

		// 	// test empty array
		// 	_irc.config.userGroups = [];
		// 	_basePlugin.checkUser("aNick", "aGroup").should.equal(true);
		// })

		it('should return false if the user is not part of a group', function() {
			_basePlugin.checkUser(user, 'user').should.be.equal(false);
		})

		it('should return true if user is a memeber of the given group, or in a higher group', function() {
			user.group = 'superuser';

			(_basePlugin.checkUser(user, 'admin')).should.be.false;
			(_basePlugin.checkUser(user, 'moderator')).should.be.false;
			(_basePlugin.checkUser(user, 'superuser')).should.be.true;
			(_basePlugin.checkUser(user, 'user')).should.be.true;
		})

		it('should return false if no user found', function() {
			_basePlugin.checkUser('nonUser', 'admin').should.be.false;
		})
	}),

	it('should have a name', function() {
		JSON.stringify(_basePlugin.name).should.equal(JSON.stringify('basePlugin'));
	})

});
