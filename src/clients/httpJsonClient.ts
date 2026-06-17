import axios from 'axios';

export interface HttpResponse {
  statusCode: number;
  body: unknown;
}

interface RequestJsonOptions {
  timeoutMs?: number;
}

export async function requestJson(url: string, options: RequestJsonOptions = {}): Promise<HttpResponse> {
  const timeoutMs = options.timeoutMs ?? 5000;

  const response = await axios.get(url, {
    timeout: timeoutMs,
    validateStatus: () => true,
  });

  return {
    statusCode: response.status,
    body: response.data,
  };
}

export async function postJson(
  url: string,
  body: unknown,
  options: RequestJsonOptions = {},
): Promise<HttpResponse> {
  const timeoutMs = options.timeoutMs ?? 5000;

  const response = await axios.post(url, body, {
    timeout: timeoutMs,
    validateStatus: () => true,
  });

  return {
    statusCode: response.status,
    body: response.data,
  };
}
