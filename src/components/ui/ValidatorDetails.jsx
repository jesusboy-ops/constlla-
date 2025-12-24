/**
 * Validator Details Panel
 * Displays comprehensive validator information, staking data, and performance metrics
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useMemo } from 'react';
import { useValidators } from '../../hooks/useValidators.js';
import { formatNumber, formatPercentage, formatTimeAgo } from '../../utils/formatters.js';
import GlassCard from './GlassCard.jsx';
import GlassButton from './GlassButton.jsx';

const ValidatorDetails = ({ validatorAddress, onClose }) => {
  const { getValidator, getValidatorMetrics, eraData } = useValidators();
  const [activeTab, setActiveTab] = useState('overview');
  
  const validator = useMemo(() => getValidator(validatorAddress), [getValidator, validatorAddress]);
  const metrics = useMemo(() => getValidatorMetrics(validatorAddress), [getValidatorMetrics, validatorAddress]);
  
  if (!validator) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50"
        onClick={onClose}
      >
        <GlassCard className="p-6 max-w-md">
          <h3 className="text-xl font-bold text-white mb-4">Validator Not Found</h3>
          <p className="text-white/70 mb-4">The requested validator could not be found.</p>
          <GlassButton onClick={onClose}>Close</GlassButton>
        </GlassCard>
      </motion.div>
    );
  }

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
          className="w-full max-w-4xl max-h-[90vh] overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard className="h-full overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <div className="flex items-center gap-4">
                <div className={`text-2xl ${getStatusColor(validator.status)}`}>
                  {getStatusIcon(validator.status)}
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">
                    {validator.identity || 'Anonymous Validator'}
                  </h2>
                  <p className="text-white/60 font-mono text-sm">{validator.address}</p>
                </div>
              </div>
              <GlassButton onClick={onClose} variant="danger">✕</GlassButton>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-white/10">
              {['overview', 'performance', 'rewards', 'history'].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === tab
                      ? 'text-white border-b-2 border-white'
                      : 'text-white/60 hover:text-white/80'
                  }`}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {activeTab === 'overview' && (
                <OverviewTab validator={validator} metrics={metrics} />
              )}
              {activeTab === 'performance' && (
                <PerformanceTab validator={validator} metrics={metrics} />
              )}
              {activeTab === 'rewards' && (
                <RewardsTab validator={validator} eraData={eraData} />
              )}
              {activeTab === 'history' && (
                <HistoryTab validator={validator} />
              )}
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

// Overview Tab Component
const OverviewTab = ({ validator, metrics }) => (
  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
    {/* Basic Info */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
        Basic Information
      </h3>
      
      <div className="space-y-3">
        <InfoRow label="Status" value={validator.status} className={getStatusColor(validator.status)} />
        <InfoRow label="Commission" value={`${formatPercentage(validator.commission)}%`} />
        <InfoRow label="Last Seen" value={formatTimeAgo(validator.lastSeen)} />
        <InfoRow label="Uptime" value={`${formatPercentage(validator.uptime * 100)}%`} />
      </div>
    </div>

    {/* Staking Info */}
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
        Staking Information
      </h3>
      
      <div className="space-y-3">
        <InfoRow label="Total Stake" value={formatNumber(validator.totalStake)} />
        <InfoRow label="Own Stake" value={formatNumber(validator.ownStake)} />
        <InfoRow label="Nominator Stake" value={formatNumber(validator.nominatorStake)} />
        <InfoRow 
          label="Self Stake Ratio" 
          value={`${formatPercentage((validator.ownStake / validator.totalStake) * 100)}%`} 
        />
      </div>
    </div>

    {/* Performance Metrics */}
    {metrics && (
      <div className="md:col-span-2 space-y-4">
        <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
          Performance Metrics
        </h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <MetricCard
            label="Performance"
            value={`${formatPercentage(metrics.performance * 100)}%`}
            color={metrics.performance > 0.95 ? 'text-green-400' : metrics.performance > 0.8 ? 'text-yellow-400' : 'text-red-400'}
          />
          <MetricCard
            label="Reliability"
            value={`${formatPercentage(metrics.reliability * 100)}%`}
            color={metrics.reliability > 0.95 ? 'text-green-400' : metrics.reliability > 0.8 ? 'text-yellow-400' : 'text-red-400'}
          />
          <MetricCard
            label="Blocks Produced"
            value={validator.blocksProduced}
            color="text-blue-400"
          />
          <MetricCard
            label="Era Rewards"
            value={formatNumber(validator.eraRewards)}
            color="text-purple-400"
          />
        </div>
      </div>
    )}
  </div>
);

// Performance Tab Component
const PerformanceTab = ({ validator, metrics }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Block Production</h3>
        <div className="space-y-2">
          <InfoRow label="Blocks Produced" value={validator.blocksProduced} />
          <InfoRow label="Blocks Assigned" value={validator.blocksAssigned} />
          <InfoRow 
            label="Success Rate" 
            value={`${formatPercentage((validator.blocksProduced / validator.blocksAssigned) * 100)}%`}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Reward Points</h3>
        <div className="space-y-2">
          <InfoRow label="Current Points" value={validator.rewardPoints} />
          <InfoRow label="Expected Points" value={validator.expectedPoints} />
          <InfoRow 
            label="Point Ratio" 
            value={`${formatPercentage((validator.rewardPoints / validator.expectedPoints) * 100)}%`}
          />
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Network Stats</h3>
        <div className="space-y-2">
          <InfoRow label="Uptime" value={`${formatPercentage(validator.uptime * 100)}%`} />
          <InfoRow label="Commission" value={`${formatPercentage(validator.commission)}%`} />
          <InfoRow label="Status" value={validator.status} className={getStatusColor(validator.status)} />
        </div>
      </div>
    </div>
  </div>
);

// Rewards Tab Component
const RewardsTab = ({ validator, eraData }) => (
  <div className="space-y-6">
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Current Era Rewards</h3>
        <div className="space-y-2">
          <InfoRow label="Era Rewards" value={formatNumber(validator.eraRewards)} />
          <InfoRow label="Commission Earned" value={formatNumber(validator.eraRewards * validator.commission / 100)} />
          <InfoRow label="Nominator Rewards" value={formatNumber(validator.eraRewards * (1 - validator.commission / 100))} />
        </div>
      </div>

      {eraData && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Era Information</h3>
          <div className="space-y-2">
            <InfoRow label="Current Era" value={eraData.currentEra} />
            <InfoRow label="Era Length" value={`${eraData.eraLength / 3600}h`} />
            <InfoRow label="Sessions per Era" value={eraData.sessionsPerEra} />
          </div>
        </div>
      )}
    </div>
  </div>
);

// History Tab Component
const HistoryTab = ({ validator }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-semibold text-white">Validator History</h3>
    <div className="space-y-4">
      <InfoRow label="First Seen" value={formatTimeAgo(validator.lastSeen - 86400000 * 30)} />
      <InfoRow label="Total Eras Active" value="847" />
      <InfoRow label="Slashing Events" value={validator.status === 'slashed' ? '1' : '0'} />
      <InfoRow label="Identity Changes" value="2" />
    </div>
  </div>
);

// Helper Components
const InfoRow = ({ label, value, className = "text-white" }) => (
  <div className="flex justify-between items-center">
    <span className="text-white/70">{label}:</span>
    <span className={className}>{value}</span>
  </div>
);

const MetricCard = ({ label, value, color = "text-white" }) => (
  <div className="bg-white/5 rounded-lg p-4 text-center">
    <div className="text-white/70 text-sm mb-1">{label}</div>
    <div className={`text-xl font-bold ${color}`}>{value}</div>
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

export default ValidatorDetails;