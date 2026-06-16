import { ExternalApiError } from '../errors/ExternalApiError';
import { Logger } from '../logger/logger';
import { binanceConfig } from '../config/binanceConfig';
import { requestJson, HttpResponse } from '../clients/httpJsonClient';
import { Price } from '../repositories/priceRepository';

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

type HttpClient = (url: string, options: { timeoutMs: number }) => Promise<HttpResponse>;

interface BinanceServiceOptions {
  httpClient?: HttpClient;
  logger?: Logger;
  baseUrl?: string;
  pricesPath?: string;
  timeoutMs?: number;
  retryCount?: number;
  retryDelayMs?: number;
}

export class BinanceService {
  private baseUrl: string;
  private pricesPath: string;
  private timeoutMs: number;
  private retryCount: number;
  private retryDelayMs: number;
  private httpClient: HttpClient;
  private logger?: Logger;

  constructor(options: BinanceServiceOptions = {}) {
    this.baseUrl = options.baseUrl ?? binanceConfig.baseUrl;
    this.pricesPath = options.pricesPath ?? binanceConfig.pricesPath;
    this.timeoutMs = options.timeoutMs ?? binanceConfig.timeoutMs;
    this.retryCount = options.retryCount ?? binanceConfig.retryCount;
    this.retryDelayMs = options.retryDelayMs ?? binanceConfig.retryDelayMs;
    this.httpClient = options.httpClient ?? requestJson;
    this.logger = options.logger;
  }

  async getAllPrices(options: { requestId?: string } = {}): Promise<Price[]> {
    const requestId = options.requestId;
    const url = `${this.baseUrl}${this.pricesPath}`;

    let lastError: unknown = null;

    for (let attempt = 1; attempt <= this.retryCount + 1; attempt += 1) {
      try {
        const response = await this.httpClient(url, { timeoutMs: this.timeoutMs });

        if (response.statusCode < 200 || response.statusCode >= 300) {
          throw new ExternalApiError('Binance returned bad status', {
            requestId,
            context: { statusCode: response.statusCode, attempt },
          });
        }

        if (!Array.isArray(response.body)) {
          throw new ExternalApiError('Binance returned invalid data', {
            requestId,
            context: { attempt },
          });
        }

        return this.normalizePrices(response.body, { requestId });
      } catch (error) {
        lastError = error;

        if (this.logger) {
          const message = error instanceof Error ? error.message : String(error);
          this.logger.warn(`Binance request failed: ${message}`, { requestId });
        }

        if (attempt <= this.retryCount) {
          await wait(this.retryDelayMs);
        }
      }
    }

    if (lastError instanceof ExternalApiError) {
      throw lastError;
    }

    const reason = lastError instanceof Error ? lastError.message : 'Unknown error';

    throw new ExternalApiError('Binance is not available', {
      requestId,
      context: { reason },
    });
  }

  private normalizePrices(prices: unknown[], options: { requestId?: string } = {}): Price[] {
    const normalizedPrices: Price[] = prices
      .filter((item): item is { symbol: string; price: string } => {
        return (
          typeof item === 'object' &&
          item !== null &&
          typeof (item as { symbol?: unknown }).symbol === 'string' &&
          typeof (item as { price?: unknown }).price === 'string'
        );
      })
      .map((item) => {
        return { symbol: item.symbol, price: item.price };
      });

    if (normalizedPrices.length === 0) {
      throw new ExternalApiError('Binance returned empty prices', {
        requestId: options.requestId,
      });
    }

    return normalizedPrices;
  }
}
