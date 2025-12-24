/**
 * Validator & Staking Data Hook
 * Fetches and manages validator information, staking data, and era analytics
 */

import { useState, useEffect, useCallback } from 'react';
import { useChainStore } from '../state/useChainStore.js';
import { useSettingsStore } from '../state/useSettingsStore.js';

export const useValidators = () => {
  const { selectedChain } = useChainStore();
  const { enableRealTimeData } = useSettingsStore();
  
  const [validators, setValidators] = useState([]);
  const [eraData, setEraData] = useState(null);
  const [stakingMetrics, setStakingMetrics] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch validator data
  const fetchValidators = useCallback(async () => {
    if (!selectedChain) return;
    
    setLoading(true);
    setError(null);
    
    try {
      // Simulate validator data for different chains
      const mockValidators = generateMockValidators(selectedChain);
      setValidators(mockValidators);
      
      // Generate era data
      const mockEraData = generateMockEraData();
      setEraData(mockEraData);
      
      // Calculate staking metrics
      const metrics = calculateStakingMetrics(mockValidators);
      setStakingMetrics(metrics);
      
    } catch (err) {
      setError(err.message);
      console.error('Error fetching validator data:', err);
    } finally {
      setLoading(false);
    }
  }, [selectedChain]);

  // Real-time updates
  useEffect(() => {
    fetchValidators();
    
    if (enableRealTimeData) {
      const interval = setInterval(fetchValidators, 30000); // Update every 30s
      return () => clearInterval(interval);
    }
  }, [fetchValidators, enableRealTimeData]);

  // Get validator by address
  const getValidator = useCallback((address) => {
    if (!address || !validators || validators.length === 0) return null;
    return validators.find(v => v && v.address === address) || null;
  }, [validators]);

  // Get top validators by stake
  const getTopValidators = useCallback((limit = 10) => {
    if (!validators || validators.length === 0) return [];
    return validators
      .filter(v => v && v.totalStake)
      .sort((a, b) => (b.totalStake || 0) - (a.totalStake || 0))
      .slice(0, limit);
  }, [validators]);

  // Get validator performance metrics
  const getValidatorMetrics = useCallback((address) => {
    const validator = getValidator(address);
    if (!validator) return null;
    
    return {
      performance: validator.rewardPoints / Math.max(validator.expectedPoints, 1),
      reliability: validator.blocksProduced / Math.max(validator.blocksAssigned, 1),
      commission: validator.commission,
      isActive: validator.status === 'active',
      isSlashed: validator.status === 'slashed'
    };
  }, [getValidator]);

  return {
    validators,
    eraData,
    stakingMetrics,
    loading,
    error,
    getValidator,
    getTopValidators,
    getValidatorMetrics,
    refetch: fetchValidators
  };
};

// Generate mock validator data
const generateMockValidators = (chain) => {
  const validatorCount = chain === 'polkadot' ? 297 : chain === 'kusama' ? 1000 : 150;
  const validators = [];
  
  for (let i = 0; i < validatorCount; i++) {
    const baseStake = Math.random() * 1000000 + 100000;
    const commission = Math.random() * 20; // 0-20%
    const isActive = Math.random() > 0.1; // 90% active
    const isSlashed = Math.random() < 0.02; // 2% slashed
    
    validators.push({
      address: `${chain}${i.toString().padStart(4, '0')}...${Math.random().toString(36).substr(2, 6)}`,
      identity: Math.random() > 0.7 ? `Validator-${i + 1}` : null,
      totalStake: baseStake,
      ownStake: baseStake * (0.1 + Math.random() * 0.3),
      nominatorStake: baseStake * (0.7 + Math.random() * 0.2),
      commission: commission,
      rewardPoints: Math.floor(Math.random() * 1000),
      expectedPoints: 1000,
      blocksProduced: Math.floor(Math.random() * 100),
      blocksAssigned: 100,
      status: isSlashed ? 'slashed' : isActive ? 'active' : 'inactive',
      eraRewards: Math.random() * 10000,
      position: generateValidatorPosition(i, validatorCount),
      lastSeen: Date.now() - Math.random() * 86400000, // Last 24h
      uptime: 0.95 + Math.random() * 0.05 // 95-100%
    });
  }
  
  return validators;
};

// Generate validator positions in 3D space
const generateValidatorPosition = (index, total) => {
  // Arrange validators in a sphere around the center
  const phi = Math.acos(1 - 2 * (index + 0.5) / total);
  const theta = Math.PI * (1 + Math.sqrt(5)) * (index + 0.5);
  
  const radius = 150 + Math.random() * 50; // 150-200 units from center
  
  return [
    radius * Math.sin(phi) * Math.cos(theta),
    radius * Math.cos(phi),
    radius * Math.sin(phi) * Math.sin(theta)
  ];
};

// Generate mock era data
const generateMockEraData = () => {
  const currentEra = 1000 + Math.floor(Math.random() * 100);
  const eras = [];
  
  for (let i = 0; i < 10; i++) {
    const era = currentEra - i;
    eras.push({
      era,
      startTime: Date.now() - (i + 1) * 86400000, // Each era is ~1 day
      endTime: Date.now() - i * 86400000,
      totalRewards: 50000 + Math.random() * 20000,
      totalStake: 10000000 + Math.random() * 2000000,
      activeValidators: 250 + Math.floor(Math.random() * 50),
      averageCommission: 5 + Math.random() * 10,
      blocksProduced: 7200 + Math.floor(Math.random() * 200)
    });
  }
  
  return {
    currentEra,
    eras,
    eraLength: 86400, // 24 hours in seconds
    sessionsPerEra: 6
  };
};

// Calculate staking metrics
const calculateStakingMetrics = (validators) => {
  const activeValidators = validators.filter(v => v.status === 'active');
  const totalStake = validators.reduce((sum, v) => sum + v.totalStake, 0);
  const totalRewards = validators.reduce((sum, v) => sum + v.eraRewards, 0);
  
  return {
    totalValidators: validators.length,
    activeValidators: activeValidators.length,
    totalStake,
    averageStake: totalStake / validators.length,
    totalRewards,
    averageCommission: validators.reduce((sum, v) => sum + v.commission, 0) / validators.length,
    stakingRatio: totalStake / (totalStake + 1000000), // Assume some unstaked tokens
    slashingEvents: validators.filter(v => v.status === 'slashed').length
  };
};

export default useValidators;