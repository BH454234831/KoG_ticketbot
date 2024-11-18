const { ActionRowBuilder, ButtonBuilder, ButtonStyle, ThreadAutoArchiveDuration, ComponentType, ChannelType, ChannelFlags, PermissionFlagsBits } = require('discord.js');
const {ref_id,ingame_id,registration_id,other_id} = require("../../../config.json");
const { execute } = require('../../buttons/category/ru');
module.exports = {
	id: "select-category",
    async execute(interaction) {
        interaction.reply({ephemeral: true, content: "In process ..."})
    }
}