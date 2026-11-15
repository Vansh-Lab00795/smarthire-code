import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

function MatchCircle({ percentage = 0, size = 80, strokeWidth = 6 }) {
  const [animatedPercentage, setAnimatedPercentage] = useState(0);
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (animatedPercentage / 100) * circumference;

  useEffect(() => {
    const timer = setTimeout(() => {
      setAnimatedPercentage(percentage);
    }, 300);
    return () => clearTimeout(timer);
  }, [percentage]);

  const getColor = (pct) => {
    if (pct >= 90) return { stroke: '#6366f1', bg: 'rgba(99, 102, 241, 0.15)', text: '#818cf8' };
    if (pct >= 70) return { stroke: '#22c55e', bg: 'rgba(34, 197, 94, 0.15)', text: '#4ade80' };
    if (pct >= 50) return { stroke: '#eab308', bg: 'rgba(234, 179, 8, 0.15)', text: '#facc15' };
    return { stroke: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)', text: '#f87171' };
  };

  const colors = getColor(percentage);

  return (
    <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="rgba(255,255,255,0.05)"
          strokeWidth={strokeWidth}
        />
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={colors.stroke}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          style={{
            filter: `drop-shadow(0 0 6px ${colors.stroke}40)`,
          }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="font-display font-bold"
          style={{
            fontSize: size * 0.22,
            color: colors.text,
          }}
        >
          {Math.round(animatedPercentage)}%
        </span>
      </div>
    </div>
  );
}

export default MatchCircle;
