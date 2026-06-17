interface BlockchainNetworkConfig {
  baseUrl: string;
}

interface BlockchainConfig {
  timeoutMs: number;
  retryCount: number;
  retryDelayMs: number;
  bitcoin: BlockchainNetworkConfig;
  ethereum: BlockchainNetworkConfig;
}

export const blockchainConfig: BlockchainConfig = {
  timeoutMs: 5000,
  retryCount: 2,
  retryDelayMs: 300,
  bitcoin: {
    baseUrl: 'https://mempool.space/api',
  },
  ethereum: {
    baseUrl: 'https://ethereum-rpc.publicnode.com',
  },
};
