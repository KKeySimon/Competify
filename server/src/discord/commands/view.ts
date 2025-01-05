require("dotenv").config();

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from "discord.js";
import prisma from "../../prisma/client";
import axios from "axios";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("view")
    .setDescription(
      "View submissions for the competition connected to this channel"
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
      const competition = await prisma.competitions.findFirst({
        where: {
          id: discordChannel.competition_id,
        },
      });
      if (competition) {
        try {
          const upcomingResponse = await axios.get(
            `${process.env.API_URL}/api/competition/${competition.id}/events/upcoming`,
            {
              headers: {
                "X-Bot-Secret": process.env.DISCORD_BOT_SECRET,
              },
              params: {
                discordId: interaction.user.id,
              },
            }
          );

          if (upcomingResponse && upcomingResponse.data) {
            const upcomingEvents = upcomingResponse.data;
            const submissionsResponse = await axios.get(
              `${process.env.API_URL}/api/competition/${competition.id}/events/${upcomingEvents.id}`,
              {
                headers: {
                  "X-Bot-Secret": process.env.DISCORD_BOT_SECRET,
                },
                params: {
                  discordId: interaction.user.id,
                },
              }
            );
            if (submissionsResponse && submissionsResponse.data) {
              const submissions = submissionsResponse.data.submissions;
              const event = submissionsResponse.data.event;

              let sortedSubmissions;
              if (event.is_numerical) {
                sortedSubmissions = submissions.sort((a, b) => {
                  if (event.priority === "HIGHEST") {
                    return b.content_number - a.content_number;
                  } else {
                    return a.content_number - b.content_number;
                  }
                });
              } else {
                sortedSubmissions = submissions.sort((a, b) => {
                  return b.vote_count - a.vote_count;
                });
              }

              const topSubmissions = sortedSubmissions.slice(0, 10);

              const embed = new EmbedBuilder()
                .setColor("#0099ff")
                .setTitle(`Submission for Event: ${event.belongs_to.name}`)
                .setDescription(
                  `[Click here to view competition details](http://localhost:5173/competition/${competition.id})`
                )
                .addFields({
                  name: "Deadline",
                  value: new Date(event.date).toLocaleString(),
                  inline: false,
                });

              topSubmissions.forEach((sortedSubmission, index) => {
                let rankEmoji;
                switch (index) {
                  case 0:
                    rankEmoji = "🥇";
                    break;
                  case 1:
                    rankEmoji = "🥈";
                    break;
                  case 2:
                    rankEmoji = "🥉";
                    break;
                  default:
                    rankEmoji = "🔹";
                }

                let contentDisplay;

                if (event.is_numerical) {
                  contentDisplay = sortedSubmission.content_number;
                } else {
                  switch (sortedSubmission.submission_type) {
                    case "TEXT":
                      contentDisplay = `📰 Text Submission\n${sortedSubmission.content}`;
                      break;
                    case "URL":
                      contentDisplay = `🔗 URL Submission\n[Click here](${sortedSubmission.content})`;
                      break;
                    case "IMAGE_URL":
                      contentDisplay = `🖼️ Image Submission\n[Click here to view image](${sortedSubmission.content})`;
                      break;
                    default:
                      contentDisplay = "No submission content available";
                  }
                }

                const voteDisplay = event.is_numerical
                  ? ""
                  : `**Votes:** 👍 ${sortedSubmission.vote_count}`;

                embed.addFields({
                  name: `${rankEmoji} Rank #${index + 1} - ${
                    sortedSubmission.belongs_to.username
                  }`,
                  value: `${contentDisplay}\n${voteDisplay}${
                    index < topSubmissions.length - 1
                      ? "\n------------------------"
                      : ""
                  }`,
                  inline: false,
                });
              });

              await interaction.editReply({
                embeds: [embed],
              });
            }
          } else {
            await interaction.editReply(
              "No upcoming events found for this competition."
            );
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
