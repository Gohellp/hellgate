const { SlashCommandBuilder, SlashCommandUserOption, SlashCommandIntegerOption, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('register')
        .setDescription('Sign Up to P.Q.')
        .addUserOption(
            new SlashCommandUserOption()
                .setName("target")
                .setDescription("Target for register.\nOnly Administrator allow to use.")
                .setRequired(false)
        )
        .addIntegerOption(
            new SlashCommandIntegerOption()
                .setName("type")
                .setDescription("Player type.\nRemember: Admins know ALL what u do.")
                .setChoices({
                    name:"Player",
                    value:0
                },{
                    name:"Observer",
                    value:1
                },{
                    name:"Administrator",
                    value:2
                },{
                    name:"God",
                    value:3
                })
                .setRequired(false)
        ),
    async execute(interaction) {
        const target = interaction.options.get("target")?interaction.options.get("target"):interaction.user

        if(interaction.options.get("type")){
            interaction.db.get("select iif(exists(select 1 from players where discord_id=$t),2,iif(exists(select 1 from players where discord_id=$a),iif((select type from players where discord_id=$a)>1,1,0),-1)) as status;",{$t:target.id, $a:interaction.user.id},(err, row)=>{
                if(err)return console.log(err);
                switch (row.status) {
                    case -1:
                        return interaction.reply({
                            embeds:[
                                new EmbedBuilder()
                                    .setAuthor({name: interaction.client.user.username,iconURL:interaction.client.user.avatarURL()})
                                    .setTitle("ERROR")
                                    .setColor("#ff0000")
                                    .setDescription("UNAUTHORIZED ACCESS")
                                    .addFields([
                                        {
                                            name:"WARNING",
                                            value:"YOU HAVE NO ACCESS TO USE THIS FEATURE!"
                                        }
                                    ])
                            ]
                        })
                    case 0:
                        return interaction.reply({//TODO: Send this to bots_chat|pq_discuss
                            embeds:[
                                new EmbedBuilder()
                                    .setAuthor({name: interaction.client.user.username,iconURL:interaction.client.user.avatarURL()})
                                    .setTitle("ERROR")
                                    .setColor("#ff0000")
                                    .setDescription("Profile doesn't exist")
                                    .addFields([
                                        {
                                            name:"Existence error",
                                            value:"You must have profile to use target sign-up"
                                        }
                                    ])
                            ],
                            ephemeral:true
                        })
                    case 1:
                        interaction.db.run("insert into players(discord_id, type) values(?,?)", [target.value,interaction.options.get("type").value])
                        interaction.reply({
                            embeds:[
                                new EmbedBuilder()
                                    .setAuthor({name: interaction.client.user.username,iconURL:interaction.client.user.avatarURL()})
                                    .setTitle("Success")
                                    .setColor("#00ff00")
                                    .setDescription(`${target.user.username}'s profile was been created`)
                            ],
                            ephemeral:true
                        })
                    break;
                    case 2:
                        return interaction.reply({
                            embeds:[
                                new EmbedBuilder()
                                    .setAuthor({name: interaction.client.user.username,iconURL:interaction.client.user.avatarURL()})
                                    .setTitle("ERROR")
                                    .setColor("#ff0000")
                                    .setDescription("Target's profile already exist")
                                    .addFields([
                                        {
                                            name:"Existence error",
                                            value:"Profile already exist"
                                        }
                                    ])
                            ],
                            ephemeral:true
                        })
                }
            })
        }else{
            interaction.db.get("select exists(select players.id from players where discord_id=?) as status;", target.id, (err,row)=>{
                if(err)return console.log(err)
                if(!row.status){
                    interaction.db.run("insert into players(discord_id) values(?)",target.id)
                    interaction.reply({
                        embeds:[
                            new EmbedBuilder()
                                .setAuthor({name: interaction.client.user.username,iconURL:interaction.client.user.avatarURL()})
                                .setTitle("Success")
                                .setColor("#00ff00")
                                .setDescription("Your profile was been created")
                        ],
                        ephemeral:true
                    })

                }else{
                    return interaction.reply({
                        embeds:[
                            new EmbedBuilder()
                                .setAuthor({name: interaction.client.user.username,iconURL:interaction.client.user.avatarURL()})
                                .setTitle("ERROR")
                                .setColor("#ff0000")
                                .setDescription("Target's profile already exist")
                                .addFields([
                                    {
                                        name:"Existence error",
                                        value:"Profile already exist"
                                    }
                                ])
                        ],
                        ephemeral:true
                    })
                }
            })
        }
    },
};