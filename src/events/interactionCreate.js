//#region External module imports
const { Events: { InteractionCreate }, MessageFlags: { Ephemeral } } = require("discord.js");
//#endregion

//#region Module exports
module.exports = {
	name: InteractionCreate,
	/**
	 * Handler to execute when the client recieves an interaction.
	 * @param {import("discord.js").Interaction} interaction The interaction context created.
	 */
	async execute(interaction) {
		if (!interaction.isChatInputCommand()) return;

		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);

			return;
		}

		try { await command.execute(interaction); } catch (error) {
			console.error(error);

			if (interaction.replied || interaction.deferred) await interaction.followUp({ content: "There was an error while executing this command!", flags: Ephemeral });
			else await interaction.reply({ content: "There was an error while executing this command!", flags: Ephemeral });
		}
	}
};
//#endregion
