import {
  SlashCommandBuilder,
  EmbedBuilder,
  type ChatInputCommandInteraction,
} from "discord.js";
import { BOX_TYPES, HNP_REWARDS, MAX_DAILY_TP, MIN_MESSAGE_LENGTH } from "../config.js";

export const data = new SlashCommandBuilder()
  .setName("info")
  .setDescription("Learn how everything works — TP points, boxes, and HNP withdrawals");

export async function execute(interaction: ChatInputCommandInteraction) {
  await interaction.deferReply();

  const tpEmbed = new EmbedBuilder()
    .setTitle("📖 How Everything Works")
    .setColor(0x5865f2)
    .setDescription("Welcome to the HNP reward system! Here's a complete guide:")
    .addFields(
      {
        name: "🎯 Step 1: Earn TP Points",
        value: [
          `• Chat in the server to earn TP points`,
          `• Each message must be at least **${MIN_MESSAGE_LENGTH} characters** long`,
          `• You earn **1–5 TP** per valid message`,
          `• Maximum of **${MAX_DAILY_TP} TP per day**`,
          `• Use \`/balance\` to check your points`,
          `• Use \`/leaderboard\` to see top chatters`,
        ].join("\n"),
        inline: false,
      },
      {
        name: "🏪 Step 2: Buy HNP Boxes",
        value: [
          `Use \`/buy\` to spend TP and open a box:`,
          ``,
          `🎁 **Fun Box** — 100 TP`,
          `> 50% Common | 30% Uncommon | 12% Rare | 6% Epic | 2% Legendary`,
          ``,
          `📦 **Calev Box** — 200 TP`,
          `> 30% Common | 40% Uncommon | 15% Rare | 12% Epic | 3% Legendary`,
          ``,
          `💎 **Chate Box** — 300 TP`,
          `> 20% Common | 50% Uncommon | 10% Rare | 15% Epic | 5% Legendary`,
        ].join("\n"),
        inline: false,
      },
      {
        name: "💎 HNP Rewards by Rarity",
        value: [
          `⚪ **Common**: 0.002 – 0.018 HNP`,
          `🟢 **Uncommon**: 0.02 – 0.1 HNP`,
          `🔵 **Rare**: 0.12 – 0.2 HNP`,
          `🟣 **Epic**: 0.2 – 1.0 HNP`,
          `🌟 **Legendary**: 1.0 – 2.0 HNP`,
        ].join("\n"),
        inline: false,
      },
      {
        name: "💸 Step 3: Withdraw HNP",
        value: [
          `• Use \`/withdraw <amount>\` to request a withdrawal`,
          `• Your HNP balance is deducted immediately`,
          `• A notification is sent to the admin channel`,
          `• The admin team will process your withdrawal`,
          `• Use \`/balance\` to see your current HNP balance`,
        ].join("\n"),
        inline: false,
      },
      {
        name: "🛠️ Useful Commands",
        value: [
          `\`/balance\` — Check your TP & HNP balance`,
          `\`/leaderboard\` — View top TP earners`,
          `\`/shop\` — Browse available boxes`,
          `\`/buy <box>\` — Purchase a box`,
          `\`/withdraw <amount>\` — Withdraw HNP`,
          `\`/info\` — This guide`,
        ].join("\n"),
        inline: false,
      }
    )
    .setFooter({ text: "Good luck and happy chatting! 🎉" });

  await interaction.editReply({ embeds: [tpEmbed] });
}
