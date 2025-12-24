/**
 * Blockchain network configurations
 * Contains RPC endpoints and chain metadata for supported networks
 */

export const SUPPORTED_CHAINS = {
  ethereum: {
    id: 1,
    name: 'Ethereum',
    symbol: 'ETH',
    rpcUrl: 'https://eth.drpc.org',
    explorerUrl: 'https://etherscan.io',
    color: '#627EEA',
    etherscanApi: 'https://api.etherscan.io/api'
  },
  polygon: {
    id: 137,
    name: 'Polygon',
    symbol: 'MATIC',
    rpcUrl: 'https://polygon-rpc.com',
    explorerUrl: 'https://polygonscan.com',
    color: '#8247E5',
    etherscanApi: 'https://api.polygonscan.com/api'
  },
  base: {
    id: 8453,
    name: 'Base',
    symbol: 'ETH',
    rpcUrl: 'https://base-rpc.publicnode.com',
    explorerUrl: 'https://basescan.org',
    color: '#0052FF',
    etherscanApi: 'https://api.basescan.org/api'
  },
  arbitrum: {
    id: 42161,
    name: 'Arbitrum',
    symbol: 'ETH',
    rpcUrl: 'https://arbitrum.llamarpc.com',
    explorerUrl: 'https://arbiscan.io',
    color: '#28A0F0',
    etherscanApi: 'https://api.arbiscan.io/api'
  },
  optimism: {
    id: 10,
    name: 'Optimism',
    symbol: 'ETH',
    rpcUrl: 'https://optimism.publicnode.com',
    explorerUrl: 'https://optimistic.etherscan.io',
    color: '#FF0420',
    etherscanApi: 'https://api-optimistic.etherscan.io/api'
  },
  bsc: {
    id: 56,
    name: 'BSC',
    symbol: 'BNB',
    rpcUrl: 'https://bsc-dataseed.bnbchain.org',
    explorerUrl: 'https://bscscan.com',
    color: '#F3BA2F',
    etherscanApi: 'https://api.bscscan.com/api'
  }
};

export const DEFAULT_CHAIN = 'ethereum';

export const getChainById = (chainId) => {
  return Object.values(SUPPORTED_CHAINS).find(chain => chain.id === chainId);
};

export const getChainByName = (name) => {
  return SUPPORTED_CHAINS[name.toLowerCase()];
};