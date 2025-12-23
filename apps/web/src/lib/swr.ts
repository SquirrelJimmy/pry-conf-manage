import { useAuthStore } from '../stores/use-auth-store';
import { requestJson } from './http';

export async function swrFetcher(key: string) {
  const token = useAuthStore.getState().token;
  const headers = token ? { authorization: `Bearer ${token}` } : undefined;
  return requestJson(key, { headers });
}
