import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const isWeb = Platform.OS === 'web';

let db: any = null;

const STORAGE_KEYS = {
  USER_SETTINGS: '@journal_user_settings',
  ENTRIES: '@journal_entries',
  MEDIA: '@journal_media',
  CHECKLIST: '@journal_checklist',
  ALBUMS: '@journal_albums',
};

async function getStorageData<T>(key: string, defaultValue: T): Promise<T> {
  try {
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch {
    return defaultValue;
  }
}

async function setStorageData<T>(key: string, data: T): Promise<void> {
  try {
    await AsyncStorage.setItem(key, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving to storage:', error);
  }
}

export const webStorage = {
  getUserSettings: () => getStorageData(STORAGE_KEYS.USER_SETTINGS, null),
  setUserSettings: (data: any) => setStorageData(STORAGE_KEYS.USER_SETTINGS, data),
  getEntries: () => getStorageData(STORAGE_KEYS.ENTRIES, []),
  setEntries: (data: any[]) => setStorageData(STORAGE_KEYS.ENTRIES, data),
  getMedia: () => getStorageData(STORAGE_KEYS.MEDIA, []),
  setMedia: (data: any[]) => setStorageData(STORAGE_KEYS.MEDIA, data),
  getChecklist: () => getStorageData(STORAGE_KEYS.CHECKLIST, []),
  setChecklist: (data: any[]) => setStorageData(STORAGE_KEYS.CHECKLIST, data),
  getAlbums: () => getStorageData(STORAGE_KEYS.ALBUMS, []),
  setAlbums: (data: any[]) => setStorageData(STORAGE_KEYS.ALBUMS, data),
};

export async function initializeDatabase() {
  if (isWeb) {
    return true;
  }

  try {
    const SQLite = require('expo-sqlite');
    const { drizzle } = require('drizzle-orm/expo-sqlite');
    const schema = require('./schema');

    const expoDb = SQLite.openDatabaseSync('journal.db');
    db = drizzle(expoDb, { schema });

    await expoDb.execAsync(`
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        primary_goal TEXT NOT NULL,
        onboarding_completed INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

      CREATE TABLE IF NOT EXISTS journal_entries (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT,
        mood TEXT,
        weather TEXT,
        location TEXT,
        tags TEXT,
        is_favorite INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS entry_media (
        id TEXT PRIMARY KEY,
        entry_id TEXT NOT NULL,
        type TEXT NOT NULL,
        uri TEXT NOT NULL,
        caption TEXT,
        timestamp TEXT,
        "order" INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS checklist_items (
        id TEXT PRIMARY KEY,
        entry_id TEXT NOT NULL,
        text TEXT NOT NULL,
        is_completed INTEGER DEFAULT 0,
        "order" INTEGER DEFAULT 0,
        FOREIGN KEY (entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS albums (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        cover_image_uri TEXT,
        is_pinned INTEGER DEFAULT 0,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );

      CREATE TABLE IF NOT EXISTS album_media (
        id TEXT PRIMARY KEY,
        album_id TEXT NOT NULL,
        media_id TEXT NOT NULL,
        added_at TEXT NOT NULL,
        FOREIGN KEY (album_id) REFERENCES albums(id) ON DELETE CASCADE,
        FOREIGN KEY (media_id) REFERENCES entry_media(id) ON DELETE CASCADE
      );
    `);

    return true;
  } catch (error) {
    console.warn('Native SQLite not available:', error);
    return false;
  }
}

export function getDb() {
  return db;
}
