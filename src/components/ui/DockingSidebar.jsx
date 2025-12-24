/**
 * Docking Sidebar Component
 * Glassmorphic sidebar that slides in when docked to a planet
 * Shows detailed blockchain information with smooth animations
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useCameraStore, CAMERA_MODES } from '../../state/useCameraStore.js';
import { useAppStore } from '../../state/useAppStore.js';

const DockingSidebar = () => {
  const { mode, dockedPlanet, undock } = useCameraStore();
  const { selectedContract } = useAppStore();
  const [expandedSection, setExpandedSection] = useState(null);
  
  const isVisible = mode === CAMERA_MODES.DOCKED_ORBIT && (dockedPlanet || selectedContract);
  const planetData = dockedPlanet || selectedContract;
  
  if (!isVisible || !planetData) return null;
  
  return (
    <AnimatePresence>
      <motion.div
        initial={{ x: '100%', opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: '100%', opacity: 0 }}
        transition={{ 
          type: 'spring',
          stiffness: 300,
          damping: 30,
          duration: 0.5
        }}
        className="fixed top-0 right-0 h-full w-96 z-40 pointer-events-auto"
        style={{
          background: 'rgba(0, 0, 0, 0.4)',
          backdropFilter: 'blur(20px) saturate(180%)',
          borderLeft: '1px solid rgba(255, 255, 255, 0.1)',
          boxShadow: '-10px 0 50px rgba(0, 0, 0, 0.3)'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              <span className="text-green-400 text-sm font-medium">DOCKED</span>
            </div>
            
            <button
              onClick={undock}
              className="text-white/60 hover:text-white text-2xl p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              ×
            </button>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            {planetData.contractName || `Block #${planetData.blockNumber}`}
          </h2>
          
          <div className="flex items-center gap-2 text-sm text-white/70">
            <span className="px-2 py-1 bg-blue-500/20 rounded text-blue-300">
              {planetData.chain || 'Ethereum'}
            </span>
            {planetData.verified && (
              <span className="px-2 py-1 bg-green-500/20 rounded text-green-300">
                ✓ Verified
              </span>
            )}
          </div>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Quick Stats */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-2 gap-4"
          >
            <StatCard
              label="Transactions"
              value={planetData.transactionCount?.toLocaleString() || 'N/A'}
              icon="📊"
            />
            <StatCard
              label="Gas Used"
              value={planetData.gasUsed ? `${(planetData.gasUsed / 1000000).toFixed(1)}M` : 'N/A'}
              icon="⛽"
            />
            <StatCard
              label="Block Size"
              value={`${planetData.size?.toFixed(1) || '5.0'} ETH`}
              icon="📦"
            />
            <StatCard
              label="Timestamp"
              value={planetData.timestamp ? new Date(planetData.timestamp).toLocaleTimeString() : 'N/A'}
              icon="⏰"
            />
          </motion.div>
          
          {/* Block Details */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <ExpandableSection
              title="Block Information"
              icon="🧱"
              isExpanded={expandedSection === 'block'}
              onToggle={() => setExpandedSection(expandedSection === 'block' ? null : 'block')}
            >
              <div className="space-y-3">
                <DetailRow label="Block Number" value={planetData.blockNumber || 'N/A'} />
                <DetailRow label="Hash" value={planetData.hash || planetData.address || 'N/A'} mono />
                <DetailRow label="Parent Hash" value="0x..." mono />
                <DetailRow label="Difficulty" value="15.5T" />
                <DetailRow label="Total Difficulty" value="58.7P" />
              </div>
            </ExpandableSection>
          </motion.div>
          
          {/* Transaction List */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <ExpandableSection
              title="Recent Transactions"
              icon="💸"
              isExpanded={expandedSection === 'transactions'}
              onToggle={() => setExpandedSection(expandedSection === 'transactions' ? null : 'transactions')}
            >
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {Array.from({ length: Math.min(planetData.transactionCount || 5, 10) }).map((_, i) => (
                  <TransactionRow key={i} index={i} />
                ))}
              </div>
            </ExpandableSection>
          </motion.div>
          
          {/* Network Activity */}
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <ExpandableSection
              title="Network Activity"
              icon="🌐"
              isExpanded={expandedSection === 'network'}
              onToggle={() => setExpandedSection(expandedSection === 'network' ? null : 'network')}
            >
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-white/70">Gas Price</span>
                  <span className="text-white font-mono">25.3 gwei</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2">
                  <div 
                    className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
                    style={{ width: `${(planetData.gasUsage / 8000000) * 100}%` }}
                  />
                </div>
                <div className="text-xs text-white/50">
                  Block utilization: {((planetData.gasUsage / 8000000) * 100).toFixed(1)}%
                </div>
              </div>
            </ExpandableSection>
          </motion.div>
        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <button
              onClick={undock}
              className="flex-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/30 rounded-xl py-3 text-white font-semibold hover:from-blue-500/30 hover:to-purple-500/30 transition-all"
            >
              🚀 Continue Journey
            </button>
            <button className="px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white hover:bg-white/20 transition-all">
              📋
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

/**
 * Stat Card Component
 */
const StatCard = ({ label, value, icon }) => (
  <div className="bg-white/5 rounded-xl p-4 border border-white/10">
    <div className="flex items-center gap-2 mb-2">
      <span className="text-lg">{icon}</span>
      <span className="text-white/70 text-sm">{label}</span>
    </div>
    <div className="text-white font-bold text-lg">{value}</div>
  </div>
);

/**
 * Expandable Section Component
 */
const ExpandableSection = ({ title, icon, children, isExpanded, onToggle }) => (
  <div className="bg-white/5 rounded-xl border border-white/10 overflow-hidden">
    <button
      onClick={onToggle}
      className="w-full p-4 flex items-center justify-between text-left hover:bg-white/5 transition-all"
    >
      <div className="flex items-center gap-3">
        <span className="text-lg">{icon}</span>
        <span className="text-white font-semibold">{title}</span>
      </div>
      <motion.span
        animate={{ rotate: isExpanded ? 180 : 0 }}
        transition={{ duration: 0.2 }}
        className="text-white/60"
      >
        ▼
      </motion.span>
    </button>
    
    <AnimatePresence>
      {isExpanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="border-t border-white/10"
        >
          <div className="p-4">
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

/**
 * Detail Row Component
 */
const DetailRow = ({ label, value, mono = false }) => (
  <div className="flex justify-between items-center py-2">
    <span className="text-white/70 text-sm">{label}</span>
    <span className={`text-white text-sm ${mono ? 'font-mono' : ''} max-w-48 truncate`}>
      {value}
    </span>
  </div>
);

/**
 * Transaction Row Component
 */
const TransactionRow = ({ index }) => {
  const txHash = `0x${Math.random().toString(16).substr(2, 8)}...`;
  const value = (Math.random() * 10).toFixed(3);
  
  return (
    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg hover:bg-white/10 transition-all cursor-pointer">
      <div className="flex items-center gap-3">
        <div className="w-2 h-2 bg-green-400 rounded-full" />
        <span className="text-white font-mono text-sm">{txHash}</span>
      </div>
      <span className="text-white/70 text-sm">{value} ETH</span>
    </div>
  );
};

export default DockingSidebar;