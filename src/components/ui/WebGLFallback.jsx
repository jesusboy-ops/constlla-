/**
 * WebGL Fallback Component
 * Displays when WebGL is not supported
 */

import { motion } from 'framer-motion';
import GlassCard from './GlassCard.jsx';
import GlassButton from './GlassButton.jsx';

const WebGLFallback = () => {
  const checkWebGLSupport = () => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      return !!gl;
    } catch (error) {
      return false;
    }
  };

  const refreshPage = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <GlassCard className="max-w-2xl text-center">
          <div className="space-y-6">
            <div className="text-6xl mb-4">🌌</div>
            
            <h1 className="text-3xl font-bold text-white mb-2">
              WebGL Not Available
            </h1>
            
            <p className="text-white/70 text-lg mb-6">
              Constella requires WebGL to render the 3D blockchain universe. 
              Your browser or device doesn't support WebGL or it's disabled.
            </p>

            <div className="bg-white/5 rounded-lg p-4 mb-6">
              <h3 className="text-white font-semibold mb-3">To enable WebGL:</h3>
              <ul className="text-white/80 text-sm space-y-2 text-left">
                <li>• Update your browser to the latest version</li>
                <li>• Enable hardware acceleration in browser settings</li>
                <li>• Update your graphics drivers</li>
                <li>• Try a different browser (Chrome, Firefox, Safari, Edge)</li>
              </ul>
            </div>

            <div className="flex gap-4 justify-center">
              <GlassButton onClick={refreshPage}>
                🔄 Try Again
              </GlassButton>
              
              <GlassButton
                variant="secondary"
                onClick={() => window.open('https://get.webgl.org/', '_blank')}
              >
                📖 Learn More
              </GlassButton>
            </div>

            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-white/50 text-sm">
                WebGL Support: {checkWebGLSupport() ? '✅ Available' : '❌ Not Available'}
              </p>
            </div>
          </div>
        </GlassCard>
      </motion.div>
    </div>
  );
};

export default WebGLFallback;