/**
 * Insult Plugin converted from :
 * http://lxr.mozilla.org/mozilla/source/webtools/mozbot/BotModules/Insult.bm
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
};
util.inherits(Plugin, basePlugin.BasePlugin);

Plugin.prototype.onMessage = function(line) {
	var irc = this.irc,
		user = irc.users.find(line.nick),
		chan = irc.channels.find(line.arguments[0]),
		msg = line.arguments[1];

	var match = msg.match(/^\s*(?:will\s+you\s+)?(?:insult|harass)\s+(\S+?)(?:[\s,.]+please)?[\s.?!]*$/i);
	if (match) {
		var target = match[1], line;

		// Do they want us to insult them?
		if (target == 'me') {
			target = user.nick;
		}

		// Are they trying to insult us?
		if (target.toLowerCase() == irc.nick.toLowerCase() || target.toLowerCase() == 'yourself') {
			line = user.nick+': nice try, fool';
		}
		else {
			line = target+ ': '+ this.generateInsult();
		}

		chan.say(line);
	}

};

/**
 * Insults are formed by making combinations of:
 *
 *    You are nothing but a(n) {adj} {amt} of {adj} {noun}
 */
Plugin.prototype.generateInsult = function() {

	var adjectives = [
		'acidic', 'antique', 'contemptible', 'culturally-unsound', 'despicable', 'evil',
		'fermented', 'festering', 'foul', 'fulminating', 'humid', 'impure', 'inept', 'inferior',
		'industrial', 'left-over', 'low-quality', 'malodorous', 'off-color', 'penguin-molesting',
		'petrified', 'pointy-nosed', 'salty', 'sausage-snorfling', 'tasteless', 'tempestuous',
		'tepid', 'tofu-nibbling', 'unintelligent', 'unoriginal', 'uninspiring', 'weasel-smelling',
		'wretched', 'spam-sucking', 'egg-sucking', 'decayed', 'halfbaked', 'infected', 'squishy',
		'porous', 'pickled', 'coughed-up', 'thick', 'vapid', 'hacked-up', 'unmuzzled', 'bawdy',
		'vain', 'lumpish', 'churlish', 'fobbing', 'rank', 'craven', 'puking', 'jarring',
		'fly-bitten', 'pox-marked', 'fen-sucked', 'spongy', 'droning', 'gleeking', 'warped',
		'currish', 'milk-livered', 'surly', 'mammering', 'ill-borne', 'beef-witted',
		'tickle-brained', 'half-faced', 'headless', 'wayward', 'rump-fed', 'onion-eyed',
		'beslubbering', 'villainous', 'lewd-minded', 'cockered', 'full-gorged', 'rude-snouted',
		'crook-pated', 'pribbling', 'dread-bolted', 'fool-born', 'puny', 'fawning', 'sheep-biting',
		'dankish', 'goatish', 'weather-bitten', 'knotty-pated', 'malt-wormy', 'saucyspleened',
		'motley-mind', 'it-fowling', 'vassal-willed', 'loggerheaded', 'clapper-clawed', 'frothy',
		'ruttish', 'clouted', 'common-kissing', 'pignutted', 'folly-fallen', 'plume-plucked',
		'flap-mouthed', 'swag-bellied', 'dizzy-eyed', 'gorbellied', 'weedy', 'reeky', 'measled',
		'spur-galled', 'mangled', 'impertinent', 'bootless', 'toad-spotted', 'hasty-witted',
		'horn-beat', 'yeasty', 'imp-bladdereddle-headed', 'boil-brained', 'tottering', 'hedge-born',
		'hugger-muggered', 'elf-skinned', 'Microsoft-loving'
	];

	var amounts = [
		'accumulation', 'bucket', 'coagulation', 'enema-bucketful', 'gob', 'half-mouthful', 'heap',
		'mass', 'mound', 'petrification', 'pile', 'puddle', 'stack', 'thimbleful', 'tongueful',
		'ooze', 'quart', 'bag', 'plate', 'ass-full', 'assload'
	];

	var nouns = [
		'bat toenails', 'bug spit', 'cat hair', 'chicken piss', 'dog vomit', 'dung',
		'fat woman\'s stomach-bile', 'fish heads', 'guano', 'gunk', 'pond scum', 'rat retch',
		'red dye number-9', 'Sun IPC manuals', 'waffle-house grits', 'yoo-hoo', 'dog balls',
		'seagull puke', 'cat bladders', 'pus', 'urine samples', 'squirrel guts', 'snake assholes',
		'snake bait', 'buzzard gizzards', 'cat-hair-balls', 'rat-farts', 'pods', 'armadillo snouts',
		'entrails', 'snake snot', 'eel ooze', 'slurpee-backwash', 'toxic waste', 'Stimpy-drool',
		'poopy', 'poop', 'craptacular carpet droppings', 'jizzum', 'cold sores', 'anal warts',
		'IE user'
	];


	var adj1 = adjectives[Math.floor(Math.random()*adjectives.length)],
		adj2 = adjectives[Math.floor(Math.random()*adjectives.length)],
		amnt = amounts[Math.floor(Math.random()*amounts.length)],
		noun = nouns[Math.floor(Math.random()*nouns.length)],
		an = adj1.match(/^[aeiou]/i) ? 'an' : 'a';

	// adj2 musn't be the same as $adj1
	if (adj1 == adj2) {
		adj2 = 'err... of... some';
	}

	return util.format("You are nothing but %s %s %s of %s %s.", an, adj1, amnt, adj2, noun);
};
