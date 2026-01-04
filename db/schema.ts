import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';

export const userSettings = sqliteTable('user_settings', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  name: text('name').notNull(),
  primaryGoal: text('primary_goal').notNull(),
  onboardingCompleted: integer('onboarding_completed', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default('CURRENT_TIMESTAMP'),
  updatedAt: text('updated_at').default('CURRENT_TIMESTAMP'),
});

export const journalEntries = sqliteTable('journal_entries', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content'),
  mood: text('mood'),
  weather: text('weather'),
  location: text('location'),
  tags: text('tags'),
  isFavorite: integer('is_favorite', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const entryMedia = sqliteTable('entry_media', {
  id: text('id').primaryKey(),
  entryId: text('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  type: text('type').notNull(),
  uri: text('uri').notNull(),
  caption: text('caption'),
  timestamp: text('timestamp'),
  order: integer('order').default(0),
  createdAt: text('created_at').notNull(),
});

export const checklistItems = sqliteTable('checklist_items', {
  id: text('id').primaryKey(),
  entryId: text('entry_id').notNull().references(() => journalEntries.id, { onDelete: 'cascade' }),
  text: text('text').notNull(),
  isCompleted: integer('is_completed', { mode: 'boolean' }).default(false),
  order: integer('order').default(0),
});

export const albums = sqliteTable('albums', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  coverImageUri: text('cover_image_uri'),
  isPinned: integer('is_pinned', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
});

export const albumMedia = sqliteTable('album_media', {
  id: text('id').primaryKey(),
  albumId: text('album_id').notNull().references(() => albums.id, { onDelete: 'cascade' }),
  mediaId: text('media_id').notNull().references(() => entryMedia.id, { onDelete: 'cascade' }),
  addedAt: text('added_at').notNull(),
});

export type UserSettings = typeof userSettings.$inferSelect;
export type NewUserSettings = typeof userSettings.$inferInsert;
export type JournalEntry = typeof journalEntries.$inferSelect;
export type NewJournalEntry = typeof journalEntries.$inferInsert;
export type EntryMedia = typeof entryMedia.$inferSelect;
export type NewEntryMedia = typeof entryMedia.$inferInsert;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type NewChecklistItem = typeof checklistItems.$inferInsert;
export type Album = typeof albums.$inferSelect;
export type NewAlbum = typeof albums.$inferInsert;
