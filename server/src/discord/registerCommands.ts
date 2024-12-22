require("dotenv").config();

import { REST, Routes } from "discord.js";
import { getCommands } from "./discordUtil";
import { token } from "./discordConfig";

const clientId = process.env.DISCORD_CLIENT_ID;
if (!clientId) {
  throw new Error("DISCORD_CLIENT_ID is not defined in the environment.");
}

const commandsCollection = getCommands("./commands");

for (const [key, command] of commandsCollection.entries()) {
  if (!command.data || !command.data.toJSON) {
    console.error(`Command "${key}" is missing a valid "data" property.`);
  }
}

const commands = Array.from(commandsCollection.values()).map((cmd) =>
  cmd.data.toJSON()
);

const rest = new REST().setToken(token);

(async () => {
  try {
    console.log("Started refreshing application (/) commands.");

    await rest.put(Routes.applicationCommands(clientId), {
      body: commands,
    });

    console.log("Successfully reloaded application (/) commands.");
  } catch (error) {
    console.error(error);
  }
})();
