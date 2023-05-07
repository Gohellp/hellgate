const {Client, Collection, GatewayIntentBits} = require("discord.js"),
	fs = require('node:fs'),
	moment = require("moment"),
	path = require('node:path'),
	sqlite3 = require("sqlite3").verbose(),
	foldersPath = path.join(__dirname, 'commands'),
	{Connected, Disconnected} = require("./src/voice_handler"),
	commandFolders = fs.readdirSync(foldersPath),
	bot = new Client({
		intents:[
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.MessageContent,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildMessageReactions
		]
	})

let nith,
	{token} = require('./config.json');
bot.commands = new Collection();

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			bot.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

if (process.argv[2] && process.argv[2] === '-t') {
	token = "MTA5NzA3NDk4MDkxMjYzMTgyOA.GDyri1.3uF-9ntzcrcBc3W4Rkh_fHoL6rztRownzuZd50";
}

bot.once("ready", async ()=>{
	console.log(`${bot.user.username} is started at ${moment().format('HH:mm:ss')}`);
	nith = bot.guilds.cache.get("991658690434318407");
	nith.logs_channel = nith.channels.cache.get("991661277015457912");//Bot's chat
	nith.db = new sqlite3.Database('./database.db')
})
bot.on("interactionCreate", async interaction=>{
	if (!interaction.isChatInputCommand()) return;

	interaction.db = nith.db;
	const command = interaction.client.commands.get(interaction.commandName);

	if (!command) {
		console.error(`No command matching ${interaction.commandName} was found.`);
		return;
	}

	try {
		await command.execute(interaction);
	} catch (error) {
		console.error(error);
		if (interaction.replied || interaction.deferred) {
			await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
		} else {
			await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
		}
	}
})
bot.on("voiceStateUpdate", async (voice_old, voice_new)=>{
	if(voice_new.channelId==="991660306092785684"){	
			await Connected(voice_old, voice_new, nith)
	} else if(voice_old.channelId!=="991660306092785684"&&voice_old.channelId!==null&&voice_old.channelId!==voice_new.channelId){
			await Disconnected(voice_old, voice_new, nith)
	}
})


bot.login(token)