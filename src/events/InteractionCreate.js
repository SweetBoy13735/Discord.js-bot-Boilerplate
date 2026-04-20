//#region External module imports
const { Collection, Events: { InteractionCreate }, MessageFlags: { Ephemeral } } = require("discord.js");
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
			const message = `No command matching "${interaction.commandName}" was found.`; 

			console.error(message);

			return interaction.reply({ content: message.replaceAll('"', "`"), flags: Ephemeral });
		}

		if (command.cooldown) {
			const { cooldowns } = interaction.client;

			if (!cooldowns.has(command.data.name)) cooldowns.set(command.data.name, new Collection());

			const now = Date.now(), cooldownAmount = command.cooldown * 1_000, timestamps = cooldowns.get(command.data.name);

			if (timestamps.has(interaction.user.id)) {
				const expirationTime = timestamps.get(interaction.user.id) + cooldownAmount;

				if (now < expirationTime) return interaction.reply({ content: `Please wait, you are on a cooldown for \`${command.data.name}\`. You can use it again <t:${Math.round(expirationTime / 1_000)}:R>.`, flags: Ephemeral });
			}

			timestamps.set(interaction.user.id, now);

			setTimeout(() => { timestamps.delete(interaction.user.id); }, cooldownAmount);
		}

		try { await command.execute(interaction); } catch (error) {
			console.error(error);

			if (interaction.replied || interaction.deferred) await interaction.followUp({ content: "There was an error while executing this command!", flags: Ephemeral });
			else await interaction.reply({ content: "There was an error while executing this command!", flags: Ephemeral });
		}
	}
};
//#endregion
