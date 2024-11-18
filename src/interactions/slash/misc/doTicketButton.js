const { ButtonStyle } = require('discord.js');
const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder } = require("@discordjs/builders");
module.exports = {
	data: new SlashCommandBuilder() 
		.setName("doticketbutton")
		.setDescription(
			"Do system ticket button"
		),

		
	async execute(interaction) {
		try {
		const en = new ButtonBuilder()
		.setCustomId('en')
		.setLabel('English')
		.setStyle(ButtonStyle.Primary)
		.setEmoji({name: "🇬🇧"});
		const ru = new ButtonBuilder()
		.setCustomId('ru')
		.setLabel('Русский')
		.setStyle(ButtonStyle.Primary)
		.setEmoji({name: '🇷🇺'});
		const fr = new ButtonBuilder()
		.setCustomId('fr')
		.setLabel('Français')
		.setStyle(ButtonStyle.Primary)
		.setEmoji({name: "🇫🇷"});
		const de = new ButtonBuilder()
		.setCustomId('de')
		.setLabel('Deutsch')
		.setStyle(ButtonStyle.Primary)
		.setEmoji({name: "🇩🇪"});
		const tur = new ButtonBuilder()
		.setCustomId('tur')
		.setLabel('Türkçe')
		.setStyle(ButtonStyle.Primary)
		.setEmoji({name: "🇹🇷"});
		const lagnuagesButtons = new ActionRowBuilder()
		.addComponents(en,ru,fr,de,tur);

		await interaction.channel.send({
			content: "**Pick a language for ticket creation.**",
			components: [lagnuagesButtons],});
		await interaction.reply({ephemeral: true, content: "button sent succesfuly"})
		}
		catch(e) {
			await interaction.reply({ephemeral: true, content: "something went wrong"})
			console.error(e)
		}
	},
}