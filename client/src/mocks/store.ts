import { createInitialStore } from './seedData';
import type { DemoStore } from './types';

const STORAGE_KEY = 'smart-leads-demo-v1';

let memoryStore: DemoStore | null = null;

export const getStore = (): DemoStore => {
  if (memoryStore) return memoryStore;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      memoryStore = JSON.parse(raw) as DemoStore;
      return memoryStore;
    }
  } catch {
    /* reset corrupt data */
  }
  memoryStore = createInitialStore();
  saveStore();
  return memoryStore;
};

export const saveStore = (): void => {
  if (!memoryStore) return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(memoryStore));
};

export const resetStore = (): DemoStore => {
  memoryStore = createInitialStore();
  saveStore();
  return memoryStore;
};

export const nextId = (prefix: string): string =>
  `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
