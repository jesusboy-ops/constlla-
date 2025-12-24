/**
 * Exploration Controls UI - WASD Instructions
 * Shows control instructions for exploration mode
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useVisualizationStore, VISUALIZATION_MODES } from '../../state/useVisualizationStore.js';

const ExplorationControls = () => {
  const { mode } = useVisualizationStore();
  const [isVisible, setIsVisible] = useState(true);
  const [hasInteracted, setHasInteracted] = useState(false);

  // Auto-hide after user interaction or time
  useEffect(() => {
    if (mode === VISUALIZATION_MODES.EXPLORE && !hasInteracted) {
      const timer = setTimeout(() => {
        setIsVisible(false);
      }, 8000); // Hide after 8 seconds

      const handleKeyDown = () => {
        setHasInteracted(true);
        setIsVisible(false);
      };

      const handleMouseDown = () => {
        setHasInteracted(true);
        setIsVisible(false);
      };

      window.addEventListener('keydown', handleKeyDown);
      window.addEventListener('mousedown', handleMouseDown);

      return () => {
        clearTimeout(timer);
        window.removeEventListener('keydown', handleKeyDown);
        window.removeEventListener('mousedown', handleMouseDown);
      };
    }
  }, [mode, hasInteracted]);

  // Reset when mode changes
  useEffect(() => {
    if (mode === VISUALIZATION_MODES.EXPLORE) {
      setHasInteracted(false);
      setIsVisible(true);
    }
  }, [mode]);

  if (mode !== VISUALIZATION_MODES.EXPLORE) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="fixed inset-0 flex items-center justify-center z-40 pointer-events-none"
        >
          <div className="glass rounded-2xl p-6 backdrop-blur-professional border border-purple-400/30 max-w-md mx-4 pointer-events-auto">
            <div className="text-center mb-4">
              <h3 className="text-white font-bold text-xl mb-2 text-gradient">
                🚀 Exploration Mode
              </h3>
              <p className="text-white/70 text-sm">
                Navigate through the scattered blockchain universe
              </p>
            </div>

            <div className="space-y-4">
              {/* Movement Controls */}
              <div className="bg-black/20 rounded-xl p-4">
                <h4 className="text-purple-300 font-semibold mb-3 text-sm">Movement</h4>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-white font-mono">W</kbd>
                    <span className="text-white/80">Forward</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-white font-mono">S</kbd>
                    <span className="text-white/80">Backward</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-white font-mono">A</kbd>
                    <span className="text-white/80">Left</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-white font-mono">D</kbd>
                    <span className="text-white/80">Right</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-white font-mono">Q</kbd>
                    <span className="text-white/80">Up</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <kbd className="px-2 py-1 bg-white/10 rounded text-white font-mono">E</kbd>
                    <span className="text-white/80">Down</span>
                  </div>
                </div>
              </div>

              {/* Look Controls */}
              <div className="bg-black/20 rounded-xl p-4">
                <h4 className="text-purple-300 font-semibold mb-3 text-sm">Look Around</h4>
                <div className="flex items-center gap-2 text-xs">
                  <div className="px-3 py-2 bg-white/10 rounded text-white font-mono">
                    Hold Left Mouse
                  </div>
                  <span className="text-white/80">+ Move mouse to look around</span>
                </div>
              </div>

              {/* Interaction */}
              <div className="bg-black/20 rounded-xl p-4">
                <h4 className="text-purple-300 font-semibold mb-3 text-sm">Interaction & Navigation</h4>
                <div className="text-xs text-white/80">
                  • Look for "📊 Click for Data" buttons above planets<br/>
                  • Click planets or buttons to view blockchain data<br/>
                  • Use radar (bottom-right) for navigation<br/>
                  • 200 planets scattered across vast space
                </div>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-white/10 text-center">
              <button
                onClick={() => setIsVisible(false)}
                className="text-purple-300 text-xs hover:text-purple-200 transition-colors"
              >
                Got it! Hide this guide
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExplorationControls;