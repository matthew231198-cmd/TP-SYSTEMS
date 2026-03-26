import { pgTable, text, integer, numeric, timestamp, boolean, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const usersTable = pgTable("discord_users", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  username: text("username").notNull(),
  tpPoints: integer("tp_points").notNull().default(0),
  hnpBalance: numeric("hnp_balance", { precision: 18, scale: 6 }).notNull().default("0"),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const dailyActivityTable = pgTable("discord_daily_activity", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull(),
  date: text("date").notNull(),
  pointsEarned: integer("points_earned").notNull().default(0),
  invitePointsEarned: integer("invite_points_earned").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const openedBoxesTable = pgTable("discord_opened_boxes", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull(),
  boxType: text("box_type").notNull(),
  rarity: text("rarity").notNull(),
  hnpAmount: numeric("hnp_amount", { precision: 18, scale: 6 }).notNull(),
  openedAt: timestamp("opened_at").notNull().defaultNow(),
});

export const withdrawalsTable = pgTable("discord_withdrawals", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull(),
  username: text("username").notNull(),
  hnpAmount: numeric("hnp_amount", { precision: 18, scale: 6 }).notNull(),
  walletAddress: text("wallet_address").notNull(),
  requestedAt: timestamp("requested_at").notNull().defaultNow(),
});

export const botConfigTable = pgTable("discord_bot_config", {
  id: serial("id").primaryKey(),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
});

export const invitesTable = pgTable("discord_invites", {
  id: serial("id").primaryKey(),
  inviteCode: text("invite_code").notNull().unique(),
  inviterDiscordId: text("inviter_discord_id").notNull(),
  guildId: text("guild_id").notNull(),
  uses: integer("uses").notNull().default(0),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const joinedMembersTable = pgTable("discord_joined_members", {
  id: serial("id").primaryKey(),
  discordId: text("discord_id").notNull().unique(),
  firstJoinedAt: timestamp("first_joined_at").notNull().defaultNow(),
});

export const insertUserSchema = createInsertSchema(usersTable).omit({ id: true, createdAt: true, updatedAt: true });
export const insertDailyActivitySchema = createInsertSchema(dailyActivityTable).omit({ id: true, createdAt: true });
export const insertOpenedBoxSchema = createInsertSchema(openedBoxesTable).omit({ id: true, openedAt: true });
export const insertWithdrawalSchema = createInsertSchema(withdrawalsTable).omit({ id: true, requestedAt: true });

export type User = typeof usersTable.$inferSelect;
export type DailyActivity = typeof dailyActivityTable.$inferSelect;
export type OpenedBox = typeof openedBoxesTable.$inferSelect;
export type Withdrawal = typeof withdrawalsTable.$inferSelect;
export type BotConfig = typeof botConfigTable.$inferSelect;
export type Invite = typeof invitesTable.$inferSelect;
export type JoinedMember = typeof joinedMembersTable.$inferSelect;
