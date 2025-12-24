/**
 * Glass Button Component
 * Glassmorphism button with hover effects and variants
 */

import { motion } from 'framer-motion';

const GlassButton = ({
  children,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  onClick,
  className = '',
  ...props
}) => {
  const variants = {
    primary: 'bg-white/5 hover:bg-white/10 border-white/10 hover:border-white/20',
    secondary: 'bg-white/3 hover:bg-white/8 border-white/5 hover:border-white/15',
    danger: 'bg-red-500/10 hover:bg-red-500/20 border-red-500/20 hover:border-red-500/40',
    success: 'bg-green-500/10 hover:bg-green-500/20 border-green-500/20 hover:border-green-500/40'
  };

  const sizes = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg'
  };

  const baseClasses = `
    backdrop-blur-professional border rounded-xl
    font-semibold transition-all duration-300
    flex items-center justify-center gap-2
    disabled:opacity-50 disabled:cursor-not-allowed
    btn-glow will-change-transform gpu-accelerated
    text-white shadow-lg hover:shadow-xl
    ${variants[variant]}
    ${sizes[size]}
    ${className}
  `;

  return (
    <motion.button
      className={baseClasses}
      disabled={disabled || loading}
      onClick={onClick}
      whileHover={!disabled ? { scale: 1.05 } : undefined}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      {...props}
    >
      {loading && (
        <div className="w-4 h-4 spinner" />
      )}
      {children}
    </motion.button>
  );
};

export default GlassButton;