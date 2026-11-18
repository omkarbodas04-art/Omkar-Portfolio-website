import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface Particle {
  id: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  char: string;
  scale: number;
}

interface SkillPillProps {
  skill: string;
}

const GLITCH_CHARS = ['█', '░', '▒', '+', '_', '0', '1', '//', '[]', '*', '•'];

const SkillPill: React.FC<SkillPillProps> = ({ skill }) => {
  const [particles, setParticles] = useState<Particle[]>([]);
  const [isHovered, setIsHovered] = useState(false);

  // Clean up expired particles to ensure pristine performance
  useEffect(() => {
    if (particles.length === 0) return;
    const interval = setInterval(() => {
      setParticles((prev) => prev.filter((p) => Date.now() - p.id < 450));
    }, 100);
    return () => clearInterval(interval);
  }, [particles]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    // Rate-limit particle creation slightly so it's a classy trail, not overwhelming
    if (Math.random() > 0.45) {
      const newParticle: Particle = {
        id: Date.now() + Math.random(),
        x,
        y,
        // Calculate velocity vectors scattering away or randomly
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3 - 1, // slight upward boost
        char: GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)],
        scale: 0.7 + Math.random() * 0.6,
      };

      setParticles((prev) => [...prev.slice(-15), newParticle]); // keep max 15 particles
    }
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsHovered(true);
    const rect = e.currentTarget.getBoundingClientRect();
    
    // Core burst on initial mouse enter for snappy feedback
    const burst: Particle[] = Array.from({ length: 4 }).map((_, i) => ({
      id: Date.now() + i + Math.random(),
      x: rect.width / 2 + (Math.random() - 0.5) * (rect.width * 0.5),
      y: rect.height / 2 + (Math.random() - 0.5) * (rect.height * 0.5),
      vx: (Math.random() - 0.5) * 4,
      vy: (Math.random() - 0.5) * 4,
      char: GLITCH_CHARS[Math.floor(Math.random() * GLITCH_CHARS.length)],
      scale: 0.8 + Math.random() * 0.5,
    }));

    setParticles((prev) => [...prev, ...burst].slice(-20));
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
  };

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="relative overflow-visible select-none"
    >
      {/* Interactive Particles Trail */}
      <AnimatePresence>
        {particles.map((p) => (
          <motion.span
            key={p.id}
            initial={{
              opacity: 0.9,
              scale: p.scale,
              x: p.x,
              y: p.y,
              rotate: 0,
            }}
            animate={{
              opacity: 0,
              scale: 0.1,
              x: p.x + p.vx * 35,
              y: p.y + p.vy * 35,
              rotate: Math.random() > 0.5 ? 180 : -180,
            }}
            exit={{ opacity: 0 }}
            transition={{
              duration: 0.45,
              ease: 'easeOut',
            }}
            className="absolute pointer-events-none font-mono text-[9px] font-bold z-50 select-none text-acid mix-blend-difference"
            style={{
              transform: 'translate(-50%, -50%)',
              left: 0,
              top: 0,
            }}
          >
            {p.char}
          </motion.span>
        ))}
      </AnimatePresence>

      {/* Main Pill Button */}
      <motion.div
        animate={
          isHovered
            ? {
                x: [0, -0.7, 0.7, -0.5, 0.8, -0.6, 0.5, -0.4, 0],
                y: [0, 0.6, -0.6, 0.7, -0.5, 0.4, -0.4, 0.5, 0],
                scale: 1.03,
              }
            : { x: 0, y: 0, scale: 1 }
        }
        transition={
          isHovered
            ? {
                x: {
                  repeat: Infinity,
                  duration: 0.2,
                  ease: 'linear',
                },
                y: {
                  repeat: Infinity,
                  duration: 0.2,
                  ease: 'linear',
                },
                scale: {
                  type: 'spring',
                  stiffness: 450,
                  damping: 14,
                }
              }
            : { type: 'spring', stiffness: 450, damping: 14 }
        }
        className="border border-border px-4 py-2 font-mono text-sm uppercase tracking-tighter hover:bg-acid hover:text-bg hover:border-acid transition-colors cursor-crosshair relative z-10"
      >
        {skill}
      </motion.div>
    </div>
  );
};

export default SkillPill;
