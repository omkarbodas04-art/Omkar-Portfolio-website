import React, { useRef } from 'react';
import { motion, useMotionValue, useSpring } from 'motion/react';

interface MagneticProps {
  children: React.ReactElement;
  range?: number; // Active zone around element
  strength?: number; // Move factor (0 to 1)
}

const Magnetic: React.FC<MagneticProps> = ({ children, range = 60, strength = 0.35 }) => {
  const ref = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  // High-fidelity spring mechanics matching a physical, snappy experience
  const springConfig = { damping: 12, stiffness: 150, mass: 0.1 };
  const springX = useSpring(x, springConfig);
  const springY = useSpring(y, springConfig);

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();
    
    // Middle of wrapped element
    const centerX = left + width / 2;
    const centerY = top + height / 2;
    
    // Relative position
    const distanceX = clientX - centerX;
    const distanceY = clientY - centerY;
    
    // Dynamic math-based approach for smooth activation gradient
    const distance = Math.sqrt(distanceX * distanceX + distanceY * distanceY);

    if (distance < range) {
      // Attraction scales towards the cursor
      x.set(distanceX * strength);
      y.set(distanceY * strength);
    } else {
      // Fade/Reset back to position when out of range
      x.set(0);
      y.set(0);
    }
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ x: springX, y: springY }}
      className="inline-block"
    >
      {children}
    </motion.div>
  );
};

export default Magnetic;
