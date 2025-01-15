import * as fs from "node:fs";
import { Collection } from "discord.js";
import path from "node:path";

export function getCommands(dir: string) {
  const commands = new Collection<string, any>();
  const commandsPath = path.resolve(__dirname, dir);
  const commandFiles = getFiles(commandsPath);

  for (const commandFile of commandFiles) {
    try {
      const command = require(commandFile);
      commands.set(command.data.name, command);
    } catch (error) {
      console.error(`Error loading command file ${commandFile}:`, error);
    }
  }
  return commands;
}

export function getFiles(dir: string) {
  const ext = process.env.NODE_ENV === "production" ? ".js" : ".ts";

  return fs
    .readdirSync(dir)
    .filter((file) => file.endsWith(ext))
    .map((file) => path.join(dir, file));
}
