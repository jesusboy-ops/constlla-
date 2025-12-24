/**
 * Etherscan API Service
 * Handles contract ABI fetching and metadata retrieval
 */

import axios from 'axios';
import { SUPPORTED_CHAINS } from './chains.js';

// Etherscan API Key (use environment variable)
const ETHERSCAN_API_KEY = import.meta.env.VITE_ETHERSCAN_API_KEY || '';

class EtherscanService {
  constructor() {
    this.apiKey = ETHERSCAN_API_KEY;
    this.cache = new Map();
    this.rateLimitDelay = 200; // 200ms between requests
    this.lastRequestTime = 0;
  }

  /**
   * Rate limiting helper
   */
  async rateLimit() {
    const now = Date.now();
    const timeSinceLastRequest = now - this.lastRequestTime;
    
    if (timeSinceLastRequest < this.rateLimitDelay) {
      await new Promise(resolve => 
        setTimeout(resolve, this.rateLimitDelay - timeSinceLastRequest)
      );
    }
    
    this.lastRequestTime = Date.now();
  }

  /**
   * Get API URL for specific chain
   */
  getApiUrl(chainName = 'ethereum') {
    const chain = SUPPORTED_CHAINS[chainName];
    if (!chain || !chain.etherscanApi) {
      throw new Error(`Etherscan API not supported for chain: ${chainName}`);
    }
    return chain.etherscanApi;
  }

  /**
   * Make API request with rate limiting
   */
  async makeRequest(url, params, chainName = 'ethereum') {
    await this.rateLimit();
    
    const cacheKey = `${chainName}-${JSON.stringify(params)}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }

    try {
      const apiUrl = this.getApiUrl(chainName);
      const response = await axios.get(apiUrl, {
        params: {
          ...params,
          apikey: this.apiKey
        },
        timeout: 10000
      });

      if (response.data.status === '1') {
        this.cache.set(cacheKey, response.data.result);
        return response.data.result;
      } else {
        throw new Error(response.data.message || 'API request failed');
      }
    } catch (error) {
      console.error('Etherscan API request failed:', error);
      throw error;
    }
  }

  /**
   * Get contract ABI
   */
  async getContractABI(address, chainName = 'ethereum') {
    try {
      const result = await this.makeRequest('', {
        module: 'contract',
        action: 'getabi',
        address: address
      }, chainName);

      return JSON.parse(result);
    } catch (error) {
      console.error(`Error fetching ABI for ${address} on ${chainName}:`, error);
      return null;
    }
  }

  /**
   * Get contract source code
   */
  async getContractSource(address, chainName = 'ethereum') {
    try {
      const result = await this.makeRequest('', {
        module: 'contract',
        action: 'getsourcecode',
        address: address
      }, chainName);

      return result[0];
    } catch (error) {
      console.error(`Error fetching source code for ${address} on ${chainName}:`, error);
      return null;
    }
  }

  /**
   * Get contract creation transaction
   */
  async getContractCreation(address, chainName = 'ethereum') {
    try {
      const result = await this.makeRequest('', {
        module: 'contract',
        action: 'getcontractcreation',
        contractaddresses: address
      }, chainName);

      return result[0];
    } catch (error) {
      console.error(`Error fetching contract creation for ${address} on ${chainName}:`, error);
      return null;
    }
  }

  /**
   * Get comprehensive contract data
   */
  async getContractData(address, chainName = 'ethereum') {
    try {
      const [abi, source, creation] = await Promise.allSettled([
        this.getContractABI(address, chainName),
        this.getContractSource(address, chainName),
        this.getContractCreation(address, chainName)
      ]);

      const contractData = {
        address,
        chainName,
        abi: abi.status === 'fulfilled' ? abi.value : null,
        source: source.status === 'fulfilled' ? source.value : null,
        creation: creation.status === 'fulfilled' ? creation.value : null,
        isVerified: false,
        functions: [],
        events: []
      };

      // Process ABI if available
      if (contractData.abi && Array.isArray(contractData.abi)) {
        contractData.isVerified = true;
        contractData.functions = contractData.abi.filter(item => 
          item.type === 'function'
        ).map(func => ({
          name: func.name,
          type: func.stateMutability || 'nonpayable',
          inputs: func.inputs || [],
          outputs: func.outputs || [],
          isReadOnly: func.stateMutability === 'view' || func.stateMutability === 'pure'
        }));

        contractData.events = contractData.abi.filter(item => 
          item.type === 'event'
        );
      }

      // Add metadata from source
      if (contractData.source) {
        contractData.contractName = contractData.source.ContractName;
        contractData.compilerVersion = contractData.source.CompilerVersion;
        contractData.optimizationUsed = contractData.source.OptimizationUsed === '1';
      }

      return contractData;
    } catch (error) {
      console.error(`Error fetching contract data for ${address} on ${chainName}:`, error);
      return {
        address,
        chainName,
        isVerified: false,
        error: error.message
      };
    }
  }

  /**
   * Check if address is a contract
   */
  async isContract(address, chainName = 'ethereum') {
    try {
      const source = await this.getContractSource(address, chainName);
      return source && source.SourceCode && source.SourceCode.length > 0;
    } catch (error) {
      return false;
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

// Export singleton instance
export const etherscanService = new EtherscanService();
export default etherscanService;