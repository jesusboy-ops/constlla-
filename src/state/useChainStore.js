/**
 * Blockchain chain state store
 * Manages active chain, chain switching, and chain-specific data
 */

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { DEFAULT_CHAIN, SUPPORTED_CHAINS } from '../services/chains.js';

export const useChainStore = create(
  subscribeWithSelector((set, get) => ({
    // Current chain
    activeChain: DEFAULT_CHAIN,
    
    // Chain data
    chains: SUPPORTED_CHAINS,
    
    // Network stats per chain
    networkStats: {},
    
    // Loading states
    switchingChain: false,
    
    // Actions
    setActiveChain: async (chainName) => {
      if (!SUPPORTED_CHAINS[chainName]) {
        console.error(`Unsupported chain: ${chainName}`);
        return false;
      }

      set({ switchingChain: true });
      
      try {
        // Clear previous chain data when switching
        set({
          activeChain: chainName,
          switchingChain: false
        });
        
        return true;
      } catch (error) {
        console.error('Error switching chain:', error);
        set({ switchingChain: false });
        return false;
      }
    },

    updateNetworkStats: (chainName, stats) => {
      set(state => ({
        networkStats: {
          ...state.networkStats,
          [chainName]: {
            ...state.networkStats[chainName],
            ...stats,
            lastUpdated: Date.now()
          }
        }
      }));
    },

    getActiveChainConfig: () => {
      const { activeChain, chains } = get();
      return chains[activeChain];
    },

    getNetworkStats: (chainName) => {
      const { networkStats, activeChain } = get();
      const chain = chainName || activeChain;
      return networkStats[chain] || null;
    },

    // Get all chains with their current stats
    getAllChainsWithStats: () => {
      const { chains, networkStats } = get();
      return Object.entries(chains).map(([key, chain]) => ({
        ...chain,
        key,
        stats: networkStats[key] || null
      }));
    },

    // Check if chain is supported
    isChainSupported: (chainName) => {
      const { chains } = get();
      return !!chains[chainName];
    },

    // Reset chain data
    resetChainData: () => set({
      networkStats: {}
    })
  }))
);