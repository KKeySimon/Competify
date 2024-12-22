import { EmbedBuilder, SlashCommandBuilder } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Help menu for commands"),

  async execute(interaction) {
    const embed = new EmbedBuilder()
      .setTitle("Help")
      .setDescription("Bot help menu");

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
