/**
 * Fixed NavBar Component
 * Professional purple neon navbar with proper z-index and mobile support
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../state/useAppStore.js';
import { useChainStore } from '../../state/useChainStore.js';
import { formatChainName } from '../../utils/formatters.js';
import GlassButton from './GlassButton.jsx';
import CaptureControls from './CaptureControls.jsx';

const FixedNavBar = () => {
  const { currentView, setCurrentView, setSettingsOpen } = useAppStore();
  const { activeChain, setActiveChain, chains } = useChainStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Universe', icon: '🌌' },
    { id: 'explore', label: 'Explorer', icon: '🔍' },
    { id: 'visualizer', label: 'Analytics', icon: '📊' }
  ];

  return (
    <>
      {/* Fixed NavBar - z-index 1000 (above everything) */}
      <nav
        className="fixed top-0 left-0 right-0 z-[1000] px-4 py-3 bg-[var(--bg-primary)]/80 backdrop-blur-xl border-b border-[var(--glass-border)]"
        style={{ borderBottomColor: 'var(--glass-border)' }}
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo Section */}
          <motion.div 
            className="flex items-center gap-3"
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
          >
            <div className="relative">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{ 
                  background: 'linear-gradient(135deg, var(--neon-primary), var(--neon-secondary))',
                  boxShadow: '0 0 20px rgba(155, 92, 255, 0.5)'
                }}
              >
                <span className="text-white font-bold text-lg">C</span>
              </div>
            </div>
            <div className="flex flex-col">
              <span 
                className="font-bold text-xl tracking-tight"
                style={{ color: 'var(--text-primary)' }}
              >
                Constella
              </span>
              <span 
                className="text-xs font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                Blockchain Explorer
              </span>
            </div>
          </motion.div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <div className="flex items-center gap-2">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  className={`
                    relative px-5 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300
                    ${currentView === item.id 
                      ? 'text-white' 
                      : 'text-[var(--text-secondary)] hover:text-white'
                    }
                  `}
                  style={{
                    background: currentView === item.id 
                      ? 'rgba(155, 92, 255, 0.2)' 
                      : 'transparent',
                    border: currentView === item.id 
                      ? '1px solid var(--neon-primary)' 
                      : '1px solid transparent',
                    boxShadow: currentView === item.id 
                      ? '0 0 20px rgba(155, 92, 255, 0.3)' 
                      : 'none'
                  }}
                  onClick={() => setCurrentView(item.id)}
                  whileHover={{ scale: 1.05, y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  transition={{ duration: 0.2 }}
                >
                  <span className="mr-2 text-base">{item.icon}</span>
                  {item.label}
                </motion.button>
              ))}
            </div>

            {/* Chain Selector */}
            <div className="flex items-center gap-3">
              <span 
                className="text-sm font-medium"
                style={{ color: 'var(--text-secondary)' }}
              >
                Network
              </span>
              <select
                value={activeChain}
                onChange={(e) => setActiveChain(e.target.value)}
                className="px-4 py-2 rounded-xl text-sm text-white cursor-pointer transition-all duration-300"
                style={{
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  backdropFilter: 'blur(10px)'
                }}
              >
                {Object.entries(chains).map(([key, chain]) => (
                  <option key={key} value={key} style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>
                    {formatChainName(key)}
                  </option>
                ))}
              </select>
            </div>

            {/* Action Controls */}
            <div className="flex items-center gap-3">
              <CaptureControls />
              
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <GlassButton
                  size="sm"
                  onClick={() => setSettingsOpen(true)}
                  className="!p-3"
                  style={{
                    background: 'var(--glass-bg)',
                    borderColor: 'var(--glass-border)'
                  }}
                >
                  <span className="text-lg">⚙️</span>
                </GlassButton>
              </motion.div>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden w-10 h-10 flex items-center justify-center rounded-lg transition-all duration-300"
            style={{
              background: 'var(--glass-bg)',
              border: '1px solid var(--glass-border)'
            }}
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            <span className="text-xl" style={{ color: 'var(--text-primary)' }}>
              {mobileMenuOpen ? '✕' : '☰'}
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Menu Dropdown - z-index 999 (below navbar but above canvas) */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            className="fixed top-[64px] left-0 right-0 z-[999] md:hidden"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.2 }}
            style={{
              background: 'var(--bg-primary)',
              borderBottom: '1px solid var(--glass-border)',
              backdropFilter: 'blur(20px)'
            }}
          >
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <motion.button
                  key={item.id}
                  className={`
                    w-full px-4 py-3 rounded-xl text-left font-semibold transition-all duration-300
                    ${currentView === item.id ? 'text-white' : 'text-[var(--text-secondary)]'}
                  `}
                  style={{
                    background: currentView === item.id 
                      ? 'rgba(155, 92, 255, 0.2)' 
                      : 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)'
                  }}
                  onClick={() => {
                    setCurrentView(item.id);
                    setMobileMenuOpen(false);
                  }}
                  whileTap={{ scale: 0.98 }}
                >
                  <span className="mr-3 text-base">{item.icon}</span>
                  {item.label}
                </motion.button>
              ))}
              
              {/* Mobile Chain Selector */}
              <div className="pt-3 border-t border-[var(--glass-border)]">
                <label 
                  className="block text-xs font-medium mb-2"
                  style={{ color: 'var(--text-secondary)' }}
                >
                  Network
                </label>
                <select
                  value={activeChain}
                  onChange={(e) => setActiveChain(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl text-sm text-white"
                  style={{
                    background: 'var(--glass-bg)',
                    border: '1px solid var(--glass-border)'
                  }}
                >
                  {Object.entries(chains).map(([key, chain]) => (
                    <option key={key} value={key} style={{ background: 'var(--bg-primary)' }}>
                      {formatChainName(key)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Mobile Actions */}
              <div className="flex items-center gap-3 pt-3">
                <CaptureControls />
                <GlassButton
                  size="sm"
                  onClick={() => {
                    setSettingsOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex-1"
                  style={{
                    background: 'var(--glass-bg)',
                    borderColor: 'var(--glass-border)'
                  }}
                >
                  <span className="mr-2">⚙️</span>
                  Settings
                </GlassButton>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default FixedNavBar;

