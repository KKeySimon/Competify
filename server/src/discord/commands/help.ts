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
    const embed = new EmbedBuilder().setTitle("Help");

    embed.addFields({
      name: "/connect",
      value: "Connects current text channel to competition",
      inline: false,
    });

    embed.addFields({
      name: "/submit",
      value:
        "Make a submission for the competition connected to current text channel. You can submit a text/number, URL, or image.",
      inline: false,
    });
    embed.addFields({
      name: "Options for /submit:",
      value: `
      **submission-type** (Required): Choose the type of your submission:
      • "Text/Number" for text or numerical submissions.
      • "URL" for a link submission.
      • "Image URL" for an image submission.

      **submission-content** (Required): Enter the content of your submission. This field can hold a text, URL, or image link depending on the type selected.
      `,
      inline: false,
    });

    embed.addFields({
      name: "/view",
      value: "View submissions for the competition connected to this channel.",
      inline: false,
    });

    await interaction.reply({
      embeds: [embed],
      ephemeral: true,
    });
  },
};
