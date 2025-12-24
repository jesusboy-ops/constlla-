/**
 * Notification System Component
 * Simple, performant toast notifications with auto-dismiss
 */

import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore } from '../../state/useAppStore.js';

const NotificationSystem = () => {
  const { notifications, removeNotification } = useAppStore();

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      case 'info': return 'ℹ️';
      default: return 'ℹ️';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case 'success': return 'border-green-500/30 bg-green-500/10';
      case 'error': return 'border-red-500/30 bg-red-500/10';
      case 'warning': return 'border-yellow-500/30 bg-yellow-500/10';
      case 'info': return 'border-blue-500/30 bg-blue-500/10';
      default: return 'border-blue-500/30 bg-blue-500/10';
    }
  };

  return (
    <div className="fixed top-20 right-8 z-50 space-y-2">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            transition={{ duration: 0.3 }}
            className={`
              glass rounded-xl p-4 min-w-80 max-w-96 border
              ${getNotificationColor(notification.type)}
            `}
          >
            <div className="flex items-start gap-3">
              <span className="text-lg flex-shrink-0 mt-0.5">
                {getNotificationIcon(notification.type)}
              </span>
              
              <div className="flex-1 min-w-0">
                {notification.title && (
                  <h4 className="text-white font-medium text-sm mb-1">
                    {notification.title}
                  </h4>
                )}
                <p className="text-white/80 text-sm">
                  {notification.message}
                </p>
              </div>
              
              <button
                onClick={() => removeNotification(notification.id)}
                className="text-white/60 hover:text-white transition-colors flex-shrink-0"
              >
                ✕
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default NotificationSystem;