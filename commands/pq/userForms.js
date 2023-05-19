const {
	EmbedBuilder,
	ButtonBuilder,
	ComponentType,
	ActionRowBuilder,
	SlashCommandBuilder,
	StringSelectMenuBuilder,
	SlashCommandStringOption,
	SlashCommandAttachmentOption,
	StringSelectMenuOptionBuilder,
	SlashCommandSubcommandBuilder
} = require('discord.js');

function editFewNotes(inter,interaction){
	interaction.db.get("select notes,name from forms where id=?;", inter.values[0], (err_, row) => {
		if (err_) return console.log(err_);
		inter.update({
			embeds: [
				new EmbedBuilder()
					.setTitle(row.name + "'s note")
					.setColor(interaction.member.displayColor)
					.addFields({
						name: "Note:",
						value: row.notes
					})
			],
			components: [],
			ephemeral: true
		})
	})
	const messageCollector = interaction.channel.createMessageCollector({
		filter: m => m.author.id === interaction.user.id,
		time: 1_800_000,
		max: 1
	})
	messageCollector.on("collect", msg => {
		interaction.db.run("update forms set notes=$n where id=$id;", {
			$n: msg.content,
			$id: inter.values[0]
		})
		interaction.editReply({
			embeds: [
				new EmbedBuilder()
					.setTitle("INFO")
					.setColor("#00ffff")
					.addFields({
						name: "Message",
						value: "All done. Note set to:"
					}, {
						name: "Note",
						value: msg.content
					})
			],
			ephemeral: true,
			components: []
		})
		msg.delete()
	})
	messageCollector.on("end", (coll, reason) => {
		if (reason === "time") interaction.editReply({
			content: "Time expire",
			embeds: [
				new EmbedBuilder()
					.setTitle("INFO")
					.setColor("#00ffff")
					.addFields({
						name: "Message",
						value: "Time expire.\nYou should write a note a little faster."
					})
			],
			ephemeral: true,
			components: []
		})

	})
}
function changePage_edit(inter, interaction, offset){
	interaction.db.all("select f.id, f.name, f.distortion from forms as f join players p on f.player_id = p.id where p.discord_id=$d_id limit 20 offset $offset;", {$d_id:inter.user.id, $offset:offset},async (err,rows)=>{
		if(err)return console.log(err);

		if(rows.length>1){
			const actionRow = new ActionRowBuilder(),
				selectMenu = new StringSelectMenuBuilder()
					.setMaxValues(1)
					.setPlaceholder("Select your form to edit notes!")
					.setCustomId("customID");

			rows.map((item,i)=>{
				if(i>=20)
					return actionRow
						.addComponents(
							new ButtonBuilder()
								.setStyle(2)
								.setLabel("previous")
								.setCustomId("previous"+(offset-20)),
							new ButtonBuilder()
								.setStyle(2)
								.setLabel("Next")
								.setCustomId("next"+offset),
						)
				selectMenu
					.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel(item.name)
							.setValue(item.id.toString())
					)
			})
			await inter.editReply({
				components:actionRow.addComponents(selectMenu),
			}).awaitMessageComponent({
				componentType: ComponentType.SelectMenu||ComponentType.Button,
				max:1,
				time: 1_800_000
			}).then(inter_=>{
				if(inter_.isStringSelectMenu()){
					editFewNotes(inter,interaction)
				}else if(inter_.isButton()){
					changePage_edit(inter_,interaction,parseInt(inter.customId.replace("next","").replace("previous","")))
				}
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
}
function changePage(inter,interaction,offset){
	interaction.db.all("select f.id, f.name, f.distortion from forms as f join players p on f.player_id = p.id where p.discord_id=$d_id limit 20 offset $offset;", {$d_id:inter.user.id, $offset:offset},async (err,rows)=>{
		if(err)return console.log(err);

		if(rows.length>1){
			const actionRow = new ActionRowBuilder(),
				selectMenu = new StringSelectMenuBuilder()
					.setMaxValues(1)
					.setPlaceholder("Select your form to edit notes!")
					.setCustomId("customID");

			rows.map((item,i)=>{
				if(i>=20)
					return actionRow
						.addComponents(
							new ButtonBuilder()
								.setStyle(2)
								.setLabel("previous")
								.setCustomId("previous"+(offset-20)),
							new ButtonBuilder()
								.setStyle(2)
								.setLabel("Next")
								.setCustomId("next"+offset),
						)
				selectMenu
					.addOptions(
						new StringSelectMenuOptionBuilder()
							.setLabel(item.name)
							.setValue(item.id.toString())
					)
			})
			await interaction.editReply({
				components:actionRow.addComponents(selectMenu),
			}).awaitMessageComponent({
				componentType: ComponentType.SelectMenu||ComponentType.Button,
				max:1,
				time: 1_800_000
			}).then(inter_=>{
				if(inter_.isStringSelectMenu()){
					interaction.db.get("select notes,name from forms where id=?;",rows[0].id,(err,row)=>{
						interaction.editReply({
							embeds:[
								new EmbedBuilder()
									.setTitle(row.name+"'s note")
									.setColor(interaction.member.displayColor)
									.addFields({
										name:"Note:",
										value:row.notes
									})
							],
							components:[],
							ephemeral:true
						})
					})
				}else if(inter_.isButton()){
					changePage(inter_,interaction,parseInt(inter.customId.replace("next","").replace("previous","")))
				}
			})
		}else{
			interaction.db.get("select notes,name from forms where id=?;",rows[0].id,(err,row)=>{
				interaction.editReply({
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
		}
	})
}

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
						.setRequired(true)
				)
				.addStringOption(
					new SlashCommandStringOption()
						.setName("appearance")
						.setDescription("Character appearance")
						.setRequired(true)
				)
				.addStringOption(
					new SlashCommandStringOption()
						.setName("distortion")
						.setDescription("Character Distortion (ability|quirk)")
						.setRequired(true)
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
		),
	async execute(interaction) {
		switch (interaction.options.getSubcommand()) {
			case "create":
				interaction.db.get("SELECT IIF(exists(select * from players where discord_id = $d_id),IIF(COUNT(f.id)>=p.max_forms,true,false),-1) AS status,p.id FROM players as p left join forms as f on p.id = f.player_id where discord_id = $d_id;", {$d_id:interaction.user.id},(err,row)=>{
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
							const params={
								$p_id: row.id,
								$name:interaction.options.getString("name").value,
								$dist:interaction.options.getString("distortion").value,
								$look:interaction.options.getString("appearance").value,
								$art:interaction.options.getAttachment("appearance_art")?.url
							}
							interaction.db.run("insert into forms(player_id, name, look, look_art, distortion) values($p_id,$name,$look,$art,$dist)",params,err=> {
								if (err) return console.log(err)
								else{
									interaction.db.get("select seq as id from sqlite_sequence where name='forms';",async (err_, row_) =>{
										if(err_)return console.log(err_)

										interaction.reply({
											embeds:[
												new EmbedBuilder()
													.setTitle("INFO")
													.setColor("#00ffff")
													.addFields({
														name:"Message",
														value:"Form was sent to verification."
													})
											],
											ephemeral:true
										})
										await interaction.guild.channels.cache.get("1104791830245159086")
											.send({
											content:"<@&1104798851061272726>",
											embeds:[
												new EmbedBuilder()
													.setTitle("INFO(admin)")
													.setColor("#00ffff")
													.addFields(
														{
															name:"Message",
															value:`Form on id ${row_.id} by player_id: ${params.$p_id} has been created`
														},{
															name:"Name:",
															value:params.$name
														},{
															name:"Distortion:",
															value:params.$dist
														},{
															name:"Look:",
															value:params.$look
														}
													)
													.setImage(params.$art)
											],
											components:[
												new ActionRowBuilder()
													.addComponents(
														new ButtonBuilder()
															.setCustomId("approve_"+row_.id+"^"+interaction.user.id)
															.setLabel("Approve")
															.setStyle(3),
														new ButtonBuilder()
															.setCustomId("reject_"+row_.id+"^"+interaction.user.id)
															.setLabel("reject")
															.setStyle(4)
													)
											]
										})
									})

								}
							})
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
				})
				break;
			case "edit_notes":
				interaction.db.all("select f.id, f.name, f.distortion from forms as f join players p on f.player_id = p.id where p.discord_id=? limit 20;",interaction.user.id,async (err,rows)=>{
					if(err)console.log(err)
					if(!rows)return interaction.reply({
						content:'I cant find your forms. :c\n I think u forget create it! So u can do it with command `/form create`!!!\nSee you later <З',
						ephemeral: true
					});
					if(rows.length>1){
						const ActionRow = new ActionRowBuilder()
						let selectMenu = new StringSelectMenuBuilder()
								.setMaxValues(1)
								.setPlaceholder("Select your form to edit notes!")
								.setCustomId("customID");
						rows.map((item,i)=>{
							if(i >= 20) {
								return ActionRow.addComponents(
									new ButtonBuilder()
										.setLabel("Next list")
										.setCustomId("next20")
										.setStyle(2)
								);
							}
							selectMenu.addOptions(
								new StringSelectMenuOptionBuilder()
									.setLabel(item.name)
									.setValue(item.id.toString())
							)
						})

						const interReply = await interaction.reply({
							components: [
								ActionRow.addComponents(selectMenu)
							],
							ephemeral:true
						})
						const interCollector = interReply.createMessageComponentCollector({
							componentType: ComponentType.SelectMenu||ComponentType.Button,
							max:1,
							time: 1_800_000
						})
						interCollector.on("collect", async inter=>{
							if(inter.isStringSelectMenu()){
								editFewNotes(inter,interaction)
							}else if(inter.isButton()){
								changePage_edit(inter,interaction,parseInt(inter.customId.replace("next","")))
							}
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
						const actionRow = new ActionRowBuilder(),
							selectMenu = new StringSelectMenuBuilder()
								.setMaxValues(1)
								.setPlaceholder("Select your form to edit notes!")
								.setCustomId("customID");

						rows.map((item,i)=>{
							if(i>=20)
								return actionRow
									.addComponents(
										new ButtonBuilder()
											.setStyle(2)
											.setLabel("Next")
											.setCustomId("next20")
									)
							selectMenu.addOptions(
								new StringSelectMenuOptionBuilder()
									.setLabel(item.name)
									.setValue(item.id.toString())
							)
						})
						const interReply = await interaction.reply({
							components: [
								actionRow.addComponents(selectMenu)
							],
							ephemeral:true
						}),
							collector= interReply.createMessageComponentCollector({
							componentType: ComponentType.SelectMenu||ComponentType.Button,
							max:1,
							time: 1_800_000
						})
							collector.on("collect",inter=>{
							if(inter.isButton()){
								changePage(inter,interaction,parseInt(inter.customId.replace("next","")))
							}else if(inter.isStringSelectMenu()){
								interaction.db.get("select notes,name from forms where id=?;", inter.values[0], (err_, row) => {
									if (err_) return console.log(err_);
									interaction.editReply({
										embeds: [
											new EmbedBuilder()
												.setTitle(row.name + "'s note")
												.setColor(interaction.member.displayColor)
												.addFields({
													name: "Note:",
													value: row.notes
												})
										],
										components: [],
										ephemeral: true
									})
								})
							}
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
											value:row.notes
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