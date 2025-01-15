import { token } from "./discordConfig";
import path from "node:path";
import * as fs from "node:fs";
import { BotClient } from "../types/types";
import { getCommands } from "./discordUtil";

export const client = new BotClient({ intents: [] });

export const startDiscordBot = () => {
  try {
    client.commands = getCommands("./commands");
    console.log("Logging in with token:", token);

    client.login(token);

    const eventsPath = path.join(__dirname, "./events");
    const eventFiles = fs
      .readdirSync(eventsPath)
      .filter((file) =>
        file.endsWith(process.env.NODE_ENV === "production" ? ".js" : ".ts")
      );
    console.log("Commands loaded:", client.commands);
    console.log("Event files found:", eventFiles);
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
