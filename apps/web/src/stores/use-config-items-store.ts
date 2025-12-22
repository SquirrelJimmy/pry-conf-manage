import { create } from 'zustand';

type ConfigItem = {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

type ConfigItemsState = {
  items: ConfigItem[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  upsert: (key: string, value: string) => Promise<void>;
};

export const useConfigItemsStore = create<ConfigItemsState>((set, get) => ({
  items: [],
  loading: false,
  error: null,
  refresh: async () => {
    set({ loading: true, error: null });
    try {
      const res = await fetch('/api/config-items');
      if (!res.ok) {
        throw new Error(`请求失败: ${res.status} ${res.statusText}`);
      }
      const data = (await res.json()) as ConfigItem[];
      set({ items: data, loading: false });
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '未知错误', loading: false });
    }
  },
  upsert: async (key: string, value: string) => {
    if (!key) return;
    set({ error: null });
    try {
      const res = await fetch(`/api/config-items/${encodeURIComponent(key)}`, {
        method: 'PUT',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ value }),
      });
      if (!res.ok) {
        throw new Error(`保存失败: ${res.status} ${res.statusText}`);
      }
      await get().refresh();
    } catch (e) {
      set({ error: e instanceof Error ? e.message : '未知错误' });
    }
  },
}));

