/**
 * Settings state store
 * Manages user preferences, performance settings, and app configuration
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useSettingsStore = create(
  persist(
    (set, get) => ({
      // Visual Settings
      theme: 'dark',
      particleDensity: 1.0,
      bloomStrength: 1.5,
      animationSpeed: 1.0,
      showParticleTrails: true,
      showBlockLabels: true,
      showNodeConnections: true,
      showFPS: false,
      
      // Planet Motion Settings
      enablePlanetMotion: true,
      planetMotionSpeed: 1.0,
      planetFloatAmplitude: 1.0,
      
      // Performance Settings - Optimized for better performance
      enableBloom: false, // Disabled by default
      enableParticles: false, // Disabled by default
      enablePostProcessing: false, // Disabled by default
      enablePhysics: false, // Disabled by default
      targetFPS: 60,
      adaptiveQuality: true,
      maxBlocks: 100,
      maxTransactions: 50,
      
      // Camera Settings
      cameraSpeed: 1.0,
      cameraDamping: 0.1,
      autoRotate: false,
      autoRotateSpeed: 0.5,
      
      // Data Settings
      autoRefresh: true,
      refreshInterval: 12000, // 12 seconds
      enableNotifications: true,
      
      // Recording Settings
      recordingQuality: '4k', // 'low', 'medium', 'high', '4k'
      recordingFPS: 60,
      recordingResolution: '4k', // '1080p', '1440p', '4k'
      includeWatermark: true,
      
      // Actions
      setTheme: (theme) => set({ theme }),
      
      setParticleDensity: (density) => set({ 
        particleDensity: Math.max(0.1, Math.min(2.0, density)) 
      }),
      
      setBloomStrength: (strength) => set({ 
        bloomStrength: Math.max(0, Math.min(3.0, strength)) 
      }),
      
      setAnimationSpeed: (speed) => set({ 
        animationSpeed: Math.max(0.1, Math.min(3.0, speed)) 
      }),
      
      toggleParticleTrails: () => set(state => ({ 
        showParticleTrails: !state.showParticleTrails 
      })),
      
      toggleBlockLabels: () => set(state => ({ 
        showBlockLabels: !state.showBlockLabels 
      })),
      
      toggleNodeConnections: () => set(state => ({ 
        showNodeConnections: !state.showNodeConnections 
      })),
      
      toggleFPS: () => set(state => ({ 
        showFPS: !state.showFPS 
      })),
      
      togglePlanetMotion: () => set(state => ({ 
        enablePlanetMotion: !state.enablePlanetMotion 
      })),
      
      setPlanetMotionSpeed: (speed) => set({ 
        planetMotionSpeed: Math.max(0.1, Math.min(3.0, speed)) 
      }),
      
      setPlanetFloatAmplitude: (amplitude) => set({ 
        planetFloatAmplitude: Math.max(0.1, Math.min(2.0, amplitude)) 
      }),
      
      toggleBloom: () => {
        set(state => ({ enableBloom: !state.enableBloom }));
      },
      
      toggleParticles: () => {
        set(state => ({ enableParticles: !state.enableParticles }));
      },
      
      togglePostProcessing: () => set(state => ({ 
        enablePostProcessing: !state.enablePostProcessing 
      })),
      
      togglePhysics: () => set(state => ({ 
        enablePhysics: !state.enablePhysics 
      })),
      
      setTargetFPS: (fps) => set({ 
        targetFPS: Math.max(15, Math.min(120, fps)) 
      }),
      
      toggleAdaptiveQuality: () => set(state => ({ 
        adaptiveQuality: !state.adaptiveQuality 
      })),
      
      setMaxBlocks: (max) => set({ 
        maxBlocks: Math.max(10, Math.min(500, max)) 
      }),
      
      setMaxTransactions: (max) => set({ 
        maxTransactions: Math.max(5, Math.min(200, max)) 
      }),
      
      setCameraSpeed: (speed) => set({ 
        cameraSpeed: Math.max(0.1, Math.min(5.0, speed)) 
      }),
      
      setCameraDamping: (damping) => set({ 
        cameraDamping: Math.max(0.01, Math.min(1.0, damping)) 
      }),
      
      toggleAutoRotate: () => set(state => ({ 
        autoRotate: !state.autoRotate 
      })),
      
      setAutoRotateSpeed: (speed) => set({ 
        autoRotateSpeed: Math.max(0.1, Math.min(2.0, speed)) 
      }),
      
      toggleAutoRefresh: () => set(state => ({ 
        autoRefresh: !state.autoRefresh 
      })),
      
      setRefreshInterval: (interval) => set({ 
        refreshInterval: Math.max(1000, Math.min(60000, interval)) 
      }),
      
      setRecordingQuality: (quality) => set({ recordingQuality: quality }),
      
      setRecordingResolution: (resolution) => set({ recordingResolution: resolution }),
      
      setRecordingFPS: (fps) => set({ 
        recordingFPS: Math.max(15, Math.min(120, fps)) 
      }),
      
      toggleWatermark: () => set(state => ({ 
        includeWatermark: !state.includeWatermark 
      })),
      
      toggleNotifications: () => set(state => ({ 
        enableNotifications: !state.enableNotifications 
      })),
      
      // Preset configurations
      setPerformancePreset: (preset) => {
        const presets = {
          low: {
            particleDensity: 0.5,
            bloomStrength: 0.5,
            enableBloom: false,
            enableParticles: false,
            enablePostProcessing: false,
            enablePhysics: false,
            targetFPS: 30,
            maxBlocks: 50,
            maxTransactions: 25
          },
          medium: {
            particleDensity: 0.8,
            bloomStrength: 1.0,
            enableBloom: true,
            enableParticles: true,
            enablePostProcessing: true,
            enablePhysics: true,
            targetFPS: 45,
            maxBlocks: 75,
            maxTransactions: 35
          },
          high: {
            particleDensity: 1.0,
            bloomStrength: 1.5,
            enableBloom: true,
            enableParticles: true,
            enablePostProcessing: true,
            enablePhysics: true,
            targetFPS: 60,
            maxBlocks: 100,
            maxTransactions: 50
          },
          ultra: {
            particleDensity: 1.5,
            bloomStrength: 2.0,
            enableBloom: true,
            enableParticles: true,
            enablePostProcessing: true,
            enablePhysics: true,
            targetFPS: 60,
            maxBlocks: 150,
            maxTransactions: 75
          }
        };
        
        const config = presets[preset];
        if (config) {
          set(config);
        }
      },
      
      // Reset to defaults
      resetToDefaults: () => set({
        theme: 'dark',
        particleDensity: 1.0,
        bloomStrength: 1.5,
        animationSpeed: 1.0,
        showParticleTrails: true,
        showBlockLabels: true,
        showNodeConnections: true,
        showFPS: false,
        enablePlanetMotion: true,
        planetMotionSpeed: 1.0,
        planetFloatAmplitude: 1.0,
        enableBloom: false, // Performance optimized
        enableParticles: false, // Performance optimized
        enablePostProcessing: false, // Performance optimized
        targetFPS: 60,
        adaptiveQuality: true,
        maxBlocks: 100,
        maxTransactions: 50,
        cameraSpeed: 1.0,
        cameraDamping: 0.1,
        autoRotate: false,
        autoRotateSpeed: 0.5,
        autoRefresh: true,
        refreshInterval: 12000,
        enableNotifications: true,
        recordingQuality: 'high',
        recordingFPS: 30,
        recordingResolution: '1080p',
        includeWatermark: true
      }),
      
      // Export/Import settings
      exportSettings: () => {
        const state = get();
        const settings = { ...state };
        delete settings.exportSettings;
        delete settings.importSettings;
        delete settings.resetToDefaults;
        delete settings.setPerformancePreset;
        
        return JSON.stringify(settings, null, 2);
      },
      
      importSettings: (settingsJson) => {
        try {
          const settings = JSON.parse(settingsJson);
          set(settings);
          return true;
        } catch (error) {
          console.error('Failed to import settings:', error);
          return false;
        }
      }
    }),
  {
    name: 'constella-settings',
    version: 1
  }
));