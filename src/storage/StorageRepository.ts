/**
 * AI Website Inspector — Storage Repository
 * Abstraction layer for persistent storage (chrome.storage.local / memory fallback).
 */

import { CompleteInspectionResult } from '../shared/types';

export interface IStorageRepository {
  saveInspection(result: CompleteInspectionResult): Promise<void>;
  getInspection(id: string): Promise<CompleteInspectionResult | null>;
  getHistory(): Promise<CompleteInspectionResult[]>;
  deleteInspection(id: string): Promise<void>;
  clearHistory(): Promise<void>;
  togglePin(id: string): Promise<boolean>;
  getPinnedReports(): Promise<CompleteInspectionResult[]>;
  cacheLatestReport(result: CompleteInspectionResult): Promise<void>;
  getCachedLatestReport(): Promise<CompleteInspectionResult | null>;
}

const STORAGE_KEY_HISTORY = 'INSPECTOR_HISTORY';
const STORAGE_KEY_PINNED = 'INSPECTOR_PINNED_IDS';
const STORAGE_KEY_LATEST_CACHE = 'INSPECTOR_LATEST_CACHE';

class ExtensionStorageRepository implements IStorageRepository {
  private memoryFallback = new Map<string, unknown>();

  private async getRaw<T>(key: string): Promise<T | null> {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const res = await chrome.storage.local.get(key);
      return (res[key] as T) || null;
    }
    const val = this.memoryFallback.get(key) || localStorage?.getItem(key);
    if (!val) return null;
    return typeof val === 'string' ? JSON.parse(val) : (val as T);
  }

  private async setRaw<T>(key: string, value: T): Promise<void> {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ [key]: value });
      return;
    }
    this.memoryFallback.set(key, value);
    if (typeof localStorage !== 'undefined') {
      localStorage.setItem(key, JSON.stringify(value));
    }
  }

  public async saveInspection(result: CompleteInspectionResult): Promise<void> {
    const history = (await this.getHistory()) || [];
    // Deduplicate by URL or ID
    const filtered = history.filter((item) => item.id !== result.id && item.url !== result.url);
    filtered.unshift(result);
    // Keep max 50 recent inspections
    const capped = filtered.slice(0, 50);
    await this.setRaw(STORAGE_KEY_HISTORY, capped);
    await this.cacheLatestReport(result);
  }

  public async getInspection(id: string): Promise<CompleteInspectionResult | null> {
    const history = await this.getHistory();
    return history.find((item) => item.id === id) || null;
  }

  public async getHistory(): Promise<CompleteInspectionResult[]> {
    return (await this.getRaw<CompleteInspectionResult[]>(STORAGE_KEY_HISTORY)) || [];
  }

  public async deleteInspection(id: string): Promise<void> {
    const history = await this.getHistory();
    const filtered = history.filter((item) => item.id !== id);
    await this.setRaw(STORAGE_KEY_HISTORY, filtered);

    const pinnedIds = (await this.getRaw<string[]>(STORAGE_KEY_PINNED)) || [];
    if (pinnedIds.includes(id)) {
      await this.setRaw(
        STORAGE_KEY_PINNED,
        pinnedIds.filter((pId) => pId !== id)
      );
    }
  }

  public async clearHistory(): Promise<void> {
    await this.setRaw(STORAGE_KEY_HISTORY, []);
    await this.setRaw(STORAGE_KEY_PINNED, []);
  }

  public async togglePin(id: string): Promise<boolean> {
    const pinnedIds = (await this.getRaw<string[]>(STORAGE_KEY_PINNED)) || [];
    const index = pinnedIds.indexOf(id);
    if (index === -1) {
      pinnedIds.push(id);
      await this.setRaw(STORAGE_KEY_PINNED, pinnedIds);
      return true;
    } else {
      pinnedIds.splice(index, 1);
      await this.setRaw(STORAGE_KEY_PINNED, pinnedIds);
      return false;
    }
  }

  public async getPinnedReports(): Promise<CompleteInspectionResult[]> {
    const history = await this.getHistory();
    const pinnedIds = (await this.getRaw<string[]>(STORAGE_KEY_PINNED)) || [];
    return history.filter((item) => pinnedIds.includes(item.id));
  }

  public async cacheLatestReport(result: CompleteInspectionResult): Promise<void> {
    await this.setRaw(STORAGE_KEY_LATEST_CACHE, result);
  }

  public async getCachedLatestReport(): Promise<CompleteInspectionResult | null> {
    return await this.getRaw<CompleteInspectionResult>(STORAGE_KEY_LATEST_CACHE);
  }
}

export const storageRepository = new ExtensionStorageRepository();
