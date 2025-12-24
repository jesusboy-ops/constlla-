/**
 * Explorer Dashboard - Comprehensive Data Visualization Interface
 * Full dashboard layout with multiple panels, sidebars, and real-time metrics
 * Purple neon theme with glassmorphic design
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useVisualizationStore, VISUALIZATION_MODES } from '../../state/useVisualizationStore.js';
import { useChainStore } from '../../state/useChainStore.js';

const ExplorerDashboard = () => {
  const { mode, planets, phase } = useVisualizationStore();
  const { activeChain } = useChainStore();
  const [leftSidebarOpen, setLeftSidebarOpen] = useState(true);
  const [rightSidebarOpen, setRightSidebarOpen] = useState(true);
  
  if (mode !== VISUALIZATION_MODES.EXPLORE) return null;
  
  return (
    <>
      {/* Top Stats Bar */}
      <TopStatsBar />
      
      {/* Left Sidebar - Network Overview */}
      <LeftSidebar isOpen={leftSidebarOpen} setIsOpen={setLeftSidebarOpen} />
      
      {/* Right Sidebar - Live Activity Feed */}
      <RightSidebar isOpen={rightSidebarOpen} setIsOpen={setRightSidebarOpen} />
      
      {/* Bottom Panel - Quick Stats */}
      <BottomPanel />
      
      {/* Floating Mini Cards */}
      <FloatingMiniCards />
    </>
  );
};

/**
 * Top Stats Bar - Key Metrics
 */
const TopStatsBar = () => {
  const { planets } = useVisualizationStore();
  const visiblePlanets = Array.from(planets.values()).filter(p => p.visible);
  
  const totalValue = visiblePlanets.reduce((sum, p) => sum + parseFloat(p.totalValue || 0), 0);
  const totalTxs = visiblePlanets.reduce((sum, p) => sum + (p.dailyTransactions || 0), 0);
  const verifiedCount = visiblePlanets.filter(p => p.verified).length;
  
  return (
    <motion.div
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.2 }}
      className="fixed top-32 left-1/2 transform -translate-x-1/2 z-40 pointer-events-none"
    >
      <div className="flex gap-3 pointer-events-auto">
        <StatCard
          icon="🪐"
          label="Active Contracts"
          value={visiblePlanets.length}
          color="purple"
        />
        <StatCard
          icon="💎"
          label="Total Value"
          value={`${totalValue.toFixed(1)} ETH`}
          color="blue"
        />
        <StatCard
          icon="📊"
          label="Daily TXs"
          value={totalTxs.toLocaleString()}
          color="green"
        />
        <StatCard
          icon="✅"
          label="Verified"
          value={`${verifiedCount}/${visiblePlanets.length}`}
          color="cyan"
        />
      </div>
    </motion.div>
  );
};

/**
 * Left Sidebar - Network Overview & Controls
 */
const LeftSidebar = ({ isOpen, setIsOpen }) => {
  const { planets, phase } = useVisualizationStore();
  const { activeChain } = useChainStore();
  
  return (
    <motion.div
      initial={{ x: -300, opacity: 0 }}
      animate={{ x: isOpen ? 0 : -280, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed left-0 top-32 bottom-4 w-80 z-40 pointer-events-none"
    >
      <div className="h-full flex">
        <div className="flex-1 glass rounded-r-2xl p-4 backdrop-blur-professional border-r border-t border-b border-white/20 overflow-y-auto pointer-events-auto">
          {/* Network Status */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-lg">Network Status</h3>
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
            </div>
            
            <div className="space-y-2">
              <InfoRow label="Chain" value={activeChain.toUpperCase()} />
              <InfoRow label="Phase" value={phase} />
              <InfoRow label="Block Height" value="18,247,891" />
              <InfoRow label="Gas Price" value="25 gwei" />
            </div>
          </div>
          
          {/* Contract Distribution */}
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg mb-3">Contract Types</h3>
            <div className="space-y-2">
              <ProgressBar label="DeFi" value={45} color="purple" />
              <ProgressBar label="NFT" value={30} color="blue" />
              <ProgressBar label="Gaming" value={15} color="green" />
              <ProgressBar label="Other" value={10} color="orange" />
            </div>
          </div>
          
          {/* Top Contracts */}
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg mb-3">Top Contracts</h3>
            <div className="space-y-2">
              {Array.from(planets.values())
                .filter(p => p.visible)
                .sort((a, b) => parseFloat(b.totalValue) - parseFloat(a.totalValue))
                .slice(0, 5)
                .map((planet, i) => (
                  <ContractListItem key={planet.id} planet={planet} rank={i + 1} />
                ))}
            </div>
          </div>
          
          {/* Quick Actions */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-3">Quick Actions</h3>
            <div className="space-y-2">
              <ActionButton icon="🔍" label="Search Contracts" />
              <ActionButton icon="📊" label="View Analytics" />
              <ActionButton icon="⚙️" label="Filter Options" />
            </div>
          </div>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-6 bg-black/30 backdrop-blur-sm border-r border-t border-b border-white/20 rounded-r-lg hover:bg-black/50 transition-all pointer-events-auto flex items-center justify-center"
        >
          <span className="text-white/60 text-xs">
            {isOpen ? '◀' : '▶'}
          </span>
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Right Sidebar - Live Activity Feed
 */
const RightSidebar = ({ isOpen, setIsOpen }) => {
  const [activities] = useState([
    { type: 'contract', action: 'deployed', address: '0x742d...3f8a', time: '2s ago', value: '1.5 ETH' },
    { type: 'transaction', action: 'executed', address: '0x8f3c...9d2b', time: '5s ago', value: '0.3 ETH' },
    { type: 'contract', action: 'verified', address: '0x1a2b...4c5d', time: '12s ago', value: '5.2 ETH' },
    { type: 'transaction', action: 'pending', address: '0x9e8f...7a6b', time: '18s ago', value: '2.1 ETH' },
    { type: 'contract', action: 'updated', address: '0x3c4d...5e6f', time: '25s ago', value: '0.8 ETH' },
  ]);
  
  return (
    <motion.div
      initial={{ x: 300, opacity: 0 }}
      animate={{ x: isOpen ? 0 : 280, opacity: 1 }}
      transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      className="fixed right-0 top-32 bottom-4 w-80 z-40 pointer-events-none"
    >
      <div className="h-full flex flex-row-reverse">
        <div className="flex-1 glass rounded-l-2xl p-4 backdrop-blur-professional border-l border-t border-b border-white/20 overflow-y-auto pointer-events-auto">
          {/* Live Activity Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-semibold text-lg">Live Activity</h3>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-400 rounded-full animate-pulse" />
                <span className="text-white/60 text-xs">LIVE</span>
              </div>
            </div>
          </div>
          
          {/* Activity Feed */}
          <div className="space-y-3 mb-6">
            {activities.map((activity, i) => (
              <ActivityItem key={i} activity={activity} />
            ))}
          </div>
          
          {/* Network Metrics */}
          <div className="mb-6">
            <h3 className="text-white font-semibold text-lg mb-3">Network Metrics</h3>
            <div className="space-y-3">
              <MetricCard
                label="TPS"
                value="15.2"
                change="+2.3%"
                positive={true}
              />
              <MetricCard
                label="Gas Price"
                value="25 gwei"
                change="-5.1%"
                positive={true}
              />
              <MetricCard
                label="Active Contracts"
                value="1,247"
                change="+12"
                positive={true}
              />
            </div>
          </div>
          
          {/* Recent Blocks */}
          <div>
            <h3 className="text-white font-semibold text-lg mb-3">Recent Blocks</h3>
            <div className="space-y-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <BlockItem key={i} blockNumber={18247891 - i} />
              ))}
            </div>
          </div>
        </div>
        
        {/* Toggle Button */}
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-6 bg-black/30 backdrop-blur-sm border-l border-t border-b border-white/20 rounded-l-lg hover:bg-black/50 transition-all pointer-events-auto flex items-center justify-center"
        >
          <span className="text-white/60 text-xs">
            {isOpen ? '▶' : '◀'}
          </span>
        </button>
      </div>
    </motion.div>
  );
};

/**
 * Bottom Panel - Quick Stats & Mini Charts
 */
const BottomPanel = () => {
  return (
    <motion.div
      initial={{ y: 100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.4 }}
      className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-30 pointer-events-none"
    >
      <div className="glass rounded-2xl px-6 py-3 backdrop-blur-professional border border-white/20 pointer-events-auto">
        <div className="flex items-center gap-6">
          <MiniStat icon="⚡" label="Network" value="99.9%" color="green" />
          <div className="w-px h-8 bg-white/20" />
          <MiniStat icon="🔥" label="Gas" value="25 gwei" color="orange" />
          <div className="w-px h-8 bg-white/20" />
          <MiniStat icon="📈" label="TPS" value="15.2" color="blue" />
          <div className="w-px h-8 bg-white/20" />
          <MiniStat icon="💰" label="TVL" value="$2.4B" color="purple" />
        </div>
      </div>
    </motion.div>
  );
};

/**
 * Floating Mini Cards - Additional Context
 */
const FloatingMiniCards = () => {
  return (
    <>
      {/* Camera Position Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.6 }}
        className="fixed top-32 left-6 z-30 pointer-events-none"
      >
        <div className="glass rounded-xl px-4 py-3 backdrop-blur-sm border border-white/10 pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">📍</span>
            <span className="text-white/70 text-xs">Position</span>
          </div>
          <div className="text-white text-sm font-mono">
            X: 0.0 Y: 0.0 Z: 100.0
          </div>
        </div>
      </motion.div>
      
      {/* Performance Indicator */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.7 }}
        className="fixed top-52 left-6 z-30 pointer-events-none"
      >
        <div className="glass rounded-xl px-4 py-3 backdrop-blur-sm border border-white/10 pointer-events-auto">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-sm">⚡</span>
            <span className="text-white/70 text-xs">Performance</span>
          </div>
          <div className="text-green-400 text-sm font-mono">
            60 FPS
          </div>
        </div>
      </motion.div>
    </>
  );
};

// ============================================================================
// COMPONENT HELPERS
// ============================================================================

const StatCard = ({ icon, label, value, color }) => {
  const colorClasses = {
    purple: 'border-purple-400/30 bg-purple-500/10',
    blue: 'border-blue-400/30 bg-blue-500/10',
    green: 'border-green-400/30 bg-green-500/10',
    cyan: 'border-cyan-400/30 bg-cyan-500/10',
  };
  
  return (
    <div className={`glass rounded-xl px-4 py-3 backdrop-blur-professional border ${colorClasses[color]} min-w-32`}>
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <span className="text-white/70 text-xs">{label}</span>
      </div>
      <div className="text-white font-bold text-lg">{value}</div>
    </div>
  );
};

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between items-center py-1">
    <span className="text-white/60 text-sm">{label}</span>
    <span className="text-white text-sm font-medium">{value}</span>
  </div>
);

const ProgressBar = ({ label, value, color }) => {
  const colorClasses = {
    purple: 'bg-purple-500',
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    orange: 'bg-orange-500',
  };
  
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-white/70">{label}</span>
        <span className="text-white">{value}%</span>
      </div>
      <div className="w-full bg-white/10 rounded-full h-2">
        <div 
          className={`${colorClasses[color]} h-2 rounded-full transition-all duration-500`}
          style={{ width: `${value}%` }}
        />
      </div>
    </div>
  );
};

const ContractListItem = ({ planet, rank }) => (
  <div className="bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-all cursor-pointer">
    <div className="flex items-center gap-2">
      <span className="text-white/60 text-xs font-mono">#{rank}</span>
      <div className="flex-1 min-w-0">
        <div className="text-white text-xs font-mono truncate">
          {planet.contractAddress?.substring(0, 12)}...
        </div>
        <div className="text-white/60 text-xs">
          {planet.totalValue} ETH
        </div>
      </div>
      {planet.verified && <span className="text-xs">✅</span>}
    </div>
  </div>
);

const ActionButton = ({ icon, label }) => (
  <button className="w-full bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg px-3 py-2 text-white text-sm transition-all flex items-center gap-2">
    <span>{icon}</span>
    <span>{label}</span>
  </button>
);

const ActivityItem = ({ activity }) => {
  const typeColors = {
    contract: 'text-purple-400',
    transaction: 'text-blue-400',
  };
  
  return (
    <div className="bg-white/5 rounded-lg p-3 hover:bg-white/10 transition-all">
      <div className="flex items-start justify-between mb-1">
        <span className={`text-xs font-semibold ${typeColors[activity.type]}`}>
          {activity.type.toUpperCase()}
        </span>
        <span className="text-white/60 text-xs">{activity.time}</span>
      </div>
      <div className="text-white text-sm mb-1">{activity.action}</div>
      <div className="flex justify-between items-center">
        <span className="text-white/70 text-xs font-mono">{activity.address}</span>
        <span className="text-green-400 text-xs font-semibold">{activity.value}</span>
      </div>
    </div>
  );
};

const MetricCard = ({ label, value, change, positive }) => (
  <div className="bg-white/5 rounded-lg p-3">
    <div className="text-white/70 text-xs mb-1">{label}</div>
    <div className="flex items-end justify-between">
      <span className="text-white font-bold text-lg">{value}</span>
      <span className={`text-xs font-semibold ${positive ? 'text-green-400' : 'text-red-400'}`}>
        {change}
      </span>
    </div>
  </div>
);

const BlockItem = ({ blockNumber }) => (
  <div className="bg-white/5 rounded-lg p-2 hover:bg-white/10 transition-all cursor-pointer">
    <div className="flex justify-between items-center">
      <span className="text-white text-sm font-mono">#{blockNumber.toLocaleString()}</span>
      <span className="text-white/60 text-xs">{Math.floor(Math.random() * 60)}s ago</span>
    </div>
    <div className="flex justify-between items-center mt-1">
      <span className="text-white/60 text-xs">{Math.floor(Math.random() * 200) + 50} txs</span>
      <span className="text-green-400 text-xs">{(Math.random() * 5).toFixed(2)} ETH</span>
    </div>
  </div>
);

const MiniStat = ({ icon, label, value, color }) => {
  const colorClasses = {
    green: 'text-green-400',
    orange: 'text-orange-400',
    blue: 'text-blue-400',
    purple: 'text-purple-400',
  };
  
  return (
    <div className="flex items-center gap-2">
      <span className="text-sm">{icon}</span>
      <div>
        <div className="text-white/60 text-xs">{label}</div>
        <div className={`text-sm font-semibold ${colorClasses[color]}`}>{value}</div>
      </div>
    </div>
  );
};

export default ExplorerDashboard;
