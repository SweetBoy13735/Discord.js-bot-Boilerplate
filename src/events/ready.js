//#region External module imports
const { Events: { ClientReady } } = require("discord.js");
//#endregion

//#region Module exports
module.exports = {
	name: ClientReady,
	once: true,
	/**
	 * Handler to execute when the client has logged into Discord.
	 * @param {import("discord.js").Client} client The client instance that logged in.
	 */
	execute(client) { console.log(`Ready! Logged in as ${client.user.tag}`); }
};
//#endregion
