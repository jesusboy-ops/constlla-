/**
 * Exploration HUD
 * Minimal heads-up display showing exploration status and controls
 * Only visible in explore mode, very subtle and non-intrusive
 */

import { motion } from 'framer-motion';
import { useExplorationStore, EXPLORATION_MODES } from '../../state/useExplorationStore.js';

const ExplorationHUD = () => {
  const { 
    mode, 
    nearbyPlanets, 
    scannedPlanets, 
    spaceshipVelocity 
  } = useExplorationStore();
  
  if (mode !== EXPLORATION_MODES.EXPLORE) return null;
  
  // Calculate speed from velocity
  const speed = spaceshipVelocity ? 
    Math.sqrt(spaceshipVelocity[0]**2 + spaceshipVelocity[1]**2 + spaceshipVelocity[2]**2) : 0;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed top-6 left-6 z-30 pointer-events-none"
    >
      <div 
        className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 min-w-64"
        style={{ boxShadow: '0 4px 20px rgba(0, 0, 0, 0.2)' }}
      >
        {/* Status Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-green-400 text-sm font-medium">
            EXPLORATION ACTIVE
          </span>
        </div>
        
        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 text-xs">
          <div>
            <span className="text-white/60">Speed:</span>
            <div className="text-white font-mono">
              {speed.toFixed(1)} u/s
            </div>
          </div>
          
          <div>
            <span className="text-white/60">Nearby:</span>
            <div className="text-white font-mono">
              {nearbyPlanets.length} planets
            </div>
          </div>
          
          <div>
            <span className="text-white/60">Scanned:</span>
            <div className="text-blue-400 font-mono">
              {scannedPlanets.size} blocks
            </div>
          </div>
          
          <div>
            <span className="text-white/60">Scanner:</span>
            <div className="text-white font-mono">
              SPACE
            </div>
          </div>
        </div>
        
        {/* Controls Hint */}
        <div className="mt-3 pt-3 border-t border-white/10">
          <div className="text-white/40 text-xs">
            WASD: Move • Mouse: Steer • SPACE: Scan
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ExplorationHUD;