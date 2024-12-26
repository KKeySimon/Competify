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
      option
        .setName("submission-content")
        .setDescription("Enter the content of your submission")
        .setMaxLength(200)
        .setRequired(true)
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
          let parsedContent: string | number;
          if (competition.is_numerical) {
            parsedContent = parseInt(content, 10);

            if (isNaN(parsedContent)) {
              await interaction.editReply(
                "Your submission must be a valid number for this competition."
              );
              return;
            }
          } else {
            parsedContent = content;
          }

          const submissionData = {
            discordId: interaction.user.id,
            content: {
              inputType: submissionType,
              submission: competition.is_numerical ? parsedContent : content,
            },
          };

          const response = await axios.post(
            `${process.env.API_URL}/api/competition/${competition.id}/events/upcoming/submit`,
            submissionData,
            {
              params: {
                discordId: interaction.user.id,
              },
              headers: {
                "X-Bot-Secret": process.env.DISCORD_BOT_SECRET,
              },
            }
          );

          await interaction.editReply({
            content: `${interaction.user.username} has successfully submitted their entry to the competition! 🎉\nUse the \`/view\` command to check out submissions in this channel: #${interaction.channel.name}`,
          });
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
