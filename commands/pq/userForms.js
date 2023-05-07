const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandStringOption, SlashCommandAttachmentOption, SlashCommandUserOption, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder, ComponentType, EmbedBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('form')
		.setDescription('Forms manager')
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName("create")
				.setDescription("Create character's form")
				.addStringOption(
					new SlashCommandStringOption()
						.setName("name")
						.setDescription("Character's name")
						.setMaxLength(40)
				)
				.addStringOption(
					new SlashCommandStringOption()
						.setName("appearance")
						.setDescription("Character appearance")
				)
				.addStringOption(
					new SlashCommandStringOption()
						.setName("distortion")
						.setDescription("Character Distortion (ability|quirk)")
				)
				.addAttachmentOption(
					new SlashCommandAttachmentOption()
						.setName("appearance_art")
						.setDescription("Character appearance art")
						.setRequired(false)
				)
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName("edit_notes")
				.setDescription("Edit notes of your form")
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName("get_notes")
				.setDescription("Get notes of your form")
				.addUserOption(
					new SlashCommandUserOption()
				)
		),
	async execute(interaction) {
		switch (interaction.options.getSubcommand()) {
			case "create":
				interaction.db.get("SELECT IIF(exists(select * from players where discord_id = $d_id), IIF(COUNT(f.id)>=p.max_forms,true,false),-1) AS status FROM players as p join forms f on p.id = f.player_id where discord_id = $d_id;", interaction.user.id,(err,row)=>{
					if(err)console.log(err)
					switch (row.status) {
						case 1://Max Reached
							interaction.reply({
								content:'Sorry, you reached max of count forms.',
								embed: [
									new EmbedBuilder()
										.setTitle("ERROR")
										.setColor("#FF0000")
										.addFields({
											name:"Error in create form.",
											value:"Reached max"
										})
								]
							})
							break;
						case 0://Normal status code

							break;
						case -1://Players doesn't exist
							interaction.reply({
								content:"Sorry, your profile doesn't exist",
								embed: [
									new EmbedBuilder()
										.setTitle("ERROR")
										.setColor("#FF0000")
										.addFields({
											name:"Existence error",
											value:"Profile doesn't exist"
										})
								]
							})
							break;
					}
					if(row.maxReached){

					}else{
						//TODO:Не сдохнуть при написании этой функции
					}
				})
				break;
			case "edit_notes":
				interaction.db.all("select f.id, f.name, f.distortion from forms as f join players p on f.player_id = p.id where p.discord_id=?;",interaction.user.id,async (err,rows)=>{
					if(err)console.log(err)
					if(!rows)return interaction.reply({
						content:'I cant find your forms. :c\n I think u forget create it! So u can do it with command `/form create`!!!\nSee you later <З',
						ephemeral: true
					});
					if(rows.length>1){
						let selectMenu = new StringSelectMenuBuilder();
						for(const item of rows){
							selectMenu.addOptions(
								new StringSelectMenuOptionBuilder()
									.setLabel(item.name)
									.setValue(item.id.toString())
							)
								.setMaxValues(1)
								.setPlaceholder("Select your form to edit notes!")
								.setCustomId("customID")
						}

						const interReply = await interaction.reply({
							components: [
								new ActionRowBuilder()
									.addComponents(selectMenu)
							],
							ephemeral:true
						})
						const interCollector = interReply.createMessageComponentCollector({
							componentType: ComponentType.SelectMenu,
							max:1,
							time: 1_800_000
						})
						interCollector.on("collect", async selectMenu=>{
							interaction.db.get("select notes,name from forms where id=?;", selectMenu.values[0],(err_,row)=>{
								if(err_)return console.log(err_);
								selectMenu.update({
									embeds:[
										new EmbedBuilder()
											.setTitle(row.name+"'s note")
											.setColor(interaction.member.displayColor)
											.addFields({
												name:"Note:",
												value:row.notes?row.notes:"I wait for your note."
											})
									],
									components:[],
									ephemeral:true
								})
							})
							const messageCollector = interaction.channel.createMessageCollector({
								filter:m => m.author.id===interaction.user.id,
								time:1_800_000,
								max:1
							})
							messageCollector.on("collect", msg=>{
								interaction.db.run("update forms set notes=$n where id=$id;",{$n:msg.content,$id:selectMenu.values[0]})
								interaction.editReply({
									embeds:[
										new EmbedBuilder()
											.setTitle("INFO")
											.setColor("#00ffff")
											.addFields({
												name:"Message",
												value:"All done. Note set to:"
											},{
												name:"Note",
												value:msg.content
											})
									],
									ephemeral: true,
									components:[]
								})
								msg.delete()
							})
							messageCollector.on("end",(coll,reason)=>{
								if(reason==="time")interaction.editReply({
									content:"Time expire",
									embeds:[
										new EmbedBuilder()
											.setTitle("INFO")
											.setColor("#00ffff")
											.addFields({
												name:"Message",
												value:"Time expire.\nYou should write a note a little faster."
											})
									],
									ephemeral: true,
									components:[]
								})

							})
						})
					}else{

						interaction.db.get("select notes,name from forms where id=?;",rows[0].id,(err,row)=>{
							interaction.reply({
								embeds:[
									new EmbedBuilder()
										.setTitle(row.name+"'s note")
										.setColor(interaction.member.displayColor)
										.addFields({
											name:"Note:",
											value:row.notes?row.notes:"I wait for your note."
										})
								],
								components:[],
								ephemeral:true
							})
							const messageCollector = interaction.channel.createMessageCollector({
								filter:m => m.author.id===interaction.user.id,
								time:1_800_000,
								max:1
							})
							messageCollector.on("collect", msg=>{
								debugger
								interaction.db.run("update forms set notes=$n where id=$id;",{$n:msg.content,$id:row.id})
								interaction.editReply({
									embeds:[
										new EmbedBuilder()
											.setTitle("INFO")
											.setColor("#00ffff")
											.addFields({
												name:"Message",
												value:"All done. Note set to:"
											},{
												name:"Note",
												value:msg.content
											})
									],
									ephemeral: true,
									components:[]
								})
								msg.delete()
							})
							messageCollector.on("end",(coll,reason)=>{
								if(reason==="time")interaction.editReply({
									content:"Time expire",
									embeds:[
										new EmbedBuilder()
											.setTitle("INFO")
											.setColor("#00ffff")
											.addFields({
												name:"Message",
												value:"Time expire.\nYou should write a note a little faster."
											})
									],
									ephemeral: true,
									components:[]
								})

							})
						})
					}
				})
				break;
			case "get_notes":
				interaction.db.all("select f.id, f.name, f.distortion from forms as f join players p on f.player_id = p.id where p.discord_id=?;",interaction.user.id,async (err,rows)=>{
					if(err)console.log(err)
					if(!rows||rows.length===0)return interaction.reply({
						content:'I cant find your forms. :c\n I think u forget create it! So u can do it with command `/form create`!!!\nSee you later <З',
						ephemeral: true
					});
					if(rows.length>1){
						let selectMenu = new StringSelectMenuBuilder();
						for(const item of rows){
							selectMenu.addOptions(
								new StringSelectMenuOptionBuilder()
									.setLabel(item.name)
									.setValue(item.id.toString())
							)
								.setMaxValues(1)
								.setPlaceholder("Select your form to edit notes!")
								.setCustomId("customID")
						}

						const interReply = await interaction.reply({
							components: [
								new ActionRowBuilder()
									.addComponents(selectMenu)
							],
							ephemeral:true
						})
						const interCollector = interReply.createMessageComponentCollector({
							componentType: ComponentType.SelectMenu,
							max:1,
							time: 1_800_000
						})
						interCollector.on("collect", async selectMenu=>{
							interaction.db.get("select notes,name from forms where id=?;", selectMenu.values[0],(err_,row)=>{
								if(err_)return console.log(err_);
								selectMenu.update({
									embeds:[
										new EmbedBuilder()
											.setTitle(row.name+"'s note")
											.setColor(interaction.member.displayColor)
											.addFields({
												name:"Note:",
												value:row.notes?row.notes:"I wait for your note."
											})
									],
									components:[],
									ephemeral:true
								})
							})
						})
					}else{
						interaction.db.get("select notes,name from forms where id=?;",rows[0].id,(err,row)=>{
							interaction.reply({
								embeds:[
									new EmbedBuilder()
										.setTitle(row.name+"'s note")
										.setColor(interaction.member.displayColor)
										.addFields({
											name:"Note:",
											value:row.notes?row.notes:"You haven't note here"
										})
								],
								components:[],
								ephemeral:true
							})
						})
					}
				})
				break;
			default:
				interaction.reply({
					content:"Sorry, i forget this command \":D",
					ephemeral: true
				})
		}
	},
};