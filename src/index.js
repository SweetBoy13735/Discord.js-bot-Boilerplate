//#region External module imports
const FS = require("node:fs"), Path = require("node:path");
const { Client, Collection, Events: { ClientReady, InteractionCreate }, GatewayIntentBits: { Guilds }, MessageFlags: { Ephemeral } } = require("discord.js");
//#endregion

//#region Code body
if (!process.env.DISCORD_TOKEN) throw new Error("Discord token not found in .env file.");

const client = new Client({ intents: [Guilds] });

console.log("Registering commands...");

client.commands = new Collection();

const foldersPath = Path.join(__dirname, "commands"), commandFolders = FS.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = Path.join(foldersPath, folder), commandFiles = FS.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

	for (const file of commandFiles) {
		const filePath = Path.join(commandsPath, file), command = require(filePath);

		if ("data" in command && "execute" in command) client.commands.set(command.data.name, command);
		else console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

console.log("Registering events...");

client.on(InteractionCreate,
	/**
	 * Callback to execute when the client recieves an interaction.
	 * @param {import("discord.js").Interaction} interaction the interaction context created.
	 */
	async interaction => {
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
);

client.once(ClientReady,
	/**
	 * Callback to execute when the client has logged into Discord.
	 * @param {Client} readyClient The client instance that logged in.
	 */
	readyClient => { console.log(`Ready! Logged in as ${readyClient.user.tag}`); }
);

console.log("Logging into Discord...");

client.login(process.env.DISCORD_TOKEN);
//#endregion
