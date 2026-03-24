import {
  Client,
  GatewayIntentBits,
  Events,
  Collection,
  type ChatInputCommandInteraction,
} from "discord.js";
import { db } from "@workspace/db";
import {
  usersTable,
  dailyActivityTable,
  botConfigTable,
} from "@workspace/db";
import { sql } from "drizzle-orm";

import * as leaderboard from "./commands/leaderboard.js";
import * as balance from "./commands/balance.js";
import * as shop from "./commands/shop.js";
import * as buy from "./commands/buy.js";
import * as withdraw from "./commands/withdraw.js";
import * as info from "./commands/info.js";
import * as admin from "./commands/admin.js";

import { addTpPoints, getOrCreateUser, getBotConfig } from "./db.js";
import { MIN_MESSAGE_LENGTH, MAX_DAILY_TP } from "./config.js";
import { isEventActive, calcTpPerMessage } from "./utils.js";

const token = process.env.DISCORD_BOT_TOKEN;
if (!token) throw new Error("DISCORD_BOT_TOKEN is required");

await ensureSchema();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const commands = new Collection<
  string,
  { data: { name: string }; execute: Function }
>();

commands.set(leaderboard.data.name, leaderboard);
commands.set(balance.data.name, balance);
commands.set(shop.data.name, shop);
commands.set(buy.data.name, buy);
commands.set(withdraw.data.name, withdraw);
commands.set(info.data.name, info);
commands.set(admin.data.name, admin);

client.once(Events.ClientReady, async (c) => {
  console.log(`✅ Logged in as ${c.user.tag}`);
  console.log(`📊 Serving ${c.guilds.cache.size} guild(s)`);

  await registerCommands(c.user.id);
});

client.on(Events.MessageCreate, async (message) => {
  if (message.author.bot) return;
  if (!message.guild) return;

  const content = message.content.trim();
  if (content.length < MIN_MESSAGE_LENGTH) return;

  const startDate = await getBotConfig("event_start_date").catch(() => null);
  if (!isEventActive(startDate)) return;

  try {
    const points = calcTpPerMessage();
    const result = await addTpPoints(
      message.author.id,
      message.author.username,
      points
    );

    if (result.pointsAdded > 0) {
      console.log(
        `[TP] ${message.author.username} earned ${result.pointsAdded} TP (total: ${result.newTotal})`
      );
    }
  } catch (err) {
    console.error("Error adding TP points:", err);
  }
});

client.on(Events.InteractionCreate, async (interaction) => {
  if (!interaction.isChatInputCommand()) return;

  const command = commands.get(interaction.commandName);
  if (!command) return;

  try {
    if (interaction.commandName === "withdraw") {
      await (withdraw as any).execute(interaction, client);
    } else {
      await command.execute(interaction as ChatInputCommandInteraction);
    }
  } catch (err) {
    console.error(`Error executing /${interaction.commandName}:`, err);
    const msg = "There was an error while executing this command!";
    if (interaction.replied || interaction.deferred) {
      await interaction.editReply(msg).catch(() => {});
    } else {
      await interaction.reply({ content: msg, ephemeral: true }).catch(() => {});
    }
  }
});

client.login(token);

async function ensureSchema() {
  try {
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS discord_users (
        id SERIAL PRIMARY KEY,
        discord_id TEXT NOT NULL UNIQUE,
        username TEXT NOT NULL,
        tp_points INTEGER NOT NULL DEFAULT 0,
        hnp_balance NUMERIC(18, 6) NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS discord_daily_activity (
        id SERIAL PRIMARY KEY,
        discord_id TEXT NOT NULL,
        date TEXT NOT NULL,
        points_earned INTEGER NOT NULL DEFAULT 0,
        created_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS discord_opened_boxes (
        id SERIAL PRIMARY KEY,
        discord_id TEXT NOT NULL,
        box_type TEXT NOT NULL,
        rarity TEXT NOT NULL,
        hnp_amount NUMERIC(18, 6) NOT NULL,
        opened_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS discord_withdrawals (
        id SERIAL PRIMARY KEY,
        discord_id TEXT NOT NULL,
        username TEXT NOT NULL,
        hnp_amount NUMERIC(18, 6) NOT NULL,
        wallet_address TEXT NOT NULL,
        requested_at TIMESTAMP NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS discord_bot_config (
        id SERIAL PRIMARY KEY,
        key TEXT NOT NULL UNIQUE,
        value TEXT NOT NULL,
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
    console.log("✅ Database schema ready");
  } catch (err) {
    console.error("Error setting up schema:", err);
    throw err;
  }
}

async function registerCommands(clientId: string) {
  try {
    const { REST, Routes } = await import("discord.js");
    const rest = new REST().setToken(token!);
    const commandData = [
      leaderboard.data,
      balance.data,
      shop.data,
      buy.data,
      withdraw.data,
      info.data,
      admin.data,
    ].map((cmd) => cmd.toJSON());

    await rest.put(Routes.applicationCommands(clientId), { body: commandData });
    console.log("✅ Slash commands registered globally");
  } catch (err) {
    console.error("Failed to register commands:", err);
  }
}
