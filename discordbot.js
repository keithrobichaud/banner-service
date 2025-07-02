const Discord = require('discord.js');
const bot = new Discord.Client();
bot.commands = new Discord.Collection();
const makeBanner = require('./makeBanner.js');

bot.commands.set('!banner', {
    description: 'Get a banner',
    execute(msg, args) {
        if (args.length < 1) {
            msg.reply('Please format your command like so: !banner message :emoji1: :emoji2: (emoji2 optional)');
        } else {
            // Extract the message and emojis from args
            const message = args.filter(arg => !arg.startsWith(':') && !arg.startsWith('<:') && !isUnicodeEmoji(arg)).join(' ');
            const emojis = args.filter(arg => arg.startsWith(':') || arg.startsWith('<:') || isUnicodeEmoji(arg));
            const emoji1 = emojis[0] || ':smile:';
            const emoji2 = emojis[1] || ':black_large_square:';

            console.log(`Message: ${message}`);
            console.log(`Emoji1: ${emoji1}`);
            console.log(`Emoji2: ${emoji2}`);

            // Generate banner messages
            const messages = makeBanner({ chunkSize: 500, str: message, emojis: [emoji1, emoji2] });
            console.log(messages);
            messages.forEach(message => msg.channel.send(message).catch(e => console.log(e, 'message: ' + message)));
        }
    },
});

const TOKEN = '';

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

// Helper function to detect Unicode emojis
function isUnicodeEmoji(str) {
    const emojiRegex = /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/u;
    return emojiRegex.test(str);
}

module.exports = bot;
