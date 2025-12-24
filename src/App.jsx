/**
 * Main App Component
 * Constella - Web3 3D Blockchain Constellation Explorer
 */

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { useAppStore } from './state/useAppStore.js';
import { useSettingsStore } from './state/useSettingsStore.js';
import { useVisualizationStore, VISUALIZATION_MODES } from './state/useVisualizationStore.js';
import { useResponsive } from './hooks/useResponsive.js';

// UI Components
import NavBar from './components/ui/NavBar.jsx';
import LiveStatsBar from './components/ui/LiveStatsBar.jsx';
import Sidebar from './components/ui/Sidebar.jsx';
import SettingsPanel from './components/ui/SettingsPanel.jsx';
import ValidatorDetails from './components/ui/ValidatorDetails.jsx';
import ValidatorsDashboard from './components/ui/ValidatorsDashboard.jsx';
import ContractsDashboard from './components/ui/ContractsDashboard.jsx';
import EraStatsPanel from './components/ui/EraStatsPanel.jsx';
import PerformanceMonitor from './components/ui/PerformanceMonitor.jsx';
import RadarSystem from './components/ui/RadarSystem.jsx';
import SmartContractExplorer from './components/ui/SmartContractExplorer.jsx';
import BlockchainStatsDashboard from './components/ui/BlockchainStatsDashboard.jsx';
import MobileFAB from './components/ui/MobileFAB.jsx';
import MobileBottomSheet from './components/ui/MobileBottomSheet.jsx';
import MobileDirectionalControls from './components/ui/MobileDirectionalControls.jsx';
import ChainSelector from './components/ui/ChainSelector.jsx';
import ShareableSnapshots from './components/ui/ShareableSnapshots.jsx';

import NotificationSystem from './components/ui/NotificationSystem.jsx';
import PhysicsDebug from './components/ui/PhysicsDebug.jsx';
import WebGLFallback from './components/ui/WebGLFallback.jsx';
import Loader from './components/ui/Loader.jsx';

// 3D Components
import ImmersiveUniverseCanvas from './components/3D/ImmersiveUniverseCanvas.jsx';

// Styles
import './index.css';

function App() {
  const { sidebarOpen, settingsOpen, currentView, loading } = useAppStore();
  const { showDebugInfo, enablePhysics } = useSettingsStore();
  const { mode, setMode, selectedEntity, setSelectedEntity } = useVisualizationStore();
  const { setCurrentView } = useAppStore();
  const [webglSupported, setWebglSupported] = useState(true);
  const responsive = useResponsive();
  
  // New panel states
  const [validatorDetailsOpen, setValidatorDetailsOpen] = useState(false);
  const [selectedValidatorAddress, setSelectedValidatorAddress] = useState(null);
  const [eraStatsOpen, setEraStatsOpen] = useState(false);
  const [contractExplorerOpen, setContractExplorerOpen] = useState(false);
  const [showExplorerMessage, setShowExplorerMessage] = useState(true);
  const [dashboardOpen, setDashboardOpen] = useState(false);
  const [mobileBottomSheetOpen, setMobileBottomSheetOpen] = useState(false);

  // Radar system data
  const [planetsData, setPlanetsData] = useState([]);
  const [cameraPosition, setCameraPosition] = useState([0, 0, 800]);
  
  // PRD Requirements - New state
  const [showShareModal, setShowShareModal] = useState(false);
  const [selectedChain, setSelectedChain] = useState('ethereum');

  // Check WebGL support on mount
  useEffect(() => {
    const checkWebGL = () => {
      try {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
        return !!gl;
      } catch (error) {
        return false;
      }
    };

    setWebglSupported(checkWebGL());
    
    // Initialize visualization data - only run once on mount
    // Don't call generateAggregatedStars here to avoid conflicts
    console.log('App: WebGL check complete, ready for visualization');
  }, []); // Empty dependency array to run only once

  // Auto-hide explorer message after 5 seconds
  useEffect(() => {
    if (currentView === 'explore' && mode === VISUALIZATION_MODES.EXPLORE) {
      setShowExplorerMessage(true);
      const timer = setTimeout(() => {
        setShowExplorerMessage(false);
      }, 5000); // Hide after 5 seconds

      return () => clearTimeout(timer);
    }
  }, [currentView, mode]);

  // Mobile bottom sheet is only opened manually via FAB, not automatically for planet clicks
  // This ensures the center modal is the only data display method

  // Handle planets data update from 3D scene
  const handlePlanetsUpdate = (planets) => {
    setPlanetsData(planets);
  };

  // Handle camera position update from 3D scene
  const handleCameraUpdate = (position) => {
    setCameraPosition(position);
  };

  // Handle planet click from radar
  const handleRadarPlanetClick = (planet) => {
    setSelectedEntity({
      ...planet,
      type: planet.systemType || 'Blockchain Node',
      name: planet.planetName,
      contractAddress: planet.hash,
      dailyTransactions: planet.transactions
    });
  };

  // PRD Requirements - New handlers
  const handleChainSelect = (chain) => {
    setSelectedChain(chain.id);
    console.log('Chain selected:', chain.name);
  };

  const handleShareClick = () => {
    setShowShareModal(true);
  };

  // Show WebGL fallback if not supported
  if (!webglSupported) {
    return <WebGLFallback />;
  }

  return (
    <div className="w-full h-full bg-black relative overflow-hidden">
      {/* Layer 1: 3D Universe Canvas - Always Fullscreen */}
      <div className="absolute inset-0">
        <Suspense fallback={
          <div className="flex items-center justify-center w-full h-full">
            <Loader type="pulse" size="xl" text="Loading Universe..." />
          </div>
        }>
          <Canvas
            camera={{ 
              position: [0, 100, 800], // Start much farther away
              fov: 75,
              near: 0.1,
              far: 20000 // Much larger far plane for the increased distribution
            }}
            gl={{ 
              antialias: !responsive.isMobile, // Disable antialiasing on mobile
              alpha: true,
              powerPreference: "high-performance",
              pixelRatio: responsive.isMobile ? 1 : Math.min(window.devicePixelRatio, 2) // Limit pixel ratio on mobile
            }}
            dpr={responsive.isMobile ? 1 : [1, 2]} // Lower DPR on mobile
            onCreated={({ gl }) => {
              // Performance optimizations based on device
              if (responsive.isMobile) {
                gl.setPixelRatio(1);
              }
              gl.setClearColor('#000000', 1);
            }}
          >
            <ImmersiveUniverseCanvas 
              responsive={responsive} 
              onPlanetsUpdate={handlePlanetsUpdate}
              onCameraUpdate={handleCameraUpdate}
            />
          </Canvas>
        </Suspense>
      </div>

      {/* Layer 2: UI Overlay - Responsive HUD */}
      <div className="fixed inset-0 pointer-events-none z-10">
        {/* Top Navigation - Always visible */}
        <div className="pointer-events-auto">
          <NavBar responsive={responsive} />
        </div>

        {/* Desktop/Laptop Layout (lg, xl) */}
        {responsive.isDesktop && (
          <>
            {/* Top Left - Chain Selector */}
            <div className="fixed top-[135px] left-6 z-40 pointer-events-auto">
              <ChainSelector 
                currentChain={selectedChain}
                onChainSelect={handleChainSelect}
              />
            </div>

            {/* Top Right - Share Button */}
            <div className="fixed top-[135px] right-6 z-40 pointer-events-auto">
              <motion.button
                onClick={handleShareClick}
                className="flex items-center gap-2 bg-gradient-to-r from-purple-500/20 to-pink-500/20 backdrop-blur-xl border border-purple-400/30 rounded-xl px-4 py-3 text-white hover:border-purple-400/50 transition-all duration-300"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                style={{
                  boxShadow: '0 8px 32px rgba(168, 85, 247, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
                }}
              >
                <span className="text-lg">📸</span>
                <span className="font-medium">Share</span>
              </motion.button>
            </div>

            {/* Left Panel - Explorer Message */}
            {currentView === 'explore' && mode === VISUALIZATION_MODES.EXPLORE && showExplorerMessage && (
              <motion.div 
                className="fixed top-32 left-6 z-40 pointer-events-none"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -50 }}
                transition={{ duration: 0.5 }}
              >
                <div className="bg-black/20 backdrop-blur-sm border border-white/10 rounded-xl p-4 pointer-events-auto">
                  <div className="flex items-center justify-between mb-2">
                    <h2 className="text-white font-semibold">🚀 Explorer Mode</h2>
                    <button
                      onClick={() => setShowExplorerMessage(false)}
                      className="text-white/60 hover:text-white transition-colors text-sm"
                    >
                      ✕
                    </button>
                  </div>
                  <p className="text-white/70 text-sm mb-3">
                    Navigate through space and discover blockchain data on each planet.
                  </p>
                  <div className="text-white/50 text-xs">
                    <div>• Mouse: Look around</div>
                    <div>• Scroll: Zoom in/out</div>
                    <div>• Hover planets: See click prompt</div>
                    <div>• Click planets: View data</div>
                    <div>• WASD: Navigate space</div>
                  </div>
                  <div className="mt-3 text-white/40 text-xs">
                    This message will disappear in 5 seconds
                  </div>
                </div>
              </motion.div>
            )}

            {/* Right Panel - Radar (Only in Explorer Mode) */}
            {currentView === 'explore' && mode === VISUALIZATION_MODES.EXPLORE && (
              <div className="pointer-events-auto">
                <RadarSystem 
                  planets={planetsData}
                  cameraPosition={cameraPosition}
                  onPlanetClick={handleRadarPlanetClick}
                />
              </div>
            )}

            {/* Bottom Stats Bar */}
            <div className="pointer-events-auto">
              <LiveStatsBar />
            </div>
          </>
        )}

        {/* Tablet Layout (md) */}
        {responsive.isTablet && (
          <>
            {/* Compact Bottom Bar */}
            <div className="pointer-events-auto">
              <LiveStatsBar compact />
            </div>

            {/* Floating Radar - Smaller (Only in Explorer Mode) */}
            {currentView === 'explore' && mode === VISUALIZATION_MODES.EXPLORE && (
              <div className="pointer-events-auto">
                <RadarSystem 
                  planets={planetsData}
                  cameraPosition={cameraPosition}
                  onPlanetClick={handleRadarPlanetClick}
                  compact 
                />
              </div>
            )}
          </>
        )}

        {/* Mobile Layout (xs, sm) */}
        {responsive.isMobile && (
          <>
            {/* Mobile FAB Menu */}
            <div className="pointer-events-auto">
              <MobileFAB onOpenBottomSheet={() => setMobileBottomSheetOpen(true)} />
            </div>

            {/* Mobile Directional Controls - Only in explore mode */}
            {currentView === 'explore' && mode === VISUALIZATION_MODES.EXPLORE && (
              <div className="pointer-events-auto">
                <MobileDirectionalControls responsive={responsive} />
              </div>
            )}

            {/* Mobile Bottom Sheet */}
            <MobileBottomSheet 
              isVisible={mobileBottomSheetOpen}
              onClose={() => setMobileBottomSheetOpen(false)}
            />
          </>
        )}

        {/* Universal Components - All Breakpoints */}
        <div className="pointer-events-auto">
          {/* Landing Page - Responsive */}
          {currentView === 'home' && mode === VISUALIZATION_MODES.CALM && (
            <div className="fixed inset-0 flex items-center justify-center pointer-events-none px-4">
              <div className="text-center max-w-2xl">
                <h1 className={`font-thin text-white mb-8 lg:mb-12 tracking-widest opacity-95 ${
                  responsive.isMobile ? 'text-4xl' : responsive.isTablet ? 'text-6xl' : 'text-6xl md:text-9xl'
                }`}>
                  Constella
                </h1>
                <p className={`text-white/40 mb-8 lg:mb-12 font-extralight tracking-wide ${
                  responsive.isMobile ? 'text-base' : 'text-lg md:text-xl'
                }`}>
                  Immersive Blockchain Visualization
                </p>
                <div className="pointer-events-auto">
                  <button
                    onClick={() => {
                      console.log('Explore Data button clicked - switching to EXPLORE mode');
                      setMode(VISUALIZATION_MODES.EXPLORE);
                      setCurrentView('explore');
                    }}
                    className={`bg-gradient-to-r from-blue-500/10 to-cyan-500/10 border border-blue-400/15 rounded-full text-white/70 font-extralight hover:from-blue-500/20 hover:to-cyan-500/20 hover:text-white transition-all transform hover:scale-105 tracking-widest ${
                      responsive.isMobile ? 'px-8 py-3 text-base' : 'px-16 py-5 text-lg'
                    }`}
                  >
                    Explore Data
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Sidebar */}
          {sidebarOpen && <Sidebar />}

          {/* Settings Panel */}
          {settingsOpen && <SettingsPanel />}

          {/* Validator Details Panel */}
          {validatorDetailsOpen && selectedValidatorAddress && (
            <ValidatorDetails 
              validatorAddress={selectedValidatorAddress}
              onClose={() => {
                setValidatorDetailsOpen(false);
                setSelectedValidatorAddress(null);
              }}
            />
          )}

          {/* Validators Dashboard */}
          {currentView === 'validators' && (
            <ValidatorsDashboard 
              isOpen={currentView === 'validators'}
              onClose={() => setCurrentView('home')}
            />
          )}

          {/* Era Statistics Panel (separate from validators) */}
          {eraStatsOpen && (
            <EraStatsPanel 
              isOpen={eraStatsOpen}
              onClose={() => setEraStatsOpen(false)}
            />
          )}

          {/* Blockchain Stats Dashboard (Analytics/Visualizer) */}
          {(dashboardOpen || currentView === 'dashboard' || currentView === 'visualizer') && (
            <BlockchainStatsDashboard 
              onClose={() => {
                setDashboardOpen(false);
                setCurrentView('home');
              }}
            />
          )}

          {/* Contracts Dashboard */}
          {currentView === 'contracts' && (
            <ContractsDashboard 
              isOpen={currentView === 'contracts'}
              onClose={() => setCurrentView('home')}
            />
          )}

          {/* Smart Contract Explorer (separate from contracts dashboard) */}
          {contractExplorerOpen && (
            <SmartContractExplorer 
              onClose={() => setContractExplorerOpen(false)}
            />
          )}

          {/* Notification System */}
          <NotificationSystem />

          {/* Contextual Data Panel - Shows when planets are clicked (responsive positioning) */}
          {selectedEntity && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`fixed z-40 ${
                responsive.isMobile 
                  ? 'inset-4 top-20' // Mobile: centered with margins
                  : 'top-20 right-4 w-80' // Desktop: side panel
              } max-h-[70vh] bg-black/90 backdrop-blur-xl border border-white/20 rounded-xl overflow-hidden`}
            >
              <div className="p-4 border-b border-white/10">
                <div className="flex items-center justify-between">
                  <h3 className={`text-white font-semibold ${responsive.isMobile ? 'text-lg' : ''}`}>
                    {selectedEntity.planetName || selectedEntity.name || 'Planet Data'}
                  </h3>
                  <button
                    onClick={() => setSelectedEntity(null)}
                    className={`text-white/60 hover:text-white p-1 hover:bg-white/10 rounded transition-all ${
                      responsive.isMobile ? 'text-xl' : 'text-lg'
                    }`}
                  >
                    ✕
                  </button>
                </div>
              </div>
              
              <div className={`overflow-y-auto max-h-96 ${responsive.isMobile ? 'p-3' : 'p-4'}`}>
                <div className="space-y-3">
                  <div className={`grid gap-3 ${responsive.isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60 text-xs">Type</div>
                      <div className="text-white text-sm font-semibold">{selectedEntity.type || 'Contract'}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60 text-xs">Value</div>
                      <div className="text-white text-sm font-semibold">{selectedEntity.totalValue || '0'} ETH</div>
                    </div>
                  </div>
                  
                  <div className={`grid gap-3 ${responsive.isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60 text-xs">Daily TXs</div>
                      <div className="text-white text-sm font-semibold">{selectedEntity.dailyTransactions || '0'}</div>
                    </div>
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60 text-xs">Gas Used</div>
                      <div className="text-white text-sm font-semibold">{selectedEntity.gasUsed || '0'}</div>
                    </div>
                  </div>
                  
                  {selectedEntity.contractAddress && (
                    <div className="bg-white/5 rounded-lg p-3">
                      <div className="text-white/60 text-xs">Address</div>
                      <div className={`text-white font-mono break-all ${responsive.isMobile ? 'text-xs' : 'text-xs'}`}>
                        {selectedEntity.contractAddress}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {/* PRD Requirement: Shareable Snapshots & Clips */}
          <ShareableSnapshots 
            isOpen={showShareModal}
            onClose={() => setShowShareModal(false)}
          />

          {/* Loading Overlay */}
          {loading && (
            <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
              <Loader type="spinner" size="xl" text="Processing..." />
            </div>
          )}
        </div>

        {/* Development Only Components */}
        {process.env.NODE_ENV === 'development' && (
          <div className="pointer-events-auto">
            {/* Performance Monitor */}
            <PerformanceMonitor enabled={showDebugInfo} />

            {/* Physics Debug */}
            {showDebugInfo && enablePhysics && (
              <PhysicsDebug enabled={showDebugInfo} />
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default App;