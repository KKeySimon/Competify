import {
  ChatInputCommandInteraction,
  EmbedBuilder,
  SlashCommandBuilder,
} from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("help")
    .setDescription("Help menu for commands"),

  async execute(interaction: ChatInputCommandInteraction) {
    const embed = new EmbedBuilder().setTitle("Help").addFields({
      name: "/connect",
      value: "Connects current text channel to competition",
      inline: false,
    });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
