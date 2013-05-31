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

	it('should have a name', function() {
		JSON.stringify(_basePlugin.name).should.equal(JSON.stringify('basePlugin'));
	})

});
