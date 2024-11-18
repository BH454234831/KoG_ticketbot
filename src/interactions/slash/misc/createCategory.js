const fs = require("fs")
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const { runInThisContext } = require("vm");

module.exports = {
	data: new SlashCommandBuilder() 
		.setName("add_category")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription(
			"Do system ticket button"
		)
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('threads will be created in this channel')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('localisation')
                .setDescription('type button name in english it automaticly translate to other languages')
                .setRequired(true))       
        .addIntegerOption(option =>
            option.setName('autodeletion')
                .setDescription('time in minutes if no moderation answers it will automaticly delete')
                .setRequired(false))
        .addBooleanOption(option =>
            option.setName('notcreatable')
                .setDescription('can user create it from button?')
                .setRequired(false)),
        

		
	async execute(interaction) {
        let categorylist = fs.readFileSync('categoires.json')
        let categories = JSON.parse(categorylist)
        const channel = await interaction.options.getChannel("channel")
        const localisation = interaction.options.getString("localisation")
        const autodelete = interaction.options.getInteger("autodeletion") ?? 0
        const isCreatable = interaction.options.getInteger("notcreatable") ?? true
        const newCategory = {"channel": channel.id, "localisation": ["ru", localisation, "fr", "de", "tur"], "autoDelete": autodelete, "isCreatable": isCreatable} // next localisation use is [0] - ru, [1] - en, [2] - fr ...
        var count = Object.keys(categories).length;
        categories[count] = newCategory
        let data = categories
        console.log(data)
        fs.writeFileSync('categoires.json', JSON.stringify(data));
        await interaction.reply({ephemeral: true, content: `Category added succesfuly, u can change localisation in categories.json file any time ru: en: fr: de: tur:`})
    }
}
