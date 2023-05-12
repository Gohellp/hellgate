const {Client, GatewayIntentBits,EmbedBuilder} = require("discord.js"),
	{createCollection} = require("./src/collections.js"),
	moment = require("moment"),
	sqlite3 = require("sqlite3").verbose(),
	{Connected, Disconnected} = require("./src/voice_handler"),
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

if (process.argv[2] && process.argv[2] === '-t') {
	token = "MTA5NzA3NDk4MDkxMjYzMTgyOA.GDyri1.3uF-9ntzcrcBc3W4Rkh_fHoL6rztRownzuZd50";
}

bot.once("ready", async ()=>{
	createCollection("commands",bot)
	console.log(`${bot.user.username} is started at ${moment().format('HH:mm:ss')}`);
	nith = bot.guilds.cache.get("991658690434318407");
	nith.logs_channel = nith.channels.cache.get("991661277015457912");//Bot's chat
	nith.db = new sqlite3.Database('./database.db')
})
bot.on("interactionCreate", async interaction=>{
	if(interaction.isButton()){
		const options = interaction.customId.replace("approve_","").replace("reject_","").split("^")
		if(interaction.customId.startsWith("approve")){
			nith.members.cache.get(options[1]).send({
				embeds:[
					new EmbedBuilder()
						.setTitle("INFO")
						.setColor("#00ffff")
						.addFields({
							name:"Message",
							value:"Your form have been approved just now!\nGood luck in your roleplay!"
						})
				]
			})
			nith.db.run("update forms set status=1 where id=?;", options[0], ()=>{
				interaction.update({
					components:[],
					embeds:[
						new EmbedBuilder()
							.setTitle('INFO')
							.setColor('#00ffff')
							.addFields({
								name:"Message",
								value:`Form ${options[0]} has been approved!`
							})
					]
				})
			})
		}else{

		}
	}
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