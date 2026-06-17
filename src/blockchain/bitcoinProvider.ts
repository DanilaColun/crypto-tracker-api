import { ExternalApiError } from '../errors/ExternalApiError';
import { Logger } from '../logger/logger';
import { blockchainConfig } from '../config/blockchainConfig';
import { requestJson, HttpResponse } from '../clients/httpJsonClient';
import { requestWithRetry } from '../clients/requestWithRetry';
import { BalanceResult, BlockchainProvider } from './blockchainProvider';

type HttpClient = (url: string, options: { timeoutMs: number }) => Promise<HttpResponse>;

interface BitcoinProviderOptions {
  httpClient?: HttpClient;
  logger?: Logger;
  baseUrl?: string;
  timeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
}

export class BitcoinProvider implements BlockchainProvider {
  readonly chain = 'BTC';

  private httpClient: HttpClient;
  private logger?: Logger;
  private baseUrl: string;
  private timeoutMs: number;
  private retryCount: number;
  private retryDelayMs: number;

  constructor(options: BitcoinProviderOptions = {}) {
    this.httpClient = options.httpClient ?? requestJson;
    this.logger = options.logger;
    this.baseUrl = options.baseUrl ?? blockchainConfig.bitcoin.baseUrl;
    this.timeoutMs = options.timeoutMs ?? blockchainConfig.timeoutMs;
    this.retryCount = options.retryCount ?? blockchainConfig.retryCount;
    this.retryDelayMs = options.retryDelayMs ?? blockchainConfig.retryDelayMs;
  }

  getHeight(options: { requestId?: string } = {}): Promise<number> {
    const url = `${this.baseUrl}/blocks/tip/height`;

    return requestWithRetry(
      async () => {
        const response = await this.httpClient(url, { timeoutMs: this.timeoutMs });

        if (response.statusCode < 200 || response.statusCode >= 300) {
          throw new ExternalApiError('Bitcoin node returned bad status', {
            requestId: options.requestId,
            context: { statusCode: response.statusCode },
          });
        }

        const height = Number(response.body);

        if (!Number.isInteger(height) || height < 0) {
          throw new ExternalApiError('Bitcoin node returned invalid height', {
            requestId: options.requestId,
          });
        }

        return height;
      },
      {
        retryCount: this.retryCount,
        retryDelayMs: this.retryDelayMs,
        failureMessage: 'Bitcoin node is not available',
        source: 'Bitcoin',
        requestId: options.requestId,
        logger: this.logger,
      },
    );
  }

  getBalance(address: string, options: { requestId?: string } = {}): Promise<BalanceResult> {
    const url = `${this.baseUrl}/address/${address}`;

    return requestWithRetry(
      async () => {
        const response = await this.httpClient(url, { timeoutMs: this.timeoutMs });

        if (response.statusCode < 200 || response.statusCode >= 300) {
          throw new ExternalApiError('Bitcoin node returned bad status', {
            requestId: options.requestId,
            context: { statusCode: response.statusCode },
          });
        }

        const stats = (response.body as {
          chain_stats?: { funded_txo_sum?: unknown; spent_txo_sum?: unknown };
        }).chain_stats;

        if (
          !stats ||
          typeof stats.funded_txo_sum !== 'number' ||
          typeof stats.spent_txo_sum !== 'number'
        ) {
          throw new ExternalApiError('Bitcoin node returned invalid balance', {
            requestId: options.requestId,
          });
        }

        const balance = stats.funded_txo_sum - stats.spent_txo_sum;

        return {
          address,
          balance: String(balance),
          unit: 'satoshi',
        };
      },
      {
        retryCount: this.retryCount,
        retryDelayMs: this.retryDelayMs,
        failureMessage: 'Bitcoin node is not available',
        source: 'Bitcoin',
        requestId: options.requestId,
        logger: this.logger,
      },
    );
  }
}
