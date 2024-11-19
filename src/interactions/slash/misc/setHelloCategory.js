const fs = require("fs")
const { SlashCommandBuilder, PermissionFlagsBits, StringSelectMenuBuilder, ActionRowBuilder,
     ComponentType, ModalBuilder, TextInputBuilder, TextInputStyle } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder() 
		.setName("sethellocategory")
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
		.setDescription(
			"delete category"
		),
        

		
	async execute(interaction) {
        await interaction.deferReply({ephemeral:true})

        let channelList = []
        let categorylist = fs.readFileSync('categoires.json')
        let categories = JSON.parse(categorylist)
        
        for (let category in categories)
        {
            const channel = await interaction.guild.channels.cache.find(c => c.id == categories[category].channel)
            if (!channel)
            {
                categories[category].localisation[1] = categories[category].localisation[1]+" !DONT EXISTS!"
            }
            channelList.push(categories[category])
            console.log(categories[category].localisation[1])
        }
        
        const selectMenu = new StringSelectMenuBuilder()
            .setCustomId('select-category-delete')
            .setPlaceholder('Choose a category to move the thread to')
            .addOptions(
                channelList.map(category => ({
                    label: category.localisation[1],
                    value: category.channel
                }))
            );
        
        const row = new ActionRowBuilder().addComponents(selectMenu);
        await interaction.editReply({ content: "Select a category to move the thread:", components: [row], ephemeral: true });

        
        const filter = i => i.customId === 'select-category-delete' && i.user.id === interaction.user.id;
        const collector = interaction.channel.createMessageComponentCollector({ filter, componentType: ComponentType.StringSelect, time: 60000 });

        collector.on('collect', async i => {
            const selectedCategoryId = i.values;
            
            for (let category in categories)
                {
                    if (categories[category].channel == selectedCategoryId) {
                        const modal = new ModalBuilder()
                        .setCustomId("sethello")
                        .setTitle('hello message')
                        const helloText = new TextInputBuilder()
                        .setCustomId('helloText')
                        .setLabel("Text")
                        .setPlaceholder(`write !verify to start registration ...`)
                        .setStyle(TextInputStyle.Paragraph)
                        .setRequired(true)
                        const helloRow = new ActionRowBuilder().addComponents(helloText);
                        modal.addComponents(helloRow);
                        await i.showModal(modal);
                        const getText = await i.awaitModalSubmit({ time: 60000, filter: i => i.user.id === interaction.user.id})
                        const enHello = await getText.fields.getTextInputValue('helloText')
                        
                        const languages = ["ru", "en" , "fr", "de", "tr"]
                        let translated = []
                        for (let lang in languages) {
                            translated.push(enHello)
                        }
                        categories[category].hellomessage = translated
                        fs.writeFileSync('categoires.json', JSON.stringify(categories));
                        interaction.deleteReply()
                    }
                    
                }
        })
        
        
    }
}
