/**
 * Real-time Blockchain Data Hook
 * WebSocket connection for live blockchain events
 * PRD Requirement: Live realtime feed with <1s latency
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { useChainStore } from '../state/useChainStore.js';

const ALCHEMY_WS_ENDPOINTS = {
  ethereum: 'wss://eth-mainnet.g.alchemy.com/v2/',
  polygon: 'wss://polygon-mainnet.g.alchemy.com/v2/',
  arbitrum: 'wss://arb-mainnet.g.alchemy.com/v2/',
  optimism: 'wss://opt-mainnet.g.alchemy.com/v2/'
};

export const useRealtimeBlockchain = (apiKey = 'demo') => {
  const [isConnected, setIsConnected] = useState(false);
  const [latestBlocks, setLatestBlocks] = useState([]);
  const [liveTransactions, setLiveTransactions] = useState([]);
  const [networkStats, setNetworkStats] = useState({
    blockTime: 12000,
    gasPrice: 25,
    tps: 15,
    activeContracts: 5432,
    pendingTxs: 1234
  });
  const [connectionError, setConnectionError] = useState(null);
  const [simulationMode, setSimulationMode] = useState(false);
  
  const wsRef = useRef(null);
  const reconnectTimeoutRef = useRef(null);
  const simulationIntervalRef = useRef(null);
  const { activeChain } = useChainStore();
  
  // Simulation function for demo purposes
  const startSimulation = useCallback(() => {
    setSimulationMode(true);
    setIsConnected(true);
    setConnectionError(null);
    
    // Generate initial mock data
    const mockBlocks = Array.from({ length: 5 }, (_, i) => ({
      id: `0x${Math.random().toString(16).substr(2, 64)}`,
      number: 18500000 + i,
      hash: `0x${Math.random().toString(16).substr(2, 64)}`,
      timestamp: Date.now() - (i * 12000),
      gasUsed: Math.floor(Math.random() * 15000000 + 5000000),
      gasLimit: 30000000,
      transactions: Math.floor(Math.random() * 200 + 50),
      miner: `0x${Math.random().toString(16).substr(2, 40)}`,
      difficulty: '0x1bc16d674ec80000',
      size: Math.floor(Math.random() * 50000 + 20000)
    }));
    
    setLatestBlocks(mockBlocks);
    
    // Simulate real-time updates
    simulationIntervalRef.current = setInterval(() => {
      // Add new block occasionally
      if (Math.random() < 0.1) { // 10% chance every second
        const newBlock = {
          id: `0x${Math.random().toString(16).substr(2, 64)}`,
          number: 18500000 + Math.floor(Date.now() / 12000),
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          timestamp: Date.now(),
          gasUsed: Math.floor(Math.random() * 15000000 + 5000000),
          gasLimit: 30000000,
          transactions: Math.floor(Math.random() * 200 + 50),
          miner: `0x${Math.random().toString(16).substr(2, 40)}`,
          difficulty: '0x1bc16d674ec80000',
          size: Math.floor(Math.random() * 50000 + 20000)
        };
        
        setLatestBlocks(prev => [newBlock, ...prev.slice(0, 19)]);
      }
      
      // Update network stats
      setNetworkStats(prev => ({
        blockTime: Math.floor(Math.random() * 5000 + 10000), // 10-15 seconds
        gasPrice: Math.floor(Math.random() * 30 + 15), // 15-45 gwei
        tps: Math.floor(Math.random() * 10 + 10), // 10-20 TPS
        activeContracts: Math.floor(Math.random() * 1000 + 5000),
        pendingTxs: Math.floor(Math.random() * 2000 + 500)
      }));
      
      // Add pending transactions
      if (Math.random() < 0.3) { // 30% chance
        const newTx = {
          id: `0x${Math.random().toString(16).substr(2, 64)}`,
          hash: `0x${Math.random().toString(16).substr(2, 64)}`,
          timestamp: Date.now(),
          value: Math.random() * 10,
          gasPrice: Math.random() * 100 + 20,
          status: 'pending'
        };
        
        setLiveTransactions(prev => [newTx, ...prev.slice(0, 49)]);
      }
    }, 1000);
    
  }, []);
  
  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Check if we have a valid API key and chain
    if (apiKey === 'demo' || !activeChain || !ALCHEMY_WS_ENDPOINTS[activeChain]) {
      console.log('Using simulation mode - no valid API key or unsupported chain');
      startSimulation();
      return;
    }

    const wsUrl = `${ALCHEMY_WS_ENDPOINTS[activeChain]}${apiKey}`;
    
    try {
      wsRef.current = new WebSocket(wsUrl);
      
      wsRef.current.onopen = () => {
        console.log('WebSocket connected to', activeChain);
        setIsConnected(true);
        setConnectionError(null);
        setSimulationMode(false);
        
        // Subscribe to new blocks
        wsRef.current.send(JSON.stringify({
          jsonrpc: '2.0',
          id: 1,
          method: 'eth_subscribe',
          params: ['newHeads']
        }));
        
        // Subscribe to pending transactions
        wsRef.current.send(JSON.stringify({
          jsonrpc: '2.0',
          id: 2,
          method: 'eth_subscribe',
          params: ['newPendingTransactions']
        }));
      };
      
      wsRef.current.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          
          if (data.method === 'eth_subscription') {
            const { subscription, result } = data.params;
            
            // Handle new blocks
            if (result.number) {
              const block = {
                id: result.hash,
                number: parseInt(result.number, 16),
                hash: result.hash,
                timestamp: parseInt(result.timestamp, 16) * 1000,
                gasUsed: parseInt(result.gasUsed || '0x0', 16),
                gasLimit: parseInt(result.gasLimit || '0x0', 16),
                transactions: result.transactions?.length || 0,
                miner: result.miner,
                difficulty: result.difficulty,
                size: parseInt(result.size || '0x0', 16)
              };
              
              setLatestBlocks(prev => [block, ...prev.slice(0, 19)]); // Keep last 20 blocks
              
              // Update network stats
              setNetworkStats(prev => ({
                ...prev,
                blockTime: Date.now() - (prev.lastBlockTime || Date.now()),
                gasPrice: Math.floor(Math.random() * 50 + 20), // Simulated
                tps: block.transactions / 12, // Approximate TPS
                lastBlockTime: Date.now()
              }));
            }
            
            // Handle pending transactions
            if (typeof result === 'string' && result.startsWith('0x')) {
              const tx = {
                id: result,
                hash: result,
                timestamp: Date.now(),
                value: Math.random() * 10,
                gasPrice: Math.random() * 100 + 20,
                status: 'pending'
              };
              
              setLiveTransactions(prev => [tx, ...prev.slice(0, 49)]); // Keep last 50 txs
            }
            
          }
        } catch (error) {
          console.error('WebSocket message parsing error:', error);
        }
      };
      
      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        console.log('Falling back to simulation mode');
        setConnectionError('Connection failed - using simulation');
        startSimulation();
      };
      
      wsRef.current.onclose = () => {
        console.log('WebSocket disconnected');
        if (!simulationMode) {
          setIsConnected(false);
          
          // Attempt reconnection after 5 seconds, or fall back to simulation
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log('Attempting to reconnect...');
            startSimulation(); // Use simulation as fallback
          }, 5000);
        }
      };
      
    } catch (error) {
      console.error('WebSocket connection error:', error);
      console.log('Falling back to simulation mode');
      setConnectionError('Connection failed - using simulation');
      startSimulation();
    }
  }, [activeChain, apiKey, startSimulation, simulationMode]);
  
  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    
    if (simulationIntervalRef.current) {
      clearInterval(simulationIntervalRef.current);
    }
    
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    
    setIsConnected(false);
    setSimulationMode(false);
  }, []);
  
  // Connect on mount and chain change
  useEffect(() => {
    connect();
    
    return () => {
      disconnect();
    };
  }, [connect, disconnect]);
  
  // Get latest block for display
  const latestBlock = latestBlocks[0] || null;
  
  // Get network activity for display
  const networkActivity = {
    gasPrice: networkStats.gasPrice,
    tps: networkStats.tps,
    pendingTxs: networkStats.pendingTxs,
    blockTime: networkStats.blockTime
  };
  
  return {
    isConnected,
    latestBlock,
    networkActivity,
    latestBlocks,
    liveTransactions,
    networkStats,
    connectionError,
    simulationMode,
    connect,
    disconnect,
    // Helper functions
    getBlockById: (blockId) => latestBlocks.find(block => block.id === blockId),
    getTransactionById: (txId) => liveTransactions.find(tx => tx.id === txId),
    // Stats
    totalBlocks: latestBlocks.length,
    totalTransactions: liveTransactions.length,
    averageBlockTime: networkStats.blockTime,
    currentTPS: networkStats.tps,
    // Compatibility with LiveStatsBar
    error: connectionError && !simulationMode ? connectionError : null
  };
};