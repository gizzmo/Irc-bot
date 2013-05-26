var irc = require('./irc-stub'),
	channel = require('../lib/channel'),
	should = require('should');

describe('Channels', function() {
	var config = {};
	var _irc;

	beforeEach(function() {
		_irc = new irc.Irc(config);

		// Initialize channels
		_irc.channels = new channel.Channels(_irc);
	})

	it('channels object should exsist', function() {
		(typeof _irc.channels).should.equal('object');
		_irc.channels.should.be.an.instanceof(channel.Channels)
	})

	describe('#new', function() {
		it('should return a instance of Channel', function() {
			var result = _irc.channels.new('#stubChannel');

			(result instanceof channel.Channel).should.be.true;
		})

		it('should add to channels array', function() {
			var newChannel = _irc.channels.new('#stubChannel');

			(_irc.channels.channels[0]).should.equal(newChannel);
		})

		it('should return the old object of it already exists',function() {
			var oldChannel = _irc.channels.new('#stubChannel');
			var newChannel = _irc.channels.new('#stubChannel');

			(newChannel).should.equal(oldChannel)
		})

		it('should return nothing (undefined) no name passed, or name is an empty string', function() {
			var test1 = _irc.channels.new();
			should.not.exist(test2);

			var test2 = _irc.channels.new('');
			should.not.exist(test2);
		})
	})
	describe('#find', function() {

		// setup a few channels
		var chan1, chan2;
		beforeEach(function() {
			chan1 = _irc.channels.new('#stubChannel');
			chan2 = _irc.channels.new('#stubChannel2');
		})

		it('should return a channel if it exists', function() {
			var result = _irc.channels.find('#stubChannel');
			(result).should.equal(chan1);

			var result = _irc.channels.find('#stubChannel2');
			(result).should.equal(chan2);
		})

		it('should return nothing (undefined) if channel doesnt exist', function() {
			var result = _irc.channels.find('#channelDoesntExist');
			should.not.exist(result);
		})

		it('should return nothing (undefined) no name passed, or name is an empty string', function() {
			var test1 = _irc.channels.find();
			should.not.exist(test2);

			var test2 = _irc.channels.find('');
			should.not.exist(test2);
		})
	})

})

describe("Channel", function() {
	var config = {};
	var _irc;

	beforeEach(function() {
		_irc = new irc.Irc(config);

		// Initialize channels
		_irc.channels.new('#stubChannel1', false);

	});

	describe('#join', function() {
		it('should send JOIN command', function() {
			var chan = _irc.channels.find('#stubChannel1').join();

			var message = 'JOIN #stubChannel1 ';
			var result = _irc.resultMessage;

			JSON.stringify(result).should.equal(JSON.stringify(message))
		})
	}),
	describe('#part', function() {
		it('should send PART command', function() {
			var chan = _irc.channels.find('#stubChannel1').part('Some stupid reason');

			var message = 'PART #stubChannel1 :Some stupid reason'
			var result = _irc.resultMessage;

			JSON.stringify(result).should.equal(JSON.stringify(message));
		})
	}),
	describe('#send', function() {
		it('should send PRIVMSG command', function() {
			var chan = _irc.channels.find('#stubChannel1').send('Some stupid message');

			var message = 'PRIVMSG #stubChannel1 :Some stupid message';
			var result = _irc.resultMessage;

			JSON.stringify(result).should.equal(JSON.stringify(message));
		})
	})

	describe('#emote', function() {
		it('should send PRIVMSG with action special characters', function() {
			var chan = _irc.channels.find('#stubChannel1').emote('is stupid');

			var message = 'PRIVMSG #stubChannel1 :ACTION is stupid ';
			var result = _irc.resultMessage;

			JSON.stringify(result).should.equal(JSON.stringify(message));
		})
	})
})
