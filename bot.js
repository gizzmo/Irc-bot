/**
 * IRC Bot
 */
var irc = require('./lib/irc'),
	pkgconfig = require('pkgconfig'),
	winston = require('winston'),
	argv = require('optimist').default('config', 'config').argv; // alternative: nconf

var confName = argv.config;

var options = {
	schema: './config/schema.json',
	config: './config/' + confName + '.json'
};

var config = pkgconfig(options);

if (argv.logLevel) {
	config.logLevel = argv.logLevel;
};

var logger = new (winston.Logger)({
	transports: [
		new (winston.transports.Console)({ level: config.logLevel, colorize: true })
		// new (winston.transports.File)({ level: config.logLevel, filename: 'ircbot.log' })
	]
});

config.logger = logger;

/**
 * Let's power up
 */
var ircClient = new irc.Irc(config);
ircClient.connect();
