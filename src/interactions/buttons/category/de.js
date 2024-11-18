const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ThreadAutoArchiveDuration, ComponentType, ChannelType, ChannelFlags, PermissionFlagsBits } = require('discord.js');
const {ref_id,ingame_id,registration_id,other_id,transcription_id,change_id} = require("../../../config.json")
const fs = require("fs")
module.exports = {
	id: "de",

	async execute(interaction) {
		try {
		const {client} = interaction;
		// buttons here
		
		const registration = new ButtonBuilder()
			.setCustomId('registration')
			.setLabel('Anmeldung')
			.setStyle(ButtonStyle.Primary);

		const ingame = new ButtonBuilder()
			.setCustomId('ingame')
			.setLabel('Im Spiel')
			.setStyle(ButtonStyle.Primary);

		const change = new ButtonBuilder()
			.setCustomId('change')
			.setLabel('Nickname ändern')
			.setStyle(ButtonStyle.Primary);

		const ref = new ButtonBuilder()
			.setCustomId('ref')
			.setLabel('ref<Nummer>')
			.setStyle(ButtonStyle.Primary);

		const other = new ButtonBuilder()
			.setCustomId('other')
			.setLabel('Andere')
			.setStyle(ButtonStyle.Primary);

		const close = new ButtonBuilder()
			.setCustomId('close')
			.setLabel('Close')
			.setStyle(ButtonStyle.Danger);


		const move = new ButtonBuilder()
		.setCustomId('move')
		.setLabel('move to another category')
		.setStyle(ButtonStyle.Primary);
		
		const ticketType = new ActionRowBuilder()
			.addComponents(registration,ingame,ref,other,change);
		
		const ticketManagment = new ActionRowBuilder()
		.addComponents(close,move);
		const message = await interaction.reply({ephemeral: true, content: "Wählen Sie eine Anfragekategorie", components: [ticketType],fetchReply: true})

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
		

		collector.on('collect', async(i) => {
			const threadCreate = async (channelId, prefix) => {
				const channel = await interaction.guild.channels.fetch(channelId);
				channel.permissionOverwrites.create(interaction.member, {
					'ViewChannel': true
				});

				const thread = await channel.threads.create({
					name: `de-${prefix}-${interaction.member.displayName}`,
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

				if (prefix=="reg") {
					const timeout = setTimeout(async () => {
						
                        const messages = await thread.messages.fetch({ limit: 1 });
                        const lastMessage = messages.first();

                        if (!lastMessage || lastMessage.author.bot || !lastMessage.member.permissions.has('ManageThreads')) {
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
                    }, 4 * 60 * 60 * 1000); // 4hours

                    const threadCollector = thread.createMessageCollector({
                        time: 4 * 60 * 60 * 1000
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
			switch (i.customId) {
				case 'registration':
					await threadCreate(registration_id, 'reg');
					break;
				case 'ingame':
					await threadCreate(ingame_id, 'game');
					break;
				case 'ref':
					await threadCreate(ref_id, 'ref');
					break;
				case 'other':
					await threadCreate(other_id, 'other');
					break;
				case 'change':
				await threadCreate(change_id, 'nick');
					break;
			}
			
		})
		collector.on('end', collected => {
            if (collected.size === 0) {
                interaction.editReply({ content: "Die Zeit ist um. Sie haben keine Kategorien ausgewählt.", ephemeral: true, components: [] });
            }
        });
		}
		
		catch{
			
		}
	}
};