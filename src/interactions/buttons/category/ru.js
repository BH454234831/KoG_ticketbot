const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ThreadAutoArchiveDuration, ComponentType, ChannelType, ChannelFlags, PermissionFlagsBits } = require('discord.js');
const {ref_id,ingame_id,registration_id,other_id,transcription_id,change_id} = require("../../../config.json")
const fs = require("fs")
module.exports = {
	id: "ru",

	async execute(interaction) {
		try {
		const {client} = interaction;
		// buttons here
		await interaction.deferReply({ephemeral:true})
		
		let ticketTypes = []
		let categorylist = fs.readFileSync('categoires.json')
        let categories = JSON.parse(categorylist)
		
		for (let category in categories)
		{
			
			if (categories[category].isCreatable) {
				const categorybutton = new ButtonBuilder()
				.setCustomId(categories[category].channel)
				.setLabel(categories[category].localisation[0])
				.setStyle(ButtonStyle.Primary);
				ticketTypes.push(categorybutton)
			}
		}
		let rows = []
		for (let i=0; i<ticketTypes.length;i++) {
			if (i%5==0 || i == 0) {
				const ticketType = new ActionRowBuilder()
				rows.push(ticketType.addComponents(ticketTypes[i]))
			}
			else {
				rows[rows.length-1].addComponents(ticketTypes[i])
			}
		}
		
		const message = await interaction.editReply({ephemeral: true, content: "Выберите категорию обращения", components: rows, fetchReply: true})
		
        const collector = message.createMessageComponentCollector({
            componentType: ComponentType.Button,
            time: 15000 // 15 seconds
        });

		const embed = {
			"title": "Ticket created",
			"description": `Created by: <@${interaction.member.id}>`,
			"color": 655104,
			"fields": [],
			"timestamp": new Date
		  }
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

		collector.on('collect', async(i) => {
			const threadCreate = async (channelId, deletion) => {
				const channel = await interaction.guild.channels.fetch(channelId);
				channel.permissionOverwrites.create(interaction.member, {
					'ViewChannel': true
				});

				const thread = await channel.threads.create({
					name: `ru-${interaction.member.displayName}`,
					autoArchiveDuration: ThreadAutoArchiveDuration.OneDay,
					type: ChannelType.PrivateThread,
					invitable: false,
				});
				
				await thread.members.add(interaction.member.id);
				await thread.send({ embeds: [embed], components: [ticketManagment] });

				interaction.editReply({
					ephemeral: true,
					content: `<#${thread.id}>`,
					components: []
				});

				client.threads.set(thread.id, { createdBy: interaction.member.id });
				console.log(deletion)
				if (deletion!=0) {
					const timeout = setTimeout(async () => {
						
                        const messages = await thread.messages.fetch({ limit: 1 });
                        const lastMessage = messages.first();

                        if (!lastMessage || lastMessage.author.bot || !lastMessage.member.permissions.has('ManageThreads')) {
							console.log("on deletion")
							let messages = await thread.messages.fetch();
							let contentMessages = messages.filter(msg => msg.content && msg.content.trim() !== "");
								let allMessages = [];
								for (const i of contentMessages.values()) {
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
								   let messages = await thread.messages.fetch();
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
									"value": thread.name,
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
							console.log("deleted")
                            await thread.delete();
                        }
                    }, deletion * 60 * 1000); 

                    const threadCollector = thread.createMessageCollector({
                        time: deletion * 60 * 1000
                    });

                    threadCollector.on('collect', (msg) => {
                        if (msg.member.permissions.has('ManageThreads') && !msg.author.bot) {
							console.log("stopped")
                            clearTimeout(timeout);
                            threadCollector.stop();
                        }
                    });
				}
			}
			category = categories.filter(function(categoires){return categoires.channel==i.customId})
			threadCreate(i.customId,category[0].autoDelete)
			
		})
		collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: "Время истекло. Вы не выбрали ни одной категории.", ephemeral: true, components: [] });
            }
        });
		}
		
		catch (e){
			console.log(e)
		}
	}
};