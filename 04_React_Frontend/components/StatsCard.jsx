import React from 'react';
import { motion } from 'framer-motion';

function StatsCard({ icon: Icon, label, value, delay = 0 }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay, ease: 'easeOut' }}
      whileHover={{ y: -4, boxShadow: '0 20px 40px -12px rgba(99, 102, 241, 0.12)' }}
      className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 transition-colors duration-300 hover:bg-white/[0.08] hover:border-white/20"
    >
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-600/20 to-violet-600/20 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <p className="text-2xl font-display font-bold text-white">{value}</p>
          <p className="text-sm text-slate-400">{label}</p>
        </div>
      </div>
    </motion.div>
  );
}

export default StatsCard;
