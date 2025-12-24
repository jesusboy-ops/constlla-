/**
 * Blocks feed hook
 * Manages real-time block feed for 3D visualization
 */

import { useState, useEffect, useCallback, useRef } from 'react';
import { useChainStore } from '../state/useChainStore.js';
import { useUniverseStore } from '../state/useUniverseStore.js';
import { useSettingsStore } from '../state/useSettingsStore.js';
import rpcService from '../services/rpc.js';

export const useBlocksFeed = () => {
  const { activeChain } = useChainStore();
  const { addBlock, addTransaction, maxBlocks } = useUniverseStore();
  const { autoRefresh, refreshInterval, enableNotifications } = useSettingsStore();
  
  const [isActive, setIsActive] = useState(false);
  const [blockHistory, setBlockHistory] = useState([]);
  const [error, setError] = useState(null);
  
  const subscriptionRef = useRef(null);
  const lastProcessedBlock = useRef(0);

  /**
   * Process new block and add to universe
   */
  const processNewBlock = useCallback(async (block) => {
    if (!block || block.number <= lastProcessedBlock.current) {
      return;
    }

    try {
      // Add block to universe store
      addBlock(block);
      
      // Update block history
      setBlockHistory(prev => {
        const newHistory = [block, ...prev].slice(0, maxBlocks);
        return newHistory;
      });

      // Process transactions from the block
      if (block.transactions && block.transactions.length > 0) {
        // Process first few transactions for visualization
        const txsToProcess = block.transactions.slice(0, 5);
        
        for (const txHash of txsToProcess) {
          try {
            const tx = await rpcService.getTransaction(txHash, activeChain);
            if (tx) {
              addTransaction(tx);
            }
          } catch (txError) {
            console.error(`Error processing transaction ${txHash}:`, txError);
          }
        }
      }

      lastProcessedBlock.current = block.number;
      setError(null);
      
    } catch (err) {
      console.error('Error processing new block:', err);
      setError(err.message);
    }
  }, [addBlock, addTransaction, maxBlocks, activeChain]);

  /**
   * Start the blocks feed
   */
  const startFeed = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }

    setIsActive(true);
    setError(null);

    try {
      // Subscribe to new blocks
      const unsubscribe = rpcService.subscribeToBlocks(
        activeChain,
        processNewBlock,
        refreshInterval
      );
      
      subscriptionRef.current = unsubscribe;
      
    } catch (err) {
      console.error('Error starting blocks feed:', err);
      setError(err.message);
      setIsActive(false);
    }
  }, [activeChain, processNewBlock, refreshInterval]);

  /**
   * Stop the blocks feed
   */
  const stopFeed = useCallback(() => {
    if (subscriptionRef.current) {
      subscriptionRef.current();
      subscriptionRef.current = null;
    }
    setIsActive(false);
  }, []);

  /**
   * Restart the feed (useful for settings changes)
   */
  const restartFeed = useCallback(() => {
    stopFeed();
    setTimeout(() => {
      startFeed();
    }, 100);
  }, [stopFeed, startFeed]);

  /**
   * Load historical blocks
   */
  const loadHistoricalBlocks = useCallback(async (count = 10) => {
    try {
      setError(null);
      const latestBlock = await rpcService.getLatestBlock(activeChain);
      
      if (!latestBlock) return;

      const promises = [];
      const startBlock = Math.max(1, latestBlock.number - count + 1);
      
      for (let i = startBlock; i <= latestBlock.number; i++) {
        promises.push(rpcService.getBlock(i, activeChain));
      }

      const blocks = await Promise.allSettled(promises);
      const validBlocks = blocks
        .filter(result => result.status === 'fulfilled' && result.value)
        .map(result => result.value)
        .sort((a, b) => b.number - a.number);

      // Add blocks to universe
      validBlocks.forEach(block => {
        addBlock(block);
      });

      setBlockHistory(validBlocks);
      
      if (validBlocks.length > 0) {
        lastProcessedBlock.current = validBlocks[0].number;
      }

    } catch (err) {
      console.error('Error loading historical blocks:', err);
      setError(err.message);
    }
  }, [activeChain, addBlock]);

  /**
   * Get feed statistics
   */
  const getFeedStats = useCallback(() => {
    return {
      isActive,
      blocksProcessed: blockHistory.length,
      lastBlockNumber: lastProcessedBlock.current,
      chainName: activeChain,
      error: error
    };
  }, [isActive, blockHistory.length, activeChain, error]);

  // Effect to handle chain changes
  useEffect(() => {
    lastProcessedBlock.current = 0;
    setBlockHistory([]);
    setError(null);
    
    if (autoRefresh) {
      // Load some historical blocks first
      loadHistoricalBlocks(5).then(() => {
        startFeed();
      });
    }
    
    return () => {
      stopFeed();
    };
  }, [activeChain, autoRefresh, loadHistoricalBlocks, startFeed, stopFeed]);

  // Effect to handle settings changes
  useEffect(() => {
    if (isActive && autoRefresh) {
      restartFeed();
    } else if (!autoRefresh) {
      stopFeed();
    }
  }, [refreshInterval, autoRefresh, isActive, restartFeed, stopFeed]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopFeed();
    };
  }, [stopFeed]);

  return {
    // State
    isActive,
    blockHistory,
    error,
    
    // Actions
    startFeed,
    stopFeed,
    restartFeed,
    loadHistoricalBlocks,
    
    // Utils
    getFeedStats,
    
    // Data
    lastBlockNumber: lastProcessedBlock.current,
    totalBlocks: blockHistory.length
  };
};