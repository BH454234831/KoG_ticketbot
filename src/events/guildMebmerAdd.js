const { GuildMember } = require("discord.js");

module.exports = {
	name: "guildMemberAdd",
	async execute(member){
		if (member.guild.id == "1146091455241269348") {
		const playerRole = await member.guild.roles.cache.find(role => role.name === "Player");
		if (playerRole) { member.roles.add(playerRole) }
		}
	}
};