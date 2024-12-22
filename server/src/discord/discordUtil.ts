import * as fs from "node:fs";
import { Collection } from "discord.js";

export function getCommands(dir: string) {
  let commands = new Collection<string, any>();
  const commandFiles = getFiles(`${__dirname}/${dir}`);
  for (const commandFile of commandFiles) {
    const command = require(commandFile);
    commands.set(command.data.toJSON().name, command);
  }
  return commands;
}

function getFiles(dir: string) {
  const files = fs.readdirSync(dir, {
    withFileTypes: true,
  });
  let commandFiles = [];

  for (const file of files) {
    if (file.isDirectory()) {
      commandFiles = [...commandFiles, ...getFiles(`${dir}/${file.name}`)];
    } else if (file.name.endsWith(".ts")) {
      commandFiles.push(`${dir}/${file.name}`);
    }
  }
  return commandFiles;
}
