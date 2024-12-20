import { Client, Collection, Events, SlashCommandBuilder } from "discord.js";
import { token } from "./config/discordConfig";
import { getCommands } from "./util/discordUtil";

class BotClient extends Client {
  commands: Collection<string, any>;

  constructor(options) {
    super(options);
    this.commands = new Collection();
  }
}

const client = new BotClient({ intents: [] });

client.commands = getCommands("../commands");

export const startDiscordBot = () => {
  try {
    client.login(token);

    client.once(Events.ClientReady, (c) => {
      console.log(`Logged in as ${c.user.username}`);
    });
    client.on(Events.InteractionCreate, (interaction) => {
      if (!interaction.isChatInputCommand()) {
        return;
      }

      let command = client.commands.get(interaction.commandName);

      try {
        if (interaction.replied) return;
        command.execute(interaction);
      } catch (error) {
        console.error(error);
      }
    });
  } catch (error) {
    console.error("Error logging into Discord bot:", error);
  }
};
