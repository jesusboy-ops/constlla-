/**
 * Contract data hook
 * Manages smart contract data fetching and visualization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useChainStore } from '../state/useChainStore.js';
import { useUniverseStore } from '../state/useUniverseStore.js';
import etherscanService from '../services/etherscan.js';
import fetcherService from '../services/fetcher.js';

export const useContractData = () => {
  const { activeChain } = useChainStore();
  const { addContract, contracts } = useUniverseStore();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [popularContracts, setPopularContracts] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  
  const cacheRef = useRef(new Map());

  /**
   * Fetch contract data by address
   */
  const fetchContract = useCallback(async (address) => {
    const cacheKey = `${activeChain}-${address}`;
    
    // Check cache first
    if (cacheRef.current.has(cacheKey)) {
      return cacheRef.current.get(cacheKey);
    }

    try {
      setLoading(true);
      setError(null);
      
      const contractData = await etherscanService.getContractData(address, activeChain);
      
      if (contractData && contractData.isVerified) {
        // Cache the result
        cacheRef.current.set(cacheKey, contractData);
        
        // Add to universe if not already there
        if (!contracts.has(address)) {
          addContract(contractData);
        }
      }
      
      return contractData;
    } catch (err) {
      console.error(`Error fetching contract ${address}:`, err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeChain, contracts, addContract]);

  /**
   * Fetch contract ABI only
   */
  const fetchContractABI = useCallback(async (address) => {
    try {
      const abi = await etherscanService.getContractABI(address, activeChain);
      return abi;
    } catch (err) {
      console.error(`Error fetching ABI for ${address}:`, err);
      return null;
    }
  }, [activeChain]);

  /**
   * Check if address is a contract
   */
  const isContract = useCallback(async (address) => {
    try {
      return await etherscanService.isContract(address, activeChain);
    } catch (err) {
      console.error(`Error checking if ${address} is contract:`, err);
      return false;
    }
  }, [activeChain]);

  /**
   * Load popular contracts for the current chain
   */
  const loadPopularContracts = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const contracts = await fetcherService.getPopularContracts(activeChain);
      setPopularContracts(contracts);
      
      // Add verified contracts to universe
      contracts.forEach(contract => {
        if (contract.isVerified) {
          addContract(contract);
        }
      });
      
      return contracts;
    } catch (err) {
      console.error('Error loading popular contracts:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [activeChain, addContract]);

  /**
   * Search contracts by query
   */
  const searchContracts = useCallback(async (query) => {
    if (!query || query.length < 3) {
      setSearchResults([]);
      return [];
    }

    try {
      setLoading(true);
      setError(null);
      
      const results = await fetcherService.searchContracts(query, activeChain);
      setSearchResults(results);
      
      return results;
    } catch (err) {
      console.error('Error searching contracts:', err);
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  }, [activeChain]);

  /**
   * Analyze contract functions for visualization
   */
  const analyzeContractFunctions = useCallback((contractData) => {
    if (!contractData || !contractData.functions) {
      return {
        readFunctions: [],
        writeFunctions: [],
        payableFunctions: [],
        totalFunctions: 0
      };
    }

    const readFunctions = contractData.functions.filter(f => f.isReadOnly);
    const writeFunctions = contractData.functions.filter(f => !f.isReadOnly && f.type !== 'payable');
    const payableFunctions = contractData.functions.filter(f => f.type === 'payable');

    return {
      readFunctions,
      writeFunctions,
      payableFunctions,
      totalFunctions: contractData.functions.length,
      complexity: contractData.functions.length > 50 ? 'high' : 
                  contractData.functions.length > 20 ? 'medium' : 'low'
    };
  }, []);

  /**
   * Generate contract visualization data
   */
  const generateVisualizationData = useCallback((contractData) => {
    if (!contractData || !contractData.functions) {
      return null;
    }

    const analysis = analyzeContractFunctions(contractData);
    
    // Create nodes for D3 force graph
    const nodes = [
      // Main contract node
      {
        id: contractData.address,
        type: 'contract',
        name: contractData.contractName || 'Contract',
        address: contractData.address,
        size: 20,
        color: '#3B82F6'
      },
      // Function nodes
      ...contractData.functions.map((func, index) => ({
        id: `${contractData.address}-${func.name}-${index}`,
        type: 'function',
        name: func.name,
        functionType: func.type,
        isReadOnly: func.isReadOnly,
        inputs: func.inputs.length,
        outputs: func.outputs.length,
        size: 8 + func.inputs.length * 2,
        color: func.isReadOnly ? '#10B981' : 
               func.type === 'payable' ? '#F59E0B' : '#EF4444'
      }))
    ];

    // Create links between contract and functions
    const links = contractData.functions.map((func, index) => ({
      source: contractData.address,
      target: `${contractData.address}-${func.name}-${index}`,
      strength: func.isReadOnly ? 0.3 : 0.7
    }));

    return {
      nodes,
      links,
      analysis,
      metadata: {
        address: contractData.address,
        name: contractData.contractName,
        isVerified: contractData.isVerified,
        chainName: contractData.chainName
      }
    };
  }, [analyzeContractFunctions]);

  /**
   * Clear cache
   */
  const clearCache = useCallback(() => {
    cacheRef.current.clear();
  }, []);

  // Effect to load popular contracts when chain changes
  useEffect(() => {
    clearCache();
    setPopularContracts([]);
    setSearchResults([]);
    setError(null);
    
    loadPopularContracts();
  }, [activeChain, loadPopularContracts, clearCache]);

  return {
    // State
    loading,
    error,
    popularContracts,
    searchResults,
    
    // Actions
    fetchContract,
    fetchContractABI,
    isContract,
    loadPopularContracts,
    searchContracts,
    clearCache,
    
    // Analysis
    analyzeContractFunctions,
    generateVisualizationData,
    
    // Utils
    getCachedContract: (address) => cacheRef.current.get(`${activeChain}-${address}`),
    isCached: (address) => cacheRef.current.has(`${activeChain}-${address}`)
  };
};