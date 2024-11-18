module.exports = {
	name: "ready",
	once: true,

	execute(client) {
		console.log(`Ticket works | ${client.user.tag}`);
	},
};
