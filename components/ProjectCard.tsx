
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
      className="group block bg-surface border border-border overflow-hidden transition-all duration-500 ease-out hover:border-acid/60 hover:scale-[1.03] hover:shadow-[0_25px_50px_-20px_rgba(204,255,0,0.25)] h-[520px] flex flex-col active:scale-[0.98] cursor-pointer"
    >
      {/* High-fidelity Media Container */}
      <div className="card-img h-[72%] overflow-hidden border-b border-border relative bg-[#080808] flex items-center justify-center">
        {/* Subtle Brutalist Year Corner Timestamp */}
        <div className="absolute top-0 right-0 z-30 bg-bg border-l border-b border-border text-text-sec px-3 py-1.5 font-mono text-[10px] font-bold tracking-[0.15em] transition-all duration-500 group-hover:bg-acid group-hover:text-bg group-hover:border-acid">
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
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out will-change-transform grayscale group-hover:grayscale-0 ${
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
                    className={`absolute inset-0 w-full h-full object-cover transition-all duration-1000 ease-in-out will-change-transform grayscale group-hover:grayscale-0 ${
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
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105 grayscale group-hover:grayscale-0 select-none"
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

      <div className="p-6 flex-grow flex flex-col justify-between bg-surface group-hover:bg-[#0a0a0a] transition-all duration-500">
        <div className="transform transition-transform duration-500 group-hover:translate-x-1">
          <div className="flex items-center gap-2 mb-2">
            <span className="font-mono text-[9px] text-acid tracking-[0.3em] uppercase opacity-80 group-hover:opacity-100">
              {project.category}
            </span>
          </div>
          <h3 className="text-2xl font-extrabold uppercase tracking-tighter transition-all group-hover:text-acid leading-none">
            {project.title}
          </h3>
        </div>
        
        <div className="flex justify-between items-end border-t border-border/30 pt-5">
          <div className="flex flex-col gap-0.5 transform transition-transform duration-500 group-hover:translate-x-1">
            <span className="font-mono text-[8px] text-text-sec tracking-[0.2em] uppercase">System_Entry</span>
            <span className="font-mono text-xs font-bold text-white/90">PRJ_{project.id} // {project.year}</span>
          </div>
          <div className="w-10 h-10 flex items-center justify-center border border-border group-hover:border-acid group-hover:bg-acid group-hover:text-bg transition-all duration-500 rounded-full group-hover:shadow-[0_0_15px_rgba(204,255,0,0.3)]">
            <span className="text-xl font-light transform group-hover:rotate-[-45deg] transition-transform">→</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectCard;
