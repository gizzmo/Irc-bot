var irc  = require('./irc-stub.js'),
	message = require('../lib/message'),
	jokes = require('../plugins/jokes'),
	should = require('should');

describe("Jokes", function(){
	var config = {};
	var _irc, _jokes;

	beforeEach(function() {
		_irc = new irc.Irc(config);
		_jokes = new jokes.Plugin(_irc, 'Jokes');
	});

	it('should start joke process on request', function() {

		var checks = [
			['stubBotNick, tell me a joke!', 'Ok, i\'ve got a joke for you. Knock Knock!'],
			['stubBotNick, tell me a joke please', 'Ok, i\'ve got a joke for you. Knock Knock!'],
			['stubBotNick, will you tell me a joke?', 'Ok, i\'ve got a joke for you. Knock Knock!'],
			['stubBotNick, tell me a joke please!', 'Ok, i\'ve got a joke for you. Knock Knock!'],
			['stubBotNick will you tell me a joke please.', 'Ok, i\'ve got a joke for you. Knock Knock!'],
			['stubBotNick, do not tell me a joke!', 'NOTHING HAPPENED']
		];

		checks.forEach(function(obj) {
			var msg = obj[0];
			var result = obj[1];

			it(function(){
				var test = new message.Message(':stubUser!~stubUser@users.ircserver.org PRIVMSG #stubChannel :'+msg);
				var result = 'PRIVMSG #stubChannel :'+result;

				_jokes.onMessage(test);
				var resultMessage = _irc.resultMessage;

				JSON.stringify(resultMessage).should.equal(JSON.stringify(result));
				_jokes.progress.should.equal(1);
			})
		});

	})
	it('should not start a joke when one is already in progress', function() {
		var test = new message.Message(':stubUser!~stubUser@users.ircserver.org PRIVMSG #stubChannel :stubBotNick, tell me a joke');
		var result = 'PRIVMSG #stubChannel :Shush stubUser, I\'m already telling a joke! Try again in a bit.';

		_jokes.progress = 1;

		_jokes.onMessage(test);
		var resultMessage = _irc.resultMessage;

		JSON.stringify(resultMessage).should.equal(JSON.stringify(result));
	})
	it('should respond to correct msg, and not the wrong one', function() {

		// possible stage 1 respones
		var checks = [
			['whos there', 'Doris.'],
			['who\'s there', 'Doris.'],
			['whos there?', 'Doris.'],
			['who\'s there?', 'Doris.'],
			['who is there', 'Doris.'],
			['who is there?', 'Doris.'],
			['who isnt there?', 'NOTHING HAPPENED']
		];

		checks.forEach(function(obj) {
			var msg = obj[0];
			var result = obj[1];

			// reset the progress to test each possible result
			_jokes.progress = 1;

			it(function() {
				var test = new message.Message(':stubUser!~stubUser@users.ircserver.org PRIVMSG #stubChannel :'+msg);
				var result = 'PRIVMSG #stubChannel :'+result;

				_jokes.onMessage(test);
				var resultMessage = _irc.resultMessage;

				JSON.stringify(resultMessage).should.equal(JSON.stringify(result));
			})
		});

		// stage two
		checks = [
			['doris who', 'Doris locked, that\'s why im knocking!'],
			['doris who?', 'Doris locked, that\'s why im knocking!'],
			['door is locked, yea yea yea', 'NOTHING HAPPENED']
		];

		checks.forEach(function(obj) {
			var msg = obj[0];
			var result = obj[1];

			// reset the progress to test each possible result
			_jokes.progress = 2;

			it(function() {
				var test = new message.Message(':stubUser!~stubUser@users.ircserver.org PRIVMSG #stubChannel :'+msg);
				var result = 'PRIVMSG #stubChannel :'+result;

				var call = _jokes.onMessage(test);
				var resultMessage = _irc.resultMessage;
				JSON.stringify(resultMessage).should.equal(JSON.stringify(result));

			})
		});

	})




	it('should have a name', function() {
		JSON.stringify(_jokes.name).should.equal(JSON.stringify('Knock_Knock'));
	}),
	it('should have a version', function() {
		JSON.stringify(_jokes.version).should.not.equal(JSON.stringify('undefined'));
	}),
	it('should have a title', function() {
		JSON.stringify(_jokes.title).should.not.equal(JSON.stringify('undefined'));
	})

});
