//#region External module imports
const FileSystem = require("node:fs"), Path = require("node:path");
const { REST, Routes } = require("discord.js");
//#endregion

//#region Internal module imports
const { guildIDs } = require("./Config.json");
//#endregion

//#region Code body
if (!process.env.DISCORD_TOKEN) throw new Error("Discord token not found in .env file.");

const rest = new REST().setToken(process.env.DISCORD_TOKEN);

console.log("Loading commands...");

const commands = [], foldersPath = Path.join(__dirname, "commands"), commandFolders = FileSystem.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = Path.join(foldersPath, folder), commandFiles = FileSystem.readdirSync(commandsPath).filter(file => file.endsWith(".js"));

	for (const file of commandFiles) {
		const filePath = Path.join(commandsPath, file), command = require(filePath);

		if ("data" in command && "execute" in command) commands.push(command.data.toJSON());
		else console.warn(`The command at ${filePath} is missing a required "data" or "execute" property.`);
	}
}

/**
 * Deploys the application commands to Discord.
 */
async function deployCommands() {
	console.log(`Deploying ${commands.length} command(s)...`);

	try {
		const { id: clientID, username } = await rest.get(Routes.user());

		if (guildIDs.length) {
			guildIDs.forEach(async guildID => {
				console.log(`Deploying to Guild ${guildID}...`);

				const data = await rest.put(Routes.applicationGuildCommands(clientID, guildID), { body: commands });

				console.log(`Deployed ${data.length} command(s) to Guild ${guildID}!`);
			});
		} else {
			console.log(`Deploying to ${username}...`);

			const data = await rest.put(Routes.applicationCommands(clientID), { body: commands });

			console.log(`Deployed ${data.length} command(s) successfully!`);
		}
	} catch (error) { console.error(error); }
}

deployCommands();
//#endregion
