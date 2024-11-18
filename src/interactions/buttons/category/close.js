const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ThreadAutoArchiveDuration, ComponentType, ChannelType } = require('discord.js');
const {transcription_id} = require("../../../config.json")
const fs = require("fs")
module.exports = {
	id: "close",

	async execute(interaction) {
        try {
            
            const targetChannel = interaction.guild.channels.cache.get(transcription_id);
            const {client} = interaction;
            const threadinfo = client.threads.get(interaction.channel.id)
            const channel = await interaction.guild.channels.fetch(interaction.channel.parentId);
            if (channel.permissionsFor(interaction.member).has('ManageThreads')) {
            
            let member = "";
            try {
            member = await interaction.guild.members.fetch(threadinfo.createdBy)
            channel.permissionOverwrites.create(member, {
                'ViewChannel': false
            })
            }
            catch(e)
            {
               let messages = await interaction.channel.messages.fetch();
               let embedMessage;
               
               messages.some(msg => {

                    if (msg.embeds.length > 0) {

                        msg.embeds.forEach(embed => {

                            if (embed.title == "Ticket created") {
                                const userIdMatch = embed.description.match(/<@(\d+)>/);
                                if (userIdMatch) {
                                    member = {id: userIdMatch[1]};
                                    embedMessage = msg; 
                                }
                            }
                        });
                    }
                });
            }
            let messages = await interaction.channel.messages.fetch();
            let contentMessages = messages.filter(msg => msg.content && msg.content.trim() !== "");
                let allMessages = [];
                for (const msg of contentMessages.values()) {
                }
                contentMessages.reverse().forEach(msg => {
                    allMessages.push([msg.author.tag+`(${msg.author.id}): `+ msg.content]);
                });

            const filePath = './channel-messages.txt';
            if (allMessages.length == 0) {
                allMessages.push(["0 Messages in this ticket"]);
            }
            fs.writeFileSync(filePath, allMessages.join('\n'));

            if (!targetChannel || targetChannel.type !== ChannelType.GuildText) {
                return interaction.reply({ content: "Cant find channel", ephemeral: true });
            }

            const embed = 
                {
                  "title": "Ticket closed",
                  "color": 16711680,
                  "fields": [
                    {
                      "name": "Category",
                      "value": interaction.channel.parent.name,
                    },
                    {
                      "name": "Deleted by",
                      "value": `<@${interaction.member.id}>`,
                      "inline": false
                    },
                    {
                      "name": "Created by",
                      "value": `<@${member.id}>`,
                      "inline": false
                    }
                  ],
                  "timestamp": new Date
                }
            
            await targetChannel.send({
                embeds: [embed],
                files: [filePath]
            });

            await interaction.channel.delete();
            console.log(client.threadinfo)
			
            }
            else {
                interaction.reply({ephemeral:true, content:"You cant do this"})
            } 
            
        }
        catch (error) {
            console.error(error);
        }
    }
};  