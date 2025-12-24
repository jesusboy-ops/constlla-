/**
 * Unified data fetcher service
 * Combines RPC and Etherscan services for comprehensive blockchain data
 */

import rpcService from './rpc.js';
import etherscanService from './etherscan.js';

class FetcherService {
  constructor() {
    this.rpc = rpcService;
    this.etherscan = etherscanService;
  }

  /**
   * Fetch enriched block data with contract information
   */
  async getEnrichedBlock(blockNumber, chainName = 'ethereum') {
    try {
      const block = await this.rpc.getBlock(blockNumber, chainName);
      
      if (!block) return null;

      // Enrich transactions with contract data
      const enrichedTransactions = await Promise.all(
        block.transactions.slice(0, 10).map(async (txHash) => {
          try {
            const tx = await this.rpc.getTransaction(txHash, chainName);
            
            // Check if 'to' address is a contract
            if (tx.to) {
              const isContract = await this.etherscan.isContract(tx.to, chainName);
              tx.isContractInteraction = isContract;
            }
            
            return tx;
          } catch (error) {
            console.error(`Error enriching transaction ${txHash}:`, error);
            return null;
          }
        })
      );

      return {
        ...block,
        enrichedTransactions: enrichedTransactions.filter(Boolean)
      };
    } catch (error) {
      console.error(`Error fetching enriched block ${blockNumber}:`, error);
      throw error;
    }
  }

  /**
   * Fetch popular contracts for visualization
   */
  async getPopularContracts(chainName = 'ethereum') {
    // Popular contract addresses by chain
    const popularContracts = {
      ethereum: [
        '0xA0b86a33E6441b8C4505E2c52Bb0C4E6c8C8b9F5', // USDC
        '0xdAC17F958D2ee523a2206206994597C13D831ec7', // USDT
        '0x1f9840a85d5aF5bf1D1762F925BDADdC4201F984', // UNI
        '0x7Fc66500c84A76Ad7e9c93437bFc5Ac33E2DDaE9', // AAVE
        '0x514910771AF9Ca656af840dff83E8264EcF986CA'  // LINK
      ],
      polygon: [
        '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174', // USDC
        '0xc2132D05D31c914a87C6611C10748AEb04B58e8F', // USDT
        '0x0d500B1d8E8eF31E21C99d1Db9A6444d3ADf1270'  // WMATIC
      ],
      base: [
        '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913', // USDC
        '0x4200000000000000000000000000000000000006'  // WETH
      ]
    };

    const contracts = popularContracts[chainName] || popularContracts.ethereum;
    
    const contractData = await Promise.all(
      contracts.map(async (address) => {
        try {
          return await this.etherscan.getContractData(address, chainName);
        } catch (error) {
          console.error(`Error fetching contract ${address}:`, error);
          return null;
        }
      })
    );

    return contractData.filter(Boolean);
  }

  /**
   * Get real-time blockchain metrics
   */
  async getBlockchainMetrics(chainName = 'ethereum') {
    try {
      const [networkStats, gasPrice, latestBlock] = await Promise.all([
        this.rpc.getNetworkStats(chainName),
        this.rpc.getGasPrice(chainName),
        this.rpc.getLatestBlock(chainName)
      ]);

      // Calculate TPS (simplified)
      const blockTime = chainName === 'ethereum' ? 12 : 
                       chainName === 'polygon' ? 2 : 
                       chainName === 'base' ? 2 : 12;
      
      const tps = latestBlock ? (latestBlock.transactionCount / blockTime).toFixed(2) : '0';

      return {
        chainName,
        blockNumber: networkStats.blockNumber,
        gasPrice: gasPrice.gasPrice,
        maxFeePerGas: gasPrice.maxFeePerGas,
        tps,
        blockTime,
        transactionCount: latestBlock?.transactionCount || 0,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Error fetching blockchain metrics for ${chainName}:`, error);
      throw error;
    }
  }

  /**
   * Search for contracts by partial address or name
   */
  async searchContracts(query, chainName = 'ethereum') {
    // This is a simplified search - in production, you'd use a proper indexing service
    if (query.startsWith('0x') && query.length >= 10) {
      try {
        const contractData = await this.etherscan.getContractData(query, chainName);
        return contractData.isVerified ? [contractData] : [];
      } catch (error) {
        return [];
      }
    }
    
    // For name-based search, return popular contracts that match
    const popularContracts = await this.getPopularContracts(chainName);
    return popularContracts.filter(contract => 
      contract.contractName && 
      contract.contractName.toLowerCase().includes(query.toLowerCase())
    );
  }
}

// Export singleton instance
export const fetcherService = new FetcherService();
export default fetcherService;