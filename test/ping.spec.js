var irc  = require('./irc-stub.js'),
	message = require('../lib/message'),
	ping = require('../plugins/ping.js'),
	should = require('should');

describe("Ping", function(){
	var config = {};
	var _irc, _ping;

	beforeEach(function() {
		_irc = new irc.Irc(config);
		_ping = new ping.Plugin(_irc, 'ping');
	});

	describe('#trigPing', function() {
		it('should respond with Pong', function() {
			var test = new message.Message(':stubOtherUserNick stubBotNick #stubChannel :!ping');
			var result = 'PRIVMSG #stubChannel :Pong!';
			var call = _ping.trigPing(test);
			var resultMessage = _irc.resultMessage;
			JSON.stringify(resultMessage).should.equal(JSON.stringify(result))
		})

	}),
	it('should have a name', function() {
		JSON.stringify(_ping.name).should.equal(JSON.stringify('ping'));
	}),
	it('should have a version', function() {
		JSON.stringify(_ping.version).should.not.equal(JSON.stringify('undefined'));
	}),
	it('should have a title', function() {
		JSON.stringify(_ping.title).should.not.equal(JSON.stringify('undefined'));
	})

});
