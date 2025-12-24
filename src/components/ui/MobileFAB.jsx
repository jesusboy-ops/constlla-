/**
 * Mobile Floating Action Button Menu
 * Provides mobile-optimized access to key features
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../state/useAppStore.js';
import { useVisualizationStore, VISUALIZATION_MODES } from '../../state/useVisualizationStore.js';

const MobileFAB = ({ onOpenBottomSheet }) => {
  const [isOpen, setIsOpen] = useState(false);
  const { setCurrentView, setSidebarOpen } = useAppStore();
  const { setMode } = useVisualizationStore();

  const fabItems = [
    { 
      id: 'explore', 
      icon: '🧭', 
      label: 'Explore',
      action: () => {
        console.log('MobileFAB: Explore action triggered');
        console.log('MobileFAB: Setting mode to EXPLORE and view to explore');
        setMode(VISUALIZATION_MODES.EXPLORE);
        setCurrentView('explore');
      }
    },
    { 
      id: 'dashboard', 
      icon: '📈', 
      label: 'Dashboard',
      action: () => {
        console.log('MobileFAB: Dashboard action triggered');
        setCurrentView('dashboard');
      }
    },
    { 
      id: 'contracts', 
      icon: '📋', 
      label: 'Contracts',
      action: () => {
        console.log('MobileFAB: Contracts action triggered');
        setCurrentView('contracts');
      }
    },
    { 
      id: 'validators', 
      icon: '👥', 
      label: 'Validators',
      action: () => {
        console.log('MobileFAB: Validators action triggered');
        setCurrentView('validators');
      }
    }
  ];

  const handleItemClick = (item) => {
    console.log('MobileFAB: Item clicked:', item.id, item.label);
    item.action();
    setIsOpen(false);
  };

  const handleFABClick = () => {
    console.log('MobileFAB: FAB button clicked, isOpen:', isOpen);
    setIsOpen(!isOpen);
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* FAB Items */}
      <AnimatePresence>
        {isOpen && (
          <div className="absolute bottom-16 right-0 space-y-3">
            {fabItems.map((item, index) => (
              <motion.button
                key={item.id}
                initial={{ opacity: 0, scale: 0, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0, y: 20 }}
                transition={{ delay: index * 0.1 }}
                onClick={() => handleItemClick(item)}
                className="flex items-center gap-3 bg-black/80 backdrop-blur-sm border border-white/20 rounded-full px-4 py-3 text-white shadow-lg"
              >
                <span className="text-lg">{item.icon}</span>
                <span className="text-sm font-medium">{item.label}</span>
              </motion.button>
            ))}
          </div>
        )}
      </AnimatePresence>

      {/* Main FAB Button */}
      <motion.button
        onClick={handleFABClick}
        className="w-14 h-14 bg-purple-500 hover:bg-purple-600 rounded-full flex items-center justify-center text-white shadow-lg border border-purple-400/30"
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        animate={{ rotate: isOpen ? 45 : 0 }}
      >
        <span className="text-xl">+</span>
      </motion.button>
    </div>
  );
};

export default MobileFAB;