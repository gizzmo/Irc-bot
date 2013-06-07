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


	it('should respond to several different requests', function() {

		// '^stubBotNick[\s,.]+(?:will\s+you\s+)?(?:insult|harass)\s+(\S+?)(?:[\s,.]+please)?[\s.?!]*$'
		[
			'stubBotNick, will you insult stubUser please',
			'stubBotNick, will you insult stubUser.',
			'stubBotNick, insult stubUser please',
			'stubBotNick, insult stubUser!',
			'stubBotNick will you harass stubUser please',
			'stubBotNick will you harass stubUser.',
			'stubBotNick harass stubUser please',
			'stubBotNick harass stubUser!'

		].forEach(function(msg) {
			var test = new message.Message(':stubUser!~stubUser@users.ircserver.org PRIVMSG #stubChannel :'+msg);
			var result = /PRIVMSG #stubChannel :stubUser: You are nothing but (\S*) (\S*) (\S*) of (\S*) (\S*)./;

			var call = _insult.onMessage(test);
			var resultMessage = _irc.resultMessage;
			JSON.stringify(resultMessage).should.match(result);
		});

	})
	it('should insult the user who sent the request', function() {
		var test = new message.Message(':stubUser!~stubUser@irc.network.com PRIVMSG #stubChannel :stubBotNick insult me');
		var result = /PRIVMSG #stubChannel :stubUser: You are nothing but (\S*) (\S*) (\S*) of (\S*) (\S*)./;

		var call = _insult.onMessage(test);
		var resultMessage = _irc.resultMessage;
		JSON.stringify(resultMessage).should.match(result);

	})
	it('should insult the intend target', function() {
		var test = new message.Message(':stubUser!~stubUser@irc.network.com PRIVMSG #stubChannel :stubBotNick insult thirdUser');
		var result = /PRIVMSG #stubChannel :thirdUser: You are nothing but (\S*) (\S*) (\S*) of (\S*) (\S*)./;

		var compare = _insult.onMessage(test);
		var resultMessage = _irc.resultMessage;
		JSON.stringify(resultMessage).should.match(result);
	})
	it('shouldn\'t insult it\'s self', function() {
		var test = new message.Message(':stubUser!~stubUser@irc.network.com PRIVMSG #stubChannel :stubBotNick insult stubBotNick');
		var result = 'PRIVMSG #stubChannel :stubUser: nice try, fool.';

		var compare = _insult.onMessage(test);
		var resultMessage = _irc.resultMessage;
		JSON.stringify(resultMessage).should.equal(JSON.stringify(result));
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
