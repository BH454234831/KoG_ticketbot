const { SlashCommandBuilder } = require("@discordjs/builders");
const fs = require("fs")
module.exports = {
	data: new SlashCommandBuilder() 
		.setName("list_categories")
		.setDescription(
			"show all existing categories"
		),

		
	async execute(interaction) {
		try {
			let channelList = []
            let categorylist = fs.readFileSync('categoires.json')
            let categories = JSON.parse(categorylist)
            let string = "Categories: channel, button name (en) - channel id:";
            for (let category in categories)
            {
                channelList.push(categories[category])
            }
			for (let i = 0;i<channelList.length;i++) {
				string += `\n${i}. <#${channelList[i].channel}> ${channelList[i].localisation[1]} - ${channelList[i].channel}`
			}
			await interaction.reply({ephemeral: true, content: string})
		}
		catch(e) {
			await interaction.reply({ephemeral: true, content: "something went wrong"})
			console.error(e)
		}
	},
}