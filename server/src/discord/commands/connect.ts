require("dotenv").config();

import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import prisma from "../../prisma/client";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("connect")
    .setDescription("Connect a competition to the current channel!")
    .addIntegerOption((option) =>
      option
        .setName("competition-id")
        .setDescription(
          `Copy the ID of "competify.vercel.app/competition/{ID COPY THIS}"`
        )
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const channelId = BigInt(interaction.channelId);

    const competitionId = Number(
      interaction.options.getInteger("competition-id")
    );
    if (isNaN(competitionId)) {
      await interaction.editReply("Invalid competition ID provided.");
      return;
    }

    // TODO: If competition private (TODO), it should not connect unless an admin (TODO)
    // makes the connection to the channel
    const competition = await prisma.competitions.findFirst({
      where: {
        id: competitionId,
      },
    });

    if (competition) {
      const existingConnection = await prisma.competition_to_channel.findFirst({
        where: {
          discord_channel_id: channelId,
        },
      });

      if (existingConnection) {
        await prisma.competition_to_channel.delete({
          where: {
            discord_channel_id: channelId,
          },
        });
      }

      await prisma.competition_to_channel.create({
        data: {
          competition_id: competitionId,
          discord_channel_id: channelId,
        },
      });

      const competitionLink = `${process.env.CLIENT_URL}/competition/${competitionId}`;

      await interaction.editReply(
        `Competition successfully connected to the channel! [View Competition](${competitionLink})`
      );
    } else {
      await interaction.editReply("Competition does not exist.");
    }
  },
};
