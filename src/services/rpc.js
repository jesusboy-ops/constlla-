/**
 * RPC Service for blockchain data fetching
 * Handles all blockchain interactions via public RPC endpoints
 */

import { ethers } from 'ethers';
import { SUPPORTED_CHAINS } from './chains.js';

class RPCService {
  constructor() {
    this.providers = {};
    this.initializeProviders();
  }

  /**
   * Initialize providers for all supported chains
   */
  initializeProviders() {
    Object.entries(SUPPORTED_CHAINS).forEach(([key, chain]) => {
      try {
        this.providers[key] = new ethers.JsonRpcProvider(chain.rpcUrl);
      } catch (error) {
        console.error(`Failed to initialize provider for ${chain.name}:`, error);
      }
    });
  }

  /**
   * Get provider for specific chain
   */
  getProvider(chainName = 'ethereum') {
    const provider = this.providers[chainName];
    if (!provider) {
      throw new Error(`Provider not found for chain: ${chainName}`);
    }
    return provider;
  }

  /**
   * Fetch latest block
   */
  async getLatestBlock(chainName = 'ethereum') {
    try {
      const provider = this.getProvider(chainName);
      const block = await provider.getBlock('latest', true);
      return this.formatBlock(block, chainName);
    } catch (error) {
      console.error(`Error fetching latest block for ${chainName}:`, error);
      throw error;
    }
  }

  /**
   * Fetch block by number
   */
  async getBlock(blockNumber, chainName = 'ethereum') {
    try {
      const provider = this.getProvider(chainName);
      const block = await provider.getBlock(blockNumber, true);
      return this.formatBlock(block, chainName);
    } catch (error) {
      console.error(`Error fetching block ${blockNumber} for ${chainName}:`, error);
      throw error;
    }
  }

  /**
   * Fetch transaction details
   */
  async getTransaction(txHash, chainName = 'ethereum') {
    try {
      const provider = this.getProvider(chainName);
      const [tx, receipt] = await Promise.all([
        provider.getTransaction(txHash),
        provider.getTransactionReceipt(txHash)
      ]);
      
      return this.formatTransaction(tx, receipt, chainName);
    } catch (error) {
      console.error(`Error fetching transaction ${txHash} for ${chainName}:`, error);
      throw error;
    }
  }

  /**
   * Get current gas price
   */
  async getGasPrice(chainName = 'ethereum') {
    try {
      const provider = this.getProvider(chainName);
      const gasPrice = await provider.getFeeData();
      return {
        gasPrice: gasPrice.gasPrice ? ethers.formatUnits(gasPrice.gasPrice, 'gwei') : null,
        maxFeePerGas: gasPrice.maxFeePerGas ? ethers.formatUnits(gasPrice.maxFeePerGas, 'gwei') : null,
        maxPriorityFeePerGas: gasPrice.maxPriorityFeePerGas ? ethers.formatUnits(gasPrice.maxPriorityFeePerGas, 'gwei') : null
      };
    } catch (error) {
      console.error(`Error fetching gas price for ${chainName}:`, error);
      throw error;
    }
  }

  /**
   * Get network stats
   */
  async getNetworkStats(chainName = 'ethereum') {
    try {
      const provider = this.getProvider(chainName);
      const [blockNumber, gasPrice] = await Promise.all([
        provider.getBlockNumber(),
        this.getGasPrice(chainName)
      ]);

      return {
        blockNumber,
        gasPrice: gasPrice.gasPrice,
        chainName,
        timestamp: Date.now()
      };
    } catch (error) {
      console.error(`Error fetching network stats for ${chainName}:`, error);
      throw error;
    }
  }

  /**
   * Format block data for UI consumption
   */
  formatBlock(block, chainName) {
    if (!block) return null;

    return {
      number: block.number,
      hash: block.hash,
      parentHash: block.parentHash,
      timestamp: block.timestamp,
      gasLimit: block.gasLimit ? block.gasLimit.toString() : '0',
      gasUsed: block.gasUsed ? block.gasUsed.toString() : '0',
      baseFeePerGas: block.baseFeePerGas ? ethers.formatUnits(block.baseFeePerGas, 'gwei') : null,
      difficulty: block.difficulty ? block.difficulty.toString() : '0',
      miner: block.miner,
      transactionCount: block.transactions ? block.transactions.length : 0,
      transactions: block.transactions || [],
      chainName,
      size: block.transactions ? block.transactions.length * 100 : 0, // Approximate size
      reward: '2.0' // Simplified block reward
    };
  }

  /**
   * Format transaction data for UI consumption
   */
  formatTransaction(tx, receipt, chainName) {
    if (!tx) return null;

    return {
      hash: tx.hash,
      blockNumber: tx.blockNumber,
      blockHash: tx.blockHash,
      from: tx.from,
      to: tx.to,
      value: tx.value ? ethers.formatEther(tx.value) : '0',
      gasLimit: tx.gasLimit ? tx.gasLimit.toString() : '0',
      gasUsed: receipt?.gasUsed ? receipt.gasUsed.toString() : '0',
      gasPrice: tx.gasPrice ? ethers.formatUnits(tx.gasPrice, 'gwei') : '0',
      nonce: tx.nonce,
      data: tx.data,
      status: receipt?.status || 0,
      chainName,
      timestamp: Date.now() // Will be updated with block timestamp
    };
  }

  /**
   * Subscribe to new blocks (polling-based)
   */
  subscribeToBlocks(chainName = 'ethereum', callback, interval = 12000) {
    let lastBlockNumber = 0;

    const poll = async () => {
      try {
        const provider = this.getProvider(chainName);
        const currentBlockNumber = await provider.getBlockNumber();
        
        if (currentBlockNumber > lastBlockNumber) {
          const block = await this.getBlock(currentBlockNumber, chainName);
          lastBlockNumber = currentBlockNumber;
          callback(block);
        }
      } catch (error) {
        console.error(`Error polling blocks for ${chainName}:`, error);
      }
    };

    // Initial poll
    poll();
    
    // Set up interval
    const intervalId = setInterval(poll, interval);
    
    // Return cleanup function
    return () => clearInterval(intervalId);
  }
}

// Export singleton instance
export const rpcService = new RPCService();
export default rpcService;