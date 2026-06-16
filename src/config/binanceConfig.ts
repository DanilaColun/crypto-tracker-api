interface BinanceConfig {
  baseUrl: string;
  pricesPath: string;
  timeoutMs: number;
  retryCount: number;
  retryDelayMs: number;
}

export const binanceConfig: BinanceConfig = {
  baseUrl: 'https://data-api.binance.vision',
  pricesPath: '/api/v3/ticker/price',
  timeoutMs: 5000,
  retryCount: 2,
  retryDelayMs: 300,
};
