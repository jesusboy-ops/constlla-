/**
 * Chain Selector Component
 * Allows users to select different blockchain networks
 * PRD Requirement: Chain selector for universe view
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useChainStore } from '../../state/useChainStore.js';
import { SUPPORTED_CHAINS } from '../../services/chains.js';

const ChainSelector = ({ onChainSelect, currentChain = 'ethereum' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setActiveChain } = useChainStore();

  // Convert chains object to array format
  const chainsArray = Object.entries(SUPPORTED_CHAINS).map(([key, chain]) => ({
    id: key,
    name: chain.name,
    symbol: chain.symbol,
    color: chain.color,
    icon: getChainIcon(key),
    rpcUrl: chain.rpcUrl,
    explorerUrl: chain.explorerUrl
  }));

  function getChainIcon(chainId) {
    const icons = {
      ethereum: '⟠',
      polygon: '⬟',
      arbitrum: '◆',
      optimism: '○',
      base: '🔵',
      bsc: '💛'
    };
    return icons[chainId] || '⚪';
  }

  const selectedChain = chainsArray.find(chain => chain.id === currentChain) || chainsArray[0];

  const handleChainSelect = (chain) => {
    setActiveChain(chain.id);
    onChainSelect?.(chain);
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* Chain Selector Button */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-3 bg-gradient-to-r from-slate-900/90 to-black/90 backdrop-blur-xl border border-white/20 rounded-xl px-4 py-3 text-white hover:border-white/40 transition-all duration-300"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        style={{
          boxShadow: `0 8px 32px ${selectedChain.color}20, inset 0 1px 0 rgba(255, 255, 255, 0.1)`
        }}
      >
        <div 
          className="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold"
          style={{ 
            backgroundColor: `${selectedChain.color}20`,
            color: selectedChain.color,
            border: `1px solid ${selectedChain.color}40`
          }}
        >
          {selectedChain.icon}
        </div>
        
        <div className="flex flex-col items-start">
          <span className="text-sm font-semibold">{selectedChain.name}</span>
          <span className="text-xs text-white/60">{selectedChain.symbol}</span>
        </div>
        
        <motion.div
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.2 }}
          className="text-white/60"
        >
          ▼
        </motion.div>
      </motion.button>

      {/* Dropdown Menu */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 mt-2 w-64 bg-gradient-to-br from-slate-900/95 to-black/95 backdrop-blur-xl border border-white/20 rounded-xl shadow-2xl z-50 overflow-hidden"
            style={{
              boxShadow: '0 20px 60px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="p-2">
              <div className="text-white/80 text-xs font-medium px-3 py-2 border-b border-white/10">
                Select Blockchain Network
              </div>
              
              {chainsArray.map((chain) => (
                <motion.button
                  key={chain.id}
                  onClick={() => handleChainSelect(chain)}
                  className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-all duration-200 ${
                    chain.id === currentChain 
                      ? 'bg-white/10 border border-white/20' 
                      : 'hover:bg-white/5 border border-transparent'
                  }`}
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div 
                    className="w-10 h-10 rounded-full flex items-center justify-center text-lg font-bold"
                    style={{ 
                      backgroundColor: `${chain.color}20`,
                      color: chain.color,
                      border: `1px solid ${chain.color}40`
                    }}
                  >
                    {chain.icon}
                  </div>
                  
                  <div className="flex-1">
                    <div className="text-white font-medium">{chain.name}</div>
                    <div className="text-white/60 text-sm">{chain.symbol}</div>
                  </div>
                  
                  {chain.id === currentChain && (
                    <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  )}
                </motion.button>
              ))}
            </div>
            
            <div className="px-3 py-2 border-t border-white/10 bg-white/5">
              <div className="text-white/50 text-xs">
                More chains coming soon...
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ChainSelector;