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

	describe("#parseTriggerMessage", function() {
		it('should throw error if no command given', function() {
			(function() {
				var msg = new message.Message(':stubOtherUserNick stubBotNick #stubChannel :!trigger');
				var test = _basePlugin.parseTriggerMessage(msg);
			}).should.throw('No command given');
		}),
		it('should return object containing two properties', function() {
			var msg = new message.Message(':stubOtherUserNick stubBotNick #stubChannel :!trigger command options second')
			var test = _basePlugin.parseTriggerMessage(msg);
			var result = {
				'command': 'command',
				'options': ['options', 'second']
			}
			JSON.stringify(test).should.equal(JSON.stringify(result));
		})
	}),

	describe("#checkUser", function() {
		it('should return true, if the config.userCheck option is set to anything else then true', function() {
			_irc.config.userCheck = false;
			_basePlugin.checkUser("aNick", "aGroup").should.equal(true);
		}),
		it('should return true if user is a memeber of the given group, or higher group', function() {

		}),
		it('should return false if the config.UserGroups option doesn\'t exist, or array is empty', function() {

		})
	}),

	it('should have a name', function() {
		JSON.stringify(_basePlugin.name).should.equal(JSON.stringify('basePlugin'));
	})

});
