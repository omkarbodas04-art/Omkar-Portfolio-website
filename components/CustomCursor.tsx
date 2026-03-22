
import React, { useState, useEffect, useRef } from 'react';

const CustomCursor: React.FC = () => {
  const cursorRef = useRef<HTMLDivElement>(null);
  const [hoverType, setHoverType] = useState<string | null>(null);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => {
      if (cursorRef.current) {
        // Use translate3d for hardware acceleration, 1:1 tracking with no lerp
        cursorRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0)`;
      }
      if (!isVisible) setIsVisible(true);
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    const onMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const isProject = target.closest('.group.block');
      const isButton = target.tagName === 'BUTTON' || target.closest('button');
      const isLink = target.tagName === 'A' || target.closest('a');

      if (isProject) {
        setHoverType('ACCESS_DATA');
      } else if (isButton || isLink) {
        setHoverType('EXECUTE');
      } else {
        setHoverType(null);
      }
    };

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mouseover', onMouseOver);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', onMouseOver);
    };
  }, [isVisible]);

  if (!isVisible) return null;

  const isHovering = !!hoverType;

  return (
    <div 
      ref={cursorRef}
      className="fixed top-0 left-0 pointer-events-none z-[9999] hidden md:block cursor-blend will-change-transform"
      style={{ marginLeft: '-16px', marginTop: '-16px' }} // Center the 32x32 area
    >
      <div className="relative w-8 h-8 flex items-center justify-center">
        {/* Central Precision Point */}
        <div className={`w-1 h-1 bg-white transition-transform duration-200 ${isClicking ? 'scale-150' : 'scale-100'}`} />

        {/* Unified Technical Crosshair Body */}
        <div className={`absolute inset-0 transition-all duration-300 ease-out border border-white/20 ${
          isHovering ? 'scale-125 border-white opacity-100' : 'scale-50 opacity-40'
        }`}>
          {/* Internal Markings */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1px] h-1.5 bg-white" />
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[1px] h-1.5 bg-white" />
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] w-1.5 bg-white" />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 h-[1px] w-1.5 bg-white" />
        </div>

        {/* Contextual Data String */}
        <div className={`absolute top-full left-full mt-2 ml-2 transition-opacity duration-200 ${isHovering ? 'opacity-100' : 'opacity-0'}`}>
          <div className="font-mono text-[8px] font-bold text-white tracking-[0.2em] whitespace-nowrap bg-black/40 px-1 py-0.5 border-l border-white">
            {hoverType}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomCursor;
