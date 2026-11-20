import React, { useEffect, useRef, useState } from 'react';
import { audioService } from '../services/audioService';

type GameStatus = 'idle' | 'playing' | 'gameover';

interface Obstacle {
  x: number;
  w: number;
  h: number;
  type: 'spike' | 'crate';
  passed: boolean;
}

interface Collectible {
  x: number;
  y: number;
  collected: boolean;
  bobOffset: number;
  isCyan: boolean;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  color: string;
  size: number;
}

interface FloatingText {
  x: number;
  y: number;
  text: string;
  life: number;
  color: string;
}

const HI_SCORE_KEY = 'portfolio-arcade-hi';

const GamingArcadeStrip: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [status, setStatus] = useState<GameStatus>('idle');
  const [score, setScore] = useState(0);
  const [hiScore, setHiScore] = useState<number>(() => {
    try {
      return Number(localStorage.getItem(HI_SCORE_KEY) || 0);
    } catch {
      return 0;
    }
  });

  const gameRef = useRef({
    status: 'idle' as GameStatus,
    width: 0,
    height: 0,
    dpr: 1,
    groundY: 64,
    runnerX: 72,
    runnerY: 0,
    vy: 0,
    onGround: true,
    runTimer: 0,
    scrollOffset: 0,
    distanceAcc: 0,
    score: 0,
    hiScore: 0,
    obstacles: [] as Obstacle[],
    collectibles: [] as Collectible[],
    particles: [] as Particle[],
    popups: [] as FloatingText[],
    spawnTimer: 0.7,
    collectTimer: 0.4,
    isVisible: true,
    lastTime: 0,
    rafId: 0,
  });

  useEffect(() => {
    gameRef.current.hiScore = hiScore;
  }, [hiScore]);

  const spawnDust = (x: number, y: number, count = 6) => {
    const g = gameRef.current;
    for (let i = 0; i < count; i++) {
      g.particles.push({
        x: x + (Math.random() - 0.5) * 10,
        y,
        vx: -40 - Math.random() * 60,
        vy: -15 - Math.random() * 50,
        life: 0,
        maxLife: 0.32 + Math.random() * 0.2,
        color: i % 2 === 0 ? 'acid' : 'accent2',
        size: 3,
      });
    }
  };

  const resetAndStart = () => {
    const g = gameRef.current;
    g.status = 'playing';
    g.runnerY = 0;
    g.vy = -285; // Chrome Dino style opening hop
    g.onGround = false;
    g.distanceAcc = 0;
    g.score = 0;
    g.obstacles = [];
    g.collectibles = [];
    g.particles = [];
    g.popups = [];
    g.spawnTimer = 0.85;
    g.collectTimer = 0.55;
    g.lastTime = performance.now();

    spawnDust(g.runnerX + 8, g.groundY - 2, 8);
    setScore(0);
    setStatus('playing');
    audioService.playClick();
  };

  const handleAction = () => {
    const g = gameRef.current;
    if (g.status === 'idle' || g.status === 'gameover') {
      resetAndStart();
      return;
    }

    // Active play: jump when grounded
    if (g.onGround) {
      g.vy = -285;
      g.onGround = false;
      spawnDust(g.runnerX + 8, g.groundY - 2, 6);
      audioService.playClick();
    }
  };

  // Global Space/ArrowUp listener only while actively playing so normal page scrolling isn't hijacked in idle
  useEffect(() => {
    if (status !== 'playing') return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleAction();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [status]);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const updateSize = () => {
      const rect = container.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const width = Math.max(280, Math.round(rect.width));
      const height = Math.max(72, Math.round(rect.height));

      gameRef.current.width = width;
      gameRef.current.height = height;
      gameRef.current.dpr = dpr;
      gameRef.current.groundY = height - 16;
      gameRef.current.runnerX = width < 640 ? 40 : 96;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = `${width}px`;
      canvas.style.height = `${height}px`;
    };

    updateSize();
    const resizeObs = new ResizeObserver(updateSize);
    resizeObs.observe(container);

    const io = new IntersectionObserver(
      ([entry]) => {
        gameRef.current.isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    io.observe(container);

    const getPalette = () => {
      const styles = getComputedStyle(document.documentElement);
      return {
        bg: styles.getPropertyValue('--surface-color').trim() || '#121212',
        deepBg: styles.getPropertyValue('--bg-color').trim() || '#050505',
        acid: styles.getPropertyValue('--acid-color').trim() || '#ccff00',
        accent2: styles.getPropertyValue('--accent2-color').trim() || '#5ce1e6',
        border: styles.getPropertyValue('--border-color').trim() || '#333333',
        text: styles.getPropertyValue('--text-primary-color').trim() || '#ffffff',
        textSec: styles.getPropertyValue('--text-sec-color').trim() || '#888888',
      };
    };

    const drawPixelRunner = (
      ctx: CanvasRenderingContext2D,
      rx: number,
      ry: number,
      frame: number,
      inAir: boolean,
      currentStatus: GameStatus,
      pal: ReturnType<typeof getPalette>
    ) => {
      const p = 2;
      const x = Math.round(rx);
      const y = Math.round(ry - 32);

      if (!inAir) {
        ctx.fillStyle = 'rgba(0,0,0,0.35)';
        ctx.fillRect(x + 2, Math.round(gameRef.current.groundY), 18, 3);
      }

      // Hair (dark + neon acid highlights)
      ctx.fillStyle = '#111111';
      ctx.fillRect(x + 3 * p, y + 0 * p, 6 * p, 2 * p);
      ctx.fillRect(x + 2 * p, y + 1 * p, 8 * p, 2 * p);
      ctx.fillStyle = currentStatus === 'gameover' ? pal.accent2 : pal.acid;
      ctx.fillRect(x + 3 * p, y + 0 * p, 2 * p, p);
      ctx.fillRect(x + 8 * p, y + 1 * p, p, p);

      // Face
      ctx.fillStyle = '#d99b66';
      ctx.fillRect(x + 3 * p, y + 3 * p, 5 * p, 3 * p);

      // Eyes (wide/X on gameover)
      ctx.fillStyle = '#111111';
      if (currentStatus === 'gameover') {
        ctx.fillRect(x + 4 * p, y + 3 * p, 2, 4);
        ctx.fillRect(x + 6 * p, y + 3 * p, 2, 4);
      } else {
        ctx.fillRect(x + 6 * p, y + 4 * p, p, p);
        ctx.fillRect(x + 4 * p, y + 4 * p, p, p);
      }

      // Neon headphones
      ctx.fillStyle = pal.acid;
      ctx.fillRect(x + 2 * p, y + 5 * p, p, 2 * p);
      ctx.fillRect(x + 7 * p, y + 5 * p, p, 2 * p);

      // Black hoodie torso + neon trim
      ctx.fillStyle = '#0d0d0d';
      ctx.fillRect(x + 2 * p, y + 6 * p, 7 * p, 5 * p);
      ctx.fillStyle = pal.acid;
      ctx.fillRect(x + 2 * p, y + 6 * p, p, 4 * p);
      ctx.fillRect(x + 5 * p, y + 7 * p, p, 3 * p);
      ctx.fillRect(x + 7 * p, y + 7 * p, p, 2 * p);

      // Legs: standing still in idle, animated 4-frame run while playing, tucked in air
      ctx.fillStyle = '#1b1b1b';
      if (currentStatus === 'idle') {
        ctx.fillRect(x + 3 * p, y + 11 * p, 2 * p, 4 * p);
        ctx.fillRect(x + 6 * p, y + 11 * p, 2 * p, 4 * p);
        ctx.fillStyle = pal.acid;
        ctx.fillRect(x + 3 * p, y + 15 * p, 2 * p, p);
        ctx.fillRect(x + 6 * p, y + 15 * p, 2 * p, p);
      } else if (inAir) {
        ctx.fillRect(x + 2 * p, y + 11 * p, 3 * p, 3 * p);
        ctx.fillRect(x + 6 * p, y + 10 * p, 3 * p, 3 * p);
        ctx.fillStyle = pal.accent2;
        ctx.fillRect(x + 2 * p, y + 13 * p, 3 * p, p);
        ctx.fillRect(x + 6 * p, y + 12 * p, 3 * p, p);
      } else if (frame === 0) {
        ctx.fillRect(x + 2 * p, y + 11 * p, 2 * p, 4 * p);
        ctx.fillRect(x + 6 * p, y + 11 * p, 2 * p, 3 * p);
        ctx.fillStyle = pal.acid;
        ctx.fillRect(x + 2 * p, y + 15 * p, 3 * p, p);
        ctx.fillRect(x + 6 * p, y + 14 * p, 3 * p, p);
      } else if (frame === 1) {
        ctx.fillRect(x + 3 * p, y + 11 * p, 2 * p, 4 * p);
        ctx.fillRect(x + 5 * p, y + 11 * p, 2 * p, 4 * p);
        ctx.fillStyle = pal.acid;
        ctx.fillRect(x + 3 * p, y + 15 * p, 3 * p, p);
      } else if (frame === 2) {
        ctx.fillRect(x + 6 * p, y + 11 * p, 2 * p, 4 * p);
        ctx.fillRect(x + 2 * p, y + 11 * p, 2 * p, 3 * p);
        ctx.fillStyle = pal.acid;
        ctx.fillRect(x + 6 * p, y + 15 * p, 3 * p, p);
        ctx.fillRect(x + 1 * p, y + 14 * p, 3 * p, p);
      } else {
        ctx.fillRect(x + 4 * p, y + 11 * p, 2 * p, 4 * p);
        ctx.fillRect(x + 5 * p, y + 11 * p, 2 * p, 3 * p);
        ctx.fillStyle = pal.acid;
        ctx.fillRect(x + 4 * p, y + 15 * p, 3 * p, p);
      }
    };

    const render = (now: number) => {
      const g = gameRef.current;
      const dt = Math.min(0.05, Math.max(0.001, (now - (g.lastTime || now)) / 1000));
      g.lastTime = now;

      if (g.isVisible && g.width > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const pal = getPalette();
          const worldSpeed = Math.min(340, 195 + g.score * 0.045);

          // Advance world simulation ONLY when actively playing
          if (g.status === 'playing') {
            g.scrollOffset += worldSpeed * dt;
            g.runTimer += dt * 12;

            // Distance score ticker
            g.distanceAcc += dt;
            if (g.distanceAcc >= 0.085) {
              g.distanceAcc = 0;
              g.score += 1;
              setScore(g.score);
            }

            // Runner physics
            if (!g.onGround) {
              g.vy += 880 * dt;
              g.runnerY += g.vy * dt;
              if (g.runnerY >= 0) {
                g.runnerY = 0;
                g.vy = 0;
                g.onGround = true;
              }
            }

            // Spawn obstacles
            g.spawnTimer -= dt;
            if (g.spawnTimer <= 0) {
              g.spawnTimer = 1.05 + Math.random() * 0.95;
              const isSpike = Math.random() > 0.45;
              g.obstacles.push({
                x: g.width + 24,
                w: isSpike ? 14 : 18,
                h: isSpike ? 16 : 20,
                type: isSpike ? 'spike' : 'crate',
                passed: false,
              });
            }

            // Spawn pixel collectibles
            g.collectTimer -= dt;
            if (g.collectTimer <= 0) {
              g.collectTimer = 0.9 + Math.random() * 0.8;
              g.collectibles.push({
                x: g.width + 24,
                y: g.groundY - (20 + Math.random() * 24),
                collected: false,
                bobOffset: Math.random() * Math.PI * 2,
                isCyan: Math.random() > 0.65,
              });
            }

            // Move obstacles & check collision
            const runnerBox = {
              x: g.runnerX + 5,
              y: g.groundY + g.runnerY - 26,
              w: 12,
              h: 24,
            };

            for (let i = g.obstacles.length - 1; i >= 0; i--) {
              const obs = g.obstacles[i];
              obs.x -= worldSpeed * dt;

              const ox = obs.x + 2;
              const oy = g.groundY - obs.h + 2;
              const ow = obs.w - 4;
              const oh = obs.h - 2;

              const hit =
                runnerBox.x < ox + ow &&
                runnerBox.x + runnerBox.w > ox &&
                runnerBox.y < oy + oh &&
                runnerBox.y + runnerBox.h > oy;

              if (hit) {
                g.status = 'gameover';
                setStatus('gameover');
                audioService.playSecondary();

                if (g.score > g.hiScore) {
                  g.hiScore = g.score;
                  setHiScore(g.score);
                  try {
                    localStorage.setItem(HI_SCORE_KEY, String(g.score));
                  } catch {
                    // ignore storage errors
                  }
                }

                // Impact sparks
                for (let k = 0; k < 12; k++) {
                  const ang = (Math.PI * 2 * k) / 12;
                  g.particles.push({
                    x: g.runnerX + 10,
                    y: g.groundY + g.runnerY - 14,
                    vx: Math.cos(ang) * (60 + Math.random() * 70),
                    vy: Math.sin(ang) * (60 + Math.random() * 70),
                    life: 0,
                    maxLife: 0.45,
                    color: k % 2 === 0 ? 'acid' : 'accent2',
                    size: 4,
                  });
                }
                break;
              }

              if (!obs.passed && obs.x + obs.w < g.runnerX) {
                obs.passed = true;
                g.score += 10;
                setScore(g.score);
              }

              if (obs.x < -40) {
                g.obstacles.splice(i, 1);
              }
            }

            // Move & collect gems
            const runnerScreenY = g.groundY + g.runnerY;
            for (let i = g.collectibles.length - 1; i >= 0; i--) {
              const c = g.collectibles[i];
              c.x -= worldSpeed * dt;
              const cy = c.y + Math.sin(now * 0.006 + c.bobOffset) * 3;

              if (c.x < -20) {
                g.collectibles.splice(i, 1);
                continue;
              }

              const dx = Math.abs(c.x - (g.runnerX + 10));
              const dy = Math.abs(cy - (runnerScreenY - 16));
              if (!c.collected && dx < 20 && dy < 22) {
                c.collected = true;
                const pts = c.isCyan ? 50 : 25;
                g.score += pts;
                setScore(g.score);
                audioService.playClick();

                g.popups.push({
                  x: c.x,
                  y: cy - 6,
                  text: `+${pts}`,
                  life: 0,
                  color: c.isCyan ? 'accent2' : 'acid',
                });

                for (let k = 0; k < 7; k++) {
                  const ang = (Math.PI * 2 * k) / 7;
                  g.particles.push({
                    x: c.x,
                    y: cy,
                    vx: Math.cos(ang) * 70,
                    vy: Math.sin(ang) * 70,
                    life: 0,
                    maxLife: 0.35,
                    color: c.isCyan ? 'accent2' : 'acid',
                    size: 3,
                  });
                }

                g.collectibles.splice(i, 1);
              }
            }
          }

          // Clear & draw scene (static in idle, frozen on gameover, moving while playing)
          ctx.setTransform(g.dpr, 0, 0, g.dpr, 0, 0);
          ctx.imageSmoothingEnabled = false;
          ctx.fillStyle = pal.deepBg;
          ctx.fillRect(0, 0, g.width, g.height);

          // Parallax pixel skyline
          const skylineOffset = (g.scrollOffset * 0.25) % 64;
          for (let sx = -skylineOffset; sx < g.width + 64; sx += 64) {
            const pillarH = 18 + ((Math.round((sx + skylineOffset) / 64) * 13) % 24);
            ctx.fillStyle = 'rgba(255,255,255,0.03)';
            ctx.fillRect(Math.round(sx), g.groundY - pillarH, 36, pillarH);
            ctx.fillStyle = pal.border;
            ctx.fillRect(Math.round(sx), g.groundY - pillarH, 36, 1);
          }

          // Stars
          const starShift = (g.scrollOffset * 0.15) % 90;
          for (let i = 0; i < Math.ceil(g.width / 90) + 2; i++) {
            const bx = Math.round(i * 90 - starShift);
            const by = 10 + ((i * 23) % Math.max(12, g.groundY - 36));
            ctx.fillStyle = i % 3 === 0 ? pal.accent2 : pal.acid;
            ctx.globalAlpha = 0.25;
            ctx.fillRect(bx, by, 2, 2);
            ctx.globalAlpha = 1;
          }

          // Ground rail
          ctx.fillStyle = pal.acid;
          ctx.fillRect(0, g.groundY, g.width, 2);
          ctx.fillStyle = pal.bg;
          ctx.fillRect(0, g.groundY + 2, g.width, g.height - g.groundY - 2);

          const dashShift = g.scrollOffset % 28;
          for (let dx = -dashShift; dx < g.width + 28; dx += 28) {
            ctx.fillStyle = pal.accent2;
            ctx.globalAlpha = 0.45;
            ctx.fillRect(Math.round(dx), g.groundY + 6, 10, 2);
            ctx.globalAlpha = 1;
          }

          // Draw obstacles
          for (const obs of g.obstacles) {
            const ox = Math.round(obs.x);
            const oy = Math.round(g.groundY - obs.h);
            if (obs.type === 'crate') {
              ctx.fillStyle = pal.bg;
              ctx.fillRect(ox, oy, obs.w, obs.h);
              ctx.strokeStyle = pal.accent2;
              ctx.lineWidth = 2;
              ctx.strokeRect(ox + 1, oy + 1, obs.w - 2, obs.h - 2);
              ctx.fillStyle = pal.accent2;
              ctx.fillRect(ox + 5, oy + 5, obs.w - 10, 2);
            } else {
              ctx.fillStyle = pal.acid;
              ctx.fillRect(ox + 5, oy, 4, 4);
              ctx.fillRect(ox + 3, oy + 4, 8, 5);
              ctx.fillRect(ox, oy + 9, 14, 7);
            }
          }

          // Draw collectibles
          for (const c of g.collectibles) {
            const cy = c.y + Math.sin(now * 0.006 + c.bobOffset) * 3;
            const px = Math.round(c.x);
            const py = Math.round(cy);
            ctx.fillStyle = c.isCyan ? pal.accent2 : pal.acid;
            ctx.fillRect(px - 2, py - 5, 4, 2);
            ctx.fillRect(px - 4, py - 3, 8, 6);
            ctx.fillRect(px - 2, py + 3, 4, 2);
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(px - 1, py - 2, 2, 2);
          }

          // Draw runner
          const runnerScreenY = g.groundY + g.runnerY;
          const frame = Math.floor(g.runTimer) % 4;
          drawPixelRunner(ctx, g.runnerX, runnerScreenY, frame, !g.onGround, g.status, pal);

          // Particles
          for (let i = g.particles.length - 1; i >= 0; i--) {
            const p = g.particles[i];
            p.x += p.vx * dt;
            p.y += p.vy * dt;
            p.life += dt;
            if (p.life >= p.maxLife) {
              g.particles.splice(i, 1);
              continue;
            }
            ctx.globalAlpha = 1 - p.life / p.maxLife;
            ctx.fillStyle = p.color === 'accent2' ? pal.accent2 : pal.acid;
            ctx.fillRect(Math.round(p.x), Math.round(p.y), p.size, p.size);
            ctx.globalAlpha = 1;
          }

          // Popups
          ctx.font = 'bold 9px "Space Mono", monospace';
          for (let i = g.popups.length - 1; i >= 0; i--) {
            const pop = g.popups[i];
            pop.y -= 28 * dt;
            pop.life += dt;
            if (pop.life >= 0.65) {
              g.popups.splice(i, 1);
              continue;
            }
            ctx.globalAlpha = 1 - pop.life / 0.65;
            ctx.fillStyle = pop.color === 'accent2' ? pal.accent2 : pal.acid;
            ctx.fillText(pop.text, Math.round(pop.x), Math.round(pop.y));
            ctx.globalAlpha = 1;
          }

          // Idle or Game Over Dino-style prompt overlay on canvas
          if (g.status === 'idle' || g.status === 'gameover') {
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            const centerX = Math.max(g.runnerX + 95, g.width * 0.52);
            const centerY = Math.round(g.groundY * 0.5);

            if (g.status === 'idle') {
              const blinkOn = Math.floor(now / 520) % 2 === 0;
              ctx.font = 'bold 11px "Space Mono", monospace';
              ctx.fillStyle = blinkOn ? pal.acid : pal.text;
              const label = g.width < 500 ? '▶ TAP TO START' : '▶ CLICK OR PRESS SPACE TO START';
              ctx.fillText(label, Math.min(centerX, g.width - 110), centerY);
            } else {
              ctx.font = 'bold 12px "Space Mono", monospace';
              ctx.fillStyle = pal.acid;
              ctx.fillText('GAME OVER', Math.min(centerX, g.width - 90), centerY - 9);
              ctx.font = 'bold 9px "Space Mono", monospace';
              ctx.fillStyle = pal.accent2;
              const retryLabel = g.width < 500 ? '[ TAP TO RETRY ]' : '[ CLICK OR SPACE TO RETRY ]';
              ctx.fillText(retryLabel, Math.min(centerX, g.width - 90), centerY + 8);
            }
            ctx.textAlign = 'left';
            ctx.textBaseline = 'alphabetic';
          }

          // Scanlines
          ctx.fillStyle = 'rgba(0,0,0,0.14)';
          for (let sy = 0; sy < g.height; sy += 3) {
            ctx.fillRect(0, sy, g.width, 1);
          }
        }
      }

      g.rafId = requestAnimationFrame(render);
    };

    gameRef.current.rafId = requestAnimationFrame(render);

    return () => {
      resizeObs.disconnect();
      io.disconnect();
      cancelAnimationFrame(gameRef.current.rafId);
    };
  }, []);

  return (
    <div className="w-full border-y-2 border-border bg-surface mb-16 md:mb-28 select-none overflow-hidden">
      {/* Arcade Top HUD */}
      <div className="max-w-[1400px] mx-auto px-4 sm:px-6 py-2 flex items-center justify-between border-b border-border/60 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest">
        <div className="flex items-center gap-3 sm:gap-5">
          <span className="flex items-center gap-1.5 text-acid font-bold">
            <span
              className={`inline-block w-2 h-2 ${
                status === 'playing' ? 'bg-acid animate-blink' : status === 'gameover' ? 'bg-accent2' : 'bg-text-sec'
              }`}
            />
            P1 // ARCADE_RUN
          </span>
          <span className="hidden sm:inline text-accent2">
            {status === 'playing' ? 'LIVE' : status === 'gameover' ? 'CRASHED' : 'READY'}
          </span>
        </div>

        <div className="flex items-center gap-4 sm:gap-6">
          <span className="text-text-sec">
            HI <span className="text-accent2 font-bold">{String(hiScore).padStart(5, '0')}</span>
          </span>
          <span className="text-acid font-bold tracking-[0.2em]">
            SCORE {String(score).padStart(5, '0')}
          </span>
        </div>
      </div>

      {/* Playable 8-Bit Dino-Style Runner Canvas */}
      <div
        ref={containerRef}
        onClick={handleAction}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.code === 'Space' || e.code === 'ArrowUp') {
            e.preventDefault();
            handleAction();
          }
        }}
        aria-label="Interactive 8-bit arcade runner. Click or press Space to start and jump."
        className="relative w-full h-[84px] sm:h-[98px] cursor-pointer focus:outline-none"
      >
        <canvas ref={canvasRef} className="block w-full h-full" />
      </div>
    </div>
  );
};

export default GamingArcadeStrip;
