//#region External module imports
const FS = require("node:fs"), Path = require("node:path");
const { Client, Collection, GatewayIntentBits: { Guilds } } = require("discord.js");
//#endregion

//#region Code body
if (!process.env.DISCORD_TOKEN) throw new Error("Discord token not found in .env file.");

const client = new Client({ intents: [Guilds] });

console.log("Registering commands...");

client.commands = new Collection();
client.cooldowns = new Collection();

const commandFoldersPath = Path.join(__dirname, "commands"), commandFolders = FS.readdirSync(commandFoldersPath);

for (const commandFolder of commandFolders) {
	const commandsPath = Path.join(commandFoldersPath, commandFolder), commandFiles = FS.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

	for (const file of commandFiles) {
		const filePath = Path.join(commandsPath, file), command = require(filePath);

		if ("data" in command && "execute" in command) client.commands.set(command.data.name, command);
		else console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

console.log("Registering events...");

const eventsPath = Path.join(__dirname, "events"), eventFiles = FS.readdirSync(eventsPath).filter(file => file.endsWith(".js"));

for (const file of eventFiles) {
	const filePath = Path.join(eventsPath, file), event = require(filePath);

	if (event.once) client.once(event.name, (...args) => event.execute(...args));
	else client.on(event.name, (...args) => event.execute(...args));
}

console.log("Logging into Discord...");

client.login(process.env.DISCORD_TOKEN);
//#endregion
