var irc  = require('./irc-stub.js'),
	message = require('../lib/message.js'),
	insult = require('../plugins/insult.js'),
	should = require('should');

describe("Insult", function(){
	var config = {};
	var _irc, _insult;

	beforeEach(function() {
		_irc = new irc.Irc(config);
		_insult = new insult.Plugin(_irc, 'insult');
	})

	describe("#trigInsult()", function() {
		it('should insult the user who sent the command', function() {
			var test = new message.Message(':stubUser!~stubUser@irc.network.com PRIVMSG #stubChannel :!insult');
			var result = /PRIVMSG #stubChannel :stubUser! You ([^\s]*), ([^\s]*) ([^\s]*)!/;
			var call = _insult.trigInsult(test);
			var resultMessage = _irc.resultMessage;
			JSON.stringify(resultMessage).should.match(result);

		})
		it('should insult the intend target', function() {
			var test = new message.Message(':stubUser!~stubUser@irc.network.com PRIVMSG #stubChannel :!insult thirdUser');
			var result = /PRIVMSG #stubChannel :thirdUser! You ([^\s]*), ([^\s]*) ([^\s]*)!/;
			var compare = _insult.trigInsult(test);
			var resultMessage = _irc.resultMessage;
			JSON.stringify(resultMessage).should.match(result);
		})
		it('should\'nt insult the bot', function() {
			var test = new message.Message(':stubUser!~stubUser@irc.network.com PRIVMSG #stubChannel :!insult stubBotNick');
			var result = /PRIVMSG #stubChannel :stubUser! You ([^\s]*), ([^\s]*) ([^\s]*)!/;
			var compare = _insult.trigInsult(test);
			var resultMessage = _irc.resultMessage;
			JSON.stringify(resultMessage).should.match(result);
		})
	})
	it('should have a name', function() {
		JSON.stringify(_insult.name).should.equal(JSON.stringify('insult'));
	}),
	it('should have a version', function() {
		JSON.stringify(_insult.version).should.not.equal(JSON.stringify('undefined'));
	}),
	it('should have a title', function() {
		JSON.stringify(_insult.title).should.not.equal(JSON.stringify('undefined'));
	})

});
