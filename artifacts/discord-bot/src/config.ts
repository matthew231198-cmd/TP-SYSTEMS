export const BOX_TYPES = {
  fun: {
    name: "Fun Box",
    cost: 100,
    emoji: "🎁",
    rarities: {
      common: 0.50,
      uncommon: 0.30,
      rare: 0.12,
      epic: 0.06,
      legendary: 0.02,
    },
  },
  calev: {
    name: "Calev Box",
    cost: 200,
    emoji: "📦",
    rarities: {
      common: 0.30,
      uncommon: 0.40,
      rare: 0.15,
      epic: 0.12,
      legendary: 0.03,
    },
  },
  chate: {
    name: "Chate Box",
    cost: 300,
    emoji: "💎",
    rarities: {
      common: 0.20,
      uncommon: 0.50,
      rare: 0.10,
      epic: 0.15,
      legendary: 0.05,
    },
  },
} as const;

export type BoxType = keyof typeof BOX_TYPES;

export const HNP_REWARDS = {
  common: { min: 0.002, max: 0.018 },
  uncommon: { min: 0.02, max: 0.1 },
  rare: { min: 0.12, max: 0.2 },
  epic: { min: 0.2, max: 1.0 },
  legendary: { min: 1.0, max: 2.0 },
} as const;

export type Rarity = keyof typeof HNP_REWARDS;

export const RARITY_COLORS = {
  common: 0x9e9e9e,
  uncommon: 0x4caf50,
  rare: 0x2196f3,
  epic: 0x9c27b0,
  legendary: 0xffc107,
} as const;

export const RARITY_EMOJIS = {
  common: "⚪",
  uncommon: "🟢",
  rare: "🔵",
  epic: "🟣",
  legendary: "🌟",
} as const;

export const MIN_MESSAGE_LENGTH = 10;
export const MAX_DAILY_TP = 100;
