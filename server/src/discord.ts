import { Client, Events, SlashCommandBuilder } from "discord.js";
import { token } from "./config/discordConfig";

const client = new Client({ intents: [] });

client.commands = getCommands("./commands");

export const startDiscordBot = () => {
  try {
    client.login(token);
    client.once(Events.ClientReady, (c) => {
      console.log(`Logged in as ${c.user.username}`);
    });

    client.on(Events.InteractionCreate, (interaction) => {
      if (interaction.isChatInputCommand()) {
        if (interaction.commandName === "hello") {
          let user = interaction.options.getUser("user") || interaction.user;
        } else if (interaction.commandName === "ping") {
          interaction.reply("Pong!");
        }
      }
    });
  } catch (error) {
    console.error("Error logging into Discord bot:", error);
  }
};
