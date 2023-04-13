'use strict';
const { EmbedBuilder } = require("@discordjs/builders")

module.exports = {
	async Connected(voice_old, voice_new, nith){
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
                }).then(voice=>{
				  nith.db.run("update voices set owner_id=? where voice_id=?;",[new_owner.id,voice.channelId])
				})
		    }else{
		        try{
			     	voice_old.channel.delete()
				    	.then(() => {
				    		nith.db.run("delete from voices where owner_id=?;",[voice_old.id])
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
				    					value:err.message
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
            nith.db.run(`insert into voices(owner_id, voice_id) values (${voice_new.id},${voice.id});`, err=>{
		    	if(err)nith.logs_channel.send({
		    	    embeds:[
		               new EmbedBuilder()
						  .setTitle("ERROR")
						  .setColor("#FF0000")
						  .addFields(
						  	[{
								name:"Error in Disconnection\/connection",
								value:"I can't update db."
							},
								{
									name:"Error message",
									value:err?err.message:"Idk"
								}])
				   ]
			  })
		    })
        })
	},
	async Disconnected (voice_old, voice_new, nith){
		nith.db.get('select * from voices where voice_id =?;', [voice_old.channelId], (err,row)=>{
		    if(err||!row){
		    	console.log(err?err:`[${moment().format('HH:mm:ss')}]\n\tmsg: I can't get the own_id from db`)
		        return nith.logs_channel.send({
				    embeds:[
				        new EmbedBuilder()
						    .setTitle("ERROR")
						    .setColor("#FF0000")
						    .addFields(
						        [{
								    name:"Error in Disconnection\/connection",
								    value:"I can't get the own_id from db"
						        },
      							{
	     							name:"Error message",
		    						value:err?err.message:"Row was not received"
			     				}])
				    ]
    			})
    		}
    		if(row.owner_id===voice_old.id){
    			if(!voice_old.channel.members.size){
    				try{
    					voice_old.channel.delete()
    						.then(()=>{
    							nith.db.run("delete from voices where owner_id=?;",[voice_old.id])
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
    										value:err.message
    									})
    						]
    					})
    				}
    			}else{
    				let next_voice_owner = voice_old.channel.members.toJSON()[Math.floor(Math.random() * (voice_old.channel.members.size - 1))]
    				nith.db.run("update voices set owner_id=? where voice_id=?;", [next_voice_owner.id, voice_old.channelId],(err)=>{
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
}
