/**
 * Glass Card Component
 * Reusable glassmorphism card with consistent styling
 */

import { motion } from 'framer-motion';

const GlassCard = ({ 
  children, 
  className = '', 
  hover = true,
  animate = true,
  onClick,
  ...props 
}) => {
  const baseClasses = `
    glass rounded-2xl p-6 backdrop-blur-professional
    ${hover ? 'glass-hover cursor-pointer' : ''}
    will-change-transform gpu-accelerated
    ${className}
  `;

  const Component = animate ? motion.div : 'div';
  
  const animationProps = animate ? {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
    whileHover: hover ? { scale: 1.02 } : undefined,
    whileTap: onClick ? { scale: 0.98 } : undefined
  } : {};

  return (
    <Component
      className={baseClasses}
      onClick={onClick}
      {...animationProps}
      {...props}
    >
      {children}
    </Component>
  );
};

export default GlassCard;