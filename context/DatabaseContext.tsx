import React, { createContext, useContext, useEffect, useState } from 'react';
import { initializeDatabase, webStorage, isWeb, getDb } from '@/db/client';
import * as schema from '@/db/schema';
import { v4 as uuidv4 } from 'uuid';

interface DatabaseContextType {
  isReady: boolean;
  userSettings: schema.UserSettings | null;
  entries: schema.JournalEntry[];
  albums: schema.Album[];
  saveUserSettings: (name: string, primaryGoal: string) => Promise<void>;
  createEntry: (entry: Omit<schema.NewJournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => Promise<string>;
  updateEntry: (id: string, entry: Partial<schema.JournalEntry>) => Promise<void>;
  deleteEntry: (id: string) => Promise<void>;
  getEntryById: (id: string) => Promise<schema.JournalEntry | null>;
  searchEntries: (query: string) => Promise<schema.JournalEntry[]>;
  getEntryMedia: (entryId: string) => Promise<schema.EntryMedia[]>;
  addMedia: (media: Omit<schema.NewEntryMedia, 'id' | 'createdAt'>) => Promise<string>;
  deleteMedia: (id: string) => Promise<void>;
  getChecklistItems: (entryId: string) => Promise<schema.ChecklistItem[]>;
  addChecklistItem: (item: Omit<schema.NewChecklistItem, 'id'>) => Promise<string>;
  updateChecklistItem: (id: string, item: Partial<schema.ChecklistItem>) => Promise<void>;
  deleteChecklistItem: (id: string) => Promise<void>;
  createAlbum: (name: string) => Promise<string>;
  updateAlbum: (id: string, album: Partial<schema.Album>) => Promise<void>;
  deleteAlbum: (id: string) => Promise<void>;
  getAllMedia: () => Promise<schema.EntryMedia[]>;
  refreshEntries: () => Promise<void>;
  refreshAlbums: () => Promise<void>;
}

const DatabaseContext = createContext<DatabaseContextType | null>(null);

export function DatabaseProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [userSettings, setUserSettings] = useState<schema.UserSettings | null>(null);
  const [entries, setEntries] = useState<schema.JournalEntry[]>([]);
  const [albums, setAlbums] = useState<schema.Album[]>([]);
  const [mediaItems, setMediaItems] = useState<schema.EntryMedia[]>([]);
  const [checklistItems, setChecklistItems] = useState<schema.ChecklistItem[]>([]);

  useEffect(() => {
    async function init() {
      await initializeDatabase();

      if (isWeb) {
        const settings = await webStorage.getUserSettings();
        if (settings) setUserSettings(settings);
        const storedEntries = await webStorage.getEntries();
        setEntries(storedEntries);
        const storedAlbums = await webStorage.getAlbums();
        setAlbums(storedAlbums);
        const storedMedia = await webStorage.getMedia();
        setMediaItems(storedMedia);
        const storedChecklist = await webStorage.getChecklist();
        setChecklistItems(storedChecklist);
      } else {
        const db = getDb();
        if (db) {
          try {
            const { desc } = require('drizzle-orm');
            const settings = await db.select().from(schema.userSettings).limit(1);
            if (settings.length > 0) {
              setUserSettings(settings[0]);
            }
            const entriesResult = await db.select().from(schema.journalEntries).orderBy(desc(schema.journalEntries.createdAt));
            setEntries(entriesResult);
            const albumsResult = await db.select().from(schema.albums).orderBy(desc(schema.albums.updatedAt));
            setAlbums(albumsResult);
          } catch (error) {
            console.warn('Error loading native data:', error);
          }
        }
      }
      setIsReady(true);
    }
    init();
  }, []);

  const refreshEntries = async () => {
    if (isWeb) {
      const storedEntries = await webStorage.getEntries();
      setEntries(storedEntries);
    } else {
      const db = getDb();
      if (db) {
        const { desc } = require('drizzle-orm');
        const result = await db.select().from(schema.journalEntries).orderBy(desc(schema.journalEntries.createdAt));
        setEntries(result);
      }
    }
  };

  const refreshAlbums = async () => {
    if (isWeb) {
      const storedAlbums = await webStorage.getAlbums();
      setAlbums(storedAlbums);
    } else {
      const db = getDb();
      if (db) {
        const { desc } = require('drizzle-orm');
        const result = await db.select().from(schema.albums).orderBy(desc(schema.albums.updatedAt));
        setAlbums(result);
      }
    }
  };

  const saveUserSettings = async (name: string, primaryGoal: string) => {
    const now = new Date().toISOString();

    if (isWeb) {
      const newSettings = {
        id: userSettings?.id || 1,
        name,
        primaryGoal,
        onboardingCompleted: true,
        createdAt: userSettings?.createdAt || now,
        updatedAt: now,
      };
      await webStorage.setUserSettings(newSettings);
      setUserSettings(newSettings as any);
    } else {
      const db = getDb();
      const { eq } = require('drizzle-orm');
      if (userSettings) {
        await db.update(schema.userSettings).set({ name, primaryGoal, updatedAt: now, onboardingCompleted: true }).where(eq(schema.userSettings.id, userSettings.id));
        setUserSettings({ ...userSettings, name, primaryGoal, onboardingCompleted: true, updatedAt: now });
      } else {
        const result = await db.insert(schema.userSettings).values({ name, primaryGoal, onboardingCompleted: true, createdAt: now, updatedAt: now }).returning();
        setUserSettings(result[0]);
      }
    }
  };

  const createEntry = async (entry: Omit<schema.NewJournalEntry, 'id' | 'createdAt' | 'updatedAt'>) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newEntry = { ...entry, id, createdAt: now, updatedAt: now, isFavorite: false };

    if (isWeb) {
      const updatedEntries = [newEntry as schema.JournalEntry, ...entries];
      await webStorage.setEntries(updatedEntries);
      setEntries(updatedEntries);
    } else {
      const db = getDb();
      await db.insert(schema.journalEntries).values(newEntry);
      await refreshEntries();
    }
    return id;
  };

  const updateEntry = async (id: string, entry: Partial<schema.JournalEntry>) => {
    const now = new Date().toISOString();

    if (isWeb) {
      const updatedEntries = entries.map((e) => e.id === id ? { ...e, ...entry, updatedAt: now } : e);
      await webStorage.setEntries(updatedEntries);
      setEntries(updatedEntries);
    } else {
      const db = getDb();
      const { eq } = require('drizzle-orm');
      await db.update(schema.journalEntries).set({ ...entry, updatedAt: now }).where(eq(schema.journalEntries.id, id));
      await refreshEntries();
    }
  };

  const deleteEntry = async (id: string) => {
    if (isWeb) {
      const updatedEntries = entries.filter((e) => e.id !== id);
      await webStorage.setEntries(updatedEntries);
      setEntries(updatedEntries);
    } else {
      const db = getDb();
      const { eq } = require('drizzle-orm');
      await db.delete(schema.journalEntries).where(eq(schema.journalEntries.id, id));
      await refreshEntries();
    }
  };

  const getEntryById = async (id: string) => {
    if (isWeb) {
      return entries.find((e) => e.id === id) || null;
    } else {
      const db = getDb();
      const { eq } = require('drizzle-orm');
      const result = await db.select().from(schema.journalEntries).where(eq(schema.journalEntries.id, id)).limit(1);
      return result.length > 0 ? result[0] : null;
    }
  };

  const searchEntries = async (query: string): Promise<schema.JournalEntry[]> => {
    if (!query.trim()) {
      return [];
    }

    const searchTerm = query.toLowerCase().trim();

    if (isWeb) {
      return entries.filter((entry) => {
        const titleMatch = entry.title.toLowerCase().includes(searchTerm);
        const contentMatch = entry.content?.toLowerCase().includes(searchTerm);
        const tagsMatch = entry.tags?.toLowerCase().includes(searchTerm);
        const moodMatch = entry.mood?.toLowerCase().includes(searchTerm);
        return titleMatch || contentMatch || tagsMatch || moodMatch;
      });
    } else {
      const db = getDb();
      const { or, like, desc } = require('drizzle-orm');
      const searchPattern = `%${searchTerm}%`;

      const result = await db
        .select()
        .from(schema.journalEntries)
        .where(
          or(
            like(schema.journalEntries.title, searchPattern),
            like(schema.journalEntries.content, searchPattern),
            like(schema.journalEntries.tags, searchPattern),
            like(schema.journalEntries.mood, searchPattern)
          )
        )
        .orderBy(desc(schema.journalEntries.createdAt));

      return result;
    }
  };

  const getEntryMedia = async (entryId: string) => {
    if (isWeb) {
      return mediaItems.filter((m) => m.entryId === entryId).sort((a, b) => (a.order || 0) - (b.order || 0));
    } else {
      const db = getDb();
      const { eq } = require('drizzle-orm');
      return await db.select().from(schema.entryMedia).where(eq(schema.entryMedia.entryId, entryId)).orderBy(schema.entryMedia.order);
    }
  };

  const addMedia = async (media: Omit<schema.NewEntryMedia, 'id' | 'createdAt'>) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newMedia = { ...media, id, createdAt: now };

    if (isWeb) {
      const updatedMedia = [...mediaItems, newMedia as schema.EntryMedia];
      await webStorage.setMedia(updatedMedia);
      setMediaItems(updatedMedia);
    } else {
      const db = getDb();
      await db.insert(schema.entryMedia).values(newMedia);
    }
    return id;
  };

  const deleteMedia = async (id: string) => {
    if (isWeb) {
      const updatedMedia = mediaItems.filter((m) => m.id !== id);
      await webStorage.setMedia(updatedMedia);
      setMediaItems(updatedMedia);
    } else {
      const db = getDb();
      const { eq } = require('drizzle-orm');
      await db.delete(schema.entryMedia).where(eq(schema.entryMedia.id, id));
    }
  };

  const getChecklistItems = async (entryId: string) => {
    if (isWeb) {
      return checklistItems.filter((c) => c.entryId === entryId).sort((a, b) => (a.order || 0) - (b.order || 0));
    } else {
      const db = getDb();
      const { eq } = require('drizzle-orm');
      return await db.select().from(schema.checklistItems).where(eq(schema.checklistItems.entryId, entryId)).orderBy(schema.checklistItems.order);
    }
  };

  const addChecklistItem = async (item: Omit<schema.NewChecklistItem, 'id'>) => {
    const id = uuidv4();
    const newItem = { ...item, id };

    if (isWeb) {
      const updatedItems = [...checklistItems, newItem as schema.ChecklistItem];
      await webStorage.setChecklist(updatedItems);
      setChecklistItems(updatedItems);
    } else {
      const db = getDb();
      await db.insert(schema.checklistItems).values(newItem);
    }
    return id;
  };

  const updateChecklistItem = async (id: string, item: Partial<schema.ChecklistItem>) => {
    if (isWeb) {
      const updatedItems = checklistItems.map((c) => c.id === id ? { ...c, ...item } : c);
      await webStorage.setChecklist(updatedItems);
      setChecklistItems(updatedItems);
    } else {
      const db = getDb();
      const { eq } = require('drizzle-orm');
      await db.update(schema.checklistItems).set(item).where(eq(schema.checklistItems.id, id));
    }
  };

  const deleteChecklistItem = async (id: string) => {
    if (isWeb) {
      const updatedItems = checklistItems.filter((c) => c.id !== id);
      await webStorage.setChecklist(updatedItems);
      setChecklistItems(updatedItems);
    } else {
      const db = getDb();
      const { eq } = require('drizzle-orm');
      await db.delete(schema.checklistItems).where(eq(schema.checklistItems.id, id));
    }
  };

  const createAlbum = async (name: string) => {
    const id = uuidv4();
    const now = new Date().toISOString();
    const newAlbum = { id, name, coverImageUri: null, isPinned: false, createdAt: now, updatedAt: now };

    if (isWeb) {
      const updatedAlbums = [newAlbum as schema.Album, ...albums];
      await webStorage.setAlbums(updatedAlbums);
      setAlbums(updatedAlbums);
    } else {
      const db = getDb();
      await db.insert(schema.albums).values(newAlbum);
      await refreshAlbums();
    }
    return id;
  };

  const updateAlbum = async (id: string, album: Partial<schema.Album>) => {
    const now = new Date().toISOString();

    if (isWeb) {
      const updatedAlbums = albums.map((a) => a.id === id ? { ...a, ...album, updatedAt: now } : a);
      await webStorage.setAlbums(updatedAlbums);
      setAlbums(updatedAlbums);
    } else {
      const db = getDb();
      const { eq } = require('drizzle-orm');
      await db.update(schema.albums).set({ ...album, updatedAt: now }).where(eq(schema.albums.id, id));
      await refreshAlbums();
    }
  };

  const deleteAlbum = async (id: string) => {
    if (isWeb) {
      const updatedAlbums = albums.filter((a) => a.id !== id);
      await webStorage.setAlbums(updatedAlbums);
      setAlbums(updatedAlbums);
    } else {
      const db = getDb();
      const { eq } = require('drizzle-orm');
      await db.delete(schema.albums).where(eq(schema.albums.id, id));
      await refreshAlbums();
    }
  };

  const getAllMedia = async () => {
    if (isWeb) {
      return [...mediaItems].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else {
      const db = getDb();
      const { desc } = require('drizzle-orm');
      return await db.select().from(schema.entryMedia).orderBy(desc(schema.entryMedia.createdAt));
    }
  };

  return (
    <DatabaseContext.Provider
      value={{
        isReady,
        userSettings,
        entries,
        albums,
        saveUserSettings,
        createEntry,
        updateEntry,
        deleteEntry,
        getEntryById,
        searchEntries,
        getEntryMedia,
        addMedia,
        deleteMedia,
        getChecklistItems,
        addChecklistItem,
        updateChecklistItem,
        deleteChecklistItem,
        createAlbum,
        updateAlbum,
        deleteAlbum,
        getAllMedia,
        refreshEntries,
        refreshAlbums,
      }}
    >
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase() {
  const context = useContext(DatabaseContext);
  if (!context) {
    throw new Error('useDatabase must be used within a DatabaseProvider');
  }
  return context;
}
