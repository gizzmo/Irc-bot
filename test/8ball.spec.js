var irc  = require('./irc-stub.js'),
	message = require('../lib/message'),
	EightBall = require('../plugins/8ball.js'),
	should = require('should');

describe("8Ball", function(){
	var config = {};
	var _irc, _8ball;

	beforeEach(function() {
		_irc = new irc.Irc(config);
		_8ball = new EightBall.Plugin(_irc, '8ball');
	});

	describe('#trig8Ball', function() {
		it('should answer with an Example, if now question asked', function() {
			var test = new message.Message(':stubOtherUserNick stubBotNick #stubChannel :!8ball');
			var result = 'PRIVMSG #stubChannel :\002Example:\002 !8ball <question>\r\n\r\n';
			var call = _8ball.trig8Ball(test);
			var resultMessage = _irc.resultMessage;
			JSON.stringify(resultMessage).should.equal(JSON.stringify(result))
		})
		// How do you test this?
		// it('should answer back', function() {
		// 	var test = new message.Message(':stubOtherUserNick stubBotNick #stubChannel :!8ball question');
		// 	var result = 'PRIVMSG #stubChannel :<result goes here>\r\n\r\n';
		// 	var call _8ball.trig8Ball(test);
		// 	var resultMessage = _irc.resultMessage;
		// 	JSON.stringify(resultMessage).should.equal(JSON.stringify(result))
		// })

	}),
	it('should have a name', function() {
		JSON.stringify(_8ball.name).should.equal(JSON.stringify('8ball'));
	}),
	it('should have a version', function() {
		JSON.stringify(_8ball.version).should.not.equal(JSON.stringify('undefined'));
	}),
	it('should have a title', function() {
		JSON.stringify(_8ball.title).should.not.equal(JSON.stringify('undefined'));
	})

});
