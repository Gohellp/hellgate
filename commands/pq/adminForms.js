const { SlashCommandBuilder, SlashCommandSubcommandBuilder, SlashCommandUserOption, SlashCommandStringOption, SlashCommandIntegerOption, SlashCommandAttachmentOption, EmbedBuilder } = require('discord.js')

module.exports = {
	data: new SlashCommandBuilder()
		.setName("admin")
		.setDescription("Admins things")
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName("set")
				.setDescription("Set some thing in user's form")
				.addStringOption(
					new SlashCommandStringOption()
						.setName("field")
						.setDescription("Field to edit or sql req")
						.addChoices(
							{
								name:"status",
								value:"status"
							},{
								name:"area",
								value:"area"
							},{
								name:"look_art",
								value:"look_art"
							},{
								name:"access level",
								value:"access_lvl"
							},{
								name:"admin notes",
								value:"my_notes"
							},{
								name:"sql_req",
								value:"sql"
							}
						)
						.setRequired(true)
				)
				.addUserOption(
					new SlashCommandUserOption()
						.setName("target")
						.setDescription("Target for changes")
				)
				.addIntegerOption(
					new SlashCommandIntegerOption()
						.setName("status")
						.setDescription("Велл, сам поймёшь")
						.setChoices({
							name:"Deactivated",
							value:0
						},{
							name:"Alive",
							value:1
						},{
							name:"NPC",
							value:2
						})
				)
				.addStringOption(
					new SlashCommandStringOption()
						.setName("some")
						.setDescription("Option for area, notes or sql request")
				)
				.addIntegerOption(
					new SlashCommandIntegerOption()
						.setName("access_lvl")
						.setDescription("Велл, сам поймёшь")
						.setChoices({
							name:"Prisoner",
							value:0
						},{
							name:"Low rank scientist",
							value:1
						},{
							name:"Area's scientist",
							value:2
						},{
							name:"Area manager",
							value:3
						},{
							name:"Technician",
							value:4
						},{
							name:"High rank technician",
							value:5
						},{
							name:"Deactivator",
							value:6
						},{
							name:"Administrator",
							value:7
						},{
							name:"God",
							value:8
						})
				)
				.addAttachmentOption(
					new SlashCommandAttachmentOption()
						.setName("art")
						.setDescription("New art for the form")
				)
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName("create_form")
				.setDescription("Создание формы с заполнением всехнеобходимых полей")
				.addStringOption(
					new SlashCommandStringOption()
						.setName("name")
						.setDescription("Character's name")
						.setMaxLength(40)
						.setRequired(true)
				)
				.addIntegerOption(
					new SlashCommandIntegerOption()
						.setName("status")
						.setDescription("Велл, сам поймёшь")
						.setChoices({
							name:"Deactivated",
							value:0
						},{
							name:"Alive",
							value:1
						},{
							name:"NPC",
							value:2
						})
						.setRequired(true)
				)
				.addStringOption(
					new SlashCommandStringOption()
						.setName("appearance")
						.setDescription("Character appearance")
						.setRequired(true)
				)
				.addIntegerOption(
					new SlashCommandIntegerOption()
						.setName("type")
						.setDescription("Велл, сам поймёшь")
						.setChoices({
							name:"Prisoner",
							value:0
						},{
							name:"Area's scientist",
							value:1
						},{
							name:"Area manager",
							value:2
						},{
							name:"Technician",
							value:3
						},{
							name:"Deactivator",
							value:4
						},{
							name:"Administrator",
							value:5
						})
						.setRequired(true)
				)
				.addIntegerOption(
					new SlashCommandIntegerOption()
						.setName("access")
						.setDescription("Велл, сам поймёшь")
						.setChoices({
							name:"Prisoner",
							value:0
						},{
							name:"Low rank scientist",
							value:1
						},{
							name:"Area's scientist",
							value:2
						},{
							name:"Area manager",
							value:3
						},{
							name:"Technician",
							value:4
						},{
							name:"High rank technician",
							value:5
						},{
							name:"Deactivator",
							value:6
						},{
							name:"Administrator",
							value:7
						},{
							name:"God",
							value:8
						})
						.setRequired(true)
				)
				.addStringOption(
					new SlashCommandStringOption()
						.setName("distortion")
						.setDescription("Character Distortion (ability|quirk)")
						.setRequired(false)
				)
				.addStringOption(
					new SlashCommandStringOption()
						.setName("area")
						.setDescription("Корпус проживания персонажа")
						.setRequired(false)
				)
				.addAttachmentOption(
					new SlashCommandAttachmentOption()
						.setName("appearance_art")
						.setDescription("Character appearance art")
						.setRequired(false)
				)
				.addUserOption(
					new SlashCommandUserOption()
						.setName("target")
						.setDescription("Target for command")
						.setRequired(false)
				)
		)
		.addSubcommand(
			new SlashCommandSubcommandBuilder()
				.setName("get_form")
				.setDescription("Get user's form")
				.addUserOption(
					new SlashCommandUserOption()
						.setName("target")
						.setDescription("Target")
				)
		),
	async execute(interaction) {
		switch(interaction.options.getSubcommand()){
			case "set":
				switch (interaction.options.get("field").value) {
					case "status":
						if(!interaction.options.get("target")||!interaction.options.get("status")?.value)return interaction.reply({
							embeds:[
								new EmbedBuilder()
									.setTitle("ERROR")
									.setColor("#FF0000")
									.addFields({
										name:"Message:",
										value:"You forget set the target or status"
									})
							],
							ephemeral:true
						})

						break;
					case "sql":
						if(interaction.options.get("sql").value)return interaction.reply({
							embeds:[
								new EmbedBuilder()
									.setTitle("ERROR")
									.setColor("#FF0000")
									.addFields({
										name:"Message:",
										value:"No SQL request was provided"
									})
							],
							ephemeral:true
						})
						interaction.db.run(interaction.options.get("sql_req")?.value, err=>{
							if(err){
								interaction.reply({
									embeds:[
										new EmbedBuilder()
											.setTitle("ERROR")
											.setColor("#FF0000")
											.addFields({
												name:"Message:",
												value:err
											})
									],
									ephemeral:true
								})
							}else{
								interaction.reply({
									embeds:[
										new EmbedBuilder()
											.setTitle("INFO")
											.setColor("#00ffff")
											.addFields({
												name:"Message",
												value:"SQL req succesful executed!"
											})
									],
									ephemeral:true
								})
							}
						})
						break
					default:
						interaction.reply({
							embeds:[
								new EmbedBuilder()
									.setTitle("ERROR")
									.setColor("#ff0000")
									.addFields({
										name:"Message",
										value:"I forget this option \":D"
									})
							]
						})
				}

				
				break;
			case "create_form":
				const target = interaction.options.get("target")?interaction.options.get("target"):interaction.user

				interaction.db.get("SELECT IIF(exists(select * from players where discord_id = $d_id), IIF(COUNT(f.id)>=p.max_forms  AND f.status like 1, true, false), -1) AS status, p.id FROM players as p left join forms as f on p.id = f.player_id where discord_id = $d_id;", {$d_id:target.id}, (err, row) => {
					if(err)return console.log(err);

					switch (row.status) {
						case -1:
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
						case 0:
							const params={
								$p_id:   row.id,
								$name:   interaction.options.getString("name"),
								$type:   interaction.options.getInteger("type"),
								$area:   interaction.options.getString("area"),
								$status: interaction.options.getInteger("status"),
								$access: interaction.options.getInteger("access"),
								$dist:   interaction.options.getString("distortion"),
								$look:   interaction.options.getString("appearance"),
								$art:    interaction.options.getAttachment("appearance_art")?.url
							}
							interaction.db.run("insert into forms(player_id,name,type,area,status,access_lvl,distortion,look,look_art) values($p_id,$name,$type,$area,$status,$access,$dist,$look,$art);",params,err1 =>{
								if(err1)return console.log(err1)
								interaction.reply({
									embeds:[
										new EmbedBuilder()
											.setTitle("INFO")
											.setColor("#00ffff")
											.addFields({
												name:"Message",
												value:"Successful!"
											})
									],
									ephemeral:true
								})
							})
							break;
						case 1:
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
}