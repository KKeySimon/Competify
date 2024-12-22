import { token } from "./discordConfig";
import path from "node:path";
import * as fs from "node:fs";
import { BotClient } from "../types/types";
import { getCommands } from "./discordUtil";

const client = new BotClient({ intents: [] });

export const startDiscordBot = () => {
  try {
    client.commands = getCommands("./commands");

    client.login(token);

    const eventsPath = path.join(__dirname, "events");
    const eventFiles = fs
      .readdirSync(eventsPath)
      .filter((file) => file.endsWith(".ts"));

    for (const file of eventFiles) {
      const filePath = path.join(eventsPath, file);
      const event = require(filePath);
      if (event.once) {
        client.once(event.name, (...args) => event.execute(client, ...args));
      } else {
        client.on(event.name, (...args) => event.execute(client, ...args));
      }
    }
  } catch (error) {
    console.error("Error logging into Discord bot:", error);
  }
};
