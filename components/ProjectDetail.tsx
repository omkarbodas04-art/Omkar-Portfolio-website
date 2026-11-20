
import React, { useEffect, useState } from 'react';
import { Project } from '../types';

interface ProjectDetailProps {
  project: Project;
  onBack: () => void;
}

const ProjectDetail: React.FC<ProjectDetailProps> = ({ project, onBack }) => {
  const [loadedIndices, setLoadedIndices] = useState<Set<number>>(new Set());

  const allImages = project.images && project.images.length > 0 ? project.images : [project.image];

  const handleMediaLoad = (idx: number) => {
    setLoadedIndices(prev => new Set(prev).add(idx));
  };

  const isVideo = (url: string) => url.toLowerCase().endsWith('.mp4');
  const isExternalVideo = (url: string) => url.includes('screenpal.com');

  const getEmbedUrl = (url: string) => {
    if (url.includes('screenpal.com/watch/')) {
      return url.replace('screenpal.com/watch/', 'screenpal.com/player/');
    }
    return url;
  };

  // Handle escape key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onBack();
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [onBack]);

  return (
    <div 
      className="fixed inset-0 z-[100] flex items-center justify-center p-2.5 sm:p-4 md:p-12 animate-in fade-in duration-300"
      style={{ background: 'var(--overlay-bg, rgba(0,0,0,0.85))', backdropFilter: 'blur(12px)' }}
      onClick={onBack}
    >
      <div 
        className="w-full max-w-[1280px] h-[92dvh] md:h-full md:max-h-[90vh] bg-surface border border-border flex flex-col md:flex-row overflow-hidden relative shadow-[0_0_100px_rgba(0,0,0,0.5)] animate-in zoom-in-95 slide-in-from-bottom-4 duration-500 ease-out"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Mobile Sticky Top Header Bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-border bg-surface shrink-0 z-[110]">
          <div className="min-w-0 pr-3">
            <span className="font-mono text-[8px] text-acid tracking-[0.3em] uppercase block">
              /// PRJ_{project.id} // {project.year}
            </span>
            <h2 className="font-extrabold uppercase tracking-tighter text-base truncate">
              {project.title}
            </h2>
          </div>
          <button 
            onClick={onBack}
            aria-label="Close project details"
            className="bg-acid text-bg w-9 h-9 shrink-0 flex items-center justify-center font-bold text-xl active:scale-95 transition-transform"
          >
            &times;
          </button>
        </div>

        {/* Desktop Floating Close Button UI */}
        <button 
          onClick={onBack}
          aria-label="Close project details"
          className="hidden md:flex absolute top-6 right-6 z-[110] bg-acid text-bg w-10 h-10 items-center justify-center font-bold text-xl hover:scale-110 active:scale-95 transition-all shadow-[4px_4px_0px_rgba(255,255,255,0.2)]"
        >
          &times;
        </button>

        {/* Scrollable Content Wrapper (Unified scroll on mobile, split pane on desktop) */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden min-h-0">
          {/* LEFT PANEL: VERTICAL GALLERY */}
          <div className="w-full md:flex-1 md:h-full md:overflow-y-auto bg-[#080808] p-3 sm:p-5 md:p-12 space-y-6 md:space-y-12 scrollbar-hide shrink-0 md:shrink">
            {allImages.map((url, idx) => (
              <div 
                key={idx} 
                className="relative group border border-border/20 overflow-hidden bg-bg animate-in fade-in slide-in-from-bottom-10 duration-700"
                style={{ animationDelay: `${idx * 150}ms` }}
              >
                {/* Technical Indicator */}
                <div className="absolute top-3 left-3 md:top-4 md:left-4 z-10 font-mono text-[8px] text-accent2/75 bg-bg/70 px-1.5 py-0.5 tracking-widest uppercase">
                  IMG_SOURCE_0{idx + 1}
                </div>

                {!loadedIndices.has(idx) && (
                  <div className="aspect-video w-full flex items-center justify-center">
                    <div className="w-12 h-[1px] bg-acid/20 animate-pulse"></div>
                  </div>
                )}
                
                {isExternalVideo(url) ? (
                  <div className="aspect-video w-full">
                    <iframe 
                      src={getEmbedUrl(url)} 
                      onLoad={() => handleMediaLoad(idx)}
                      className={`w-full h-full border-0 transition-opacity duration-1000 ${loadedIndices.has(idx) ? 'opacity-100' : 'opacity-0'}`}
                      allowFullScreen
                      allow="autoplay; fullscreen"
                    />
                  </div>
                ) : isVideo(url) ? (
                  <video 
                    src={url} 
                    autoPlay 
                    muted 
                    loop 
                    playsInline
                    onLoadedData={() => handleMediaLoad(idx)}
                    className={`w-full h-auto block transition-opacity duration-1000 ${loadedIndices.has(idx) ? 'opacity-100' : 'opacity-0'}`}
                  />
                ) : (
                  <img 
                    src={url} 
                    alt={`${project.title} - ${idx + 1}`} 
                    onLoad={() => handleMediaLoad(idx)}
                    className={`w-full h-auto block transition-opacity duration-1000 ${loadedIndices.has(idx) ? 'opacity-100' : 'opacity-0'}`}
                  />
                )}

                {/* Decorative Corner */}
                <div className="absolute bottom-0 right-0 w-4 h-4 border-b border-r border-acid/20 group-hover:border-acid transition-colors duration-500" />
              </div>
            ))}

            {/* End of Gallery Indicator */}
            <div className="py-6 md:py-12 flex flex-col items-center">
              <div className="w-px h-10 md:h-16 bg-gradient-to-b from-acid/50 to-transparent"></div>
              <span className="font-mono text-[8px] text-text-sec mt-3 md:mt-4 tracking-[0.4em] md:tracking-[0.5em] uppercase">End_Of_Transmission</span>
            </div>
          </div>

          {/* RIGHT PANEL: PROJECT BRIEF */}
          <div className="w-full md:w-[400px] md:h-full bg-surface border-t md:border-t-0 md:border-l border-border flex flex-col shrink-0 md:animate-in md:slide-in-from-right md:duration-700 md:ease-out">
            <div className="p-5 sm:p-7 md:p-12 md:flex-grow md:overflow-y-auto space-y-6 md:space-y-10">
              <div>
                <span className="font-mono text-[9px] text-acid tracking-[0.4em] uppercase mb-3 md:mb-4 block">/// PROJECT_CASE_STUDY</span>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold uppercase leading-[0.9] tracking-tighter">
                  {project.title.split(' ')[0]} <br />
                  <span className="text-white/40">{project.title.split(' ').slice(1).join(' ') || 'ARCHIVE'}</span>
                </h1>
              </div>

              <div className="space-y-4 md:space-y-6 pt-5 md:pt-6 border-t border-border/50">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-text-sec uppercase tracking-widest">Year_Rel</span>
                  <span className="text-white font-bold">{project.year}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-text-sec uppercase tracking-widest">Category</span>
                  <span className="text-acid font-bold truncate ml-4 text-right uppercase">{project.category.replace('GALLERY // ', '')}</span>
                </div>
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-text-sec uppercase tracking-widest">Object_ID</span>
                  <span className="text-accent2 font-bold opacity-80">#PRJ_{project.id}</span>
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="font-mono text-[10px] text-acid uppercase tracking-[0.2em] font-bold">Creative_Brief</h3>
                {project.brief ? (
                  project.brief.map((paragraph, i) => (
                    <p key={i} className="font-mono text-xs sm:text-sm text-text-sec leading-relaxed">
                      {paragraph}
                    </p>
                  ))
                ) : (
                  <>
                    <p className="font-mono text-xs sm:text-sm text-text-sec leading-relaxed">
                      This study explores the synergy between digital abstraction and functional communication. 
                      Using high-fidelity assets and custom typography, we established a brand narrative that challenges conventional design boundaries.
                    </p>
                    <p className="font-mono text-xs sm:text-sm text-text-sec leading-relaxed">
                      Focus points: Composition balance, color theory application, and motion fluidity. 
                      Every frame was optimized for performance without compromising aesthetic impact.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProjectDetail;
