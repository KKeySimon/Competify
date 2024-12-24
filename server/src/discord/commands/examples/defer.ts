import {
  ChatInputCommandInteraction,
  PermissionFlagsBits,
  SlashCommandBuilder,
} from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("defer")
    .setDescription("Defer reply example")
    .addStringOption((option) =>
      option
        .setName("string")
        .setDescription("test")
        .setMaxLength(10)
        .setMinLength(3)
        .setRequired(true)
        .setChoices({ name: "hello", value: "hello" })
    )
    .addNumberOption((option) =>
      option
        .setName("number")
        .setDescription("test")
        .setMaxValue(10)
        .setMinValue(3)
        .setRequired(true)
    )
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction: ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });
    // Add time consuming task (accessing database etc)
    await interaction.editReply({ content: "hello" });
    // More time consuming tasks
    await interaction.followUp({ content: "Hello again!" });
  },
};
