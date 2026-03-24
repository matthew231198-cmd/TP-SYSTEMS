import { db } from "@workspace/db";
import {
  usersTable,
  dailyActivityTable,
  openedBoxesTable,
  withdrawalsTable,
  botConfigTable,
} from "@workspace/db";
import { eq, and, desc, sql } from "drizzle-orm";
import type { BoxType, Rarity } from "./config.js";

export async function getOrCreateUser(discordId: string, username: string) {
  const existing = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.discordId, discordId))
    .limit(1);

  if (existing.length > 0) {
    if (existing[0].username !== username) {
      await db
        .update(usersTable)
        .set({ username, updatedAt: new Date() })
        .where(eq(usersTable.discordId, discordId));
    }
    return existing[0];
  }

  const [newUser] = await db
    .insert(usersTable)
    .values({ discordId, username, tpPoints: 0, hnpBalance: "0" })
    .returning();
  return newUser;
}

export async function getTodayDate(): Promise<string> {
  const now = new Date();
  return now.toISOString().split("T")[0];
}

export async function getDailyPoints(discordId: string): Promise<number> {
  const today = await getTodayDate();
  const result = await db
    .select()
    .from(dailyActivityTable)
    .where(
      and(
        eq(dailyActivityTable.discordId, discordId),
        eq(dailyActivityTable.date, today)
      )
    )
    .limit(1);

  return result.length > 0 ? result[0].pointsEarned : 0;
}

export async function addTpPoints(
  discordId: string,
  username: string,
  points: number
): Promise<{ newTotal: number; pointsAdded: number }> {
  const today = await getTodayDate();
  const dailyEarned = await getDailyPoints(discordId);
  const remaining = Math.max(0, 100 - dailyEarned);

  if (remaining <= 0) return { newTotal: 0, pointsAdded: 0 };

  const pointsToAdd = Math.min(points, remaining);

  const existing = await db
    .select()
    .from(dailyActivityTable)
    .where(
      and(
        eq(dailyActivityTable.discordId, discordId),
        eq(dailyActivityTable.date, today)
      )
    )
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(dailyActivityTable)
      .set({ pointsEarned: existing[0].pointsEarned + pointsToAdd })
      .where(eq(dailyActivityTable.id, existing[0].id));
  } else {
    await db
      .insert(dailyActivityTable)
      .values({ discordId, date: today, pointsEarned: pointsToAdd });
  }

  const user = await getOrCreateUser(discordId, username);
  await db
    .update(usersTable)
    .set({
      tpPoints: user.tpPoints + pointsToAdd,
      username,
      updatedAt: new Date(),
    })
    .where(eq(usersTable.discordId, discordId));

  return { newTotal: user.tpPoints + pointsToAdd, pointsAdded: pointsToAdd };
}

export async function getLeaderboard(limit = 10) {
  return db
    .select()
    .from(usersTable)
    .orderBy(desc(usersTable.tpPoints))
    .limit(limit);
}

export async function deductTp(discordId: string, amount: number): Promise<boolean> {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.discordId, discordId))
    .limit(1);

  if (!user.length || user[0].tpPoints < amount) return false;

  await db
    .update(usersTable)
    .set({ tpPoints: user[0].tpPoints - amount, updatedAt: new Date() })
    .where(eq(usersTable.discordId, discordId));

  return true;
}

export async function addHnp(discordId: string, amount: number) {
  const current = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.discordId, discordId))
    .limit(1);

  if (!current.length) return;
  const currentBal = parseFloat(current[0].hnpBalance as string);
  const newBal = (currentBal + amount).toFixed(6);

  await db
    .update(usersTable)
    .set({ hnpBalance: newBal, updatedAt: new Date() })
    .where(eq(usersTable.discordId, discordId));
}

export async function deductHnp(discordId: string, amount: number): Promise<boolean> {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.discordId, discordId))
    .limit(1);

  if (!user.length) return false;
  const currentBal = parseFloat(user[0].hnpBalance as string);
  if (currentBal < amount) return false;

  const newBal = (currentBal - amount).toFixed(6);
  await db
    .update(usersTable)
    .set({ hnpBalance: newBal, updatedAt: new Date() })
    .where(eq(usersTable.discordId, discordId));

  return true;
}

export async function logBoxOpen(
  discordId: string,
  boxType: BoxType,
  rarity: Rarity,
  hnpAmount: number
) {
  await db.insert(openedBoxesTable).values({
    discordId,
    boxType,
    rarity,
    hnpAmount: hnpAmount.toFixed(6),
  });
}

export async function logWithdrawal(
  discordId: string,
  username: string,
  hnpAmount: number,
  walletAddress: string
) {
  await db.insert(withdrawalsTable).values({
    discordId,
    username,
    hnpAmount: hnpAmount.toFixed(6),
    walletAddress,
  });
}

export async function resetAllTpPoints() {
  await db.update(usersTable).set({ tpPoints: 0, updatedAt: new Date() });
  await db.delete(dailyActivityTable);
}

export async function adminAdjustTp(
  discordId: string,
  amount: number
): Promise<number> {
  const user = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.discordId, discordId))
    .limit(1);

  if (!user.length) return -1;

  const newTotal = Math.max(0, user[0].tpPoints + amount);
  await db
    .update(usersTable)
    .set({ tpPoints: newTotal, updatedAt: new Date() })
    .where(eq(usersTable.discordId, discordId));

  return newTotal;
}

export async function getBotConfig(key: string): Promise<string | null> {
  const result = await db
    .select()
    .from(botConfigTable)
    .where(eq(botConfigTable.key, key))
    .limit(1);
  return result.length > 0 ? result[0].value : null;
}

export async function setBotConfig(key: string, value: string) {
  const existing = await db
    .select()
    .from(botConfigTable)
    .where(eq(botConfigTable.key, key))
    .limit(1);

  if (existing.length > 0) {
    await db
      .update(botConfigTable)
      .set({ value, updatedAt: new Date() })
      .where(eq(botConfigTable.key, key));
  } else {
    await db.insert(botConfigTable).values({ key, value });
  }
}

export async function getUserByDiscordId(discordId: string) {
  const result = await db
    .select()
    .from(usersTable)
    .where(eq(usersTable.discordId, discordId))
    .limit(1);
  return result.length > 0 ? result[0] : null;
}
