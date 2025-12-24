/**
 * Physics Debug Component
 * Development tool for monitoring physics simulation
 */

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GlassCard from './GlassCard.jsx';

const PhysicsDebug = ({ physicsEngine, enabled = false }) => {
  const [stats, setStats] = useState({
    bodyCount: 0,
    totalKineticEnergy: 0,
    totalPotentialEnergy: 0,
    totalEnergy: 0
  });

  useEffect(() => {
    if (!enabled || !physicsEngine) return;

    const interval = setInterval(() => {
      const newStats = physicsEngine.getStats();
      setStats(newStats);
    }, 100);

    return () => clearInterval(interval);
  }, [physicsEngine, enabled]);

  if (!enabled || process.env.NODE_ENV !== 'development') {
    return null;
  }

  return (
    <motion.div
      className="fixed top-24 left-6 z-40"
      initial={{ opacity: 0, x: -100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5 }}
    >
      <GlassCard className="w-64 space-y-3">
        <h3 className="text-white font-semibold text-sm border-b border-white/20 pb-2">
          🔬 Physics Debug
        </h3>
        
        <div className="space-y-2 text-xs">
          <div className="flex justify-between">
            <span className="text-white/60">Bodies:</span>
            <span className="text-white font-mono">{stats.bodyCount}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-white/60">Kinetic Energy:</span>
            <span className="text-white font-mono">{stats.totalKineticEnergy.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-white/60">Potential Energy:</span>
            <span className="text-white font-mono">{stats.totalPotentialEnergy.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between">
            <span className="text-white/60">Total Energy:</span>
            <span className="text-white font-mono">{stats.totalEnergy.toFixed(2)}</span>
          </div>
        </div>

        <div className="pt-2 border-t border-white/10">
          <div className="text-white/50 text-xs">
            Physics simulation running at 60 FPS
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
};

export default PhysicsDebug;