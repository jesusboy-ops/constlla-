/**
 * Loading Component
 * Various loading states and spinners
 */

import { motion } from 'framer-motion';

const Loader = ({ 
  type = 'spinner', 
  size = 'md', 
  text = '', 
  className = '' 
}) => {
  const sizes = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
    xl: 'w-16 h-16'
  };

  if (type === 'spinner') {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        <div className={`spinner ${sizes[size]}`} />
        {text && (
          <p className="text-white/70 text-sm">{text}</p>
        )}
      </div>
    );
  }

  if (type === 'dots') {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="w-2 h-2 bg-white/60 rounded-full"
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.5, 1, 0.5]
            }}
            transition={{
              duration: 1,
              repeat: Infinity,
              delay: i * 0.2
            }}
          />
        ))}
        {text && (
          <span className="text-white/70 text-sm ml-2">{text}</span>
        )}
      </div>
    );
  }

  if (type === 'pulse') {
    return (
      <div className={`flex flex-col items-center gap-3 ${className}`}>
        <motion.div
          className={`bg-blue-500/30 rounded-full ${sizes[size]}`}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.8, 0.3]
          }}
          transition={{
            duration: 2,
            repeat: Infinity
          }}
        />
        {text && (
          <p className="text-white/70 text-sm">{text}</p>
        )}
      </div>
    );
  }

  return null;
};

export default Loader;