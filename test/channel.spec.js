var irc = require('./irc-stub'),
	channel = require('../lib/channel'),
	should = require('should');

describe("Channel", function() {
	var config = {};
	var _irc;

	beforeEach(function() {
		_irc = new irc.Irc(config);

		// Initialize channels
		_irc.channels['#stubChannel1'] = new channel.Channel(_irc, '#stubChannel1', false);

	});

	describe('#join', function() {
		it('should send JOIN command', function() {
			var chan = _irc.channels['#stubChannel1'].join();

			var message = 'JOIN #stubChannel1 ';
			var result = _irc.resultMessage;

			JSON.stringify(result).should.equal(JSON.stringify(message))
		})
	}),
	describe('#part', function() {
		it('should send PART command', function() {
			var chan = _irc.channels['#stubChannel1'].part('Some stupid reason');

			var message = 'PART #stubChannel1 :Some stupid reason'
			var result = _irc.resultMessage;

			JSON.stringify(result).should.equal(JSON.stringify(message));
		})
	}),
	describe('#send', function() {
		it('should send PRIVMSG command', function() {
			var chan = _irc.channels['#stubChannel1'].send('Some stupid message');

			var message = 'PRIVMSG #stubChannel1 :Some stupid message';
			var result = _irc.resultMessage;

			JSON.stringify(result).should.equal(JSON.stringify(message));
		})
	})

	// describe('', function() {
		// it('', function() {})
	// })
})
