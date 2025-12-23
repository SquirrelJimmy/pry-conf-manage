export class HttpError extends Error {
  status: number;
  body?: unknown;

  constructor(message: string, status: number, body?: unknown) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.body = body;
  }
}

type JsonRequestInit = Omit<RequestInit, 'body'> & {
  json?: unknown;
};

async function tryReadJson(res: Response) {
  const contentType = res.headers.get('content-type') || '';
  if (!contentType.toLowerCase().includes('application/json')) return null;
  try {
    return await res.json();
  } catch {
    return null;
  }
}

export async function requestJson<T>(url: string, init?: JsonRequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  headers.set('accept', 'application/json');

  let body: BodyInit | undefined = undefined;
  if (init && 'json' in init) {
    headers.set('content-type', 'application/json');
    body = JSON.stringify(init.json);
  }

  const res = await fetch(url, {
    ...init,
    headers,
    body,
  });

  if (!res.ok) {
    const data = await tryReadJson(res);
    const text = data ? '' : await res.text().catch(() => '');
    const message =
      (typeof data === 'object' && data && 'message' in (data as any) && (data as any).message
        ? String((data as any).message)
        : text) || `请求失败: ${res.status} ${res.statusText}`;
    throw new HttpError(message, res.status, data ?? text);
  }

  const data = await tryReadJson(res);
  return data as T;
}

