/**
 * Camera Mode Indicator
 * Shows current camera mode and provides mode switching controls
 */

import { motion } from 'framer-motion';
import { useCameraStore, CAMERA_MODES } from '../../state/useCameraStore.js';

const CameraModeIndicator = () => {
  const { mode, setMode, getCameraState } = useCameraStore();
  const cameraState = getCameraState();
  
  const modeConfig = {
    [CAMERA_MODES.FREE_TRAVEL]: {
      label: 'Free Travel',
      icon: '🚀',
      color: 'blue',
      description: 'Explore the universe freely'
    },
    [CAMERA_MODES.ASSISTED_FOCUS]: {
      label: 'Assisted Focus',
      icon: '🎯',
      color: 'purple',
      description: 'Camera assists with object focus'
    },
    [CAMERA_MODES.DOCKED_ORBIT]: {
      label: 'Docked',
      icon: '🛰️',
      color: 'green',
      description: 'Orbiting selected planet'
    }
  };
  
  const currentMode = modeConfig[mode];
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-6 left-6 z-30 pointer-events-auto"
    >
      <div 
        className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-4 min-w-64"
        style={{ boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)' }}
      >
        {/* Current Mode Display */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`w-3 h-3 rounded-full ${
            mode === CAMERA_MODES.DOCKED_ORBIT ? 'bg-green-400 animate-pulse' : 
            mode === CAMERA_MODES.ASSISTED_FOCUS ? 'bg-purple-400' : 'bg-blue-400'
          }`} />
          
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg">{currentMode.icon}</span>
              <span className="text-white font-semibold">{currentMode.label}</span>
            </div>
            <div className="text-white/60 text-xs">{currentMode.description}</div>
          </div>
        </div>
        
        {/* Docked Planet Info */}
        {cameraState.isDockedToPlanet && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            className="border-t border-white/10 pt-3 mb-3"
          >
            <div className="text-white/70 text-xs mb-1">Docked to:</div>
            <div className="text-white font-medium">{cameraState.planetName}</div>
          </motion.div>
        )}
        
        {/* Mode Controls (only show in free travel) */}
        {mode === CAMERA_MODES.FREE_TRAVEL && (
          <div className="border-t border-white/10 pt-3">
            <div className="text-white/70 text-xs mb-2">Camera Modes:</div>
            <div className="flex gap-2">
              <button
                onClick={() => setMode(CAMERA_MODES.FREE_TRAVEL)}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${
                  mode === CAMERA_MODES.FREE_TRAVEL 
                    ? 'bg-blue-500/30 text-blue-300 border border-blue-400/50' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                🚀 Free
              </button>
              <button
                onClick={() => setMode(CAMERA_MODES.ASSISTED_FOCUS)}
                className={`px-3 py-1 rounded-lg text-xs transition-all ${
                  mode === CAMERA_MODES.ASSISTED_FOCUS 
                    ? 'bg-purple-500/30 text-purple-300 border border-purple-400/50' 
                    : 'bg-white/10 text-white/70 hover:bg-white/20'
                }`}
              >
                🎯 Focus
              </button>
            </div>
          </div>
        )}
        
        {/* Controls Help */}
        <div className="border-t border-white/10 pt-3 mt-3">
          <div className="text-white/50 text-xs">
            {mode === CAMERA_MODES.FREE_TRAVEL && (
              <>
                <div>WASD: Navigate • Mouse: Steer</div>
                <div>Click planet: Dock • Space/Shift: Up/Down</div>
              </>
            )}
            {mode === CAMERA_MODES.DOCKED_ORBIT && (
              <div>Press ESC or click "Continue Journey" to undock</div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default CameraModeIndicator;