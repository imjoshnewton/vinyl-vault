import {
  pgTable,
  text,
  timestamp,
  uuid,
  varchar,
  integer,
  boolean,
  index,
  pgEnum,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const recordTypeEnum = pgEnum("record_type", ["LP", "Single", "EP"]);
export const recordConditionEnum = pgEnum("record_condition", [
  "Mint",
  "Near Mint",
  "Very Good Plus",
  "Very Good",
  "Good Plus",
  "Good",
  "Fair",
  "Poor",
]);

export const users = pgTable("vinyl_vault_users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  email: varchar("email", { length: 255 }).notNull(),
  name: varchar("name", { length: 255 }),
  username: varchar("username", { length: 50 }).unique(),
  imageUrl: text("image_url"),
  isPublic: boolean("is_public").default(false),
  discogsUsername: varchar("discogs_username", { length: 100 }),
  discogsAccessToken: text("discogs_access_token"),
  discogsTokenSecret: text("discogs_token_secret"),
  discogsSyncEnabled: boolean("discogs_sync_enabled").default(false),
  lastDiscogsSync: timestamp("last_discogs_sync"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => ({
  usernameIdx: index("username_idx").on(table.username),
  discogsUsernameIdx: index("discogs_username_idx").on(table.discogsUsername),
}));

export const vinylRecords = pgTable(
  "vinyl_vault_records",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    artist: varchar("artist", { length: 255 }).notNull(),
    title: varchar("title", { length: 255 }).notNull(),
    label: varchar("label", { length: 255 }),
    catalogNumber: varchar("catalog_number", { length: 100 }),
    releaseYear: integer("release_year"),
    genre: varchar("genre", { length: 100 }),
    type: recordTypeEnum("type").notNull().default("LP"),
    condition: recordConditionEnum("condition").default("Very Good"),
    notes: text("notes"),
    imageUrl: text("image_url"),
    coverImageUrl: text("cover_image_url"), // Higher res cover
    backCoverUrl: text("back_cover_url"),
    labelImageUrl: text("label_image_url"),
    additionalImages: text("additional_images").array().default([]),
    purchasePrice: integer("purchase_price"), // Store in cents
    purchaseDate: timestamp("purchase_date"),
    isWishlist: boolean("is_wishlist").default(false),
    rating: integer("rating"), // 1-5 stars
    playCount: integer("play_count").default(0),
    lastPlayedAt: timestamp("last_played_at"),
    // Discogs integration fields
    discogsReleaseId: varchar("discogs_release_id", { length: 50 }),
    discogsMasterId: varchar("discogs_master_id", { length: 50 }),
    discogsInstanceId: varchar("discogs_instance_id", { length: 50 }),
    lastDiscogsSyncAt: timestamp("last_discogs_sync_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("user_id_idx").on(table.userId),
    artistIdx: index("artist_idx").on(table.artist),
    typeIdx: index("type_idx").on(table.type),
    wishlistIdx: index("wishlist_idx").on(table.isWishlist),
    discogsReleaseIdx: index("discogs_release_idx").on(table.discogsReleaseId),
    discogsInstanceIdx: index("discogs_instance_idx").on(table.discogsInstanceId),
  })
);

export const playHistory = pgTable(
  "vinyl_vault_play_history",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recordId: uuid("record_id")
      .notNull()
      .references(() => vinylRecords.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    playedAt: timestamp("played_at").defaultNow().notNull(),
    notes: text("notes"),
  },
  (table) => ({
    recordIdIdx: index("record_id_idx").on(table.recordId),
    userIdIdx: index("play_history_user_id_idx").on(table.userId),
  })
);

export const listeningLogs = pgTable(
  "vinyl_vault_listening_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recordId: uuid("record_id")
      .notNull()
      .references(() => vinylRecords.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    playedAt: timestamp("played_at").defaultNow().notNull(),
    
    // Ritual/context
    mood: varchar("mood", { length: 100 }),
    location: varchar("location", { length: 255 }),
    weather: varchar("weather", { length: 100 }),
    occasion: varchar("occasion", { length: 255 }),
    
    // Gear chain
    turntable: varchar("turntable", { length: 255 }),
    cartridge: varchar("cartridge", { length: 255 }),
    amplifier: varchar("amplifier", { length: 255 }),
    speakers: varchar("speakers", { length: 255 }),
    headphones: varchar("headphones", { length: 255 }),
    
    // Condition
    preClean: boolean("pre_clean").default(false),
    conditionNotes: text("condition_notes"),
    
    // Notes
    notes: text("notes"),
    favoriteTracks: text("favorite_tracks").array().default([]),
    rating: integer("rating"),
    
    // Social
    guests: text("guests").array().default([]),
    sharedToSocial: boolean("shared_to_social").default(false),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    recordIdIdx: index("listening_logs_record_idx").on(table.recordId),
    userIdIdx: index("listening_logs_user_idx").on(table.userId),
    playedAtIdx: index("listening_logs_played_at_idx").on(table.playedAt),
  })
);

export const guestComments = pgTable(
  "vinyl_vault_guest_comments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    recordId: uuid("record_id")
      .notNull()
      .references(() => vinylRecords.id, { onDelete: "cascade" }),
    collectionOwnerId: uuid("collection_owner_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    
    // Guest info
    guestName: varchar("guest_name", { length: 255 }).notNull(),
    guestEmail: varchar("guest_email", { length: 255 }),
    
    // Comment
    comment: text("comment").notNull(),
    rating: integer("rating"),
    
    // Moderation
    approved: boolean("approved").default(true),
    hidden: boolean("hidden").default(false),
    
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    recordIdIdx: index("guest_comments_record_idx").on(table.recordId),
    ownerIdIdx: index("guest_comments_owner_idx").on(table.collectionOwnerId),
    createdAtIdx: index("guest_comments_created_idx").on(table.createdAt),
  })
);

export const nowSpinning = pgTable(
  "vinyl_vault_now_spinning",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    recordId: uuid("record_id")
      .references(() => vinylRecords.id, { onDelete: "set null" }),
    
    // State
    isActive: boolean("is_active").default(true),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    side: varchar("side", { length: 10 }),
    
    // Queue
    queueRecordIds: uuid("queue_record_ids").array().default([]),
    
    // Settings
    showLyrics: boolean("show_lyrics").default(false),
    showNotes: boolean("show_notes").default(true),
    autoAdvance: boolean("auto_advance").default(false),
    
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("now_spinning_user_idx").on(table.userId),
    activeIdx: index("now_spinning_active_idx").on(table.isActive),
  })
);

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  vinylRecords: many(vinylRecords),
  playHistory: many(playHistory),
  listeningLogs: many(listeningLogs),
  nowSpinning: many(nowSpinning),
  guestComments: many(guestComments),
}));

export const vinylRecordsRelations = relations(vinylRecords, ({ one, many }) => ({
  user: one(users, {
    fields: [vinylRecords.userId],
    references: [users.id],
  }),
  playHistory: many(playHistory),
  listeningLogs: many(listeningLogs),
  guestComments: many(guestComments),
}));

export const playHistoryRelations = relations(playHistory, ({ one }) => ({
  record: one(vinylRecords, {
    fields: [playHistory.recordId],
    references: [vinylRecords.id],
  }),
  user: one(users, {
    fields: [playHistory.userId],
    references: [users.id],
  }),
}));

export const listeningLogsRelations = relations(listeningLogs, ({ one }) => ({
  record: one(vinylRecords, {
    fields: [listeningLogs.recordId],
    references: [vinylRecords.id],
  }),
  user: one(users, {
    fields: [listeningLogs.userId],
    references: [users.id],
  }),
}));

export const guestCommentsRelations = relations(guestComments, ({ one }) => ({
  record: one(vinylRecords, {
    fields: [guestComments.recordId],
    references: [vinylRecords.id],
  }),
  owner: one(users, {
    fields: [guestComments.collectionOwnerId],
    references: [users.id],
  }),
}));

export const nowSpinningRelations = relations(nowSpinning, ({ one }) => ({
  user: one(users, {
    fields: [nowSpinning.userId],
    references: [users.id],
  }),
  record: one(vinylRecords, {
    fields: [nowSpinning.recordId],
    references: [vinylRecords.id],
  }),
}));

// Types
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type VinylRecord = typeof vinylRecords.$inferSelect;
export type NewVinylRecord = typeof vinylRecords.$inferInsert;
export type PlayHistory = typeof playHistory.$inferSelect;
export type NewPlayHistory = typeof playHistory.$inferInsert;
export type ListeningLog = typeof listeningLogs.$inferSelect;
export type NewListeningLog = typeof listeningLogs.$inferInsert;
export type GuestComment = typeof guestComments.$inferSelect;
export type NewGuestComment = typeof guestComments.$inferInsert;
export type NowSpinning = typeof nowSpinning.$inferSelect;
export type NewNowSpinning = typeof nowSpinning.$inferInsert;