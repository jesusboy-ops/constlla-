/**
 * Settings Panel Component
 * Comprehensive settings for performance, visuals, and preferences
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';
import { useAppStore } from '../../state/useAppStore.js';
import { useSettingsStore } from '../../state/useSettingsStore.js';
import GlassCard from './GlassCard.jsx';
import GlassButton from './GlassButton.jsx';

const SettingsPanel = () => {
  const { setSettingsOpen } = useAppStore();
  const [saveStatus, setSaveStatus] = useState('');
  
  // Use individual selectors for better reactivity
  const enableBloom = useSettingsStore(state => state.enableBloom);
  const toggleBloom = useSettingsStore(state => state.toggleBloom);
  
  // Get the rest of the store for other properties
  const settingsStore = useSettingsStore();
  
  const {
    // Visual Settings
    bloomStrength,
    animationSpeed,
    enablePlanetMotion,
    planetMotionSpeed,
    planetFloatAmplitude,
    
    // Performance Settings
    enablePostProcessing,
    targetFPS,
    adaptiveQuality,
    
    // Camera Settings
    cameraSpeed,
    cameraDamping,
    
    // Recording Settings
    recordingQuality,
    recordingResolution,
    recordingFPS,
    includeWatermark,
    
    // Data Settings
    autoRefresh,
    refreshInterval,
    
    // Actions
    setBloomStrength,
    setAnimationSpeed,
    togglePlanetMotion,
    setPlanetMotionSpeed,
    setPlanetFloatAmplitude,
    togglePostProcessing,
    setTargetFPS,
    toggleAdaptiveQuality,
    setCameraSpeed,
    setCameraDamping,
    setRecordingQuality,
    setRecordingResolution,
    setRecordingFPS,
    toggleWatermark,
    toggleAutoRefresh,
    setRefreshInterval,
    setPerformancePreset,
    resetToDefaults
  } = settingsStore;

  const handleSaveSettings = () => {
    // Settings are automatically saved via Zustand persist middleware
    // This provides user feedback
    setSaveStatus('Settings saved successfully!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  const SliderControl = ({ label, value, onChange, min = 0, max = 1, step = 0.1 }) => (
    <div className="space-y-2">
      <div className="flex justify-between">
        <span className="text-white/80 text-sm">{label}</span>
        <span className="text-white text-sm">{value.toFixed(2)}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-white/10 rounded-lg appearance-none cursor-pointer slider input-professional"
        style={{
          background: `linear-gradient(to right, rgba(59, 130, 246, 0.5) 0%, rgba(59, 130, 246, 0.5) ${((value - min) / (max - min)) * 100}%, rgba(255, 255, 255, 0.1) ${((value - min) / (max - min)) * 100}%, rgba(255, 255, 255, 0.1) 100%)`
        }}
      />
    </div>
  );

  const ToggleControl = ({ label, value, onChange }) => {
    const handleToggle = (e) => {
      e.preventDefault();
      e.stopPropagation();
      console.log(`ToggleControl: ${label} clicked (${value} -> ${!value})`);
      
      if (typeof onChange !== 'function') {
        console.error(`ToggleControl: onChange is not a function for ${label}:`, onChange);
        return;
      }
      
      try {
        onChange();
        console.log(`ToggleControl: ${label} toggle executed`);
      } catch (error) {
        console.error(`ToggleControl: Error toggling ${label}:`, error);
      }
    };
    
    return (
      <div className="flex items-center justify-between">
        <span className="text-white/80 text-sm">{label}</span>
        <button
          type="button"
          onClick={handleToggle}
          className={`
            relative w-12 h-6 rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-400/50
            ${value ? 'bg-blue-500 shadow-lg shadow-blue-500/25' : 'bg-white/20 hover:bg-white/30'}
          `}
        >
          <div
            className={`
              absolute top-0.5 w-5 h-5 bg-white rounded-full transition-all duration-300 shadow-md
              ${value ? 'translate-x-6 shadow-blue-500/25' : 'translate-x-0.5'}
            `}
          />
          {/* Visual indicator */}
          <div className={`
            absolute inset-0 flex items-center justify-center text-xs font-bold transition-opacity duration-300
            ${value ? 'text-white opacity-100' : 'text-white/40 opacity-0'}
          `}>
            {value ? '✓' : ''}
          </div>
        </button>
      </div>
    );
  };

  return (
    <AnimatePresence>
      <motion.div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[1001]"
        style={{
          backgroundColor: 'rgba(11, 6, 26, 0.8)',
          pointerEvents: 'auto'
        }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setSettingsOpen(false)}
      >
        <motion.div
          className="w-full max-w-4xl max-h-[90vh] overflow-y-auto p-4 md:p-8"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          <GlassCard className="space-y-6 card-professional">
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <h2 className="text-2xl font-bold text-white text-gradient">⚙️ Settings</h2>
              <div className="flex items-center gap-2">
                <GlassButton 
                  onClick={() => setSettingsOpen(false)}
                  className="!w-10 !h-10 !p-0 !rounded-full !bg-white/10 hover:!bg-white/20"
                >
                  ✕
                </GlassButton>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Visual Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Visual Settings
                </h3>
                
                <SliderControl
                  label="Bloom Strength"
                  value={bloomStrength}
                  onChange={setBloomStrength}
                  min={0}
                  max={3}
                />
                
                <SliderControl
                  label="Animation Speed"
                  value={animationSpeed}
                  onChange={setAnimationSpeed}
                  min={0.1}
                  max={3}
                />
                
                <ToggleControl
                  label="Planet Motion"
                  value={enablePlanetMotion}
                  onChange={togglePlanetMotion}
                />
                
                {enablePlanetMotion && (
                  <>
                    <SliderControl
                      label="Motion Speed"
                      value={planetMotionSpeed}
                      onChange={setPlanetMotionSpeed}
                      min={0.1}
                      max={3}
                      step={0.1}
                    />
                    
                    <SliderControl
                      label="Float Amplitude"
                      value={planetFloatAmplitude}
                      onChange={setPlanetFloatAmplitude}
                      min={0.1}
                      max={2}
                      step={0.1}
                    />
                  </>
                )}
              </div>

              {/* Performance Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Performance Settings
                </h3>
                
                <ToggleControl
                  label="Bloom Effects"
                  value={enableBloom}
                  onChange={toggleBloom}
                />
                
                <ToggleControl
                  label="Post Processing"
                  value={enablePostProcessing}
                  onChange={togglePostProcessing}
                />
                
                <SliderControl
                  label="Target FPS"
                  value={targetFPS}
                  onChange={setTargetFPS}
                  min={15}
                  max={120}
                  step={5}
                />
                
                <ToggleControl
                  label="Adaptive Quality"
                  value={adaptiveQuality}
                  onChange={toggleAdaptiveQuality}
                />
              </div>

              {/* Camera Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Camera Settings
                </h3>
                
                <SliderControl
                  label="Camera Speed"
                  value={cameraSpeed}
                  onChange={setCameraSpeed}
                  min={0.1}
                  max={5}
                />
                
                <SliderControl
                  label="Camera Damping"
                  value={cameraDamping}
                  onChange={setCameraDamping}
                  min={0.01}
                  max={1}
                />
              </div>

              {/* Recording Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  🎥 Recording Settings
                </h3>
                
                <div className="space-y-2">
                  <span className="text-white/80 text-sm">Resolution</span>
                  <select
                    value={recordingResolution}
                    onChange={(e) => setRecordingResolution(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-blue-400"
                  >
                    <option value="1080p" className="bg-gray-800">1080p (1920x1080)</option>
                    <option value="1440p" className="bg-gray-800">1440p (2560x1440)</option>
                    <option value="4k" className="bg-gray-800">4K (3840x2160)</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <span className="text-white/80 text-sm">Quality</span>
                  <select
                    value={recordingQuality}
                    onChange={(e) => setRecordingQuality(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg p-2 text-white text-sm focus:outline-none focus:border-blue-400"
                  >
                    <option value="low" className="bg-gray-800">Low (Fast)</option>
                    <option value="medium" className="bg-gray-800">Medium</option>
                    <option value="high" className="bg-gray-800">High</option>
                    <option value="4k" className="bg-gray-800">Ultra (4K Optimized)</option>
                  </select>
                </div>
                
                <SliderControl
                  label="Recording FPS"
                  value={recordingFPS}
                  onChange={setRecordingFPS}
                  min={15}
                  max={120}
                  step={5}
                />
                
                <ToggleControl
                  label="Include Watermark"
                  value={includeWatermark}
                  onChange={toggleWatermark}
                />
                
                <div className="bg-blue-500/10 border border-blue-400/20 rounded-lg p-3 text-xs text-blue-300">
                  💡 4K recording requires significant processing power. Consider using lower settings if experiencing performance issues.
                </div>
              </div>

              {/* Data & Refresh Settings */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  📊 Data Settings
                </h3>
                
                <ToggleControl
                  label="Auto Refresh Data"
                  value={autoRefresh}
                  onChange={toggleAutoRefresh}
                />
                
                {autoRefresh && (
                  <SliderControl
                    label="Refresh Interval (seconds)"
                    value={refreshInterval / 1000}
                    onChange={(val) => setRefreshInterval(val * 1000)}
                    min={1}
                    max={60}
                    step={1}
                  />
                )}
              </div>

              {/* Keyboard Controls */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Keyboard Controls
                </h3>
                
                <div className="space-y-2 text-sm text-white/80">
                  <div className="flex justify-between">
                    <span>Move Forward:</span>
                    <kbd className="px-2 py-1 bg-white/10 rounded text-white">W</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Move Backward:</span>
                    <kbd className="px-2 py-1 bg-white/10 rounded text-white">S</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Move Left:</span>
                    <kbd className="px-2 py-1 bg-white/10 rounded text-white">A</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Move Right:</span>
                    <kbd className="px-2 py-1 bg-white/10 rounded text-white">D</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Move Up:</span>
                    <kbd className="px-2 py-1 bg-white/10 rounded text-white">Q</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Move Down:</span>
                    <kbd className="px-2 py-1 bg-white/10 rounded text-white">E</kbd>
                  </div>
                  <div className="flex justify-between">
                    <span>Look Around:</span>
                    <kbd className="px-2 py-1 bg-white/10 rounded text-white">Hold Left Mouse</kbd>
                  </div>
                </div>
              </div>

              {/* Presets & Actions */}
              <div className="space-y-4">
                <h3 className="text-lg font-semibold text-white border-b border-white/20 pb-2">
                  Presets & Actions
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  <GlassButton onClick={() => setPerformancePreset('low')}>
                    Low Quality
                  </GlassButton>
                  <GlassButton onClick={() => setPerformancePreset('medium')}>
                    Medium Quality
                  </GlassButton>
                  <GlassButton onClick={() => setPerformancePreset('high')}>
                    High Quality
                  </GlassButton>
                  <GlassButton onClick={() => setPerformancePreset('ultra')}>
                    Ultra Quality
                  </GlassButton>
                </div>
                
                <div className="space-y-2">
                  <GlassButton 
                    variant="success" 
                    className="w-full"
                    onClick={handleSaveSettings}
                  >
                    💾 Save Settings
                  </GlassButton>
                  
                  <GlassButton 
                    variant="danger" 
                    className="w-full"
                    onClick={resetToDefaults}
                  >
                    🔄 Reset to Defaults
                  </GlassButton>
                </div>
                
                {/* Save Status */}
                {saveStatus && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className={`p-3 rounded-lg text-center text-sm ${
                      saveStatus.includes('success') || saveStatus.includes('copied') || saveStatus.includes('imported')
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {saveStatus}
                  </motion.div>
                )}
              </div>
            </div>
          </GlassCard>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default SettingsPanel;