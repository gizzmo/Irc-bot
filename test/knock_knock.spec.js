var irc  = require('./irc-stub.js'),
	message = require('../lib/message'),
	knock_knock = require('../plugins/knock_knock.js'),
	should = require('should');

describe("KnockKnock", function(){
	var config = {};
	var _irc, _knock_knock;

	beforeEach(function() {
		_irc = new irc.Irc(config);
		_knock_knock = new knock_knock.Plugin(_irc, 'Knock_Knock');
	});

	it('should start one joke process on request', function() {
		var test = new message.Message(':stubUser!~stubUser@users.ircserver.org PRIVMSG #stubChannel :!joke');
		var result = 'PRIVMSG #stubChannel :Ok, i\'ve got a joke for you. Knock Knock!';

		var call = _knock_knock.trigJoke(test);
		var resultMessage = _irc.resultMessage;

		JSON.stringify(resultMessage).should.equal(JSON.stringify(result));
		_knock_knock.progress.should.equal(1);

		// if somone else
		var result = 'PRIVMSG #stubChannel :Shush stubUser, I\'m already telling a joke! Try again in a min.';

		var call = _knock_knock.trigJoke(test);
		var resultMessage = _irc.resultMessage;
		JSON.stringify(resultMessage).should.equal(JSON.stringify(result));

	})
	it('should respond to correct msg', function() {

		// possible stage 1 respones
		var checks = [
			['whos there', 'PRIVMSG #stubChannel :Doris!'],
			['who\'s there', 'PRIVMSG #stubChannel :Doris!'],
			['whos there?', 'PRIVMSG #stubChannel :Doris!'],
			['who\'s there?', 'PRIVMSG #stubChannel :Doris!'],
			['who is there', 'PRIVMSG #stubChannel :Doris!'],
			['who is there?', 'PRIVMSG #stubChannel :Doris!']
		];

		checks.forEach(function(obj) {
			var msg = obj[0];
			var result = obj[1];

			// reset the progress to test each possible result
			_knock_knock.progress = 1;

			var test = new message.Message(':stubUser!~stubUser@users.ircserver.org PRIVMSG #stubChannel :'+msg);

			var call = _knock_knock.onMessage(test);
			var resultMessage = _irc.resultMessage;

			JSON.stringify(resultMessage).should.equal(JSON.stringify(result));
		});

		// stage two
		checks = [
			['doris who', 'Doris locked, that\'s why im knocking!'],
			['doris who?', 'Doris locked, that\'s why im knocking!']
		];

		checks.forEach(function(obj) {
			var msg = obj[0];
			var result = obj[1];

			// reset the progress to test each possible result
			_knock_knock.progress = 2;

			var test = new message.Message(':stubUser!~stubUser@users.ircserver.org PRIVMSG #stubChannel :'+msg);
			var result = 'PRIVMSG #stubChannel :'+result;

			var call = _knock_knock.onMessage(test);
			var resultMessage = _irc.resultMessage;
			JSON.stringify(resultMessage).should.equal(JSON.stringify(result));
		});

	})
	it('shouldnt respond if msg doesnt match progress', function() {

		var checks = [
			['who\'s that?', 'NOTHING HAPPENED'],
			['who is that?', 'NOTHING HAPPENED'],
			['whats there', 'NOTHING HAPPENED'],
			['whats this', 'NOTHING HAPPENED'],
			['ok, whos there', 'NOTHING HAPPENED'],
			['Doris Who?', 'NOTHING HAPPENED']
		];

		checks.forEach(function(obj) {
			var msg = obj[0];
			var result = obj[1];

			// reset progress
			_knock_knock.progress = 1;

			// test invalid responce
			var test = new message.Message(':stubUser!~stubUser@users.ircserver.org PRIVMSG #stubChannel :'+ msg);
			var result = 'NOTHING HAPPENED';

			var call = _knock_knock.onMessage(test);
			var resultMessage = _irc.resultMessage;
			JSON.stringify(resultMessage).should.equal(JSON.stringify(result));

			_knock_knock.progress.should.equal(1);
		})
	})




	it('should have a name', function() {
		JSON.stringify(_knock_knock.name).should.equal(JSON.stringify('Knock_Knock'));
	}),
	it('should have a version', function() {
		JSON.stringify(_knock_knock.version).should.not.equal(JSON.stringify('undefined'));
	}),
	it('should have a title', function() {
		JSON.stringify(_knock_knock.title).should.not.equal(JSON.stringify('undefined'));
	})

});
