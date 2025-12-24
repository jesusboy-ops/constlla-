/**
 * Blockchain data hook
 * Manages blockchain data fetching and real-time updates
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useChainStore } from '../state/useChainStore.js';
import { useAppStore } from '../state/useAppStore.js';
import { useSettingsStore } from '../state/useSettingsStore.js';
import fetcherService from '../services/fetcher.js';
import rpcService from '../services/rpc.js';

export const useBlockchain = () => {
  const { activeChain, updateNetworkStats } = useChainStore();
  const { addNotification } = useAppStore();
  const { autoRefresh, refreshInterval, enableNotifications } = useSettingsStore();
  
  const [latestBlock, setLatestBlock] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const intervalRef = useRef(null);
  const lastBlockNumber = useRef(0);

  /**
   * Fetch latest blockchain metrics
   */
  const fetchMetrics = useCallback(async () => {
    try {
      setError(null);
      const metricsData = await fetcherService.getBlockchainMetrics(activeChain);
      setMetrics(metricsData);
      updateNetworkStats(activeChain, metricsData);
      return metricsData;
    } catch (err) {
      console.error('Error fetching blockchain metrics:', err);
      setError(err.message);
      return null;
    }
  }, [activeChain, updateNetworkStats]);

  /**
   * Fetch latest block
   */
  const fetchLatestBlock = useCallback(async () => {
    try {
      setError(null);
      const block = await rpcService.getLatestBlock(activeChain);
      
      if (block && block.number > lastBlockNumber.current) {
        setLatestBlock(block);
        lastBlockNumber.current = block.number;
        
        // Show notification for new block
        if (enableNotifications && lastBlockNumber.current > 0) {
          addNotification({
            type: 'success',
            title: 'New Block',
            message: `Block #${block.number} mined on ${activeChain}`,
            duration: 3000
          });
        }
        
        return block;
      }
      
      return null;
    } catch (err) {
      console.error('Error fetching latest block:', err);
      setError(err.message);
      return null;
    }
  }, [activeChain, enableNotifications, addNotification]);

  /**
   * Fetch block by number
   */
  const fetchBlock = useCallback(async (blockNumber) => {
    try {
      setLoading(true);
      setError(null);
      const block = await rpcService.getBlock(blockNumber, activeChain);
      return block;
    } catch (err) {
      console.error(`Error fetching block ${blockNumber}:`, err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeChain]);

  /**
   * Fetch transaction details
   */
  const fetchTransaction = useCallback(async (txHash) => {
    try {
      setLoading(true);
      setError(null);
      const transaction = await rpcService.getTransaction(txHash, activeChain);
      return transaction;
    } catch (err) {
      console.error(`Error fetching transaction ${txHash}:`, err);
      setError(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  }, [activeChain]);

  /**
   * Get gas price information
   */
  const fetchGasPrice = useCallback(async () => {
    try {
      const gasData = await rpcService.getGasPrice(activeChain);
      return gasData;
    } catch (err) {
      console.error('Error fetching gas price:', err);
      return null;
    }
  }, [activeChain]);

  /**
   * Start real-time monitoring
   */
  const startMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }

    const monitor = async () => {
      await Promise.all([
        fetchLatestBlock(),
        fetchMetrics()
      ]);
    };

    // Initial fetch
    monitor();

    // Set up interval
    if (autoRefresh) {
      intervalRef.current = setInterval(monitor, refreshInterval);
    }
  }, [fetchLatestBlock, fetchMetrics, autoRefresh, refreshInterval]);

  /**
   * Stop monitoring
   */
  const stopMonitoring = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Refresh data manually
   */
  const refresh = useCallback(async () => {
    setLoading(true);
    try {
      await Promise.all([
        fetchLatestBlock(),
        fetchMetrics()
      ]);
    } finally {
      setLoading(false);
    }
  }, [fetchLatestBlock, fetchMetrics]);

  // Effect to handle chain changes
  useEffect(() => {
    lastBlockNumber.current = 0;
    setLatestBlock(null);
    setMetrics(null);
    setError(null);
    
    startMonitoring();
    
    return () => {
      stopMonitoring();
    };
  }, [activeChain, startMonitoring, stopMonitoring]);

  // Effect to handle settings changes
  useEffect(() => {
    if (autoRefresh) {
      startMonitoring();
    } else {
      stopMonitoring();
    }
  }, [autoRefresh, refreshInterval, startMonitoring, stopMonitoring]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopMonitoring();
    };
  }, [stopMonitoring]);

  return {
    // Data
    latestBlock,
    metrics,
    loading,
    error,
    
    // Actions
    fetchBlock,
    fetchTransaction,
    fetchGasPrice,
    refresh,
    startMonitoring,
    stopMonitoring,
    
    // Status
    isMonitoring: !!intervalRef.current
  };
};