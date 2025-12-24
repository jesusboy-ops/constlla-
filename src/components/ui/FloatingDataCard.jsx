/**
 * Floating Data Card
 * In-world glassmorphic data card that appears where planets were scanned
 * Immersive UI that doesn't break the space experience
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useExplorationStore, EXPLORATION_MODES } from '../../state/useExplorationStore.js';

const FloatingDataCard = () => {
  const { 
    dataCardVisible, 
    extractedData, 
    hideDataCard, 
    inspectData, 
    continueJourney 
  } = useExplorationStore();
  
  if (!dataCardVisible || !extractedData) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, scale: 0.8, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: -20 }}
        transition={{ 
          type: 'spring',
          stiffness: 300,
          damping: 25,
          duration: 0.6
        }}
        className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
      >
        <div 
          className="relative max-w-md w-full mx-4 pointer-events-auto"
          style={{
            background: 'rgba(0, 20, 40, 0.15)',
            backdropFilter: 'blur(25px) saturate(180%)',
            border: '1px solid rgba(100, 200, 255, 0.2)',
            borderRadius: '20px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 100px rgba(0, 150, 255, 0.1)',
            transform: 'perspective(1000px) rotateX(5deg)'
          }}
        >
          {/* Connection Beam Effect */}
          <div 
            className="absolute -top-20 left-1/2 transform -translate-x-1/2 w-1 h-20 opacity-60"
            style={{
              background: 'linear-gradient(to bottom, rgba(0, 150, 255, 0.8), rgba(0, 150, 255, 0))',
              boxShadow: '0 0 10px rgba(0, 150, 255, 0.5)'
            }}
          />
          
          {/* Header */}
          <div className="p-6 border-b border-white/10">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
                <span className="text-green-400 text-sm font-medium">
                  BLOCKCHAIN DATA EXTRACTED
                </span>
              </div>
              
              <button
                onClick={hideDataCard}
                className="text-white/60 hover:text-white text-xl p-1 hover:bg-white/10 rounded transition-all"
              >
                ×
              </button>
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2">
              Block #{extractedData.blockNumber}
            </h2>
            
            <div className="text-blue-300 text-sm font-mono">
              {extractedData.hash.substring(0, 20)}...
            </div>
          </div>
          
          {/* Data Grid */}
          <div className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <DataField 
                label="Transactions" 
                value={extractedData.transactions.toLocaleString()}
                icon="📊"
              />
              <DataField 
                label="Gas Used" 
                value={`${(extractedData.gasUsed / 1000000).toFixed(1)}M`}
                icon="⛽"
              />
              <DataField 
                label="Total Value" 
                value={`${extractedData.totalValue} ETH`}
                icon="💎"
                highlight
              />
              <DataField 
                label="Gas Price" 
                value={`${extractedData.gasPrice} gwei`}
                icon="⚡"
              />
            </div>
            
            {/* Additional Info */}
            <div className="pt-4 border-t border-white/10 space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Difficulty:</span>
                <span className="text-white font-mono">{extractedData.difficulty}</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Miner:</span>
                <span className="text-white font-mono text-xs">
                  {extractedData.miner.substring(0, 12)}...
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-white/70">Timestamp:</span>
                <span className="text-white">
                  {new Date(extractedData.timestamp).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>
          
          {/* Actions */}
          <div className="p-6 border-t border-white/10 flex gap-3">
            <motion.button
              onClick={inspectData}
              className="flex-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl py-3 text-white font-semibold hover:from-blue-500/30 hover:to-purple-500/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🔍 Deep Dive Analysis
            </motion.button>
            
            <motion.button
              onClick={continueJourney}
              className="flex-1 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-xl py-3 text-white font-semibold hover:from-green-500/30 hover:to-blue-500/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              🚀 Continue Journey
            </motion.button>
          </div>
          
          {/* Ambient Glow */}
          <div 
            className="absolute inset-0 rounded-20 opacity-30 pointer-events-none"
            style={{
              background: 'radial-gradient(circle at center, rgba(0, 150, 255, 0.1) 0%, transparent 70%)',
              filter: 'blur(20px)'
            }}
          />
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Data Field Component
 */
const DataField = ({ label, value, icon, highlight = false }) => (
  <div className={`p-3 rounded-xl ${highlight ? 'bg-green-500/10 border border-green-400/20' : 'bg-white/5'}`}>
    <div className="flex items-center gap-2 mb-1">
      <span className="text-sm">{icon}</span>
      <span className="text-white/70 text-xs font-medium">{label}</span>
    </div>
    <div className={`font-bold ${highlight ? 'text-green-400' : 'text-white'}`}>
      {value}
    </div>
  </div>
);

export default FloatingDataCard;