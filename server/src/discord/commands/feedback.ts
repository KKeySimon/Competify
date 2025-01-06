import { ChatInputCommandInteraction, TextChannel } from "discord.js";
import { client } from "../discord";

const { SlashCommandBuilder } = require("discord.js");

module.exports = {
  data: new SlashCommandBuilder()
    .setName("feedback")
    .setDescription("Submit feedback about the bot or competitions.")
    .addStringOption((option) =>
      option
        .setName("message")
        .setDescription("Your feedback message")
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const feedbackMessage = interaction.options.getString("message");
    const userId = interaction.user.id;
    const username = interaction.user.username;

    // Save or handle the feedback
    await handleFeedback(userId, username, feedbackMessage);

    // Respond to the user
    await interaction.reply({
      content: "Thank you for your feedback! 🙌",
      ephemeral: true,
    });
  },
};

const handleFeedback = async (userId, username, message) => {
  const adminChannelId = "1319673405099999465";
  const adminChannel = await client.channels.fetch(adminChannelId);

  if (
    adminChannel &&
    adminChannel.isTextBased() &&
    adminChannel instanceof TextChannel
  ) {
    await adminChannel.send(
      `📩 **New Feedback Received**\n**From:** ${username} (<@${userId}>)\n**Message:** ${message}`
    );
  }
};
