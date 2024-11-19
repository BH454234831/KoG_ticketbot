const fs = require("fs")
const { SlashCommandBuilder, PermissionFlagsBits, StringSelectMenuBuilder, ActionRowBuilder, ComponentType } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder() 
		.setName("delete_category")
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
                    categories = categories.filter(function(category) {
                    return category.channel != selectedCategoryId
                    })
                }
            fs.writeFileSync('categoires.json', JSON.stringify(categories));
            await interaction.editReply({ephemeral: true, content: `Category deleted succesfuly`})
        })
        
        
    }
}
