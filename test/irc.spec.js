var irc  = require('../lib/irc'),
	connection = require('./connection-stub'),
	Message = require('../lib/message').Message,
	winston = require('winston'),
	should = require('should');

describe("IRC", function(){
	var config = {};
	config.logger = new (winston.Logger)({
		transports: [
			new (winston.transports.Console)({ level: 'warn' })
		]
	});
	config.nick = 'stubBotNick';
	config.command = '!';
	config.plugins = ["dummy"];
	config.channels = ["#lord-taco", "#lordtaco"];

	var _irc, _connection;

	beforeEach(function() {
		_connection = new connection.Connection();
		_irc = new irc.Irc(config);
		_irc.dummyConnect(_connection);
	})

	it('should add the given plugins to the plugins array', function() {
		should.exist(_irc.plugins['dummy']);
	}),
	it('should add the given plugins with their associated events and their callbacks to the hooks array', function() {
		should.exist(_irc.plugins['dummy']);
	}),
	it('should emit the onNumeric event, if a numeric command is given', function() {
		var inMessage = ':irc.server.net 376 stubUser :End of /MOTD command.';
		var message = new Message(inMessage);

		var returnValue = false;
		_irc.once('numeric', function(args) {
			JSON.stringify(args).should.equal(JSON.stringify(message));
			returnValue = true;
		});

		_irc.onMessage(message);

		returnValue.should.equal(true);
	}),
	it('should emit privateMessage event ...', function() {
		var inMessage = ':stubUser!~stubUser@irc.server.net PRIVMSG stubBotNick :This is a private message'
		var message = new Message(inMessage);

		var returnValue = false;
		_irc.once('privateMessage', function(args) {
			JSON.stringify(args).should.equal(JSON.stringify(message));
			returnValue = true;
		});

		_irc.onMessage(message);

		returnValue.should.equal(true);
	}),
	it('should send pong if ping is received', function() {
		var inMessage = 'PING :irc.server.net';
		var message = new Message(inMessage);

		_irc.onMessage(message);

		var message = 'PONG irc.server.net\r\n';
		var result = _irc.connection.message;

		JSON.stringify(result).should.not.equal(JSON.stringify('undefined'));
		JSON.stringify(result).should.equal(JSON.stringify(message));
	})


	describe('#say', function() {
		it('should send PRIVMSG', function() {
			var chan = _irc.say('#stubChannel1', 'this is stupid');

			var message = 'PRIVMSG #stubChannel1 :this is stupid\r\n';
			var result = _irc.connection.message;

			JSON.stringify(result).should.equal(JSON.stringify(message));
		})
	})
	describe('#action', function() {
		it('should send PRIVMSG with action special characters', function() {
			var chan = _irc.action('#stubChannel1', 'is stupid');

			var message = 'PRIVMSG #stubChannel1 :\001ACTION is stupid \001\r\n';
			var result = _irc.connection.message;

			JSON.stringify(result).should.equal(JSON.stringify(message));
		})
	})

});
