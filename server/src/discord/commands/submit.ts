require("dotenv").config();

import { SlashCommandBuilder, ChatInputCommandInteraction } from "discord.js";
import prisma from "../../prisma/client";
import axios from "axios";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("submit")
    .setDescription(
      "Make a submission for the competition connected to current text channel"
    )
    .addStringOption((option) =>
      option
        .setName("submission-type")
        .setDescription("Choose the type of your submission")
        .setRequired(true)
        .addChoices(
          { name: "Text/Number", value: "text" },
          { name: "URL", value: "url" },
          { name: "Image URL", value: "image" }
        )
    )
    .addStringOption((option) =>
      option.setName("submission-content").setRequired(true).setMaxLength(200)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const channelId = BigInt(interaction.channelId);

    const discordChannel = await prisma.competition_to_channel.findFirst({
      where: {
        discord_channel_id: channelId,
      },
    });

    if (discordChannel) {
      const content = interaction.options.getString("submission-content");
      const submissionType = interaction.options.getString("submission-type");
      const competition = await prisma.competitions.findFirst({
        where: {
          id: discordChannel.competition_id,
        },
      });
      if (competition) {
        try {
          if (competition.is_numerical) {
            const parsedContent = parseInt(content, 10);

            if (isNaN(parsedContent)) {
              await interaction.editReply(
                "Your submission must be a valid number for this competition."
              );
              return;
            }

            const response = await axios.post(
              `${process.env.API_URL}/upcoming/submit`,
              {
                discordId: interaction.user.id,
                content: {
                  inputType: submissionType,
                  submission: parsedContent,
                },
              },
              {
                headers: {
                  "X-Bot-Secret": process.env.DISCORD_BOT_SECRET,
                },
              }
            );

            await interaction.editReply("Submission received successfully!");
          } else {
            if (content.length > 200) {
              await interaction.editReply(
                "Your submission exceeds the maximum allowed length of 200 characters."
              );
              return;
            }

            const response = await axios.post(
              `${process.env.API_URL}/upcoming/submit`,
              {
                discordId: interaction.user.id,
                content: {
                  inputType: submissionType,
                  submission: content,
                },
              },
              {
                headers: {
                  "X-Bot-Secret": process.env.DISCORD_BOT_SECRET,
                },
              }
            );

            await interaction.editReply("Submission received successfully!");
          }
        } catch (error) {
          console.error(error);

          if (error.response && error.response.data) {
            await interaction.editReply(
              `Failed to submit: ${error.response.data.message}`
            );
          } else {
            await interaction.editReply(
              "An error occurred while processing your submission."
            );
          }
        }
      } else {
        await interaction.editReply(
          "Competition not found. Please contact an administrator."
        );
      }
    } else {
      await interaction.editReply(
        "There is no competition connected to this channel!"
      );
    }
  },
};
