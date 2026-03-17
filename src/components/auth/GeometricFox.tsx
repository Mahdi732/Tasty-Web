'use client';

import { motion } from 'framer-motion';

interface GeometricFoxProps {
  orbitAngle: number;
  circleRadius: number;
  centerX: number;
  centerY: number;
}

export default function GeometricFox({
  orbitAngle,
  circleRadius,
  centerX,
  centerY,
}: GeometricFoxProps) {
  const radians = (orbitAngle * Math.PI) / 180;
  const foxX = centerX + circleRadius * Math.cos(radians);
  const foxY = centerY + circleRadius * Math.sin(radians);

  const foxRotation = orbitAngle + 90;

  return (
    <motion.g
      animate={{ x: foxX, y: foxY, rotate: foxRotation }}
      transition={{ type: 'spring', stiffness: 60, damping: 20 }}
    >
      {/* Glow behind the fox */}
      <circle r={28} fill="url(#foxGlow)" opacity={0.5} />

      {/* Body — main diamond */}
      <motion.polygon
        points="0,-22 14,0 0,22 -14,0"
        fill="#dc2626"
        stroke="#ef4444"
        strokeWidth={1}
        animate={{ scale: [1, 1.04, 1] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Left ear */}
      <polygon points="-10,-18 -18,-32 -4,-24" fill="#991b1b" />
      <polygon points="-10,-20 -16,-30 -6,-24" fill="#dc2626" />

      {/* Right ear */}
      <polygon points="10,-18 18,-32 4,-24" fill="#991b1b" />
      <polygon points="10,-20 16,-30 6,-24" fill="#dc2626" />

      {/* Inner ear accents */}
      <polygon points="-10,-20 -14,-28 -7,-23" fill="#ef4444" opacity={0.6} />
      <polygon points="10,-20 14,-28 7,-23" fill="#ef4444" opacity={0.6} />

      {/* Face mask — lighter triangle */}
      <polygon points="0,-14 8,2 -8,2" fill="#1a1a1a" opacity={0.7} />

      {/* Eyes */}
      <motion.circle
        cx={-5}
        cy={-8}
        r={2}
        fill="#ffffff"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />
      <motion.circle
        cx={5}
        cy={-8}
        r={2}
        fill="#ffffff"
        animate={{ scale: [1, 1.2, 1] }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: 'easeInOut',
          delay: 0.5,
        }}
      />

      {/* Eye pupils */}
      <circle cx={-5} cy={-8} r={1} fill="#050505" />
      <circle cx={5} cy={-8} r={1} fill="#050505" />

      {/* Nose */}
      <polygon points="0,-2 -2,1 2,1" fill="#991b1b" />

      {/* Snout lines */}
      <line
        x1={0}
        y1={1}
        x2={-4}
        y2={5}
        stroke="#991b1b"
        strokeWidth={0.8}
        opacity={0.5}
      />
      <line
        x1={0}
        y1={1}
        x2={4}
        y2={5}
        stroke="#991b1b"
        strokeWidth={0.8}
        opacity={0.5}
      />

      {/* Tail — trailing polygons */}
      <polygon points="0,22 -8,34 8,34" fill="#991b1b" opacity={0.6} />
      <polygon points="0,30 -5,38 5,38" fill="#dc2626" opacity={0.3} />
    </motion.g>
  );
}
