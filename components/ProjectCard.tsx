
import React, { useState, useEffect } from 'react';
import { Project } from '../types';
import { audioService } from '../services/audioService';

interface ProjectCardProps {
  project: Project;
  onClick: (project: Project) => void;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, onClick }) => {
  const [currentIdx, setCurrentIdx] = useState(0);
  const [loadedMedia, setLoadedMedia] = useState<Set<number>>(new Set());
  
  const isVideo = (url: string) => url.toLowerCase().endsWith('.mp4');
  const isExternalVideo = (url: string) => url.includes('screenpal.com');

  const slideshowMedia = (project.images || []).filter(url => !isExternalVideo(url));
  const hasSlideshow = slideshowMedia.length > 0;

  useEffect(() => {
    if (!hasSlideshow) return;

    const interval = setInterval(() => {
      setCurrentIdx((prev) => (prev + 1) % slideshowMedia.length);
    }, 4500);

    return () => clearInterval(interval);
  }, [hasSlideshow, slideshowMedia.length]);

  const handleMediaLoad = (idx: number) => {
    setLoadedMedia(prev => new Set(prev).add(idx));
  };

  const handleCustomClick = () => {
    audioService.playSecondary();
    onClick(project);
  };

  return (
    <div 
      onClick={handleCustomClick}
      onMouseEnter={() => audioService.playClick()}
      className="group block relative h-[380px] sm:h-[410px] lg:h-[400px] transition-all duration-300 ease-out md:hover:scale-[1.03] md:hover:-translate-y-1 active:scale-[0.98] hover:z-20 cursor-pointer"
    >
      {/* Colorful Bento Border Glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[2px] bg-gradient-to-br from-[#ccff00] via-[#5ce1e6] to-[#3b82f6] blur-[10px] opacity-0 md:group-hover:opacity-[var(--card-glow-opacity,0.75)] transition-opacity duration-300"
      />

      <div className="relative z-10 h-full bg-surface border border-border group-hover:border-acid overflow-hidden flex flex-col transition-all duration-300 md:group-hover:shadow-[0_0_24px_-4px_rgba(204,255,0,0.35),0_18px_36px_-15px_rgba(34,211,238,0.28)]">
        {/* High-fidelity Media Container */}
        <div className="card-img h-[63%] sm:h-[66%] lg:h-[65%] overflow-hidden border-b border-border relative bg-[#080808] flex items-center justify-center">
        {/* Subtle Brutalist Year Corner Timestamp */}
        <div className="absolute top-0 right-0 z-30 bg-bg border-l border-b border-border text-text-sec px-2.5 sm:px-3 py-1 sm:py-1.5 font-mono text-[10px] font-bold tracking-[0.15em] transition-all duration-500 group-hover:bg-acid group-hover:text-bg group-hover:border-acid">
          {project.year}
        </div>

        {hasSlideshow ? (
          slideshowMedia.map((url, idx) => {
            const active = idx === currentIdx;
            const loaded = loadedMedia.has(idx);
            const video = isVideo(url);

            return (
              <React.Fragment key={idx}>
                {video ? (
                  <video 
                    src={url} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    onLoadedData={() => handleMediaLoad(idx)}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out will-change-transform grayscale-0 md:grayscale md:group-hover:grayscale-0 ${
                      active && loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-110'
                    }`}
                  />
                ) : (
                  <img 
                    src={url} 
                    alt={`${project.title} slide ${idx}`} 
                    loading={idx === 0 ? "eager" : "lazy"}
                    decoding="async"
                    fetchPriority={idx === 0 ? "high" : "low"}
                    onLoad={() => handleMediaLoad(idx)}
                    draggable={false}
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out will-change-transform grayscale-0 md:grayscale md:group-hover:grayscale-0 ${
                      active && loaded ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
                    }`}
                    style={{ 
                      imageRendering: 'auto',
                      WebkitBackfaceVisibility: 'hidden',
                      userSelect: 'none',
                    }}
                  />
                )}
              </React.Fragment>
            );
          })
        ) : (
          <img 
            src={project.image} 
            alt={project.title} 
            loading="lazy"
            decoding="async"
            draggable={false}
            className="w-full h-full object-cover transition-transform duration-1000 md:group-hover:scale-105 grayscale-0 md:grayscale md:group-hover:grayscale-0 select-none"
            style={{ 
              imageRendering: 'auto',
              WebkitBackfaceVisibility: 'hidden',
              userSelect: 'none',
            }}
          />
        )}
        
        {/* Slideshow Progress Bar (Top) */}
        {hasSlideshow && (
          <div className="absolute top-0 left-0 right-0 h-1 flex gap-0.5 z-20">
            {slideshowMedia.map((_, idx) => (
              <div 
                key={idx}
                className={`h-full flex-grow transition-all duration-700 ${idx === currentIdx ? 'bg-acid opacity-100' : 'bg-white/5 opacity-30'}`}
              />
            ))}
          </div>
        )}

        {/* Subtle Bottom Vignette */}
        <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/80 to-transparent pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity duration-700" />
      </div>

      <div className="p-4 sm:p-6 flex-grow flex flex-col justify-between bg-surface group-hover:bg-[var(--surface-hover-color)] transition-all duration-500">
        <div className="transform transition-transform duration-500 md:group-hover:translate-x-1">
          <div className="flex items-center gap-2 mb-1.5 sm:mb-2">
            <span className="font-mono text-[9px] text-acid tracking-[0.25em] sm:tracking-[0.3em] uppercase opacity-90 md:opacity-80 group-hover:opacity-100 truncate">
              {project.category}
            </span>
          </div>
          <h3 className="text-xl sm:text-2xl font-extrabold uppercase tracking-tighter transition-all group-hover:text-acid leading-none">
            {project.title}
          </h3>
        </div>
        
        <div className="flex justify-between items-end border-t border-border/30 pt-3.5 sm:pt-5">
          <div className="flex flex-col gap-0.5 transform transition-transform duration-500 md:group-hover:translate-x-1">
            <span className="font-mono text-[8px] text-accent2/75 tracking-[0.2em] uppercase">System_Entry</span>
            <span className="font-mono text-[11px] sm:text-xs font-bold text-[var(--text-primary-color)] opacity-90">
              PRJ_{project.id} <span className="text-accent2/70">//</span> {project.year}
            </span>
          </div>
          <div className="w-9 h-9 sm:w-10 sm:h-10 flex items-center justify-center border border-border group-hover:border-acid group-hover:bg-acid group-hover:text-bg transition-all duration-500 rounded-full md:group-hover:shadow-[0_0_15px_rgba(204,255,0,0.3)] flex-shrink-0">
            <span className="text-lg sm:text-xl font-light transform md:group-hover:rotate-[-45deg] transition-transform">→</span>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
};

export default ProjectCard;
