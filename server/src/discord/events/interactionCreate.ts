import { Interaction } from "discord.js";
import { BotClient } from "../../types/types";

module.exports = {
  name: "interactionCreate",
  async execute(client: BotClient, interaction: Interaction) {
    if (!interaction.isChatInputCommand()) {
      return;
    }
    let command = client.commands.get(interaction.commandName);

    if (!command) {
      console.error(`Command ${interaction.commandName} not found.`);
      return;
    }

    try {
      if (interaction.replied) return;
      command.execute(interaction);
    } catch (error) {
      console.error(error);
    }
  },
};
