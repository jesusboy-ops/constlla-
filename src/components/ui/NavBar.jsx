/**
 * Professional Navigation Bar - Purple Neon Theme
 * Fully responsive with mobile-first design and glassmorphic styling
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useAppStore } from '../../state/useAppStore.js';
import { useChainStore } from '../../state/useChainStore.js';
import { useVisualizationStore, VISUALIZATION_MODES, MOTION_PHASES } from '../../state/useVisualizationStore.js';
import { formatChainName } from '../../utils/formatters.js';
import GlassButton from './GlassButton.jsx';
import CaptureControls from './CaptureControls.jsx';

const NavBar = ({ responsive }) => {
  const { currentView, setCurrentView, setSettingsOpen } = useAppStore();
  const { activeChain, setActiveChain, chains } = useChainStore();
  const { mode, setMode, phase, setPhase } = useVisualizationStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect for navbar
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { 
      id: 'home', 
      label: 'Universe', 
      icon: '🌌', 
      action: () => {
        setMode(VISUALIZATION_MODES.CALM);
        setCurrentView('home');
        setPhase(MOTION_PHASES.NORMAL);
      }
    },
    { 
      id: 'explore', 
      label: 'Explorer', 
      icon: '🚀', 
      action: () => {
        setMode(VISUALIZATION_MODES.EXPLORE);
        setCurrentView('explore');
        setPhase(MOTION_PHASES.NORMAL);
      }
    },
    { id: 'dashboard', label: 'Dashboard', icon: '📈' },
    { id: 'contracts', label: 'Contracts', icon: '📋' },
    { id: 'visualizer', label: 'Analytics', icon: '📊' },
    { id: 'validators', label: 'Validators', icon: '👥' }
  ];

  const handleTimeJump = () => {
    // Time jump functionality removed
  };

  return (
    <>
      {/* Desktop Navigation */}
      <motion.nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'py-3' : 'py-4'
        }`}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
      >
        <div className="flex justify-center">
          <div className={`glass rounded-xl lg:rounded-2xl px-6 lg:px-8 py-3 lg:py-4 flex items-center gap-4 lg:gap-6 backdrop-blur-professional border border-white/20 shadow-2xl transition-all duration-300 ${
            isScrolled ? 'bg-black/40' : 'bg-black/20'
          }`}>
            
            {/* Logo Section - Larger */}
            <motion.div 
              className="flex items-center gap-3 flex-shrink-0"
              whileHover={{ scale: 1.02 }}
              transition={{ duration: 0.2 }}
            >
              <div className="relative">
                <div className="w-10 h-10 lg:w-12 lg:h-12 bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-500 rounded-lg flex items-center justify-center shadow-lg">
                  <span className="text-white font-bold text-lg lg:text-xl">C</span>
                </div>
                <div className="absolute -inset-1 bg-gradient-to-br from-purple-500 via-violet-600 to-fuchsia-500 rounded-lg blur opacity-30 animate-pulse"></div>
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-white font-bold text-xl lg:text-2xl tracking-tight text-gradient">Constella</span>
                <span className="text-white/60 text-sm font-medium">Blockchain Universe</span>
              </div>
            </motion.div>

            {/* Desktop Navigation Items - Larger */}
            <div className="hidden md:flex items-center gap-2 lg:gap-3">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  className={`
                    relative px-4 lg:px-6 py-2.5 lg:py-3 rounded-xl text-sm lg:text-base font-semibold transition-all duration-300 whitespace-nowrap
                    ${currentView === item.id 
                      ? 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 text-white border border-purple-400/30 shadow-lg text-glow' 
                      : 'text-white/80 hover:text-white hover:bg-white/10 border border-transparent'
                    }
                  `}
                  onClick={() => {
                    if (item.action) {
                      item.action();
                    } else {
                      setCurrentView(item.id);
                    }
                  }}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="mr-2 text-base lg:text-lg">{item.icon}</span>
                  <span className="hidden lg:inline">{item.label}</span>
                  {currentView === item.id && (
                    <motion.div
                      className="absolute inset-0 bg-gradient-to-r from-purple-500/10 to-fuchsia-500/10 rounded-xl"
                      layoutId="activeTab"
                      transition={{ duration: 0.3 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Desktop Controls - Larger */}
            <div className="hidden lg:flex items-center gap-3 flex-shrink-0">
              {/* Chain Selector - Larger */}
              <select
                value={activeChain}
                onChange={(e) => setActiveChain(e.target.value)}
                className="bg-white/10 border border-white/20 rounded-lg px-4 py-2.5 text-sm text-white backdrop-blur-sm focus:border-purple-400/50 focus:outline-none focus:ring-1 focus:ring-purple-400/20 transition-all duration-300 cursor-pointer hover:bg-white/15"
              >
                {Object.entries(chains).map(([key, chain]) => (
                  <option key={key} value={key} className="bg-black text-white">
                    {formatChainName(key)}
                  </option>
                ))}
              </select>

              {/* Capture Controls (Video/Camera) */}
              <CaptureControls />

              {/* Settings Button - Larger */}
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <GlassButton
                  size="sm"
                  onClick={() => setSettingsOpen(true)}
                  className="!p-3 !bg-white/10 hover:!bg-white/20 border border-white/20"
                >
                  <span className="text-base">⚙️</span>
                </GlassButton>
              </motion.div>
            </div>

            {/* Mobile Menu Button + Quick Actions */}
            <div className="md:hidden flex items-center gap-2">
              {/* Quick Explorer Button - Only show when not in explore mode */}
              {currentView !== 'explore' && (
                <motion.button
                  onClick={() => {
                    setMode(VISUALIZATION_MODES.EXPLORE);
                    setCurrentView('explore');
                    setPhase(MOTION_PHASES.NORMAL);
                  }}
                  className="p-2.5 rounded-lg bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 border border-purple-400/30 text-white"
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-lg">🚀</span>
                </motion.button>
              )}
              
              {/* Quick Dashboard Button - Only show when not in dashboard */}
              {currentView !== 'dashboard' && currentView !== 'visualizer' && (
                <motion.button
                  onClick={() => setCurrentView('dashboard')}
                  className="p-2.5 rounded-lg bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-400/30 text-white"
                  whileTap={{ scale: 0.95 }}
                >
                  <span className="text-lg">📈</span>
                </motion.button>
              )}
              
              {/* Hamburger Menu Button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="p-3 rounded-lg bg-white/10 border border-white/20 text-white"
                whileTap={{ scale: 0.95 }}
              >
                <div className="w-6 h-6 flex flex-col justify-center items-center">
                  <motion.span
                    className="w-4 h-0.5 bg-white mb-1 transition-all"
                    animate={mobileMenuOpen ? { rotate: 45, y: 2 } : { rotate: 0, y: 0 }}
                  />
                  <motion.span
                    className="w-4 h-0.5 bg-white mb-1 transition-all"
                    animate={mobileMenuOpen ? { opacity: 0 } : { opacity: 1 }}
                  />
                  <motion.span
                    className="w-4 h-0.5 bg-white transition-all"
                    animate={mobileMenuOpen ? { rotate: -45, y: -2 } : { rotate: 0, y: 0 }}
                  />
                </div>
              </motion.button>
            </div>
          </div>
        </div>
      </motion.nav>

      {/* Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed inset-0 z-40 md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            {/* Backdrop */}
            <div 
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setMobileMenuOpen(false)}
            />
            
            {/* Mobile Menu */}
            <motion.div
              className="absolute top-16 left-3 right-3 glass rounded-xl p-4 backdrop-blur-professional border border-white/20 max-h-[80vh] overflow-y-auto"
              initial={{ y: -20, opacity: 0, scale: 0.95 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
            >
              {/* Mobile Navigation Items */}
              <div className="space-y-2 mb-4">
                {navItems.map((item) => (
                  <motion.button
                    key={item.id}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all duration-300 ${
                      currentView === item.id 
                        ? 'bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 text-white border border-purple-400/30' 
                        : 'text-white/80 hover:text-white hover:bg-white/10'
                    }`}
                    onClick={() => {
                      if (item.action) {
                        item.action();
                      } else {
                        setCurrentView(item.id);
                      }
                      setMobileMenuOpen(false);
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <span className="text-lg">{item.icon}</span>
                    <span className="font-semibold">{item.label}</span>
                  </motion.button>
                ))}
              </div>

              {/* Mobile Controls */}
              <div className="space-y-3 pt-3 border-t border-white/10">
                {/* Chain Selector */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-1">Network</label>
                  <select
                    value={activeChain}
                    onChange={(e) => setActiveChain(e.target.value)}
                    className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 text-white backdrop-blur-sm focus:border-purple-400/50 focus:outline-none focus:ring-2 focus:ring-purple-400/20"
                  >
                    {Object.entries(chains).map(([key, chain]) => (
                      <option key={key} value={key} className="bg-black text-white">
                        {formatChainName(key)}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Capture Controls (Mobile) */}
                <div>
                  <label className="block text-white/70 text-sm font-medium mb-2">Capture</label>
                  <div className="flex gap-2">
                    <CaptureControls />
                  </div>
                </div>

                {/* Settings Button */}
                <motion.button
                  onClick={() => {
                    setSettingsOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg bg-white/10 text-white/80 border border-white/20 font-semibold hover:bg-white/20 transition-all duration-300"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span>⚙️</span>
                  <span>Settings</span>
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default NavBar;