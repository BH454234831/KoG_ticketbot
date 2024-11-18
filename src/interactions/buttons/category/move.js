const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ThreadAutoArchiveDuration, ComponentType, ChannelType, StringSelectMenuBuilder, WebhookClient } = require('discord.js');
const {registration_id,ingame_id,ref_id,other_id,transcription_id, change_id, admin_id} = require("../../../config.json")
const fs = require("fs")
module.exports = {
	id: "move",

	async execute(interaction) {
        try {
            const { client } = interaction;
            const threadinfo = client.threads.get(interaction.channel.id);
            const channel = await interaction.guild.channels.fetch(interaction.channel.parentId);

            const close = new ButtonBuilder()
			.setCustomId('close')
			.setLabel('Close')
			.setStyle(ButtonStyle.Danger);

            const move = new ButtonBuilder()
            .setCustomId('move')
            .setLabel('move to another category')
            .setStyle(ButtonStyle.Primary);
            const ticketManagment = new ActionRowBuilder()
		    .addComponents(close,move);

            if (!channel.permissionsFor(interaction.member).has('ManageThreads')) {
                return interaction.reply({ ephemeral: true, content: "You can't do this" });
            }

            await interaction.deferReply({ephemeral:true})
		
            let channelList = []
            let categorylist = fs.readFileSync('categoires.json')
            let categories = JSON.parse(categorylist)
            
            for (let category in categories)
            {
                
                const channel = await interaction.guild.channels.cache.get(categories[category].channel);
                channelList.push(channel)
            }
            
            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select-category')
                .setPlaceholder('Choose a category to move the thread to')
                .addOptions(
                    channelList.map(category => ({
                        label: category.name,
                        value: category.id
                    }))
                );

            const row = new ActionRowBuilder().addComponents(selectMenu);
            await interaction.editReply({ content: "Select a category to move the thread:", components: [row], ephemeral: true });

           
            const filter = i => i.customId === 'select-category' && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 60000 });

            collector.on('collect', async i => {
                const selectedCategoryId = i.values[0];
                const selectedCategory = interaction.guild.channels.cache.get(selectedCategoryId);

                if (!selectedCategory) {
                    return i.reply({ content: "Selected category not found", ephemeral: true });
                }

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
                       for (const msg of messages.values()) {
                        if (msg.embeds.length > 0) {
                            for (const embed of msg.embeds) {
                                if (embed.title === "Ticket created") {
                                    const userIdMatch = embed.description.match(/<@(\d+)>/);
                                    if (userIdMatch) {
                                        member = await interaction.guild.members.fetch(userIdMatch[1]);
                                        break; 
                                    }
                                }
                            }
                        }
                    
                        if (member) break; 
                    }
                    }

               
                let messages = await interaction.channel.messages.fetch();
                let contentMessages = messages.filter(msg => msg.content && msg.content.trim() !== "");
                let allMessages = [];

                contentMessages.reverse().forEach(msg => {
                    if (msg.author.bot)
                    {
                    allMessages.push([msg.author.displayName, msg.content, msg.author.avatarURL()]);
                    }
                    else {
                        allMessages.push([msg.author.id, msg.content]);
                    }
                });

                
                selectedCategory.permissionOverwrites.create(member, {
                    'ViewChannel': true
                })
                const movedthread = await selectedCategory.threads.create({
                name: `ru-${selectedCategory.name}-${member.displayName}`,
                autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
                type: ChannelType.PrivateThread,
                invitable: false,
                })
                const embed = {
                    "title": "Ticket created",
                    "description": `Created by: <@${interaction.member.id}>`,
                    "color": 655104,
                    "fields": [],
                    "timestamp": new Date
                  }
                
                const webhooks = await movedthread.parent.fetchWebhooks();
		        let webhook = webhooks.find(wh => wh.name == "MessageMove");
                if (!webhook) {
                    webhook = await movedthread.parent.createWebhook({
                        name: "MessageMove"
                    })
                }
                
                await movedthread.members.add(member.id);
                await movedthread.send({ embeds: [embed], components: [ticketManagment] });
                for (const msg of allMessages) {
                    let msgauthor = ""
                    try {
                    msgauthor = await interaction.guild.members.fetch(msg[0])} catch {}
                    if (msgauthor != "") {
                    await webhook.send({
                        username: msgauthor.displayName,
                        avatarURL: msgauthor.user.avatarURL(),
                        content: msg[1],
                        threadId: movedthread.id
                    })
                    }
                    else {
                        await webhook.send({
                            username: msg[0],
                            content: msg[1],
                            avatarURL: msg[2],
                            threadId: movedthread.id
                    })
                    }
                }
                category = categories.filter(function(categoires){return categoires.channel==selectedCategoryId})
                if (category[0].autoDelete != 0) {
                    const timeout = setTimeout(async () => {
                        const messages = await movedthread.messages.fetch({ limit: 1 });
                        const lastMessage = messages.first();

                        if (!lastMessage || lastMessage.author.bot || !lastMessage.member.permissions.has('ManageThreads')) {
							let messages = await movedthread.messages.fetch();
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

							let member = ""
							try {
								member = await interaction.guild.members.fetch(threadinfo.createdBy)
								channel.permissionOverwrites.create(member, {
									'ViewChannel': false
								})
								}
								catch(e)
								{
								   let messages = await movedthread.messages.fetch();
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

							const closeembed = 
								{
								"title": "Ticket closed",
								"color": 16711680,
								"fields": [
									{
									"name": "Ticket name",
									"value": movedthread.name,
									},
									{
									"name": "Deleted by",
									"value": `Automatic Deletion`,
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
							const targetChannel = interaction.guild.channels.cache.get(transcription_id);
							await targetChannel.send({
								embeds: [closeembed],
								files: [filePath]
							});
                            await movedthread.delete();
                        }
                    }, category[0].autoDelete * 60 * 1000);

                    const threadCollector = movedthread.createMessageCollector({
                        time: category[0].autoDelete * 60 * 1000
                    });

                    threadCollector.on('collect', (msg) => {
                        if (msg.member.permissions.has('ManageThreads') && !msg.author.bot) {
                            
                            clearTimeout(timeout);
                            threadCollector.stop();
                        }
                    });
                }
               
                try {
                    client.threads.delete(interaction.channel.id);
                } catch (e) {
                    console.error(e);
                }
                await interaction.channel.delete();
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.editReply({ content: "No category selected, timed out.", components: [] });
                }
            });
        } catch (error) {
            console.error(error);
        }
    }
};