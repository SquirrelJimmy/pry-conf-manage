import useSWR, { useSWRConfig } from 'swr';
import useSWRMutation from 'swr/mutation';
import { requestJson } from '../lib/http';
import { useAuthStore } from '../stores/use-auth-store';

export type ConfigItem = {
  id: string;
  key: string;
  value: string;
  createdAt: string;
  updatedAt: string;
};

function authHeaders() {
  const token = useAuthStore.getState().token;
  return token ? { authorization: `Bearer ${token}` } : undefined;
}

export function useConfigItems() {
  return useSWR<ConfigItem[]>('/api/config-items');
}

async function upsertFetcher(
  url: string,
  { arg }: { arg: { key: string; value: string } },
) {
  const safeKey = encodeURIComponent(arg.key);
  return requestJson<void>(`${url}/${safeKey}`, {
    method: 'PUT',
    headers: authHeaders(),
    json: { value: arg.value },
  });
}

export function useUpsertConfigItem() {
  const { mutate } = useSWRConfig();
  const mutation = useSWRMutation('/api/config-items', upsertFetcher, {
    onSuccess: async () => {
      await mutate('/api/config-items');
    },
  });
  return mutation;
}
