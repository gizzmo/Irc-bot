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
var bot = new irc.Irc(config);
bot.connect();



// Allow input form the command line
var rl = require('readline').createInterface(process.stdin, process.stdout),

rl.on('line', function(line) {
	// start processing the line
	var params = line.split(' ');

	switch(params[0].toLowerCase()) {
		case 'join':  bot.channels.new(params[1], true, params[2]); break;
		case 'leave': bot.channels.find(params[1]).part('Admin requested me to leave!'); break;
	}

	rl.prompt();
}).on('close', function() {
	bot.raw('QUIT', ':Shutdown from commandline, Good bye!');
	bot.logger.info("Shutting down, Good bye!");
	process.exit(0);
});

rl.prompt();
