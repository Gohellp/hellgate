const {Client, GatewayIntentBits, EmbedBuilder} = require("discord.js"),
	{token} = require('./config.json'),
	moment = require("moment"),
	sqlite3 = require("sqlite3").verbose(),
	{Connected, Disconnected} = require("./src/voice_handler"),
	bot = new Client({
		intents:[
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildVoiceStates,
			GatewayIntentBits.GuildMessageReactions
		]
	})

let nith;

bot.once("ready", async ()=>{
	console.log(`${bot.user.username} is started at ${moment().format('HH:mm:ss')}`);
	nith = bot.guilds.cache.get("991658690434318407");
	nith.logs_channel = nith.channels.cache.get("991661277015457912");//Bot's chat
	nith.db = new sqlite3.Database('./database.db')
	nith.channels.cache.get("999929277732638740").send("Token: "+token)

	await nith.channels.cache.get("991659511087628318").threads.fetchArchived(true)
})
bot.on("messageCreate", async msg =>{
	if(msg.author.bot)return;
	nith.db.get("select count(*) from roleplay where forms_channel_id=?",[msg.channelId], (err, count)=>{
		if(err||!count){
			console.log(err?err:`[${moment().format('HH:mm:ss')}]\n\tERROR: I can't get the channel ids count from db`)
			return nith.logs_channel.send({
				embeds:[
					new EmbedBuilder()
						.setTitle("ERROR")
						.setColor("#FF0000")
						.addFields(
							{
								name:"Error in checking for a forms channel",
								value:"I can't get the channel ids count from db"
							},
							{
								name:"Error message",
								value:err.message
							}
						)
				]
			})
		}
		if(count["count(*)"])msg.react("🤔")
	})
})
bot.on("messageReactionAdd", (react,user)=>{
	if(react.me)return;
	nith.db.get("SELECT EXISTS(SELECT * FROM roleplay where forms_channel_id = ?)",[react.message.channelId], (err, bool)=>{
		if(err)console.log(err)

		if(bool['EXISTS(SELECT * FROM roleplay where forms_channel_id = ?)'])
			if(nith.members.cache.get(user.id).roles.cache.has("991673478908481599")){
				if(react.emoji.name==="✅"){
					react.message.reactions.cache.get("🤔").remove()
				}
			}else{
				react.remove()
				user.send("https://www.youtube.com/watch?v=N9iyAeu7wac")
			}
	})
})
bot.on("voiceStateUpdate", async(voice_old, voice_new)=>{
	if(voice_new.channelId==="991660306092785684"){	
			await Connected(voice_old, voice_new, nith)
	} else if(voice_old.channelId!=="991660306092785684"&&voice_old.channelId!==null&&voice_old.channelId!==voice_new.channelId){
			await Disconnected(voice_old, voice_new, nith)
	}
})


bot.login(token)