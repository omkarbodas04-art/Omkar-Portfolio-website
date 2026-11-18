import React from 'react';
import { motion, useScroll, useSpring } from 'motion/react';

const ScrollProgress: React.FC = () => {
  // Grab the vertical scroll progress of the window (0 to 1)
  const { scrollYProgress } = useScroll();

  // Create a spring physics transition for a buttery-smooth fluid effect
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  return (
    <motion.div
      id="global-scroll-progress-bar"
      className="fixed top-0 left-0 right-0 h-[3px] bg-acid origin-left z-[9999] pointer-events-none will-change-transform"
      style={{ scaleX }}
    />
  );
};

export default ScrollProgress;
