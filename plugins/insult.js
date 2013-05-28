/**
 * Insult Plugin
 */
var util = require('util'),
	basePlugin = require('./basePlugin');

Plugin = exports.Plugin = function(irc, name) {
	Plugin.super_.call(this, irc, name);

	// Plugin name and version
	this.title = 'Insult';
	this.version = '0.1';

	// Help info with info on the commands
	this.help = 'Have the bot instult people, or your self.';
	this.helpCommands = [
		this.irc.config.command + 'insult <target> (if target is empty, you\'ll be insulted)'
	];

	// Triggers are messages that start with `!`
	this.irc.addTrigger(this, 'insult', this.trigInsult);
};
util.inherits(Plugin, basePlugin.BasePlugin);

Plugin.prototype.trigInsult = function(line) {
	var irc = this.irc,
		user = irc.users.find(line.nick),
		chan = irc.channels.find(line.arguments[0]),
		msg = line.arguments[1],
		params = msg.split(' ');

	// The first params is always the trigger (ie !command)
	params.shift()
	if (params.length === 0) {
		this.Insult(user.nick, chan);
	}
	else if (params[0] !== irc.nick) {
		this.Insult(params[0], chan);
	}
	else {
		this.Insult(user.nick, chan);
	}

};


Plugin.prototype.Insult = function(target, chan) {

	var col1 = [ "artless", "bawdy", "beslubbering", "bootless", "churlish", "cockered", "clouted",
		"craven", "currish", "dankish", "dissembling", "droning", "errant", "fawning", "fobbing",
		"froward", "frothy", "gleeking", "goatish", "gorbellied", "impertinent", "infectious",
		"jarring", "loggerheaded", "lumpish", "mammering", "mangled", "mewling", "paunchy",
		"pribbling", "puking", "puny", "qualling", "rank", "reeky", "roguish", "ruttish", "saucy",
		"spleeny", "spongy", "surly", "tottering", "unmuzzled", "vain", "venomed", "villainous",
		"warped", "wayward", "weedy", "yeasty" ];

	var col2 = [ "base-court", "bat-fowling", "beef-witted", "beetle-headed", "boil-brained",
		"clapper-clawed", "clay-brained", "common-kissing", "crook-pated", "dismal-dreaming",
		"dizzy-eyed", "doghearted", "dread-bolted", "earth-vexing", "elf-skinned", "fat-kidneyed",
		"fen-sucked", "flap-mouthed", "fly-bitten", "folly-fallen", "fool-born", "full-gorged",
		"guts-griping", "half-faced", "hasty-witted", "hedge-born", "hell-hated", "idle-headed",
		"ill-breeding", "ill-nurtured", "knotty-pated", "milk-livered", "motley-minded",
		"onion-eyed", "plume-plucked", "pottle-deep", "pox-marked", "reeling-ripe", "rough-hewn",
		"rude-growing", "rump-fed", "shard-borne", "sheep-biting", "spur-galled", "swag-bellied",
		"tardy-gaited", "tickle-brained", "toad-spotted", "unchin-snouted", "weather-bitten"];

	var col3 = [ "apple-john", "baggage", "barnacle", "bladder", "boar-pig", "bugbear",
		"bum-bailey", "canker-blossom", "clack-dish", "clotpole", "coxcomb", "codpiece",
		"death-token","dewberry", "flap-dragon", "flax-wench", "flirt-gill", "foot-licker",
		"fustilarian", "giglet", "gudgeon", "haggard", "harpy", "hedge-pig", "horn-beast",
		"hugger-mugger", "joithead", "lewdster", "lout", "maggot-pie", "malt-worm", "mammet",
		"measle", "minnow", "miscreant", "moldwarp", "mumble-news", "nut-hook", "pigeon-egg",
		"pignut", "puttock", "pumpion", "ratsbane", "scut", "skainsmate", "strumpet", "varlet",
		"vassal", "whey-face", "wagtail" ];

	var word1 = col1[Math.floor(Math.floor(Math.random()*col1.length))],
		word2 = col2[Math.floor(Math.floor(Math.random()*col2.length))],
		word3 = col3[Math.floor(Math.floor(Math.random()*col3.length))];

	chan.send(target+'! You '+word1+', '+word2+' '+word3+'!');
}
