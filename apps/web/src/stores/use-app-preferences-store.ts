import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppLocale = 'zh-CN' | 'en-US';
export type ThemeMode = 'light' | 'dark' | 'system';

type AppPreferencesState = {
  siderCollapsed: boolean;
  themeMode: ThemeMode;
  locale: AppLocale;
  setSiderCollapsed: (collapsed: boolean) => void;
  setThemeMode: (themeMode: ThemeMode) => void;
  cycleThemeMode: () => void;
  setLocale: (locale: AppLocale) => void;
};

export const useAppPreferencesStore = create<AppPreferencesState>()(
  persist(
    (set) => ({
      siderCollapsed: false,
      themeMode: 'light',
      locale: 'zh-CN',
      setSiderCollapsed: (collapsed) => set({ siderCollapsed: collapsed }),
      setThemeMode: (themeMode) => set({ themeMode }),
      cycleThemeMode: () =>
        set((s) => ({
          themeMode:
            s.themeMode === 'light'
              ? 'dark'
              : s.themeMode === 'dark'
                ? 'system'
                : 'light',
        })),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'pry.web.preferences.v1',
      version: 2,
      migrate: (persisted, version) => {
        const base =
          persisted && typeof persisted === 'object'
            ? (persisted as Record<string, unknown>)
            : {};

        if (version === 1) {
          const state = base as { themeMode?: 'light' | 'dark' };
          return { ...base, themeMode: state.themeMode ?? 'light' };
        }
        return base;
      },
    },
  ),
);
