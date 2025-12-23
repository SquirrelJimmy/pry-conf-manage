import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppLocale = 'zh-CN' | 'en-US';
export type ThemeMode = 'light' | 'dark';

type AppPreferencesState = {
  siderCollapsed: boolean;
  themeMode: ThemeMode;
  locale: AppLocale;
  setSiderCollapsed: (collapsed: boolean) => void;
  toggleThemeMode: () => void;
  setLocale: (locale: AppLocale) => void;
};

export const useAppPreferencesStore = create<AppPreferencesState>()(
  persist(
    (set) => ({
      siderCollapsed: false,
      themeMode: 'light',
      locale: 'zh-CN',
      setSiderCollapsed: (collapsed) => set({ siderCollapsed: collapsed }),
      toggleThemeMode: () =>
        set((s) => ({ themeMode: s.themeMode === 'dark' ? 'light' : 'dark' })),
      setLocale: (locale) => set({ locale }),
    }),
    {
      name: 'pry.web.preferences.v1',
      version: 1,
    },
  ),
);

