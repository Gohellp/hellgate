const {Client, GatewayIntentBits, EmbedBuilder} = require("discord.js"),
	{token} = require('./config.json'),
	moment = require("moment"),
	sqlite3 = require("sqlite3").verbose(),
	db = new sqlite3.Database('./database.db'),
	bot = new Client({
		intents:[
			GatewayIntentBits.Guilds,
			GatewayIntentBits.GuildMembers,
			GatewayIntentBits.GuildMessages,
			GatewayIntentBits.GuildVoiceStates
		]
	})

let nith;

bot.once("ready", async ()=>{
	console.log(`${bot.user.username} is started at ${moment().format('HH:mm:ss')}`);
	nith = bot.guilds.cache.get("991658690434318407");
	nith.logs_channel = nith.channels.cache.get("991661277015457912");//Bot's chat

	await nith.channels.cache.get("991659511087628318").threads.fetchArchived(true)
})
bot.on("messageCreate", async msg =>{
	if(msg.author.bot)return;
	db.get("select count(*) from roleplay where forms_channel_id=?",[msg.channelId], (err, count)=>{
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
								value:err
							}
						)
				]
			})
		}
		if(count["count(*)"])msg.react("🤔")
	})
})
bot.on("messageReactionAdd", (react,user)=>{
	if(user.bot)return;
	db.get("select count(*) from roleplay where forms_channel_id=?",[react.message.channelId], (err, count)=>{
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
								value:err
							}
						)
				]
			})
		}
		if(count["count(*)"])msg.react("🤔")
	})
})
bot.on("voiceStateUpdate", async (voice_old, voice_new)=>{
	if(voice_new.channelId==="991660306092785684"){
		if(voice_old.channelId!==null){
			if(voice_old.channel.members.size){
				let new_owner = voice_old.channel.members.toJSON()[Math.floor(Math.random() * (voice_old.channel.members.size - 1))]
				voice_old.channel.edit({
					name:new_owner.user.username+"'s channel",
					permissionOverwrites: [
						{
							id: new_owner.id,
							allow: ['ManageChannels', 'ManageRoles', 'MuteMembers', 'DeafenMembers']
						}
					]
				})
					.then(voice=>{
						db.run("update voices set owner_id=? where owner_id=?;",[new_owner.id,voice.channelId])
					})
			}else{
				try{
					voice_old.channel.delete()
						.then(() => {
							db.run("delete from voices where owner_id=?;",[voice_old.id])
						})
				}catch (err) {
					nith.logs_channel.send({
						embeds:[
							new EmbedBuilder()
								.setTitle("ERROR")
								.setColor("#FF0000")
								.addFields(
									{
										name:"Error in delete old user channel.",
										value:"I can't delete channel"
									},
									{
										name:"Error message",
										value:err
									})
						]
					})
				}
			}
		}

		nith.channels.create({
			name: `${nith.members.cache.find(m=>m.id===voice_new.id).user.username}'s channel`,
			type:2,
			parent:'991660199502950522',//ID of category
			permissionOverwrites:[
				{
					id: voice_new.id,
					allow: ['ManageChannels','ManageRoles', 'MuteMembers', 'DeafenMembers']
				}
			]
		}).then(async voice=>{
			await voice_new.setChannel(voice)
			db.run(`insert into voices(owner_id, voice_id) values (${voice_new.id},${voice.id});`)
		})
	} else if(voice_old.channelId!=="991660306092785684"&&voice_old.channelId!==null){
		db.get('select * from voices where voice_id =?;', [voice_old.channelId], (err,row)=>{
			if(err||!row){
				console.log(err?err:`[${moment().format('HH:mm:ss')}]\n\tmsg: I can't get the own_id from db`)
				return nith.logs_channel.send({
					embeds:[
						new EmbedBuilder()
							.setTitle("ERROR")
							.setColor("#FF0000")
							.addFields(
								{
									name:"Error in Disconnection\/connection",
									value:"I can't get the own_id from db"
								},
								{
									name:"Error message",
									value:err
								})
					]
				})
			}
			if(row.owner_id===voice_old.id){
				if(!voice_old.channel.members.size){
					try{
						voice_old.channel.delete()
							.then(()=>{
								db.run("delete from voices where owner_id=?;",[voice_old.id])
							})
					}catch (err) {
						nith.logs_channel.send({
							embeds:[
								new EmbedBuilder()
									.setTitle("ERROR")
									.setColor("#FF0000")
									.addFields(
										{
											name:"Description",
											value:"Some error with Deleting Voice Channel."
										},
										{
											name:"Error message",
											value:err
										})
							]
						})
					}
				}else{
					let next_voice_owner = voice_old.channel.members.toJSON()[Math.floor(Math.random() * (voice_old.channel.members.size - 1))]
					db.run("update voices set owner_id=? where voice_id=?;", [next_voice_owner.id, voice_old.channelId],(err)=>{
						if(err)return console.log(err)

						voice_old.channel.edit({
							name:next_voice_owner.user.username+"'s channel",
							permissionOverwrites:[
								{
									id: next_voice_owner.id,
									allow: ['ManageChannels', 'ManageRoles', 'MuteMembers', 'DeafenMembers']
								}
							]
						})
					})
				}
			}
		})
	}
})


bot.login(token)