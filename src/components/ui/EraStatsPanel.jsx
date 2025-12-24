/**
 * Era Statistics Panel
 * Displays time-based analytics, era progression, and historical staking data
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useValidators } from '../../hooks/useValidators.js';
import { formatNumber, formatPercentage, formatTimeAgo } from '../../utils/formatters.js';
import GlassCard from './GlassCard.jsx';
import GlassButton from './GlassButton.jsx';

const EraStatsPanel = ({ isOpen, onClose }) => {
  const { eraData, stakingMetrics, validators } = useValidators();
  const [selectedEra, setSelectedEra] = useState(null);
  const [timeRange, setTimeRange] = useState('10'); // Last 10 eras

  // Calculate era statistics
  const eraStats = useMemo(() => {
    if (!eraData?.eras) return null;
    
    const eras = eraData.eras.slice(0, parseInt(timeRange));
    
    return {
      totalRewards: eras.reduce((sum, era) => sum + era.totalRewards, 0),
      averageRewards: eras.reduce((sum, era) => sum + era.totalRewards, 0) / eras.length,
      totalStake: eras[0]?.totalStake || 0,
      stakeGrowth: eras.length > 1 ? 
        ((eras[0].totalStake - eras[eras.length - 1].totalStake) / eras[eras.length - 1].totalStake) * 100 : 0,
      averageValidators: eras.reduce((sum, era) => sum + era.activeValidators, 0) / eras.length,
      validatorGrowth: eras.length > 1 ?
        ((eras[0].activeValidators - eras[eras.length - 1].activeValidators) / eras[eras.length - 1].activeValidators) * 100 : 0
    };
  }, [eraData, timeRange]);

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
          className="w-full max-w-6xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard className="h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div>
                <h2 className="text-2xl font-bold text-white">Era Analytics</h2>
                <p className="text-white/60">Historical staking and reward data</p>
              </div>
              <div className="flex items-center gap-4">
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white text-sm"
                >
                  <option value="5">Last 5 Eras</option>
                  <option value="10">Last 10 Eras</option>
                  <option value="20">Last 20 Eras</option>
                  <option value="50">Last 50 Eras</option>
                </select>
                <GlassButton onClick={onClose} variant="danger">✕</GlassButton>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[80vh]">
              {/* Current Era Overview */}
              {eraData && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Current Era Overview</h3>
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <StatCard
                      title="Current Era"
                      value={eraData.currentEra}
                      icon="🏛️"
                    />
                    <StatCard
                      title="Era Progress"
                      value="67%"
                      subtitle="16h remaining"
                      icon="⏱️"
                    />
                    <StatCard
                      title="Active Validators"
                      value={stakingMetrics.activeValidators}
                      subtitle={`of ${stakingMetrics.totalValidators}`}
                      icon="👥"
                    />
                    <StatCard
                      title="Total Stake"
                      value={formatNumber(stakingMetrics.totalStake)}
                      subtitle="DOT"
                      icon="💰"
                    />
                  </div>
                </div>
              )}

              {/* Historical Statistics */}
              {eraStats && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">
                    Historical Statistics (Last {timeRange} Eras)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white border-b border-white/20 pb-2">
                        Rewards
                      </h4>
                      <div className="space-y-3">
                        <InfoRow 
                          label="Total Rewards" 
                          value={formatNumber(eraStats.totalRewards)} 
                        />
                        <InfoRow 
                          label="Average per Era" 
                          value={formatNumber(eraStats.averageRewards)} 
                        />
                        <InfoRow 
                          label="Reward Rate" 
                          value={`${formatPercentage((eraStats.averageRewards / eraStats.totalStake) * 100)}%`}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white border-b border-white/20 pb-2">
                        Staking
                      </h4>
                      <div className="space-y-3">
                        <InfoRow 
                          label="Current Stake" 
                          value={formatNumber(eraStats.totalStake)} 
                        />
                        <InfoRow 
                          label="Stake Growth" 
                          value={`${eraStats.stakeGrowth > 0 ? '+' : ''}${formatPercentage(eraStats.stakeGrowth)}%`}
                          className={eraStats.stakeGrowth > 0 ? 'text-green-400' : 'text-red-400'}
                        />
                        <InfoRow 
                          label="Staking Ratio" 
                          value={`${formatPercentage(stakingMetrics.stakingRatio * 100)}%`}
                        />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-lg font-medium text-white border-b border-white/20 pb-2">
                        Validators
                      </h4>
                      <div className="space-y-3">
                        <InfoRow 
                          label="Average Active" 
                          value={Math.round(eraStats.averageValidators)} 
                        />
                        <InfoRow 
                          label="Validator Growth" 
                          value={`${eraStats.validatorGrowth > 0 ? '+' : ''}${formatPercentage(eraStats.validatorGrowth)}%`}
                          className={eraStats.validatorGrowth > 0 ? 'text-green-400' : 'text-red-400'}
                        />
                        <InfoRow 
                          label="Avg Commission" 
                          value={`${formatPercentage(stakingMetrics.averageCommission)}%`}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Era Timeline */}
              {eraData?.eras && (
                <div className="mb-8">
                  <h3 className="text-xl font-semibold text-white mb-4">Era Timeline</h3>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {eraData.eras.slice(0, parseInt(timeRange)).map((era) => (
                      <EraTimelineItem
                        key={era.era}
                        era={era}
                        isSelected={selectedEra === era.era}
                        onClick={() => setSelectedEra(selectedEra === era.era ? null : era.era)}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Top Validators */}
              <div>
                <h3 className="text-xl font-semibold text-white mb-4">Top Validators by Stake</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {validators
                    .sort((a, b) => b.totalStake - a.totalStake)
                    .slice(0, 6)
                    .map((validator, index) => (
                      <ValidatorCard key={validator.address} validator={validator} rank={index + 1} />
                    ))}
                </div>
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Stat Card Component
const StatCard = ({ title, value, subtitle, icon }) => (
  <div className="bg-white/5 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <span className="text-white/70 text-sm">{title}</span>
      <span className="text-xl">{icon}</span>
    </div>
    <div className="text-2xl font-bold text-white">{value}</div>
    {subtitle && <div className="text-white/60 text-sm">{subtitle}</div>}
  </div>
);

// Era Timeline Item Component
const EraTimelineItem = ({ era, isSelected, onClick }) => (
  <motion.div
    className={`p-4 rounded-lg cursor-pointer transition-all ${
      isSelected ? 'bg-white/10 border border-white/20' : 'bg-white/5 hover:bg-white/8'
    }`}
    onClick={onClick}
    whileHover={{ scale: 1.02 }}
    whileTap={{ scale: 0.98 }}
  >
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-4">
        <div className="text-lg font-bold text-white">Era {era.era}</div>
        <div className="text-white/60 text-sm">
          {formatTimeAgo(era.startTime)} - {formatTimeAgo(era.endTime)}
        </div>
      </div>
      <div className="flex items-center gap-6 text-sm">
        <div className="text-white/70">
          Rewards: <span className="text-white">{formatNumber(era.totalRewards)}</span>
        </div>
        <div className="text-white/70">
          Validators: <span className="text-white">{era.activeValidators}</span>
        </div>
        <div className="text-white/70">
          Blocks: <span className="text-white">{era.blocksProduced}</span>
        </div>
      </div>
    </div>
    
    {isSelected && (
      <motion.div
        initial={{ opacity: 0, height: 0 }}
        animate={{ opacity: 1, height: 'auto' }}
        exit={{ opacity: 0, height: 0 }}
        className="mt-4 pt-4 border-t border-white/10"
      >
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <InfoRow label="Total Stake" value={formatNumber(era.totalStake)} />
          <InfoRow label="Avg Commission" value={`${formatPercentage(era.averageCommission)}%`} />
          <InfoRow label="Reward Rate" value={`${formatPercentage((era.totalRewards / era.totalStake) * 100)}%`} />
          <InfoRow label="Duration" value="24h" />
        </div>
      </motion.div>
    )}
  </motion.div>
);

// Validator Card Component
const ValidatorCard = ({ validator, rank }) => (
  <div className="bg-white/5 rounded-lg p-4">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-2">
        <span className="text-lg font-bold text-white">#{rank}</span>
        <span className={`text-sm ${getStatusColor(validator.status)}`}>
          {getStatusIcon(validator.status)}
        </span>
      </div>
      <div className="text-white/60 text-xs">
        {formatPercentage(validator.commission)}% commission
      </div>
    </div>
    
    <div className="text-white font-medium mb-1">
      {validator.identity || 'Anonymous'}
    </div>
    <div className="text-white/60 text-xs font-mono mb-2">
      {validator.address}
    </div>
    
    <div className="text-lg font-bold text-white">
      {formatNumber(validator.totalStake)}
    </div>
    <div className="text-white/60 text-xs">
      Total Stake
    </div>
  </div>
);

// Helper Components
const InfoRow = ({ label, value, className = "text-white" }) => (
  <div className="flex flex-col">
    <span className="text-white/70 text-xs">{label}</span>
    <span className={`font-medium ${className}`}>{value}</span>
  </div>
);

const getStatusColor = (status) => {
  switch (status) {
    case 'active': return 'text-green-400';
    case 'inactive': return 'text-yellow-400';
    case 'slashed': return 'text-red-400';
    default: return 'text-gray-400';
  }
};

const getStatusIcon = (status) => {
  switch (status) {
    case 'active': return '✓';
    case 'inactive': return '⏸';
    case 'slashed': return '⚠';
    default: return '?';
  }
};

export default EraStatsPanel;