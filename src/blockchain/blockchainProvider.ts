export interface BalanceResult {
  address: string;
  balance: string;
  unit: string;
}

export interface BlockchainProvider {
  readonly chain: string;
  getHeight(options?: { requestId?: string }): Promise<number>;
  getBalance(address: string, options?: { requestId?: string }): Promise<BalanceResult>;
}
