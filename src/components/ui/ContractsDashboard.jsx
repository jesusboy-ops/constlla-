/**
 * Contracts Dashboard
 * Overview of smart contracts, deployments, and contract activity
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useContractData } from '../../hooks/useContractData.js';
import { formatNumber, formatTimeAgo } from '../../utils/formatters.js';
import GlassCard from './GlassCard.jsx';
import GlassButton from './GlassButton.jsx';

const ContractsDashboard = ({ isOpen, onClose }) => {
  const { contracts, contractMetrics } = useContractData();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('activity'); // activity, value, age
  const [timeframe, setTimeframe] = useState('24h');

  // Mock contract data for demonstration
  const mockContracts = useMemo(() => [
    {
      id: '1',
      name: 'Uniswap V3 Router',
      address: '0xE592427A0AEce92De3Edee1F18E0157C05861564',
      category: 'DeFi',
      totalValue: 2400000,
      dailyTransactions: 15420,
      gasUsed: 8500000,
      deployedAt: Date.now() - 86400000 * 365,
      verified: true,
      isActive: true
    },
    {
      id: '2', 
      name: 'OpenSea Seaport',
      address: '0x00000000006c3852cbEf3e08E8dF289169EdE581',
      category: 'NFT',
      totalValue: 890000,
      dailyTransactions: 8920,
      gasUsed: 4200000,
      deployedAt: Date.now() - 86400000 * 180,
      verified: true,
      isActive: true
    },
    {
      id: '3',
      name: 'Compound V3 USDC',
      address: '0xc3d688B66703497DAA19211EEdff47f25384cdc3',
      category: 'DeFi',
      totalValue: 1200000,
      dailyTransactions: 3450,
      gasUsed: 2100000,
      deployedAt: Date.now() - 86400000 * 90,
      verified: true,
      isActive: true
    },
    {
      id: '4',
      name: 'Chainlink Price Feed',
      address: '0x5f4eC3Df9cbd43714FE2740f5E3616155c5b8419',
      category: 'Oracle',
      totalValue: 0,
      dailyTransactions: 12000,
      gasUsed: 1800000,
      deployedAt: Date.now() - 86400000 * 500,
      verified: true,
      isActive: true
    },
    {
      id: '5',
      name: 'Aave V3 Pool',
      address: '0x87870Bca3F3fD6335C3F4ce8392D69350B4fA4E2',
      category: 'DeFi',
      totalValue: 3200000,
      dailyTransactions: 6780,
      gasUsed: 5400000,
      deployedAt: Date.now() - 86400000 * 120,
      verified: true,
      isActive: true
    }
  ], []);

  // Filter and sort contracts
  const processedContracts = useMemo(() => {
    let filtered = mockContracts.filter(contract => {
      if (selectedCategory === 'all') return true;
      return contract.category.toLowerCase() === selectedCategory.toLowerCase();
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'activity':
          return b.dailyTransactions - a.dailyTransactions;
        case 'value':
          return b.totalValue - a.totalValue;
        case 'age':
          return a.deployedAt - b.deployedAt;
        default:
          return 0;
      }
    });
  }, [mockContracts, selectedCategory, sortBy]);

  // Calculate statistics
  const stats = useMemo(() => {
    const totalContracts = mockContracts.length;
    const activeContracts = mockContracts.filter(c => c.isActive).length;
    const totalValue = mockContracts.reduce((sum, c) => sum + c.totalValue, 0);
    const totalTransactions = mockContracts.reduce((sum, c) => sum + c.dailyTransactions, 0);
    const totalGasUsed = mockContracts.reduce((sum, c) => sum + c.gasUsed, 0);
    
    const categories = mockContracts.reduce((acc, contract) => {
      acc[contract.category] = (acc[contract.category] || 0) + 1;
      return acc;
    }, {});

    return {
      totalContracts,
      activeContracts,
      totalValue,
      totalTransactions,
      totalGasUsed,
      categories,
      verifiedContracts: mockContracts.filter(c => c.verified).length
    };
  }, [mockContracts]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          className="w-full max-w-7xl h-full max-h-[90vh] bg-black/90 backdrop-blur-xl border border-white/20 rounded-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <div>
              <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                📋 Smart Contracts Dashboard
              </h2>
              <p className="text-white/60">Contract deployments, activity, and ecosystem overview</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
            >
              ✕
            </button>
          </div>

          <div className="p-6 overflow-y-auto h-full">
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <GlassCard className="p-4">
                <div className="text-white/60 text-sm">Total Contracts</div>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.totalContracts)}</div>
                <div className="text-green-400 text-sm">
                  {stats.activeContracts} active
                </div>
              </GlassCard>
              
              <GlassCard className="p-4">
                <div className="text-white/60 text-sm">Total Value Locked</div>
                <div className="text-2xl font-bold text-white">${formatNumber(stats.totalValue)}</div>
                <div className="text-blue-400 text-sm">
                  Across all contracts
                </div>
              </GlassCard>
              
              <GlassCard className="p-4">
                <div className="text-white/60 text-sm">Daily Transactions</div>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.totalTransactions)}</div>
                <div className="text-purple-400 text-sm">
                  Last 24 hours
                </div>
              </GlassCard>
              
              <GlassCard className="p-4">
                <div className="text-white/60 text-sm">Gas Consumed</div>
                <div className="text-2xl font-bold text-white">{formatNumber(stats.totalGasUsed)}</div>
                <div className="text-yellow-400 text-sm">
                  Daily usage
                </div>
              </GlassCard>
            </div>

            {/* Category Distribution */}
            <div className="mb-6">
              <h3 className="text-xl font-semibold text-white mb-4">Contract Categories</h3>
              <div className="flex flex-wrap gap-2">
                <GlassButton
                  onClick={() => setSelectedCategory('all')}
                  className={`px-4 py-2 ${selectedCategory === 'all' ? 'bg-purple-500/20 text-purple-300' : ''}`}
                >
                  All ({stats.totalContracts})
                </GlassButton>
                {Object.entries(stats.categories).map(([category, count]) => (
                  <GlassButton
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`px-4 py-2 ${selectedCategory === category ? 'bg-purple-500/20 text-purple-300' : ''}`}
                  >
                    {category} ({count})
                  </GlassButton>
                ))}
              </div>
            </div>

            {/* Controls */}
            <div className="flex flex-wrap gap-4 mb-6">
              <div className="flex gap-2">
                <span className="text-white/60 text-sm self-center">Sort by:</span>
                {['activity', 'value', 'age'].map((sort) => (
                  <GlassButton
                    key={sort}
                    onClick={() => setSortBy(sort)}
                    className={`px-3 py-1 text-sm ${sortBy === sort ? 'bg-blue-500/20 text-blue-300' : ''}`}
                  >
                    {sort.charAt(0).toUpperCase() + sort.slice(1)}
                  </GlassButton>
                ))}
              </div>
            </div>

            {/* Contracts List */}
            <div className="space-y-3">
              <h3 className="text-xl font-semibold text-white mb-4">
                Top Contracts ({processedContracts.length})
              </h3>
              
              {processedContracts.map((contract, index) => (
                <GlassCard 
                  key={contract.id}
                  className="p-4 hover:bg-white/5 cursor-pointer transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <div className="text-white font-semibold">{contract.name}</div>
                          {contract.verified && (
                            <div className="px-2 py-1 bg-green-500/20 text-green-300 text-xs rounded">
                              ✓ Verified
                            </div>
                          )}
                          <div className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                            {contract.category}
                          </div>
                        </div>
                        <div className="text-white/60 text-sm font-mono">
                          {contract.address}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          ${formatNumber(contract.totalValue)}
                        </div>
                        <div className="text-white/60 text-sm">Total Value</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          {formatNumber(contract.dailyTransactions)}
                        </div>
                        <div className="text-white/60 text-sm">Daily TXs</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-white font-semibold">
                          {formatNumber(contract.gasUsed)}
                        </div>
                        <div className="text-white/60 text-sm">Gas Used</div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-white/60 text-sm">
                          {formatTimeAgo(contract.deployedAt)}
                        </div>
                        <div className="text-white/60 text-xs">Deployed</div>
                      </div>
                    </div>
                  </div>
                </GlassCard>
              ))}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ContractsDashboard;