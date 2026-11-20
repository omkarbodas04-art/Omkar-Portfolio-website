import React, { useEffect, useRef, useState } from 'react';
import { audioService } from '../services/audioService';

interface PixelRevealPortraitProps {
  photoSrc: string;
  pixelCharSrc: string;
  alt: string;
}

interface Spark {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  life: number;
  maxLife: number;
  acid: boolean;
}

const GRID_SIZE = 12;

const hashCell = (gx: number, gy: number) => {
  const n = Math.sin(gx * 127.1 + gy * 311.7) * 43758.5453123;
  return n - Math.floor(n);
};

const PixelRevealPortrait: React.FC<PixelRevealPortraitProps> = ({
  photoSrc,
  pixelCharSrc,
  alt,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const pixelImgRef = useRef<HTMLImageElement | null>(null);
  const photoImgRef = useRef<HTMLImageElement | null>(null);
  const offscreenRef = useRef<HTMLCanvasElement | null>(null);
  const photoOffscreenRef = useRef<HTMLCanvasElement | null>(null);
  const sampleDataRef = useRef<Uint8ClampedArray | null>(null);
  const photoDataRef = useRef<Uint8ClampedArray | null>(null);
  const sizeRef = useRef({ width: 0, height: 0, dpr: 1 });

  const stateRef = useRef({
    hovered: false,
    radius: 0,
    maxRadius: 0,
    originX: 0,
    originY: 0,
    cursorX: 0,
    cursorY: 0,
    lastFrameTime: 0,
    lastMoveTime: 0,
    sparks: [] as Spark[],
    rafId: 0,
    running: false,
  });

  const [isPixelActive, setIsPixelActive] = useState(false);

  // Render an image into an offscreen buffer matching object-cover geometry
  const renderToOffscreen = (
    img: HTMLImageElement | null,
    canvasSlot: React.MutableRefObject<HTMLCanvasElement | null>,
    dataSlot: React.MutableRefObject<Uint8ClampedArray | null>,
    yAlignRatio: number
  ) => {
    const { width, height } = sizeRef.current;
    if (!img || !img.complete || img.naturalWidth === 0 || width <= 0 || height <= 0) {
      return;
    }

    const buffer = canvasSlot.current || document.createElement('canvas');
    buffer.width = Math.max(1, Math.floor(width));
    buffer.height = Math.max(1, Math.floor(height));
    canvasSlot.current = buffer;

    const bctx = buffer.getContext('2d', { willReadFrequently: true });
    if (!bctx) return;

    bctx.imageSmoothingEnabled = false;
    bctx.clearRect(0, 0, buffer.width, buffer.height);

    const imgRatio = img.naturalWidth / img.naturalHeight;
    const boxRatio = buffer.width / buffer.height;
    let drawW = buffer.width;
    let drawH = buffer.height;
    let offsetX = 0;
    let offsetY = 0;

    if (imgRatio > boxRatio) {
      drawH = buffer.height;
      drawW = drawH * imgRatio;
      offsetX = (buffer.width - drawW) / 2;
    } else {
      drawW = buffer.width;
      drawH = drawW / imgRatio;
      offsetY = (buffer.height - drawH) * yAlignRatio;
    }

    bctx.drawImage(img, offsetX, offsetY, drawW, drawH);
    dataSlot.current = bctx.getImageData(0, 0, buffer.width, buffer.height).data;
  };

  const buildBuffers = () => {
    renderToOffscreen(pixelImgRef.current, offscreenRef, sampleDataRef, 0.22);
    renderToOffscreen(photoImgRef.current, photoOffscreenRef, photoDataRef, 0);
  };

  useEffect(() => {
    const pixelImg = new Image();
    pixelImg.src = pixelCharSrc;
    pixelImg.onload = () => {
      pixelImgRef.current = pixelImg;
      renderToOffscreen(pixelImg, offscreenRef, sampleDataRef, 0.22);
    };

    const photoImg = new Image();
    photoImg.src = photoSrc;
    photoImg.onload = () => {
      photoImgRef.current = photoImg;
      renderToOffscreen(photoImg, photoOffscreenRef, photoDataRef, 0);
    };
  }, [pixelCharSrc, photoSrc]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(1, Math.round(rect.width));
      const height = Math.max(1, Math.round(rect.height));

      sizeRef.current = { width, height, dpr };
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;

      buildBuffers();
    };

    updateSize();
    const observer = new ResizeObserver(updateSize);
    observer.observe(container);

    return () => {
      observer.disconnect();
      if (stateRef.current.rafId) {
        cancelAnimationFrame(stateRef.current.rafId);
      }
    };
  }, []);

  const computeMaxRadius = (ox: number, oy: number, w: number, h: number) => {
    const d1 = Math.hypot(ox, oy);
    const d2 = Math.hypot(w - ox, oy);
    const d3 = Math.hypot(ox, h - oy);
    const d4 = Math.hypot(w - ox, h - oy);
    return Math.max(d1, d2, d3, d4) + 120;
  };

  const spawnSparks = (x: number, y: number, count: number, outwardSpeed = 2.0) => {
    const sparks = stateRef.current.sparks;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 0.4 + Math.random() * outwardSpeed;
      sparks.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() > 0.35 ? 5 : 7,
        life: 0,
        maxLife: 26 + Math.random() * 24,
        acid: Math.random() > 0.2,
      });
    }
    if (sparks.length > 90) {
      sparks.splice(0, sparks.length - 90);
    }
  };

  const startLoop = () => {
    if (stateRef.current.running) return;
    stateRef.current.running = true;
    stateRef.current.lastFrameTime = performance.now();

    const render = (now: number) => {
      const canvas = canvasRef.current;
      const offscreen = offscreenRef.current;
      const sampleData = sampleDataRef.current;
      const photoData = photoDataRef.current;
      const { width, height, dpr } = sizeRef.current;
      const st = stateRef.current;

      const dt = Math.min(0.05, Math.max(0.001, (now - (st.lastFrameTime || now)) / 1000));
      st.lastFrameTime = now;

      if (!canvas) {
        st.running = false;
        return;
      }
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        st.running = false;
        return;
      }

      // Snappy yet clearly visible radial pixel sweep (~265px/s expand, ~340px/s retract)
      if (st.hovered) {
        const followRate = st.radius < st.maxRadius * 0.35 ? 1 - Math.exp(-6.5 * dt) : 1 - Math.exp(-1.6 * dt);
        st.originX += (st.cursorX - st.originX) * followRate;
        st.originY += (st.cursorY - st.originY) * followRate;
        st.maxRadius = computeMaxRadius(st.originX, st.originY, width, height);
        const expandSpeed = 265;
        st.radius = Math.min(st.maxRadius, st.radius + expandSpeed * dt);
      } else {
        const shrinkSpeed = 340;
        st.radius = Math.max(0, st.radius - shrinkSpeed * dt);
      }

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, width, height);
      ctx.imageSmoothingEnabled = false;

      const cols = Math.ceil(width / GRID_SIZE);
      const rows = Math.ceil(height / GRID_SIZE);
      const bandWidth = 140;
      const coreEdge = st.radius - 24;
      const timeSec = now * 0.001;
      const moveAge = now - st.lastMoveTime;
      const rippleActive = st.hovered && moveAge < 480;

      if (offscreen && sampleData && st.radius > 1) {
        const coreStep = Math.floor(timeSec * 6);
        // 8-bit quantized breathing, sway & cursor-reactive parallax
        const breathStep = Math.round(Math.sin(timeSec * 3.4) * 3);
        const swayStep = Math.round(Math.cos(timeSec * 1.7) * 2);
        const normCursorX = width > 0 ? (st.cursorX / width - 0.5) * 2 : 0;
        const normCursorY = height > 0 ? (st.cursorY / height - 0.5) * 2 : 0;
        const parallaxX = st.hovered ? Math.round(-normCursorX * 4) : 0;
        const parallaxY = st.hovered ? Math.round(-normCursorY * 4) : 0;

        const drawOffsetX = swayStep + parallaxX;
        const drawOffsetY = breathStep + parallaxY;
        const overscan = 10;

        // 1. Settled radial core: reveal animated pixel-art character inside quantized pixel boundary
        ctx.save();
        ctx.beginPath();
        for (let gy = 0; gy < rows; gy++) {
          const py = gy * GRID_SIZE;
          const cy = py + GRID_SIZE * 0.5;
          for (let gx = 0; gx < cols; gx++) {
            const px = gx * GRID_SIZE;
            const cx = px + GRID_SIZE * 0.5;
            const noise = (hashCell(gx, gy) - 0.5) * 54;
            const dist = Math.hypot(cx - st.originX, cy - st.originY) + noise;

            if (dist <= coreEdge) {
              ctx.rect(px, py, GRID_SIZE, GRID_SIZE);
            }
          }
        }
        ctx.clip();

        // Draw base animated sprite with overscan so breathing & parallax never leave blank edges
        ctx.drawImage(
          offscreen,
          drawOffsetX - overscan,
          drawOffsetY - overscan,
          width + overscan * 2,
          height + overscan * 2
        );

        // Subtle 8-bit wind/cloth shimmer on lower hoodie & hair edges (alternating pixel strips)
        const spriteBeat = Math.floor(timeSec * 5) % 4;
        if (spriteBeat === 1 || spriteBeat === 3) {
          const stripShift = spriteBeat === 1 ? 1 : -1;
          ctx.drawImage(
            offscreen,
            0,
            Math.floor(height * 0.58),
            width,
            Math.floor(height * 0.42),
            drawOffsetX - overscan + stripShift,
            drawOffsetY + Math.floor(height * 0.58),
            width + overscan * 2,
            Math.floor(height * 0.42) + overscan
          );
        }

        // Traveling neon arcade scan beam across the pixel character
        const beamY = ((timeSec * 95) % (height + 120)) - 60;
        const beamGrad = ctx.createLinearGradient(0, beamY - 24, 0, beamY + 24);
        beamGrad.addColorStop(0, 'rgba(204, 255, 0, 0)');
        beamGrad.addColorStop(0.5, 'rgba(204, 255, 0, 0.14)');
        beamGrad.addColorStop(1, 'rgba(204, 255, 0, 0)');
        ctx.fillStyle = beamGrad;
        ctx.fillRect(0, beamY - 24, width, 48);

        // Subtle CRT pixel scanlines
        ctx.fillStyle = 'rgba(0, 0, 0, 0.12)';
        for (let sy = 0; sy < height; sy += 4) {
          ctx.fillRect(0, sy, width, 1);
        }

        // Pulse neon green highlights (headphones, drawstrings, gamepad, GAME ON) + rising pixel embers
        const greenWaveY = height - ((timeSec * 130) % (height + 80));
        for (let gy = 0; gy < rows; gy++) {
          const py = gy * GRID_SIZE;
          const sy = Math.min(offscreen.height - 1, Math.max(0, Math.floor(py + GRID_SIZE * 0.5)));
          for (let gx = 0; gx < cols; gx++) {
            const px = gx * GRID_SIZE;
            const sx = Math.min(offscreen.width - 1, Math.max(0, Math.floor(px + GRID_SIZE * 0.5)));
            const idx = (sy * offscreen.width + sx) * 4;
            const r = sampleData[idx];
            const g = sampleData[idx + 1];
            const b = sampleData[idx + 2];
            const isNeonGreen = g > 165 && r < 175 && b < 90;

            if (isNeonGreen) {
              const waveDist = Math.abs(py - greenWaveY);
              if (waveDist < 42) {
                const boost = (1 - waveDist / 42) * 0.55;
                ctx.fillStyle = `rgba(225, 255, 110, ${boost})`;
                ctx.fillRect(px + drawOffsetX, py + drawOffsetY, 6, 6);
              }
            }

            // Rising 8-bit ambient pixel particles
            const h = hashCell(gx + 19, gy + 31);
            if (h > 0.968) {
              const floatY = (py - ((timeSec * (28 + h * 26)) % height) + height) % height;
              const flicker = 0.4 + 0.6 * Math.abs(Math.sin(timeSec * 4 + h * 20));
              ctx.fillStyle = `rgba(204, 255, 0, ${flicker * 0.75})`;
              ctx.fillRect(Math.round(px + Math.sin(timeSec * 2 + h * 10) * 3), Math.round(floatY), 4, 4);
            }
          }
        }
        ctx.restore();

        // 2. Visible pixel takeover wave converting original photo pixels -> pixel character blocks
        for (let gy = 0; gy < rows; gy++) {
          const py = gy * GRID_SIZE;
          const cy = py + GRID_SIZE * 0.5;
          const sampleY = Math.min(offscreen.height - 1, Math.max(0, Math.floor(cy)));

          for (let gx = 0; gx < cols; gx++) {
            const px = gx * GRID_SIZE;
            const cx = px + GRID_SIZE * 0.5;
            const cellNoise = hashCell(gx, gy);
            const dist = Math.hypot(cx - st.originX, cy - st.originY) + (cellNoise - 0.5) * 56;
            const cursorDist = Math.hypot(cx - st.cursorX, cy - st.cursorY);

            const inFrontier = dist > coreEdge && dist <= st.radius + bandWidth;
            const inCursorWake =
              st.hovered &&
              dist <= coreEdge &&
              cursorDist < (rippleActive ? 56 : 32) &&
              hashCell(gx + coreStep, gy - coreStep) > (rippleActive ? 0.56 : 0.8);

            if (!inFrontier && !inCursorWake) continue;

            const sampleX = Math.min(offscreen.width - 1, Math.max(0, Math.floor(cx)));
            const idx = (sampleY * offscreen.width + sampleX) * 4;
            const cr = sampleData[idx];
            const cg = sampleData[idx + 1];
            const cb = sampleData[idx + 2];

            if (inCursorWake) {
              const alpha = Math.max(0.25, 1 - cursorDist / 56);
              ctx.fillStyle = cellNoise > 0.45 ? `rgba(204, 255, 0, ${alpha * 0.8})` : `rgb(${cr},${cg},${cb})`;
              ctx.fillRect(px + 1, py + 1, GRID_SIZE - 2, GRID_SIZE - 2);
              continue;
            }

            // progress: 0 = outermost edge touching original photo, 1 = fully locked into pixel character
            const progress = Math.min(
              1,
              Math.max(0, 1 - (dist - coreEdge) / (bandWidth + 26))
            );
            const flicker = Math.sin(timeSec * 8 + cellNoise * 35);

            // Sample the original photo at this cell so pixels visibly take over the real photo
            const pr = photoData ? photoData[idx] : cr;
            const pg = photoData ? photoData[idx + 1] : cg;
            const pb = photoData ? photoData[idx + 2] : cb;

            if (progress < 0.34) {
              // Stage 1: Original photo breaks into chunky mosaic pixel tiles with acid outlines
              if (progress < 0.14 && flicker < 0.05) continue;
              ctx.fillStyle = `rgb(${pr}, ${pg}, ${pb})`;
              ctx.fillRect(px + 1, py + 1, GRID_SIZE - 2, GRID_SIZE - 2);
              ctx.strokeStyle = `rgba(204, 255, 0, ${0.35 + progress * 1.5})`;
              ctx.lineWidth = 1;
              ctx.strokeRect(px + 0.5, py + 0.5, GRID_SIZE - 1, GRID_SIZE - 1);
            } else if (progress < 0.68) {
              // Stage 2: Pixel tiles glitch/flash neon acid green & swap from photo to pixel character
              if (flicker > 0.62) {
                ctx.fillStyle = '#ccff00';
              } else if (cellNoise + progress * 0.5 > 0.82) {
                ctx.fillStyle = `rgb(${cr}, ${cg}, ${cb})`;
              } else {
                ctx.fillStyle = `rgb(${pr}, ${pg}, ${pb})`;
              }
              ctx.fillRect(px + 1, py + 1, GRID_SIZE - 2, GRID_SIZE - 2);

              // Subtle dark pixel seam around converting tile so each block reads clearly
              ctx.strokeStyle = 'rgba(5, 5, 5, 0.75)';
              ctx.lineWidth = 1;
              ctx.strokeRect(px + 0.5, py + 0.5, GRID_SIZE - 1, GRID_SIZE - 1);
            } else {
              // Stage 3: Character pixel tiles lock into place with crisp pixel grid seams fading out
              ctx.fillStyle = flicker > 0.88 ? '#ccff00' : `rgb(${cr}, ${cg}, ${cb})`;
              ctx.fillRect(px, py, GRID_SIZE, GRID_SIZE);
              if (progress < 0.88) {
                ctx.strokeStyle = `rgba(204, 255, 0, ${(0.88 - progress) * 2.2})`;
                ctx.lineWidth = 1;
                ctx.strokeRect(px + 0.5, py + 0.5, GRID_SIZE - 1, GRID_SIZE - 1);
              }
            }
          }
        }
      }

      // 3. Render & update pixel sparks radiating from cursor
      for (let i = st.sparks.length - 1; i >= 0; i--) {
        const sp = st.sparks[i];
        sp.x += sp.vx * (dt * 60);
        sp.y += sp.vy * (dt * 60);
        sp.life += dt * 60;

        if (sp.life >= sp.maxLife) {
          st.sparks.splice(i, 1);
          continue;
        }

        const alpha = 1 - sp.life / sp.maxLife;
        ctx.fillStyle = sp.acid
          ? `rgba(204, 255, 0, ${alpha})`
          : `rgba(255, 255, 255, ${alpha * 0.85})`;
        ctx.fillRect(Math.round(sp.x), Math.round(sp.y), sp.size, sp.size);
      }

      if (st.hovered || st.radius > 0.5 || st.sparks.length > 0) {
        st.rafId = requestAnimationFrame(render);
      } else {
        ctx.clearRect(0, 0, width, height);
        st.running = false;
      }
    };

    stateRef.current.rafId = requestAnimationFrame(render);
  };

  const getLocalCoords = (clientX: number, clientY: number) => {
    const container = containerRef.current;
    if (!container) return { x: 0, y: 0, width: 1, height: 1 };
    const rect = container.getBoundingClientRect();
    return {
      x: Math.min(rect.width, Math.max(0, clientX - rect.left)),
      y: Math.min(rect.height, Math.max(0, clientY - rect.top)),
      width: rect.width,
      height: rect.height,
    };
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const { x, y, width, height } = getLocalCoords(e.clientX, e.clientY);
    const st = stateRef.current;
    st.hovered = true;
    st.originX = x;
    st.originY = y;
    st.cursorX = x;
    st.cursorY = y;
    st.lastMoveTime = performance.now();
    st.maxRadius = computeMaxRadius(x, y, width, height);
    spawnSparks(x, y, 16, 2.2);
    setIsPixelActive(true);
    audioService.playClick();
    startLoop();
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { x, y } = getLocalCoords(e.clientX, e.clientY);
    const st = stateRef.current;
    if (!st.hovered) {
      handleMouseEnter(e);
      return;
    }
    const moved = Math.hypot(x - st.cursorX, y - st.cursorY);
    st.cursorX = x;
    st.cursorY = y;
    if (moved > 5) {
      st.lastMoveTime = performance.now();
      spawnSparks(x, y, 2, 1.5);
    }
  };

  const handleMouseLeave = () => {
    stateRef.current.hovered = false;
    setIsPixelActive(false);
    startLoop();
  };

  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    const touch = e.touches[0];
    if (!touch) return;
    const { x, y, width, height } = getLocalCoords(touch.clientX, touch.clientY);
    const st = stateRef.current;
    const nextHovered = !st.hovered;
    st.hovered = nextHovered;
    st.originX = x;
    st.originY = y;
    st.cursorX = x;
    st.cursorY = y;
    st.lastMoveTime = performance.now();
    st.maxRadius = computeMaxRadius(x, y, width, height);
    if (nextHovered) {
      spawnSparks(x, y, 16, 2.2);
    }
    setIsPixelActive(nextHovered);
    audioService.playClick();
    startLoop();
  };

  return (
    <div className="lg:col-span-5 bg-surface border border-border relative group flex flex-col">
      <div className={`absolute -top-3 right-3 sm:-right-3 z-20 text-bg px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest transition-colors ${isPixelActive ? 'bg-acid' : 'bg-accent2'}`}>
        {isPixelActive ? '8-Bit_Mode' : 'Portrait'}
      </div>

      <div
        ref={containerRef}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onTouchStart={handleTouchStart}
        className="relative aspect-[4/5] sm:aspect-[4/3] lg:aspect-auto lg:flex-1 lg:min-h-[420px] overflow-hidden select-none cursor-crosshair"
      >
        <img
          src={photoSrc}
          alt={alt}
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover object-top select-none pointer-events-none"
        />

        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className="absolute inset-0 w-full h-full pointer-events-none z-10"
        />
      </div>

      <div className="border-t border-border px-4 sm:px-5 py-3 sm:py-3.5 flex items-center justify-between bg-surface">
        <span className="font-mono text-xs sm:text-sm tracking-[0.12em] text-acid font-bold">
          {isPixelActive ? 'CursedCookies' : 'Omkar Bodas'}
        </span>
      </div>
    </div>
  );
};

export default PixelRevealPortrait;
