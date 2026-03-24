import {
  SlashCommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { BOX_TYPES, RARITY_COLORS, RARITY_EMOJIS, type BoxType } from "../config.js";
import { getOrCreateUser, deductTp, addHnp, logBoxOpen } from "../db.js";
import { rollRarity, rollHnpAmount, formatHnp } from "../utils.js";

export const data = new SlashCommandBuilder()
  .setName("buy")
  .setDescription("Buy an HNP box from the shop")
  .addStringOption((opt) =>
    opt
      .setName("box")
      .setDescription("The box type to buy")
      .setRequired(true)
      .addChoices(
        { name: "🎁 Fun Box (100 TP)", value: "fun" },
        { name: "📦 Calev Box (200 TP)", value: "calev" },
        { name: "💎 Chate Box (300 TP)", value: "chate" }
      )
  );

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const boxKey = interaction.options.getString("box", true) as BoxType;
  const box = BOX_TYPES[boxKey];

  const user = await getOrCreateUser(
    interaction.user.id,
    interaction.user.username
  );

  if (user.tpPoints < box.cost) {
    const embed = new EmbedBuilder()
      .setTitle("❌ Not Enough TP")
      .setDescription(
        `You need **${box.cost} TP** to buy the ${box.emoji} **${box.name}**, but you only have **${user.tpPoints} TP**.\n\nChat more to earn TP points!`
      )
      .setColor(0xe74c3c);
    await interaction.editReply({ embeds: [embed] });
    return;
  }

  const deducted = await deductTp(interaction.user.id, box.cost);
  if (!deducted) {
    await interaction.editReply("Failed to deduct TP points. Please try again.");
    return;
  }

  const rarity = rollRarity(boxKey);
  const hnpAmount = rollHnpAmount(rarity);

  await addHnp(interaction.user.id, hnpAmount);
  await logBoxOpen(interaction.user.id, boxKey, rarity, hnpAmount);

  const rarityEmoji = RARITY_EMOJIS[rarity];
  const rarityColor = RARITY_COLORS[rarity];
  const rarityLabel = rarity.charAt(0).toUpperCase() + rarity.slice(1);

  const updatedUser = await getOrCreateUser(
    interaction.user.id,
    interaction.user.username
  );

  const embed = new EmbedBuilder()
    .setTitle(`${box.emoji} ${box.name} Opened!`)
    .setDescription(
      `You opened a **${box.name}** and got a ${rarityEmoji} **${rarityLabel}** reward!`
    )
    .setColor(rarityColor)
    .addFields(
      { name: "🎉 Rarity", value: `${rarityEmoji} **${rarityLabel}**`, inline: true },
      { name: "💎 HNP Earned", value: `**${formatHnp(hnpAmount)} HNP**`, inline: true },
      { name: "🎯 Remaining TP", value: `${updatedUser.tpPoints} TP`, inline: true },
      { name: "💰 Total HNP", value: `${formatHnp(updatedUser.hnpBalance as string)} HNP`, inline: true }
    )
    .setFooter({ text: `Cost: ${box.cost} TP` })
    .setTimestamp();

  await interaction.editReply({ embeds: [embed] });
}
