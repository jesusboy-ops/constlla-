/**
 * Comprehensive Blockchain Statistics Dashboard
 * Full-page data visualization with complex analytics and real-time metrics
 * Mobile responsive with hamburger menu
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useRealtimeBlockchain } from '../../hooks/useRealtimeBlockchain.js';
import { useChainStore } from '../../state/useChainStore.js';
import { useResponsive } from '../../hooks/useResponsive.js';
import { formatNumber, formatGas, formatChainName } from '../../utils/formatters.js';
import GlassCard from './GlassCard.jsx';
import GlassButton from './GlassButton.jsx';

const BlockchainStatsDashboard = ({ onClose }) => {
  const { 
    latestBlock, 
    recentTransactions, 
    networkActivity, 
    isConnected 
  } = useRealtimeBlockchain();
  const { activeChain, chains } = useChainStore();
  const responsive = useResponsive();
  
  const [selectedTimeframe, setSelectedTimeframe] = useState('24h');
  const [selectedMetric, setSelectedMetric] = useState('overview');
  const [historicalData, setHistoricalData] = useState([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Generate mock historical data for demonstration
  useEffect(() => {
    const generateHistoricalData = () => {
      const data = [];
      const now = Date.now();
      const timeframes = {
        '1h': { points: 60, interval: 60000 },
        '24h': { points: 24, interval: 3600000 },
        '7d': { points: 7, interval: 86400000 },
        '30d': { points: 30, interval: 86400000 }
      };
      
      const config = timeframes[selectedTimeframe];
      
      for (let i = config.points - 1; i >= 0; i--) {
        const timestamp = now - (i * config.interval);
        data.push({
          timestamp,
          blockNumber: (latestBlock?.number || 18500000) - i * 5,
          gasPrice: 20 + Math.random() * 80,
          tps: Math.random() * 15 + 5,
          activeAddresses: Math.floor(Math.random() * 50000) + 100000,
          totalValue: Math.random() * 1000000 + 500000,
          networkHashrate: Math.random() * 200 + 300,
          memPoolSize: Math.floor(Math.random() * 100000) + 50000
        });
      }
      
      setHistoricalData(data);
    };

    generateHistoricalData();
    const interval = setInterval(generateHistoricalData, 30000);
    return () => clearInterval(interval);
  }, [selectedTimeframe, latestBlock]);

  // Close mobile menu when metric changes
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [selectedMetric]);

  // Calculate statistics
  const stats = {
    network: {
      latestBlock: latestBlock?.number || 0,
      blockTime: networkActivity?.blockTime || 12,
      gasPrice: networkActivity?.gasPrice || 0,
      tps: networkActivity?.tps || 0,
      pendingTxs: networkActivity?.pendingTxs || 0,
      networkHashrate: 450.2,
      difficulty: '58.9T',
      totalSupply: '120.4M ETH'
    },
    transactions: {
      total24h: 1247832,
      avgGasUsed: 21000,
      totalGasUsed: '15.2M',
      avgTxValue: '0.45 ETH',
      totalValue24h: '2.1M ETH',
      successRate: 98.7,
      failedTxs: 16234,
      contractCalls: 892341
    },
    defi: {
      totalValueLocked: '45.2B USD',
      topProtocols: [
        { name: 'Uniswap V3', tvl: '4.2B', change: '+2.3%' },
        { name: 'Aave', tvl: '3.8B', change: '-0.8%' },
        { name: 'Compound', tvl: '2.1B', change: '+1.2%' },
        { name: 'MakerDAO', tvl: '1.9B', change: '+0.5%' }
      ],
      dailyVolume: '12.4B USD',
      activeUsers: 234567
    },
    validators: {
      total: 892341,
      active: 891203,
      pending: 1138,
      slashed: 234,
      totalStaked: '28.9M ETH',
      stakingRatio: '24.1%',
      avgReward: '4.2% APR',
      nextWithdrawal: '6d 14h'
    }
  };

  const timeframes = [
    { id: '1h', label: responsive.isMobile ? '1H' : '1 Hour' },
    { id: '24h', label: responsive.isMobile ? '24H' : '24 Hours' },
    { id: '7d', label: responsive.isMobile ? '7D' : '7 Days' },
    { id: '30d', label: responsive.isMobile ? '30D' : '30 Days' }
  ];

  const metrics = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'transactions', label: 'Transactions', icon: '💸' },
    { id: 'defi', label: 'DeFi', icon: '🏦' },
    { id: 'validators', label: 'Validators', icon: '👥' },
    { id: 'contracts', label: 'Contracts', icon: '📋' },
    { id: 'network', label: 'Network', icon: '🌐' }
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black z-50 overflow-y-auto"
    >
      {/* Header */}
      <div className="sticky top-0 z-10 bg-black/80 backdrop-blur-xl border-b border-white/10">
        <div className={`mx-auto ${responsive.isMobile ? 'px-4' : 'max-w-7xl px-6'} py-4`}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {/* Mobile Hamburger Menu */}
              {responsive.isMobile && (
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
                >
                  <div className="w-6 h-6 flex flex-col justify-center items-center">
                    <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${mobileMenuOpen ? 'rotate-45 translate-y-1' : '-translate-y-0.5'}`}></span>
                    <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm my-0.5 ${mobileMenuOpen ? 'opacity-0' : 'opacity-100'}`}></span>
                    <span className={`bg-white block transition-all duration-300 ease-out h-0.5 w-6 rounded-sm ${mobileMenuOpen ? '-rotate-45 -translate-y-1' : 'translate-y-0.5'}`}></span>
                  </div>
                </button>
              )}
              
              <h1 className={`font-bold text-white flex items-center gap-3 ${
                responsive.isMobile ? 'text-xl' : 'text-3xl'
              }`}>
                📈 {responsive.isMobile ? 'Analytics' : 'Blockchain Analytics'}
              </h1>
              
              <div className="flex items-center gap-2 px-3 py-1 bg-white/10 rounded-lg">
                <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
                <span className={`text-white/80 ${responsive.isMobile ? 'text-xs' : 'text-sm'}`}>
                  {responsive.isMobile ? activeChain.toUpperCase() : formatChainName(activeChain)}
                </span>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Desktop Timeframe Selector */}
              {!responsive.isMobile && (
                <div className="flex bg-white/5 rounded-lg p-1">
                  {timeframes.map((timeframe) => (
                    <button
                      key={timeframe.id}
                      onClick={() => setSelectedTimeframe(timeframe.id)}
                      className={`px-3 py-1 rounded text-sm transition-all ${
                        selectedTimeframe === timeframe.id
                          ? 'bg-purple-500/30 text-white'
                          : 'text-white/60 hover:text-white'
                      }`}
                    >
                      {timeframe.label}
                    </button>
                  ))}
                </div>
              )}
              
              <GlassButton onClick={onClose}>✕</GlassButton>
            </div>
          </div>
          
          {/* Desktop Metric Tabs */}
          {!responsive.isMobile && (
            <div className="flex gap-2 mt-4 overflow-x-auto">
              {metrics.map((metric) => (
                <button
                  key={metric.id}
                  onClick={() => setSelectedMetric(metric.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all ${
                    selectedMetric === metric.id
                      ? 'bg-purple-500/20 text-white border border-purple-400/30'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span>{metric.icon}</span>
                  <span>{metric.label}</span>
                </button>
              ))}
            </div>
          )}

          {/* Mobile Timeframe Selector */}
          {responsive.isMobile && (
            <div className="flex bg-white/5 rounded-lg p-1 mt-3">
              {timeframes.map((timeframe) => (
                <button
                  key={timeframe.id}
                  onClick={() => setSelectedTimeframe(timeframe.id)}
                  className={`flex-1 py-2 rounded text-xs transition-all ${
                    selectedTimeframe === timeframe.id
                      ? 'bg-purple-500/30 text-white'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {timeframe.label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {responsive.isMobile && mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            onClick={() => setMobileMenuOpen(false)}
          >
            <motion.div
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              className="absolute left-0 top-0 h-full w-80 bg-black/90 backdrop-blur-xl border-r border-white/10 p-6"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-white font-semibold text-lg">Dashboard Sections</h2>
                <button
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-white/60 hover:text-white p-2"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-2">
                {metrics.map((metric) => (
                  <button
                    key={metric.id}
                    onClick={() => setSelectedMetric(metric.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                      selectedMetric === metric.id
                        ? 'bg-purple-500/20 text-white border border-purple-400/30'
                        : 'text-white/60 hover:text-white hover:bg-white/5'
                    }`}
                  >
                    <span className="text-xl">{metric.icon}</span>
                    <span className="font-medium">{metric.label}</span>
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <div className={`mx-auto ${responsive.isMobile ? 'px-4' : 'max-w-7xl px-6'} py-6`}>
        <AnimatePresence mode="wait">
          {selectedMetric === 'overview' && (
            <OverviewDashboard key="overview" stats={stats} historicalData={historicalData} responsive={responsive} />
          )}
          {selectedMetric === 'transactions' && (
            <TransactionsDashboard key="transactions" stats={stats.transactions} recentTransactions={recentTransactions} responsive={responsive} />
          )}
          {selectedMetric === 'defi' && (
            <DeFiDashboard key="defi" stats={stats.defi} responsive={responsive} />
          )}
          {selectedMetric === 'validators' && (
            <ValidatorsDashboard key="validators" stats={stats.validators} responsive={responsive} />
          )}
          {selectedMetric === 'contracts' && (
            <ContractsDashboard key="contracts" responsive={responsive} />
          )}
          {selectedMetric === 'network' && (
            <NetworkDashboard key="network" stats={stats.network} historicalData={historicalData} responsive={responsive} />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

// Overview Dashboard Component
const OverviewDashboard = ({ stats, historicalData, responsive }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    {/* Key Metrics Grid */}
    <div className={`grid gap-6 ${
      responsive.isMobile ? 'grid-cols-1' : 
      responsive.isTablet ? 'grid-cols-2' : 
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }`}>
      <MetricCard
        title="Latest Block"
        value={`#${formatNumber(stats.network.latestBlock)}`}
        change="+0.1%"
        icon="⬢"
        color="blue"
        responsive={responsive}
      />
      <MetricCard
        title="Gas Price"
        value={`${stats.network.gasPrice} gwei`}
        change="-2.3%"
        icon="⛽"
        color="orange"
        responsive={responsive}
      />
      <MetricCard
        title="TPS"
        value={stats.network.tps.toFixed(1)}
        change="+5.7%"
        icon="⚡"
        color="yellow"
        responsive={responsive}
      />
      <MetricCard
        title="Total Value Locked"
        value={stats.defi.totalValueLocked}
        change="+1.2%"
        icon="🏦"
        color="green"
        responsive={responsive}
      />
    </div>

    {/* Charts Grid */}
    <div className={`grid gap-6 ${responsive.isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
      <GlassCard className={responsive.isMobile ? 'p-4' : 'p-6'}>
        <h3 className="text-white font-semibold mb-4">Network Activity</h3>
        <div className={`flex items-center justify-center text-white/60 ${responsive.isMobile ? 'h-48' : 'h-64'}`}>
          <div className="text-center">
            <div className={`mb-2 ${responsive.isMobile ? 'text-3xl' : 'text-4xl'}`}>📊</div>
            <div className={responsive.isMobile ? 'text-sm' : ''}>Interactive Chart Placeholder</div>
            <div className={`mt-2 ${responsive.isMobile ? 'text-xs' : 'text-sm'}`}>TPS over time: {historicalData.length} data points</div>
          </div>
        </div>
      </GlassCard>
      
      <GlassCard className={responsive.isMobile ? 'p-4' : 'p-6'}>
        <h3 className="text-white font-semibold mb-4">Gas Price Trends</h3>
        <div className={`flex items-center justify-center text-white/60 ${responsive.isMobile ? 'h-48' : 'h-64'}`}>
          <div className="text-center">
            <div className={`mb-2 ${responsive.isMobile ? 'text-3xl' : 'text-4xl'}`}>⛽</div>
            <div className={responsive.isMobile ? 'text-sm' : ''}>Gas Price History</div>
            <div className={`mt-2 ${responsive.isMobile ? 'text-xs' : 'text-sm'}`}>Average: {stats.network.gasPrice} gwei</div>
          </div>
        </div>
      </GlassCard>
    </div>

    {/* Recent Activity */}
    <GlassCard className={responsive.isMobile ? 'p-4' : 'p-6'}>
      <h3 className="text-white font-semibold mb-4">Recent Network Activity</h3>
      <div className={`grid gap-6 ${
        responsive.isMobile ? 'grid-cols-1' : 
        responsive.isTablet ? 'grid-cols-2' : 
        'grid-cols-1 md:grid-cols-3'
      }`}>
        <div className="space-y-3">
          <h4 className="text-white/80 font-medium">Latest Blocks</h4>
          {[...Array(responsive.isMobile ? 3 : 5)].map((_, i) => (
            <div key={i} className={`flex items-center justify-between bg-white/5 rounded-lg ${responsive.isMobile ? 'p-2' : 'p-3'}`}>
              <div>
                <div className={`text-white font-mono ${responsive.isMobile ? 'text-sm' : ''}`}>#{stats.network.latestBlock - i}</div>
                <div className={`text-white/60 ${responsive.isMobile ? 'text-xs' : 'text-xs'}`}>{Math.floor(Math.random() * 200) + 50} txs</div>
              </div>
              <div className={`text-white/60 ${responsive.isMobile ? 'text-xs' : 'text-xs'}`}>
                {i === 0 ? 'Now' : `${i * 12}s ago`}
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-3">
          <h4 className="text-white/80 font-medium">Top Contracts</h4>
          {[
            { name: 'Uniswap V3', txs: 1234 },
            { name: 'USDC', txs: 987 },
            { name: 'Wrapped ETH', txs: 756 },
            { name: 'Compound', txs: 543 },
            { name: 'Aave', txs: 432 }
          ].slice(0, responsive.isMobile ? 3 : 5).map((contract, i) => (
            <div key={i} className={`flex items-center justify-between bg-white/5 rounded-lg ${responsive.isMobile ? 'p-2' : 'p-3'}`}>
              <div>
                <div className={`text-white ${responsive.isMobile ? 'text-sm' : 'text-sm'}`}>{contract.name}</div>
                <div className={`text-white/60 ${responsive.isMobile ? 'text-xs' : 'text-xs'}`}>{contract.txs} txs/h</div>
              </div>
              <div className="w-2 h-2 bg-green-400 rounded-full" />
            </div>
          ))}
        </div>
        
        {!responsive.isMobile && (
          <div className="space-y-3">
            <h4 className="text-white/80 font-medium">Network Health</h4>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Success Rate</span>
                <span className="text-green-400">{stats.transactions.successRate}%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Pending Txs</span>
                <span className="text-yellow-400">{formatNumber(stats.network.pendingTxs)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Block Time</span>
                <span className="text-blue-400">{stats.network.blockTime}s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-white/60 text-sm">Hashrate</span>
                <span className="text-purple-400">{stats.network.networkHashrate} TH/s</span>
              </div>
            </div>
          </div>
        )}
      </div>
      
      {/* Mobile Network Health */}
      {responsive.isMobile && (
        <div className="mt-6 pt-4 border-t border-white/10">
          <h4 className="text-white/80 font-medium mb-3">Network Health</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-white/60 text-xs">Success Rate</div>
              <div className="text-green-400 font-semibold">{stats.transactions.successRate}%</div>
            </div>
            <div className="bg-white/5 rounded-lg p-3">
              <div className="text-white/60 text-xs">Block Time</div>
              <div className="text-blue-400 font-semibold">{stats.network.blockTime}s</div>
            </div>
          </div>
        </div>
      )}
    </GlassCard>
  </motion.div>
);

// Transactions Dashboard Component
const TransactionsDashboard = ({ stats, recentTransactions, responsive }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className={`grid gap-6 ${
      responsive.isMobile ? 'grid-cols-1' : 
      responsive.isTablet ? 'grid-cols-2' : 
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }`}>
      <MetricCard
        title="24h Transactions"
        value={formatNumber(stats.total24h)}
        change="+3.2%"
        icon="💸"
        color="blue"
        responsive={responsive}
      />
      <MetricCard
        title="Success Rate"
        value={`${stats.successRate}%`}
        change="+0.1%"
        icon="✅"
        color="green"
        responsive={responsive}
      />
      <MetricCard
        title="Avg Gas Used"
        value={formatNumber(stats.avgGasUsed)}
        change="-1.5%"
        icon="⛽"
        color="orange"
        responsive={responsive}
      />
      <MetricCard
        title="Total Value"
        value={stats.totalValue24h}
        change="+8.7%"
        icon="💰"
        color="yellow"
        responsive={responsive}
      />
    </div>

    {/* Transaction Details */}
    <div className={`grid gap-6 ${responsive.isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
      <GlassCard className={responsive.isMobile ? 'p-4' : 'p-6'}>
        <h3 className="text-white font-semibold mb-4">Transaction Types</h3>
        <div className="space-y-4">
          {[
            { type: 'Token Transfers', count: 456789, percentage: 36.7 },
            { type: 'Contract Calls', count: 234567, percentage: 18.8 },
            { type: 'DEX Swaps', count: 189234, percentage: 15.2 },
            { type: 'NFT Trades', count: 123456, percentage: 9.9 },
            { type: 'Other', count: 243786, percentage: 19.4 }
          ].map((item, i) => (
            <div key={i} className="space-y-2">
              <div className="flex justify-between">
                <span className={`text-white/80 ${responsive.isMobile ? 'text-sm' : ''}`}>{item.type}</span>
                <span className={`text-white ${responsive.isMobile ? 'text-sm' : ''}`}>{formatNumber(item.count)}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-2">
                <div 
                  className="bg-purple-500 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${item.percentage}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </GlassCard>

      <GlassCard className={responsive.isMobile ? 'p-4' : 'p-6'}>
        <h3 className="text-white font-semibold mb-4">Recent Transactions</h3>
        <div className={`space-y-3 overflow-y-auto ${responsive.isMobile ? 'max-h-64' : 'max-h-80'}`}>
          {(recentTransactions.length > 0 ? recentTransactions : [
            { hash: '0x1234...5678', value: '2.5', gasPrice: 45 },
            { hash: '0x2345...6789', value: '0.1', gasPrice: 32 },
            { hash: '0x3456...7890', value: '15.7', gasPrice: 67 },
            { hash: '0x4567...8901', value: '0.05', gasPrice: 28 },
            { hash: '0x5678...9012', value: '8.2', gasPrice: 51 }
          ]).slice(0, responsive.isMobile ? 5 : 10).map((tx, i) => (
            <div key={i} className={`flex items-center justify-between bg-white/5 rounded-lg ${responsive.isMobile ? 'p-2' : 'p-3'}`}>
              <div>
                <div className={`text-white font-mono ${responsive.isMobile ? 'text-xs' : 'text-sm'}`}>{tx.hash}</div>
                <div className={`text-white/60 ${responsive.isMobile ? 'text-xs' : 'text-xs'}`}>{tx.value} ETH</div>
              </div>
              <div className="text-right">
                <div className={`text-white ${responsive.isMobile ? 'text-xs' : 'text-sm'}`}>{tx.gasPrice} gwei</div>
                <div className={`text-white/60 ${responsive.isMobile ? 'text-xs' : 'text-xs'}`}>Just now</div>
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  </motion.div>
);

// DeFi Dashboard Component
const DeFiDashboard = ({ stats, responsive }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className={`grid gap-6 ${
      responsive.isMobile ? 'grid-cols-1' : 
      responsive.isTablet ? 'grid-cols-2' : 
      'grid-cols-1 md:grid-cols-3'
    }`}>
      <MetricCard
        title="Total Value Locked"
        value={stats.totalValueLocked}
        change="+2.1%"
        icon="🏦"
        color="green"
        responsive={responsive}
      />
      <MetricCard
        title="Daily Volume"
        value={stats.dailyVolume}
        change="+15.3%"
        icon="📊"
        color="blue"
        responsive={responsive}
      />
      <MetricCard
        title="Active Users"
        value={formatNumber(stats.activeUsers)}
        change="+7.8%"
        icon="👥"
        color="purple"
        responsive={responsive}
      />
    </div>

    <GlassCard className={responsive.isMobile ? 'p-4' : 'p-6'}>
      <h3 className="text-white font-semibold mb-4">Top DeFi Protocols</h3>
      <div className="space-y-4">
        {stats.topProtocols.map((protocol, i) => (
          <div key={i} className={`flex items-center justify-between bg-white/5 rounded-lg ${responsive.isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex items-center gap-4">
              <div className={`bg-purple-500/20 rounded-full flex items-center justify-center ${responsive.isMobile ? 'w-8 h-8' : 'w-10 h-10'}`}>
                <span className={`text-purple-400 font-bold ${responsive.isMobile ? 'text-sm' : ''}`}>{protocol.name[0]}</span>
              </div>
              <div>
                <div className={`text-white font-medium ${responsive.isMobile ? 'text-sm' : ''}`}>{protocol.name}</div>
                <div className={`text-white/60 ${responsive.isMobile ? 'text-xs' : 'text-sm'}`}>Rank #{i + 1}</div>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-white font-semibold ${responsive.isMobile ? 'text-sm' : ''}`}>${protocol.tvl}</div>
              <div className={`${responsive.isMobile ? 'text-xs' : 'text-sm'} ${protocol.change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
                {protocol.change}
              </div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  </motion.div>
);

// Validators Dashboard Component
const ValidatorsDashboard = ({ stats, responsive }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className={`grid gap-6 ${
      responsive.isMobile ? 'grid-cols-1' : 
      responsive.isTablet ? 'grid-cols-2' : 
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }`}>
      <MetricCard
        title="Total Validators"
        value={formatNumber(stats.total)}
        change="+0.3%"
        icon="👥"
        color="blue"
        responsive={responsive}
      />
      <MetricCard
        title="Active Validators"
        value={formatNumber(stats.active)}
        change="+0.2%"
        icon="✅"
        color="green"
        responsive={responsive}
      />
      <MetricCard
        title="Total Staked"
        value={stats.totalStaked}
        change="+1.1%"
        icon="💰"
        color="yellow"
        responsive={responsive}
      />
      <MetricCard
        title="Staking Ratio"
        value={stats.stakingRatio}
        change="+0.1%"
        icon="📊"
        color="purple"
        responsive={responsive}
      />
    </div>

    <div className={`grid gap-6 ${responsive.isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
      <GlassCard className={responsive.isMobile ? 'p-4' : 'p-6'}>
        <h3 className="text-white font-semibold mb-4">Validator Status</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className={`text-white/80 ${responsive.isMobile ? 'text-sm' : ''}`}>Active</span>
            <span className={`text-green-400 ${responsive.isMobile ? 'text-sm' : ''}`}>{formatNumber(stats.active)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-white/80 ${responsive.isMobile ? 'text-sm' : ''}`}>Pending</span>
            <span className={`text-yellow-400 ${responsive.isMobile ? 'text-sm' : ''}`}>{formatNumber(stats.pending)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-white/80 ${responsive.isMobile ? 'text-sm' : ''}`}>Slashed</span>
            <span className={`text-red-400 ${responsive.isMobile ? 'text-sm' : ''}`}>{formatNumber(stats.slashed)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-white/80 ${responsive.isMobile ? 'text-sm' : ''}`}>Average Reward</span>
            <span className={`text-purple-400 ${responsive.isMobile ? 'text-sm' : ''}`}>{stats.avgReward}</span>
          </div>
        </div>
      </GlassCard>

      <GlassCard className={responsive.isMobile ? 'p-4' : 'p-6'}>
        <h3 className="text-white font-semibold mb-4">Staking Information</h3>
        <div className="space-y-4">
          <div className="text-center">
            <div className={`font-bold text-white mb-2 ${responsive.isMobile ? 'text-2xl' : 'text-3xl'}`}>{stats.totalStaked}</div>
            <div className={`text-white/60 ${responsive.isMobile ? 'text-sm' : ''}`}>Total ETH Staked</div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className={`text-white/60 ${responsive.isMobile ? 'text-sm' : 'text-sm'}`}>Staking Ratio</span>
              <span className={`text-white ${responsive.isMobile ? 'text-sm' : ''}`}>{stats.stakingRatio}</span>
            </div>
            <div className="flex justify-between">
              <span className={`text-white/60 ${responsive.isMobile ? 'text-sm' : 'text-sm'}`}>Next Withdrawal</span>
              <span className={`text-white ${responsive.isMobile ? 'text-sm' : ''}`}>{stats.nextWithdrawal}</span>
            </div>
          </div>
        </div>
      </GlassCard>
    </div>
  </motion.div>
);

// Contracts Dashboard Component
const ContractsDashboard = ({ responsive }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className={`grid gap-6 ${
      responsive.isMobile ? 'grid-cols-1' : 
      responsive.isTablet ? 'grid-cols-2' : 
      'grid-cols-1 md:grid-cols-4'
    }`}>
      <MetricCard
        title="Total Contracts"
        value="2.4M"
        change="+5.2%"
        icon="📋"
        color="blue"
        responsive={responsive}
      />
      <MetricCard
        title="Verified Contracts"
        value="847K"
        change="+3.1%"
        icon="✅"
        color="green"
        responsive={responsive}
      />
      <MetricCard
        title="Daily Deployments"
        value="1,234"
        change="+12.5%"
        icon="🚀"
        color="purple"
        responsive={responsive}
      />
      <MetricCard
        title="Active Contracts"
        value="456K"
        change="+2.8%"
        icon="⚡"
        color="yellow"
        responsive={responsive}
      />
    </div>

    <GlassCard className={responsive.isMobile ? 'p-4' : 'p-6'}>
      <h3 className="text-white font-semibold mb-4">Most Active Contracts</h3>
      <div className="space-y-3">
        {[
          { name: 'Uniswap V3: Router 2', address: '0xE592427A0AEce92De3Edee1F18E0157C05861564', txs: 15234 },
          { name: 'USDC Token', address: '0xA0b86a33E6441E8C8C7014b37C88df5d426d9D32', txs: 12456 },
          { name: 'Wrapped Ether', address: '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2', txs: 9876 },
          { name: 'Compound cDAI', address: '0x5d3a536E4D6DbD6114cc1Ead35777bAB948E3643', txs: 7654 },
          { name: 'Aave: Lending Pool', address: '0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9', txs: 6543 }
        ].map((contract, i) => (
          <div key={i} className={`flex items-center justify-between bg-white/5 rounded-lg ${responsive.isMobile ? 'p-3' : 'p-4'}`}>
            <div className="flex-1 min-w-0">
              <div className={`text-white font-medium ${responsive.isMobile ? 'text-sm' : ''}`}>{contract.name}</div>
              <div className={`text-white/60 font-mono truncate ${responsive.isMobile ? 'text-xs' : 'text-sm'}`}>
                {responsive.isMobile ? `${contract.address.substring(0, 10)}...` : contract.address}
              </div>
            </div>
            <div className="text-right ml-4">
              <div className={`text-white ${responsive.isMobile ? 'text-sm' : ''}`}>{formatNumber(contract.txs)} txs</div>
              <div className={`text-white/60 ${responsive.isMobile ? 'text-xs' : 'text-sm'}`}>24h</div>
            </div>
          </div>
        ))}
      </div>
    </GlassCard>
  </motion.div>
);

// Network Dashboard Component
const NetworkDashboard = ({ stats, historicalData, responsive }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="space-y-6"
  >
    <div className={`grid gap-6 ${
      responsive.isMobile ? 'grid-cols-1' : 
      responsive.isTablet ? 'grid-cols-2' : 
      'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }`}>
      <MetricCard
        title="Network Hashrate"
        value={`${stats.networkHashrate} TH/s`}
        change="+1.2%"
        icon="⚡"
        color="yellow"
        responsive={responsive}
      />
      <MetricCard
        title="Difficulty"
        value={stats.difficulty}
        change="+0.8%"
        icon="🎯"
        color="red"
        responsive={responsive}
      />
      <MetricCard
        title="Total Supply"
        value={stats.totalSupply}
        change="+0.1%"
        icon="💰"
        color="green"
        responsive={responsive}
      />
      <MetricCard
        title="Block Time"
        value={`${stats.blockTime}s`}
        change="-2.1%"
        icon="⏱️"
        color="blue"
        responsive={responsive}
      />
    </div>

    <div className={`grid gap-6 ${responsive.isMobile ? 'grid-cols-1' : 'grid-cols-1 lg:grid-cols-2'}`}>
      <GlassCard className={responsive.isMobile ? 'p-4' : 'p-6'}>
        <h3 className="text-white font-semibold mb-4">Network Performance</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className={`text-white/80 ${responsive.isMobile ? 'text-sm' : ''}`}>Current TPS</span>
            <span className={`text-green-400 ${responsive.isMobile ? 'text-sm' : ''}`}>{stats.tps}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-white/80 ${responsive.isMobile ? 'text-sm' : ''}`}>Peak TPS (24h)</span>
            <span className={`text-yellow-400 ${responsive.isMobile ? 'text-sm' : ''}`}>24.7</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-white/80 ${responsive.isMobile ? 'text-sm' : ''}`}>Avg Block Size</span>
            <span className={`text-blue-400 ${responsive.isMobile ? 'text-sm' : ''}`}>85.2 KB</span>
          </div>
          <div className="flex justify-between items-center">
            <span className={`text-white/80 ${responsive.isMobile ? 'text-sm' : ''}`}>Network Utilization</span>
            <span className={`text-purple-400 ${responsive.isMobile ? 'text-sm' : ''}`}>67.3%</span>
          </div>
        </div>
      </GlassCard>

      <GlassCard className={responsive.isMobile ? 'p-4' : 'p-6'}>
        <h3 className="text-white font-semibold mb-4">Historical Data</h3>
        <div className="text-center text-white/60">
          <div className={`mb-2 ${responsive.isMobile ? 'text-3xl' : 'text-4xl'}`}>📈</div>
          <div className={responsive.isMobile ? 'text-sm' : ''}>Network Metrics Over Time</div>
          <div className={`mt-2 ${responsive.isMobile ? 'text-xs' : 'text-sm'}`}>{historicalData.length} data points</div>
        </div>
      </GlassCard>
    </div>
  </motion.div>
);

// Metric Card Component
const MetricCard = ({ title, value, change, icon, color, responsive }) => {
  const colorClasses = {
    blue: 'text-blue-400',
    green: 'text-green-400',
    yellow: 'text-yellow-400',
    orange: 'text-orange-400',
    purple: 'text-purple-400',
    red: 'text-red-400'
  };

  return (
    <GlassCard className={responsive?.isMobile ? 'p-4' : 'p-6'}>
      <div className="flex items-center justify-between mb-4">
        <span className={`${responsive?.isMobile ? 'text-xl' : 'text-2xl'} ${colorClasses[color]}`}>{icon}</span>
        <span className={`${responsive?.isMobile ? 'text-xs' : 'text-sm'} ${change.startsWith('+') ? 'text-green-400' : 'text-red-400'}`}>
          {change}
        </span>
      </div>
      <div className={`font-bold text-white mb-1 ${responsive?.isMobile ? 'text-lg' : 'text-2xl'}`}>{value}</div>
      <div className={`text-white/60 ${responsive?.isMobile ? 'text-xs' : 'text-sm'}`}>{title}</div>
    </GlassCard>
  );
};

export default BlockchainStatsDashboard;