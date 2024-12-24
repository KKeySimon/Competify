import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import prisma from "../../prisma/client";

// THIS IS NOT DONE
module.exports = {
  data: new SlashCommandBuilder()
    .setName("submit")
    .setDescription(
      "Make a submission for the competition connected to current text channel"
    )
    .addStringOption((option) =>
      option.setName("submission-content").setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

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
      const competition = await prisma.competitions.findFirst({
        where: {
          id: discordChannel.competition_id,
        },
      });
      if (competition.is_numerical) {
      } else {
      }
    } else {
      await interaction.editReply(
        "There is no competition connected to this channel!"
      );
    }
  },
};
