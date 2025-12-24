/**
 * Mobile Directional Controls
 * Up/Down/Left/Right navigation controls for mobile planet exploration
 * Communicates with camera controller via events
 */

import { motion } from 'framer-motion';
import { useRef, useEffect } from 'react';
import { useVisualizationStore, VISUALIZATION_MODES } from '../../state/useVisualizationStore.js';

const MobileDirectionalControls = ({ responsive }) => {
  const { mode } = useVisualizationStore();
  const moveIntervalRef = useRef(null);
  
  // Only show in explore mode on mobile
  if (!responsive.isMobile || mode !== VISUALIZATION_MODES.EXPLORE) {
    return null;
  }

  // Movement functions - dispatch custom events for camera controller to handle
  const moveCamera = (direction) => {
    // Dispatch custom event that the camera controller can listen to
    window.dispatchEvent(new CustomEvent('mobile-camera-move', {
      detail: { direction }
    }));
  };

  // Continuous movement while pressed
  const startMovement = (direction) => {
    moveCamera(direction);
    moveIntervalRef.current = setInterval(() => {
      moveCamera(direction);
    }, 50); // Smooth 20fps movement
  };

  const stopMovement = (e) => {
    if (moveIntervalRef.current) {
      clearInterval(moveIntervalRef.current);
      moveIntervalRef.current = null;
    }
    // Explicitly blur the button to prevent stuck focus state
    if (e && e.target) {
      e.target.blur();
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (moveIntervalRef.current) {
        clearInterval(moveIntervalRef.current);
      }
    };
  }, []);

  return (
    <div className="fixed bottom-20 left-4 right-4 z-30 pointer-events-auto select-none" style={{ touchAction: 'manipulation' }}>
      {/* Status Bar */}
      <div className="flex justify-center mb-4">
        <div className="bg-black/60 backdrop-blur-xl border border-white/20 rounded-full px-4 py-2 flex items-center gap-2">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          <span className="text-white/80 text-sm font-medium">Explorer Mode</span>
          <span className="text-white/60 text-xs">•</span>
          <span className="text-white/60 text-xs">Touch to navigate</span>
        </div>
      </div>
      
      <div className="flex justify-between items-end">
        {/* Left Side - Directional Pad */}
        <div className="relative">
          <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
            <div className="relative w-32 h-32">
              {/* Center Circle */}
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 bg-white/10 rounded-full border border-white/20" />
              
              {/* Up Button */}
              <motion.button
                className="mobile-nav-button absolute top-0 left-1/2 w-12 h-12 bg-gradient-to-b from-blue-500/30 to-blue-600/30 rounded-full border border-blue-400/40 flex items-center justify-center text-white text-xl shadow-lg"
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  startMovement('up');
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  stopMovement(e);
                }}
                onTouchCancel={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  stopMovement(e);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  startMovement('up');
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  stopMovement(e);
                }}
                onMouseLeave={(e) => {
                  e.preventDefault();
                  stopMovement(e);
                }}
                whileTap={{ 
                  backgroundColor: "rgba(59, 130, 246, 0.6)",
                  borderColor: "rgba(59, 130, 246, 0.8)"
                }}
                transition={{ duration: 0.1 }}
                style={{ 
                  touchAction: 'manipulation', 
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  transform: 'translateX(-50%)'
                }}
              >
                ↑
              </motion.button>
              
              {/* Down Button */}
              <motion.button
                className="mobile-nav-button absolute bottom-0 left-1/2 w-12 h-12 bg-gradient-to-t from-blue-500/30 to-blue-600/30 rounded-full border border-blue-400/40 flex items-center justify-center text-white text-xl shadow-lg"
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  startMovement('down');
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  stopMovement(e);
                }}
                onTouchCancel={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  stopMovement(e);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  startMovement('down');
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  stopMovement(e);
                }}
                onMouseLeave={(e) => {
                  e.preventDefault();
                  stopMovement(e);
                }}
                whileTap={{ 
                  backgroundColor: "rgba(59, 130, 246, 0.6)",
                  borderColor: "rgba(59, 130, 246, 0.8)"
                }}
                transition={{ duration: 0.1 }}
                style={{ 
                  touchAction: 'manipulation', 
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  transform: 'translateX(-50%)'
                }}
              >
                ↓
              </motion.button>
              
              {/* Left Button */}
              <motion.button
                className="mobile-nav-button absolute left-0 top-1/2 w-12 h-12 bg-gradient-to-r from-blue-500/30 to-blue-600/30 rounded-full border border-blue-400/40 flex items-center justify-center text-white text-xl shadow-lg"
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  startMovement('left');
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  stopMovement(e);
                }}
                onTouchCancel={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  stopMovement(e);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  startMovement('left');
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  stopMovement(e);
                }}
                onMouseLeave={(e) => {
                  e.preventDefault();
                  stopMovement(e);
                }}
                whileTap={{ 
                  backgroundColor: "rgba(59, 130, 246, 0.6)",
                  borderColor: "rgba(59, 130, 246, 0.8)"
                }}
                transition={{ duration: 0.1 }}
                style={{ 
                  touchAction: 'manipulation', 
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  transform: 'translateY(-50%)'
                }}
              >
                ←
              </motion.button>
              
              {/* Right Button */}
              <motion.button
                className="mobile-nav-button absolute right-0 top-1/2 w-12 h-12 bg-gradient-to-l from-blue-500/30 to-blue-600/30 rounded-full border border-blue-400/40 flex items-center justify-center text-white text-xl shadow-lg"
                onTouchStart={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  startMovement('right');
                }}
                onTouchEnd={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  stopMovement(e);
                }}
                onTouchCancel={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  stopMovement(e);
                }}
                onMouseDown={(e) => {
                  e.preventDefault();
                  startMovement('right');
                }}
                onMouseUp={(e) => {
                  e.preventDefault();
                  stopMovement(e);
                }}
                onMouseLeave={(e) => {
                  e.preventDefault();
                  stopMovement(e);
                }}
                whileTap={{ 
                  backgroundColor: "rgba(59, 130, 246, 0.6)",
                  borderColor: "rgba(59, 130, 246, 0.8)"
                }}
                transition={{ duration: 0.1 }}
                style={{ 
                  touchAction: 'manipulation', 
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  WebkitTouchCallout: 'none',
                  WebkitTapHighlightColor: 'transparent',
                  transform: 'translateY(-50%)'
                }}
              >
                →
              </motion.button>
            </div>
            
            {/* Label */}
            <div className="text-center mt-2">
              <span className="text-white/60 text-xs font-medium">Navigate</span>
            </div>
          </div>
        </div>

        {/* Right Side - Forward/Backward Controls */}
        <div className="bg-black/40 backdrop-blur-xl border border-white/20 rounded-2xl p-4">
          <div className="flex flex-col gap-3">
            {/* Forward Button */}
            <motion.button
              className="mobile-nav-button w-16 h-12 bg-gradient-to-t from-purple-500/30 to-purple-600/30 rounded-xl border border-purple-400/40 flex items-center justify-center text-white text-lg shadow-lg"
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                startMovement('forward');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stopMovement(e);
              }}
              onTouchCancel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stopMovement(e);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                startMovement('forward');
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                stopMovement(e);
              }}
              onMouseLeave={(e) => {
                e.preventDefault();
                stopMovement(e);
              }}
              whileTap={{ 
                backgroundColor: "rgba(147, 51, 234, 0.6)",
                borderColor: "rgba(147, 51, 234, 0.8)"
              }}
              transition={{ duration: 0.1 }}
              style={{ 
                touchAction: 'manipulation', 
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              ⬆️
            </motion.button>
            
            {/* Backward Button */}
            <motion.button
              className="mobile-nav-button w-16 h-12 bg-gradient-to-b from-purple-500/30 to-purple-600/30 rounded-xl border border-purple-400/40 flex items-center justify-center text-white text-lg shadow-lg"
              onTouchStart={(e) => {
                e.preventDefault();
                e.stopPropagation();
                startMovement('backward');
              }}
              onTouchEnd={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stopMovement(e);
              }}
              onTouchCancel={(e) => {
                e.preventDefault();
                e.stopPropagation();
                stopMovement(e);
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                startMovement('backward');
              }}
              onMouseUp={(e) => {
                e.preventDefault();
                stopMovement(e);
              }}
              onMouseLeave={(e) => {
                e.preventDefault();
                stopMovement(e);
              }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              style={{ 
                touchAction: 'manipulation', 
                userSelect: 'none',
                WebkitUserSelect: 'none',
                WebkitTouchCallout: 'none',
                WebkitTapHighlightColor: 'transparent'
              }}
            >
              ⬇️
            </motion.button>
          </div>
          
          {/* Label */}
          <div className="text-center mt-2">
            <span className="text-white/60 text-xs font-medium">Zoom</span>
          </div>
        </div>
      </div>
      
      {/* Instructions */}
      <div className="text-center mt-3">
        <span className="text-white/50 text-xs">Touch and hold to move • Swipe screen to look around</span>
      </div>
    </div>
  );
};

export default MobileDirectionalControls;