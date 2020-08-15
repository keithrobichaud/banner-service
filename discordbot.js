const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const makeBanner = require('./makeBanner.js');

bot.commands.set('/banner', {
	description: 'Get a banner',
	execute(msg, args) {
		if (args.length < 2) {
			msg.reply('Please format your command like so: /banner message :emoji1: :emoji2:')
		} else {
			const messages = makeBanner({ chunkSize: 1000, str: args[0], emojis: [args[1], args[2] || ':black_large_square:'] });
			console.log(messages);
			messages.forEach(message => msg.channel.send(message).catch(e => console.log(e, 'message: ' + message)));
		}
	},
})

const TOKEN = 'NzQzOTcyNjU0MDk2MzE4NTA0.Xzcchw.E37opnuf-sWPvR3h-oSTVrfb67g';

bot.login(TOKEN);






bot.on('ready', () => {
	console.info(`Logged in as ${bot.user.tag}!`);
});

bot.on('message', msg => {
	const args = msg.content.split(/ +/);
	const command = args.shift().toLowerCase();
	console.info(`Called command: ${command}`);

	if (!bot.commands.has(command)) return;

	try {
		bot.commands.get(command).execute(msg, args);
	} catch (error) {
		console.error(error);
		msg.reply('there was an error trying to execute that command!');
	}
});

module.exports = bot;
