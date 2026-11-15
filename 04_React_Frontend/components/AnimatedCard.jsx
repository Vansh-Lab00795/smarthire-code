import React from 'react';
import { motion } from 'framer-motion';

function AnimatedCard({ children, className = '', delay = 0, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{
        y: -4,
        boxShadow: '0 20px 40px -12px rgba(99, 102, 241, 0.15)',
      }}
      onClick={onClick}
      className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl transition-colors duration-300 hover:bg-white/[0.08] hover:border-white/20 ${className}`}
    >
      {children}
    </motion.div>
  );
}

export default AnimatedCard;
