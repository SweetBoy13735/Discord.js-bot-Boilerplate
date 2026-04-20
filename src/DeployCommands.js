//#region External module imports
const FS = require("node:fs"), Path = require("node:path");
const { REST, Routes } = require("discord.js");
//#endregion

//#region Internal module imports
const { ID } = require("./Config.json");
//#endregion

//#region Code body
if (!process.env.DISCORD_TOKEN) throw new Error("Discord token not found in .env file.");

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

async function deployCommands() {
	try {
		const data = await rest.put(Routes.applicationGuildCommands(ID.client, ID.guild), { body: commands });

		console.log(`Deployed ${data.length} command(s) successfully!`);
	} catch (error) { console.error(error); }
}

console.log("Registering commands...");

const commands = [], foldersPath = Path.join(__dirname, "commands"), commandFolders = FS.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = Path.join(foldersPath, folder), commandFiles = FS.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

	for (const file of commandFiles) {
		const filePath = Path.join(commandsPath, file), command = require(filePath);

		if ("data" in command && "execute" in command) commands.push(command.data.toJSON());
		else console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

console.log(`Deploying ${commands.length} command(s)...`);

deployCommands();
//#endregion
