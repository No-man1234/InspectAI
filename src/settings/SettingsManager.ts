/**
 * AI Website Inspector — Settings Manager
 * Manages user configurations with validation and defaults.
 */

import { UserSettings } from '../shared/types';
import { DEFAULT_SETTINGS } from '../shared/constants';

const STORAGE_KEY_SETTINGS = 'INSPECTOR_USER_SETTINGS';

export class SettingsManager {
  private static instance: SettingsManager;

  private constructor() {}

  public static getInstance(): SettingsManager {
    if (!SettingsManager.instance) {
      SettingsManager.instance = new SettingsManager();
    }
    return SettingsManager.instance;
  }

  public async getSettings(): Promise<UserSettings> {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      const stored = await chrome.storage.local.get(STORAGE_KEY_SETTINGS);
      if (stored[STORAGE_KEY_SETTINGS]) {
        return { ...DEFAULT_SETTINGS, ...stored[STORAGE_KEY_SETTINGS] };
      }
    } else if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(STORAGE_KEY_SETTINGS);
      if (raw) {
        try {
          return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
        } catch {
          // ignore parsing errors
        }
      }
    }
    return DEFAULT_SETTINGS;
  }

  public async saveSettings(newSettings: Partial<UserSettings>): Promise<UserSettings> {
    const current = await this.getSettings();
    const updated: UserSettings = { ...current, ...newSettings };

    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ [STORAGE_KEY_SETTINGS]: updated });
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(updated));
    }
    return updated;
  }

  public async resetToDefaults(): Promise<UserSettings> {
    if (typeof chrome !== 'undefined' && chrome.storage?.local) {
      await chrome.storage.local.set({ [STORAGE_KEY_SETTINGS]: DEFAULT_SETTINGS });
    } else if (typeof localStorage !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SETTINGS, JSON.stringify(DEFAULT_SETTINGS));
    }
    return DEFAULT_SETTINGS;
  }
}

export const settingsManager = SettingsManager.getInstance();
