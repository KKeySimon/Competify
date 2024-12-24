import {
  SlashCommandBuilder,
  EmbedBuilder,
  ChatInputCommandInteraction,
} from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("poll")
    .setDescription("Create a new poll")
    .addStringOption((option) =>
      option
        .setName("poll-title")
        .setDescription("Title of Poll")
        .setMaxLength(50)
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("option2").setDescription("Option 1 of 2").setMaxLength(50)
    )
    .addStringOption((option) =>
      option.setName("option3").setDescription("Option 2 of 2").setMaxLength(50)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    const { user, guild, client } = interaction;
    const options = interaction.options.data;

    console.log(interaction.channelId);
    const channel = await client.channels
      .fetch(interaction.channelId)
      .catch(() => null);

    let embed = new EmbedBuilder().setTitle(`${options[0].value}`);

    const emojis = [":one:", ":two:"];

    for (let i = 1; i < options.length; i++) {
      let emoji = emojis[i - 1];
      let option = options[i];
      embed.addFields({
        name: `${emoji} ${option.value}`,
        value: " ",
      });
    }

    const message = await channel.send({ embeds: [embed] });

    for (let i = 1; i < options.length; i++) {
      let emoji = emojis[i - 1];
      await message.react(emoji);
    }
    await interaction.editReply({ content: "sent poll successfully" });
  },
};
