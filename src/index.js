//#region External module imports
const { Client, Events: { ClientReady }, GatewayIntentBits: { Guilds } } = require("discord.js");
//#endregion

//#region Code body
if (!process.env.DISCORD_TOKEN) throw new Error("Discord token not found in .env file.");

const client = new Client({ intents: [Guilds] });

client.once(ClientReady, readyClient => { console.log(`Ready! Logged in as ${readyClient.user.tag}`); });

console.log("Logging into Discord...");

client.login(process.env.DISCORD_TOKEN);
//#endregion
