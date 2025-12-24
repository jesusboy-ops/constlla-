/**
 * Validators Dashboard
 * Focused on individual validator performance, staking, and network participation
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useValidators } from '../../hooks/useValidators.js';
import { formatNumber, formatPercentage, formatTimeAgo } from '../../utils/formatters.js';
import GlassCard from './GlassCard.jsx';
import GlassButton from './GlassButton.jsx';

const ValidatorsDashboard = ({ isOpen, onClose }) => {
  const { validators, stakingMetrics, eraData } = useValidators();
  const [selectedValidator, setSelectedValidator] = useState(null);
  const [sortBy, setSortBy] = useState('stake'); // stake, performance, rewards
  const [filterStatus, setFilterStatus] = useState('all'); // all, active, inactive

  // Process validator data
  const processedValidators = useMemo(() => {
    if (!validators) return [];
    
    let filtered = validators.filter(validator => {
      if (filterStatus === 'active') return validator.isActive;
      if (filterStatus === 'inactive') return !validator.isActive;
      return true;
    });

    return filtered.sort((a, b) => {
      switch (sortBy) {
        case 'stake':
          return b.totalStake - a.totalStake;
        case 'performance':
          return b.performance - a.performance;
        case 'rewards':
          return b.totalRewards - a.totalRewards;
        default:
          return 0;
      }
    });
  }, [validators, sortBy, filterStatus]);

  // Calculate validator statistics
  const validatorStats = useMemo(() => {
    if (!validators) return null;
    
    const activeValidators = validators.filter(v => v.isActive);
    const totalStake = validators.reduce((sum, v) => sum + v.totalStake, 0);
    const avgPerformance = validators.reduce((sum, v) => sum + v.performance, 0) / validators.length;
    
    return {
      total: validators.length,
      active: activeValidators.length,
      inactive: validators.length - activeValidators.length,
      totalStake,
      avgStake: totalStake / validators.length,
      avgPerformance,
      topPerformer: validators.reduce((top, v) => v.performance > top.performance ? v : top, validators[0])
    };
  }, [validators]);

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
                👥 Validators Dashboard
              </h2>
              <p className="text-white/60">Network validators, staking, and performance metrics</p>
            </div>
            <button
              onClick={onClose}
              className="w-10 h-10 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white/60 hover:text-white hover:bg-white/20 transition-all"
            >
              ✕
            </button>
          </div>

          <div className="flex h-full">
            {/* Main Content */}
            <div className="flex-1 p-6 overflow-y-auto">
              {/* Stats Overview */}
              {validatorStats && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <GlassCard className="p-4">
                    <div className="text-white/60 text-sm">Total Validators</div>
                    <div className="text-2xl font-bold text-white">{formatNumber(validatorStats.total)}</div>
                    <div className="text-green-400 text-sm">
                      {formatNumber(validatorStats.active)} active
                    </div>
                  </GlassCard>
                  
                  <GlassCard className="p-4">
                    <div className="text-white/60 text-sm">Total Staked</div>
                    <div className="text-2xl font-bold text-white">{formatNumber(validatorStats.totalStake)} ETH</div>
                    <div className="text-blue-400 text-sm">
                      Avg: {formatNumber(validatorStats.avgStake)} ETH
                    </div>
                  </GlassCard>
                  
                  <GlassCard className="p-4">
                    <div className="text-white/60 text-sm">Avg Performance</div>
                    <div className="text-2xl font-bold text-white">{formatPercentage(validatorStats.avgPerformance)}</div>
                    <div className="text-purple-400 text-sm">
                      Network health: Good
                    </div>
                  </GlassCard>
                  
                  <GlassCard className="p-4">
                    <div className="text-white/60 text-sm">Top Performer</div>
                    <div className="text-lg font-bold text-white truncate">{validatorStats.topPerformer?.name || 'Validator #1'}</div>
                    <div className="text-yellow-400 text-sm">
                      {formatPercentage(validatorStats.topPerformer?.performance || 0)}
                    </div>
                  </GlassCard>
                </div>
              )}

              {/* Controls */}
              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex gap-2">
                  <span className="text-white/60 text-sm self-center">Sort by:</span>
                  {['stake', 'performance', 'rewards'].map((sort) => (
                    <GlassButton
                      key={sort}
                      onClick={() => setSortBy(sort)}
                      className={`px-3 py-1 text-sm ${sortBy === sort ? 'bg-purple-500/20 text-purple-300' : ''}`}
                    >
                      {sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </GlassButton>
                  ))}
                </div>
                
                <div className="flex gap-2">
                  <span className="text-white/60 text-sm self-center">Filter:</span>
                  {['all', 'active', 'inactive'].map((filter) => (
                    <GlassButton
                      key={filter}
                      onClick={() => setFilterStatus(filter)}
                      className={`px-3 py-1 text-sm ${filterStatus === filter ? 'bg-blue-500/20 text-blue-300' : ''}`}
                    >
                      {filter.charAt(0).toUpperCase() + filter.slice(1)}
                    </GlassButton>
                  ))}
                </div>
              </div>

              {/* Validators List */}
              <div className="space-y-3">
                <h3 className="text-xl font-semibold text-white mb-4">
                  Validators ({processedValidators.length})
                </h3>
                
                {processedValidators.slice(0, 20).map((validator, index) => (
                  <GlassCard 
                    key={validator.address || index}
                    className="p-4 hover:bg-white/5 cursor-pointer transition-all"
                    onClick={() => setSelectedValidator(validator)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 flex items-center justify-center text-white font-bold">
                          #{index + 1}
                        </div>
                        <div>
                          <div className="text-white font-semibold">
                            {validator.name || `Validator ${validator.address?.slice(0, 8)}...`}
                          </div>
                          <div className="text-white/60 text-sm">
                            {validator.address?.slice(0, 20)}...
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            {formatNumber(validator.totalStake)} ETH
                          </div>
                          <div className="text-white/60 text-sm">Staked</div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-white font-semibold">
                            {formatPercentage(validator.performance)}
                          </div>
                          <div className="text-white/60 text-sm">Performance</div>
                        </div>
                        
                        <div className="text-right">
                          <div className={`px-2 py-1 rounded text-xs font-semibold ${
                            validator.isActive 
                              ? 'bg-green-500/20 text-green-300' 
                              : 'bg-red-500/20 text-red-300'
                          }`}>
                            {validator.isActive ? 'Active' : 'Inactive'}
                          </div>
                        </div>
                      </div>
                    </div>
                  </GlassCard>
                ))}
              </div>
            </div>

            {/* Validator Details Sidebar */}
            {selectedValidator && (
              <div className="w-80 border-l border-white/10 p-6 overflow-y-auto">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">Validator Details</h3>
                  <button
                    onClick={() => setSelectedValidator(null)}
                    className="text-white/60 hover:text-white"
                  >
                    ✕
                  </button>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="text-white/60 text-sm">Name</div>
                    <div className="text-white font-semibold">
                      {selectedValidator.name || 'Unknown Validator'}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-white/60 text-sm">Address</div>
                    <div className="text-white font-mono text-xs break-all">
                      {selectedValidator.address}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-white/60 text-sm">Total Stake</div>
                    <div className="text-white font-semibold">
                      {formatNumber(selectedValidator.totalStake)} ETH
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-white/60 text-sm">Performance</div>
                    <div className="text-white font-semibold">
                      {formatPercentage(selectedValidator.performance)}
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-white/60 text-sm">Total Rewards</div>
                    <div className="text-white font-semibold">
                      {formatNumber(selectedValidator.totalRewards)} ETH
                    </div>
                  </div>
                  
                  <div>
                    <div className="text-white/60 text-sm">Status</div>
                    <div className={`inline-block px-2 py-1 rounded text-xs font-semibold ${
                      selectedValidator.isActive 
                        ? 'bg-green-500/20 text-green-300' 
                        : 'bg-red-500/20 text-red-300'
                    }`}>
                      {selectedValidator.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ValidatorsDashboard;