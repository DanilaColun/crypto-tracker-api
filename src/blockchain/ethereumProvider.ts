import { ExternalApiError } from '../errors/ExternalApiError';
import { Logger } from '../logger/logger';
import { blockchainConfig } from '../config/blockchainConfig';
import { postJson, HttpResponse } from '../clients/httpJsonClient';
import { requestWithRetry } from '../clients/requestWithRetry';
import { BalanceResult, BlockchainProvider } from './blockchainProvider';

type HttpClient = (url: string, body: unknown, options: { timeoutMs: number }) => Promise<HttpResponse>;

interface EthereumProviderOptions {
  httpClient?: HttpClient;
  logger?: Logger;
  baseUrl?: string;
  timeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
}

function readRpcResult(body: unknown): string {
  const data = body as { result?: unknown; error?: { message?: unknown } };

  if (data.error) {
    const message = typeof data.error.message === 'string' ? data.error.message : 'rpc error';
    throw new ExternalApiError(`Ethereum node returned error: ${message}`);
  }

  if (typeof data.result !== 'string') {
    throw new ExternalApiError('Ethereum node returned invalid data');
  }

  return data.result;
}

export class EthereumProvider implements BlockchainProvider {
  readonly chain = 'ETH';

  private httpClient: HttpClient;
  private logger?: Logger;
  private baseUrl: string;
  private timeoutMs: number;
  private retryCount: number;
  private retryDelayMs: number;

  constructor(options: EthereumProviderOptions = {}) {
    this.httpClient = options.httpClient ?? postJson;
    this.logger = options.logger;
    this.baseUrl = options.baseUrl ?? blockchainConfig.ethereum.baseUrl;
    this.timeoutMs = options.timeoutMs ?? blockchainConfig.timeoutMs;
    this.retryCount = options.retryCount ?? blockchainConfig.retryCount;
    this.retryDelayMs = options.retryDelayMs ?? blockchainConfig.retryDelayMs;
  }

  getHeight(options: { requestId?: string } = {}): Promise<number> {
    const body = { jsonrpc: '2.0', method: 'eth_blockNumber', params: [], id: 1 };

    return requestWithRetry(
      async () => {
        const response = await this.httpClient(this.baseUrl, body, { timeoutMs: this.timeoutMs });

        if (response.statusCode < 200 || response.statusCode >= 300) {
          throw new ExternalApiError('Ethereum node returned bad status', {
            requestId: options.requestId,
            context: { statusCode: response.statusCode },
          });
        }

        const result = readRpcResult(response.body);
        const height = Number.parseInt(result, 16);

        if (!Number.isInteger(height) || height < 0) {
          throw new ExternalApiError('Ethereum node returned invalid height', {
            requestId: options.requestId,
          });
        }

        return height;
      },
      {
        retryCount: this.retryCount,
        retryDelayMs: this.retryDelayMs,
        failureMessage: 'Ethereum node is not available',
        source: 'Ethereum',
        requestId: options.requestId,
        logger: this.logger,
      },
    );
  }

  getBalance(address: string, options: { requestId?: string } = {}): Promise<BalanceResult> {
    const body = { jsonrpc: '2.0', method: 'eth_getBalance', params: [address, 'latest'], id: 1 };

    return requestWithRetry(
      async () => {
        const response = await this.httpClient(this.baseUrl, body, { timeoutMs: this.timeoutMs });

        if (response.statusCode < 200 || response.statusCode >= 300) {
          throw new ExternalApiError('Ethereum node returned bad status', {
            requestId: options.requestId,
            context: { statusCode: response.statusCode },
          });
        }

        const result = readRpcResult(response.body);

        return {
          address,
          balance: BigInt(result).toString(),
          unit: 'wei',
        };
      },
      {
        retryCount: this.retryCount,
        retryDelayMs: this.retryDelayMs,
        failureMessage: 'Ethereum node is not available',
        source: 'Ethereum',
        requestId: options.requestId,
        logger: this.logger,
      },
    );
  }
}
