/**
 * Exploration Notifications
 * Subtle notifications for exploration events
 * "New blockchain data received", "Planet scanned", etc.
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useState, useEffect } from 'react';
import { useExplorationStore } from '../../state/useExplorationStore.js';

const ExplorationNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const { nearbyPlanets, scannerActive, extractedData } = useExplorationStore();
  
  // Add notification
  const addNotification = (message, type = 'info', duration = 3000) => {
    const id = Date.now();
    const notification = { id, message, type };
    
    setNotifications(prev => [...prev, notification]);
    
    setTimeout(() => {
      setNotifications(prev => prev.filter(n => n.id !== id));
    }, duration);
  };
  
  // Listen for nearby planets
  useEffect(() => {
    const newNearbyCount = nearbyPlanets.length;
    if (newNearbyCount > 0) {
      // Only show notification for first nearby planet to avoid spam
      const hasUnscannedNearby = nearbyPlanets.some(p => !p.scanned);
      if (hasUnscannedNearby && notifications.length === 0) {
        addNotification('📡 New blockchain data detected', 'info');
      }
    }
  }, [nearbyPlanets.length]);
  
  // Listen for scanner activation
  useEffect(() => {
    if (scannerActive) {
      addNotification('🔍 Scanning for blockchain data...', 'scanning', 1000);
    }
  }, [scannerActive]);
  
  // Listen for data extraction
  useEffect(() => {
    if (extractedData) {
      addNotification(`✅ Block #${extractedData.blockNumber} data extracted`, 'success');
    }
  }, [extractedData]);
  
  return (
    <div className="fixed top-20 right-6 z-40 pointer-events-none">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 100, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 100, scale: 0.8 }}
            transition={{ 
              type: 'spring',
              stiffness: 500,
              damping: 30
            }}
            className={`mb-3 px-4 py-3 rounded-xl backdrop-blur-sm border ${getNotificationStyles(notification.type)}`}
            style={{
              boxShadow: '0 8px 25px rgba(0, 0, 0, 0.3)'
            }}
          >
            <div className="text-sm font-medium text-white">
              {notification.message}
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

const getNotificationStyles = (type) => {
  switch (type) {
    case 'success':
      return 'bg-green-500/20 border-green-400/30 text-green-300';
    case 'scanning':
      return 'bg-blue-500/20 border-blue-400/30 text-blue-300';
    case 'warning':
      return 'bg-yellow-500/20 border-yellow-400/30 text-yellow-300';
    case 'error':
      return 'bg-red-500/20 border-red-400/30 text-red-300';
    default:
      return 'bg-white/10 border-white/20 text-white';
  }
};

export default ExplorationNotifications;