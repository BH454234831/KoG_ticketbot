/**
 * @file Sample modal interaction
 * @autor Naman Vrati
 * @since 3.2.0
 * @version 3.2.2
 */

const { EmbedBuilder, ButtonBuilder, ButtonStyle, ActionRowBuilder } = require('discord.js');
/**
 * @type {import('../../../typings').ModalInteractionCommand}
 */
module.exports = {
	id: "sethello",

	async execute(interaction) {
		interaction.reply({ephemeral:true,content:"Hello message setuped"})
	}
}
