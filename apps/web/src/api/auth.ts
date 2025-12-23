import useSWRMutation from 'swr/mutation';
import type { AuthUser } from '../stores/use-auth-store';
import { requestJson } from '../lib/http';

export type LoginInput = {
  username: string;
  password: string;
};

export type LoginResponse = {
  accessToken: string;
  user: AuthUser;
};

async function loginFetcher(url: string, { arg }: { arg: LoginInput }) {
  return requestJson<LoginResponse>(url, {
    method: 'POST',
    json: arg,
  });
}

export function useLoginMutation() {
  return useSWRMutation('/api/auth/login', loginFetcher);
}

