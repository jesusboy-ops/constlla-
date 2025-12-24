/**
 * Deep Dive Sidebar
 * Right-side glassmorphic sidebar for detailed blockchain analysis
 * Appears when user chooses "Deep Dive Analysis" from floating data card
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useExplorationStore, EXPLORATION_MODES } from '../../state/useExplorationStore.js';

const DeepDiveSidebar = () => {
  const { 
    mode, 
    extractedData, 
    setMode, 
    continueJourney 
  } = useExplorationStore();
  
  const [activeTab, setActiveTab] = useState('overview');
  
  const isVisible = mode === EXPLORATION_MODES.DEEP_DIVE && extractedData;
  
  if (!isVisible) return null;
  
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
          duration: 0.6
        }}
        className="fixed top-0 right-0 h-full w-full md:w-96 z-50 pointer-events-auto"
        style={{
          background: 'rgba(0, 10, 20, 0.15)',
          backdropFilter: 'blur(25px) saturate(180%)',
          borderLeft: '1px solid rgba(100, 200, 255, 0.2)',
          boxShadow: '-20px 0 60px rgba(0, 0, 0, 0.4)'
        }}
      >
        {/* Header */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-blue-400 rounded-full animate-pulse" />
              <span className="text-blue-400 text-sm font-medium">
                DEEP ANALYSIS MODE
              </span>
            </div>
            
            <button
              onClick={() => setMode(EXPLORATION_MODES.EXPLORE)}
              className="text-white/60 hover:text-white text-2xl p-2 hover:bg-white/10 rounded-lg transition-all"
            >
              ×
            </button>
          </div>
          
          <h2 className="text-2xl font-bold text-white mb-2">
            Block #{extractedData.blockNumber}
          </h2>
          
          <div className="text-blue-300 text-sm font-mono">
            {extractedData.hash}
          </div>
        </div>
        
        {/* Tab Navigation */}
        <div className="flex border-b border-white/10">
          {[
            { id: 'overview', label: 'Overview', icon: '📊' },
            { id: 'transactions', label: 'Transactions', icon: '💸' },
            { id: 'network', label: 'Network', icon: '🌐' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex-1 p-4 text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10'
                  : 'text-white/70 hover:text-white hover:bg-white/5'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            {activeTab === 'overview' && (
              <OverviewTab key="overview" data={extractedData} />
            )}
            {activeTab === 'transactions' && (
              <TransactionsTab key="transactions" data={extractedData} />
            )}
            {activeTab === 'network' && (
              <NetworkTab key="network" data={extractedData} />
            )}
          </AnimatePresence>
        </div>
        
        {/* Footer Actions */}
        <div className="p-6 border-t border-white/10">
          <div className="flex gap-3">
            <button
              onClick={continueJourney}
              className="flex-1 bg-gradient-to-r from-green-500/20 to-blue-500/20 border border-green-400/30 rounded-xl py-3 text-white font-semibold hover:from-green-500/30 hover:to-blue-500/30 transition-all"
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
 * Overview Tab Content
 */
const OverviewTab = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    {/* Key Metrics */}
    <div className="grid grid-cols-2 gap-4">
      <MetricCard
        label="Transactions"
        value={data.transactions.toLocaleString()}
        icon="📊"
        color="blue"
      />
      <MetricCard
        label="Gas Used"
        value={`${(data.gasUsed / 1000000).toFixed(1)}M`}
        icon="⛽"
        color="orange"
      />
      <MetricCard
        label="Total Value"
        value={`${data.totalValue} ETH`}
        icon="💎"
        color="green"
      />
      <MetricCard
        label="Gas Price"
        value={`${data.gasPrice} gwei`}
        icon="⚡"
        color="purple"
      />
    </div>
    
    {/* Block Details */}
    <div className="bg-white/5 rounded-xl p-4 space-y-3">
      <h3 className="text-white font-semibold mb-3">Block Information</h3>
      <DetailRow label="Difficulty" value={data.difficulty} />
      <DetailRow label="Miner" value={data.miner} mono />
      <DetailRow label="Timestamp" value={new Date(data.timestamp).toLocaleString()} />
      <DetailRow label="Size" value={`${data.size} KB`} />
      <DetailRow label="Reward" value={`${data.reward} ETH`} />
    </div>
    
    {/* Gas Usage Chart Placeholder */}
    <div className="bg-white/5 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-3">Gas Usage Distribution</h3>
      <div className="h-32 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-lg flex items-end justify-center">
        <span className="text-white/60 text-sm">Gas usage visualization</span>
      </div>
    </div>
  </motion.div>
);

/**
 * Transactions Tab Content
 */
const TransactionsTab = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-4"
  >
    <div className="flex justify-between items-center">
      <h3 className="text-white font-semibold">Recent Transactions</h3>
      <span className="text-white/60 text-sm">{data.transactions} total</span>
    </div>
    
    <div className="space-y-3 max-h-96 overflow-y-auto">
      {Array.from({ length: Math.min(data.transactions, 20) }).map((_, i) => (
        <TransactionRow key={i} index={i} />
      ))}
    </div>
  </motion.div>
);

/**
 * Network Tab Content
 */
const NetworkTab = ({ data }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -20 }}
    className="space-y-6"
  >
    {/* Network Stats */}
    <div className="bg-white/5 rounded-xl p-4 space-y-3">
      <h3 className="text-white font-semibold mb-3">Network Status</h3>
      <DetailRow label="Block Height" value={data.blockNumber.toLocaleString()} />
      <DetailRow label="Network Hash Rate" value="180.5 EH/s" />
      <DetailRow label="Active Nodes" value="8,247" />
      <DetailRow label="Pending Transactions" value="142,891" />
    </div>
    
    {/* Network Activity */}
    <div className="bg-white/5 rounded-xl p-4">
      <h3 className="text-white font-semibold mb-3">Network Activity</h3>
      <div className="space-y-4">
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/70">Block Utilization</span>
            <span className="text-white">{((data.gasUsed / 30000000) * 100).toFixed(1)}%</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-green-400 to-blue-500 h-2 rounded-full"
              style={{ width: `${(data.gasUsed / 30000000) * 100}%` }}
            />
          </div>
        </div>
        
        <div>
          <div className="flex justify-between text-sm mb-2">
            <span className="text-white/70">Transaction Throughput</span>
            <span className="text-white">15.2 TPS</span>
          </div>
          <div className="w-full bg-white/10 rounded-full h-2">
            <div className="bg-gradient-to-r from-blue-400 to-purple-500 h-2 rounded-full w-3/4" />
          </div>
        </div>
      </div>
    </div>
  </motion.div>
);

/**
 * Metric Card Component
 */
const MetricCard = ({ label, value, icon, color }) => {
  const colorClasses = {
    blue: 'border-blue-400/20 bg-blue-500/10',
    orange: 'border-orange-400/20 bg-orange-500/10',
    green: 'border-green-400/20 bg-green-500/10',
    purple: 'border-purple-400/20 bg-purple-500/10'
  };
  
  return (
    <div className={`p-4 rounded-xl border ${colorClasses[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <span className="text-lg">{icon}</span>
        <span className="text-white/70 text-sm">{label}</span>
      </div>
      <div className="text-white font-bold text-lg">{value}</div>
    </div>
  );
};

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
  const gasUsed = Math.floor(Math.random() * 100000) + 21000;
  
  return (
    <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all">
      <div className="flex justify-between items-start mb-2">
        <span className="text-white font-mono text-sm">{txHash}</span>
        <span className="text-green-400 text-sm font-semibold">{value} ETH</span>
      </div>
      <div className="flex justify-between text-xs text-white/60">
        <span>Gas: {gasUsed.toLocaleString()}</span>
        <span>{Math.floor(Math.random() * 60)} sec ago</span>
      </div>
    </div>
  );
};

export default DeepDiveSidebar;