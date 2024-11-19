const fs = require("fs")
const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder() 
		.setName("add_category")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription(
			"add category of tickets"
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
        await interaction.deferReply({ephemeral:true})
        let categorylist = fs.readFileSync('categoires.json')
        let categories = JSON.parse(categorylist)
        const channel = await interaction.options.getChannel("channel")
        const localisation = interaction.options.getString("localisation")
        const autodelete = interaction.options.getInteger("autodeletion") ?? 0
        const isCreatable = interaction.options.getInteger("notcreatable") ?? true

        const languages = ["ru", "fr", "de", "tr"]
        let translated = []
        for (let lang in languages) {
            const response = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${languages[lang]}&dt=t&q=${encodeURIComponent(localisation)}`);
            const translatedData = await response.json();
            translated.push(translatedData[0][0][0])
        }
        channel.permissionOverwrites.create(channel.guild.roles.everyone.id, {
            'ViewChannel': false,
            'ManageThreads': false
        })
        const newCategory = {"channel": channel.id, "localisation": [translated[0], localisation, translated[1], translated[2], translated[3]], "autoDelete": autodelete, "isCreatable": isCreatable} // next localisation use is [0] - ru, [1] - en, [2] - fr ...
        var count = Object.keys(categories).length;
        category = categories.filter(function(categoires){return categoires.channel==channel.id})
        if (category[0]) {
            await interaction.editReply({ephemeral: true, content: `This channel already used`})
            return
        }
        categories[count] = newCategory
        fs.writeFileSync('categoires.json', JSON.stringify(categories));
        await interaction.editReply({ephemeral: true, content: `Category added succesfuly, u can change localisation in categories.json file any time ru:${translated[0]} en: ${localisation} fr: ${translated[1]} de: ${translated[2]} tur: ${translated[3]}`})
    }
}
