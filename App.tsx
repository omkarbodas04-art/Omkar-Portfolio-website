
import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Project } from './types';
import ProjectCard from './components/ProjectCard';
import ProjectDetail from './components/ProjectDetail';
import CustomCursor from './components/CustomCursor';
import Magnetic from './components/Magnetic';
import ScrollProgress from './components/ScrollProgress';
import SkillPill from './components/SkillPill';
import { audioService } from './services/audioService';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
      delayChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { y: 40, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 20,
      stiffness: 90
    }
  }
};

const gridVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.12,
    }
  }
};

const cardVariants = {
  hidden: { y: 30, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      type: 'spring',
      damping: 25,
      stiffness: 90
    }
  }
};

const PROJECTS: Project[] = [
  {
    id: '1',
    title: 'BOOK DESIGN',
    category: 'GALLERY // TYPOGRAPHY',
    image: 'https://image2url.com/r2/default/images/1770269109691-5c9190b7-ae09-4350-ba40-e269bdc1f36e.blob',
    images: [
      'https://image2url.com/r2/default/images/1770269109691-5c9190b7-ae09-4350-ba40-e269bdc1f36e.blob',
      'https://image2url.com/r2/default/images/1770269110970-7d383cef-4095-43d6-8f0e-a0ef85445a38.blob',
      'https://image2url.com/r2/default/images/1770453981617-0154d421-c96c-4ecb-8fde-f8171d3499ae.jpg',
      'https://image2url.com/r2/default/images/1770269113710-ab7fbc83-5cc9-419b-9269-aa725193e2b3.blob',
      'https://image2url.com/r2/default/images/1770269114953-f7d32761-26a8-4213-82cc-376fb642a812.blob',
      'https://image2url.com/r2/default/images/1770269116074-704a0ba2-3f6e-4726-a7d0-bb290772cff1.blob',
      'https://image2url.com/r2/default/images/1770269117180-e0d28782-a964-444b-8190-b1ddbae9e7ad.blob',
      'https://image2url.com/r2/default/images/1770454045924-1a9623cf-46f4-4498-b5b7-947496292c4d.jpg'
    ],
    year: '2025',
    tags: ['Typography', 'Editorial'],
    brief: [
      "This project focused on researching the work and design philosophy of Paula Scher, a designer known for her bold, expressive, and typographic approach. The aim was not only to understand her contributions to graphic design, but also to explore how typography can function as a primary visual element rather than just a medium for text.",
      "As a response to this research, I designed a book that became an exploration of typography in its most expressive form. The process involved studying Scher’s use of scale, hierarchy, density, and composition, and translating those principles into my own visual language. I experimented with large, dominant type, layered compositions, and dynamic layouts to see how typography could create rhythm, movement, and emotion across pages.",
      "The project pushed me to think beyond conventional grid systems and structured layouts, encouraging a more intuitive and experimental approach. At the same time, I focused on maintaining clarity and readability, ensuring that the content remained accessible despite the bold visual treatment.",
      "Through this project, I developed a deeper understanding of how typography can drive visual storytelling and create strong identity within a design. It allowed me to explore the balance between expression and communication, and helped me build confidence in using type as a central design element rather than a supporting one."
    ]
  },
  {
    id: '2',
    title: 'CHARACTER DESIGN',
    category: 'GALLERY // IMAGE CREATION',
    image: 'https://image2url.com/r2/default/images/1770269102334-9d6dd2d6-8b3f-4c3b-b1e1-70173773300c.blob',
    images: [
      'https://image2url.com/r2/default/images/1770269102334-9d6dd2d6-8b3f-4c3b-b1e1-70173773300c.blob',
      'https://image2url.com/r2/default/images/1770269104384-277a8bd6-507d-4e17-868f-93393181d344.blob',
      'https://image2url.com/r2/default/images/1770269098981-555f92e8-5774-4004-9f85-380402e9439d.blob',
      'https://image2url.com/r2/default/images/1770269105808-2be50a4f-2914-4fda-b623-5b29351ff01f.blob',
      'https://image2url.com/r2/default/images/1770269108117-7298de86-d401-4d86-b1f0-122c9a5d0356.blob',
      'https://image2url.com/r2/default/images/1770268950236-2c113360-21f0-47fe-bb16-c5b0a2609a1a.jpg'
    ],
    year: '2025',
    tags: ['Illustration'],
    brief: [
      "This project focused on exploring character design by combining human features with those of a lion. The aim was to understand how different visual elements can merge to create a cohesive and expressive hybrid character.",
      "The process involved studying both human anatomy and lion characteristics, including facial structure, proportions, and expressions. Through multiple sketches and iterations, I experimented with integrating features like the mane, eyes, and bone structure while maintaining balance and clarity in the design.",
      "A key aspect of the project was conveying personality through the character. I explored different expressions and stylistic choices to see how small changes could impact the overall feel.",
      "While the project was based on observation, the final goal was to keep the characters cartoonish. This involved simplifying forms and slightly exaggerating features to create a more engaging and visually appealing outcome."
    ]
  },
  {
    id: '3',
    title: 'PIXELFORGE',
    category: 'BRAND CREATION',
    image: 'https://image2url.com/r2/default/images/1770280640248-61dfb7d5-70df-4bfd-957a-9ae73d4e9624.blob',
    images: [
      'https://image2url.com/r2/default/images/1770280640248-61dfb7d5-70df-4bfd-957a-9ae73d4e9624.blob',
      'https://image2url.com/r2/default/images/1770280641400-13389dc8-674e-4de3-ac5c-6fb2687bdf4e.blob',
      'https://image2url.com/r2/default/images/1770280642453-cb69d199-9c37-4e5d-a25b-bc14efc9f79a.blob',
      'https://image2url.com/r2/default/images/1770280643364-9bc22c58-deaf-4755-8ac8-9dfddb7cb0c0.blob',
      'https://image2url.com/r2/default/images/1770280644351-0a2d8d7f-4d6d-4220-a636-de7e900b5b6a.blob',
      'https://image2url.com/r2/default/images/1770280645225-2e755535-dabd-4813-b66a-0cda91d8412e.blob',
      'https://image2url.com/r2/default/images/1770280647242-0f90bc16-69fd-423c-ab65-8f52f81bcabf.blob',
      'https://image2url.com/r2/default/images/1770280649075-a6403bf5-8ca7-49a9-a78b-7b36c78dde08.blob',
      'https://image2url.com/r2/default/images/1770280652860-c118a935-7d6c-4ec9-9c01-54897d895b10.blob'
    ],
    year: '2023',
    tags: ['Branding'],
    brief: [
      "This project focused on creating a hypothetical brand centered around handheld gaming consoles. The aim was to explore how a brand can be built from scratch, including its visual identity, tone, and overall design language.",
      "I began by researching the world of handheld consoles, looking at their evolution, user base, and visual styles. Based on this, I developed a brand concept that reflects portability, playfulness, and a strong digital culture. From there, I designed key brand elements such as the logo, color palette, and typography.",
      "The project extended into creating posters and other visual outputs to see how the brand translates across different formats. I experimented with layout, hierarchy, and graphic elements to maintain consistency while keeping the visuals engaging.",
      "Overall, this project helped me understand the fundamentals of branding and how to create a cohesive visual system across multiple touchpoints."
    ]
  },
  {
    id: '4',
    title: 'DANKIES',
    category: 'BRAND IDENTITY AI module',
    image: 'https://image2url.com/r2/default/images/1770270115215-a7d321b0-eaf8-4bb7-9963-714fbc919c80.blob',
    images: [
      'https://image2url.com/r2/default/images/1770270115215-a7d321b0-eaf8-4bb7-9963-714fbc919c80.blob',
      'https://image2url.com/r2/default/images/1770270117720-791ba0c9-8c30-46ad-9576-0a26a0e928d5.blob',
      'https://image2url.com/r2/default/images/1770270119487-f7f58025-5295-4ed7-b032-2d2b54d74f9e.blob',
      'https://image2url.com/r2/default/images/1770270121960-21fe895e-b6b9-4762-8ff5-305e39bca4f4.blob',
      'https://image2url.com/r2/default/images/1770270123935-851b5234-e617-4121-b11c-62aad24526d5.blob',
      'https://image2url.com/r2/default/images/1770270125933-d08734c0-a3b4-4583-8bdd-755f7dbc41fb.blob',
      'https://image2url.com/r2/default/images/1770270127284-33fa43f9-c2cd-4095-b5d0-4718f9cf7cde.blob',
      'https://image2url.com/r2/default/images/1770270128984-bc2f0fa6-7a47-4825-b7ca-94db426dc4a1.blob',
      'https://image2url.com/r2/default/images/1770270132845-a6af8852-7b6d-454e-851c-fef6a000f853.blob',
      'https://image2url.com/r2/default/images/1770270135577-3a1f6fc0-e35f-4749-9f2d-c0e699c83c59.blob',
      'https://image2url.com/r2/default/videos/1770270305870-7e9eeb32-2613-4fc2-a72c-6343be1e82e0.mp4',
      'https://image2url.com/r2/default/videos/1770270398183-93056a55-0524-469c-964a-eee00a772d06.mp4'
    ],
    year: '2026',
    tags: ['Branding', 'AI Design'],
    brief: [
      "This project was a group initiative where we developed a campaign concept for the brand Dankies, centered around a camping theme. The aim was to explore how AI tools can be used as a primary medium for creating visual and digital content.",
      "As a team, we worked on building a campaign that included videos and posters, ensuring that all outputs aligned with the core idea and visual direction. What made this project unique was that every element was created entirely using AI tools, without traditional design methods.",
      "We used platforms such as Wisk, Flow, and Claude to generate visuals, assist with ideation, and refine the overall concept. This required a strong focus on prompt-building, experimentation, and iteration to achieve the desired results.",
      "The project helped me understand the creative potential of AI in design, as well as the importance of direction and decision-making when working with generative tools."
    ]
  },
  {
    id: '5',
    title: 'CAPCOM',
    category: 'Product Catalog',
    image: 'https://image2url.com/r2/default/images/1774095815910-30df53c9-31ab-45a5-ac4d-22349871217e.jpg',
    images: [
      'https://image2url.com/r2/default/images/1774095815910-30df53c9-31ab-45a5-ac4d-22349871217e.jpg',
      'https://image2url.com/r2/default/images/1774095817466-30743d80-a604-42e7-b3db-93a1ebabe426.jpg',
      'https://image2url.com/r2/default/images/1774095819370-2ecee977-96d9-4c5e-af6f-4778cd9e8e2f.jpg',
      'https://image2url.com/r2/default/images/1774095822068-9ec37c6e-5384-46ca-a3cf-e60e5f1b9e31.jpg',
      'https://image2url.com/r2/default/images/1774095824373-8d533196-b7b9-4eac-a0c7-7259161d6552.jpg',
      'https://image2url.com/r2/default/images/1774095828175-d56eca1b-5d1f-4b2d-9f18-80152a2f76bc.jpg',
      'https://image2url.com/r2/default/images/1774095830464-bc1e9fa8-ec28-46f2-bb73-f7637269296e.jpg',
      'https://image2url.com/r2/default/images/1774095833485-77cfed9f-9d38-4473-8c39-ec2244d2e30f.jpg',
      'https://image2url.com/r2/default/images/1774095835174-c51f0981-08f8-44af-b865-778ae51be450.jpg',
      'https://image2url.com/r2/default/images/1774095837335-d76c526c-70ce-4716-a5e8-fd00440343b3.jpg',
      'https://image2url.com/r2/default/images/1774096216575-356fe5a4-1892-4c84-93c2-f16353dc1052.jpg',
      'https://image2url.com/r2/default/images/1774096220667-2008359c-cf3e-4f09-95bc-43176c0a3a44.jpg',
      'https://image2url.com/r2/default/images/1774096224232-f71adba7-fcbf-42cf-85d1-0d1466ee8d9b.jpg',
      'https://image2url.com/r2/default/images/1774096227107-8e51f6b5-54e0-4014-a717-304c07a19bdf.jpg',
      'https://image2url.com/r2/default/images/1774096230192-015346e5-769a-4bc1-8820-cb594a0330cf.jpg',
      'https://image2url.com/r2/default/images/1774096232979-31a24c50-897c-458f-868f-80cf5f96a390.jpg',
      'https://image2url.com/r2/default/images/1774096235322-95623f0b-54fa-448d-a465-fd3ffb25cf45.jpg',
      'https://image2url.com/r2/default/images/1774096238811-3519a31a-e853-4537-a2b9-b7c833a3918b.jpg',
      'https://image2url.com/r2/default/images/1774096240722-dc3f8f2e-a8ab-465e-a463-a2b4cd18da5e.jpg',
      'https://image2url.com/r2/default/images/1774096244628-db9b2d10-debb-46ed-a5df-3905d4d263bf.jpg',
      'https://image2url.com/r2/default/images/1774096362808-83486e1f-9ef6-4787-91ee-2b36465046cd.jpg',
      'https://image2url.com/r2/default/images/1774096365357-ff2b626c-459e-4532-a23b-c3cdd545cb3d.jpg',
      'https://image2url.com/r2/default/images/1774096369459-0d7e7e9f-f823-4561-a24e-e5f7cbce4e49.jpg',
      'https://image2url.com/r2/default/images/1774096371781-20b57017-910a-4972-ace6-4ea9a2f2e9be.jpg',
      'https://image2url.com/r2/default/images/1774096374807-90967f22-6ea6-4e34-91bc-7577c4a15864.jpg',
      'https://image2url.com/r2/default/images/1774096377452-99e84310-6fd3-43a6-8201-dd535c4a6f30.jpg',
      'https://image2url.com/r2/default/images/1774096378841-4160f5ec-f1b5-4568-9fe1-0a15919549c3.jpg',
      'https://image2url.com/r2/default/images/1774096380197-bb961cd8-3b3e-4115-806a-0060a55e461e.jpg'
    ],
    year: '2026',
    tags: ['Editorial', 'Branding'],
    brief: [
      "This project focused on designing a product catalog for Capcom, featuring DVD collections of game series such as Resident Evil, Devil May Cry, and Monster Hunter. The aim was to explore how visual design can organize and present a large range of products in a clear, engaging, and structured format.",
      "I began by researching Capcom’s existing visual language, along with the identity of each game franchise, to ensure the catalog felt cohesive while still respecting the uniqueness of each series. The design process involved working with layout systems, typography, and image placement to create a balanced and easy-to-navigate catalog.",
      "A key challenge was maintaining consistency across multiple pages while adapting to different visual styles and content types. I experimented with hierarchy, grid structures, and visual grouping to improve readability and flow.",
      "This project helped me understand how editorial and product design come together, and how to create a unified visual system for a diverse range of content."
    ]
  },
  {
    id: '6',
    title: 'Motion graphics',
    category: 'After effects',
    image: 'https://image2url.com/r2/default/videos/1774096929361-46f16e67-0449-4a45-86e6-26e8dbe8a758.mp4',
    images: [
      'https://image2url.com/r2/default/videos/1774096929361-46f16e67-0449-4a45-86e6-26e8dbe8a758.mp4',
      'https://image2url.com/r2/default/videos/1774096970161-a7fc8917-795d-4672-9806-259f8fff660f.mp4',
      'https://go.screenpal.com/watch/cOerlmnTh0D'
    ],
    year: '2026',
    tags: ['Motion'],
    brief: [
      "This project focused on learning and exploring Adobe After Effects as a tool for motion design. The aim was to understand the basics of animation, timing, and how motion can enhance visual communication.",
      "I began by experimenting with simple animations such as text movement, transitions, and basic effects. As I progressed, I explored keyframes, easing, and layering to create smoother and more dynamic visuals. This helped me understand how small changes in timing and motion can significantly impact the overall feel of a design.",
      "I also worked on combining typography with motion to see how animated text can add energy and clarity to a concept. Through continuous experimentation and practice, I started building short motion pieces that focused on rhythm and visual flow.",
      "Overall, this project helped me develop a foundational understanding of motion design and gave me the confidence to explore more complex animations in the future."
    ]
  }
];

const SKILLS = [
  "Photoshop",
  "Illustrator",
  "InDesign",
  "After Effects",
  "Fresco",
  "Sketch Pro"
];

const App: React.FC = () => {
  const [time, setTime] = useState(new Date().toLocaleTimeString());
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [theme, setTheme] = useState<'dark' | 'inverted'>(() => {
    return (localStorage.getItem('portfolio-theme') as 'dark' | 'inverted') || 'dark';
  });
  const [isMuted, setIsMuted] = useState(audioService.isMuted());
  const [selectedTag, setSelectedTag] = useState<string>('All');

  // Filter projects dynamically based on selected tag
  const filteredProjects = selectedTag === 'All'
    ? PROJECTS
    : PROJECTS.filter(project => project.tags?.includes(selectedTag));

  // Reset horizontal slider scroll progress & scrollLeft on tag change
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollLeft = 0;
      setScrollProgress(0);
    }
  }, [selectedTag]);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date().toLocaleTimeString()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('portfolio-theme', theme);
    if (theme === 'inverted') {
      document.documentElement.classList.add('theme-inverted');
    } else {
      document.documentElement.classList.remove('theme-inverted');
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prev => prev === 'dark' ? 'inverted' : 'dark');
    audioService.playThemeTransition();
  };

  const toggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    audioService.setMuted(nextMute);
  };

  // Drag-to-scroll logic for Work panel using a robust useRef config to prevent stuttery re-renders on mousemove
  const scrollRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef({
    isDragging: false,
    dragged: false,
    startX: 0,
    scrollLeft: 0,
  });
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [secretClicks, setSecretClicks] = useState(0);

  const handleSecretClick = () => {
    const next = secretClicks + 1;
    setSecretClicks(next);
    
    if (next >= 30) {
      setSecretClicks(0);
      audioService.playChime();
      setTimeout(() => {
        window.open('https://www.youtube.com/watch?v=dQw4w9WgXcQ', '_blank');
      }, 300);
    } else {
      audioService.playClick();
      if (next % 5 === 0) {
        audioService.playSecondary();
      }
    }
  };

  useEffect(() => {
    const handleWindowScroll = () => {
      // Show button when scrolled past the hero section (e.g. 450px)
      if (window.scrollY > 450) {
        setShowBackToTop(true);
      } else {
        setShowBackToTop(false);
      }
    };
    window.addEventListener('scroll', handleWindowScroll);
    return () => window.removeEventListener('scroll', handleWindowScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
    audioService.playClick();
  };

  const handleScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    const totalScroll = scrollWidth - clientWidth;
    if (totalScroll <= 0) {
      setScrollProgress(0);
    } else {
      setScrollProgress((scrollLeft / totalScroll) * 100);
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!scrollRef.current) return;
    dragRef.current.isDragging = true;
    dragRef.current.dragged = false;
    dragRef.current.startX = e.clientX;
    dragRef.current.scrollLeft = scrollRef.current.scrollLeft;
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragRef.current.isDragging || !scrollRef.current) return;
    e.preventDefault();
    const x = e.clientX;
    const walk = (x - dragRef.current.startX) * 1.8; // speed multiplier
    if (Math.abs(walk) > 4) {
      dragRef.current.dragged = true;
    }
    scrollRef.current.scrollLeft = dragRef.current.scrollLeft - walk;
  };

  const handleMouseUp = () => {
    dragRef.current.isDragging = false;
  };

  const handleMouseLeave = () => {
    dragRef.current.isDragging = false;
  };

  const handleClickCapture = (e: React.MouseEvent) => {
    if (dragRef.current.dragged) {
      e.stopPropagation();
      e.preventDefault();
      dragRef.current.dragged = false;
    }
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const handleWheel = (e: WheelEvent) => {
      if (e.deltaY === 0) return;
      const canScrollLeft = el.scrollLeft > 0;
      const canScrollRight = el.scrollLeft < el.scrollWidth - el.clientWidth;
      if ((e.deltaY < 0 && canScrollLeft) || (e.deltaY > 0 && canScrollRight)) {
        e.preventDefault();
        el.scrollLeft += e.deltaY * 1.5; // multiplier for a fluid scroll speed
      }
    };
    el.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [filteredProjects]);

  useEffect(() => {
    // Prevent body scroll when project is open
    if (selectedProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
  }, [selectedProject]);

  return (
    <div className="min-h-screen bg-bg text-white selection:bg-acid selection:text-bg animate-in fade-in duration-500">
      <CustomCursor />
      <ScrollProgress />
      
      {/* Home Content Always Visible */}
      <div className={`transition-all duration-700 ${selectedProject ? 'blur-sm scale-[0.98] pointer-events-none' : 'blur-0 scale-100'}`}>
        
        <div className="max-w-[1400px] mx-auto px-6 py-10">
          {/* Header */}
          <header className="flex justify-between items-center border-b border-border pb-8 mb-16">
            <div className="text-2xl font-extrabold uppercase tracking-tighter">
              OMKAR<span className="text-acid">PORTFOLIO</span>
            </div>
            
            <div className="flex items-center gap-4 md:gap-6">
              <nav className="hidden md:flex items-center gap-10 font-mono text-[10px] tracking-widest text-text-sec uppercase">
                <Magnetic>
                  <a 
                    href="#work" 
                    onMouseEnter={() => audioService.playClick()} 
                    className="hover:text-acid transition-colors"
                  >
                    [WORK]
                  </a>
                </Magnetic>
                <Magnetic>
                  <a 
                    href="#contact" 
                    onMouseEnter={() => audioService.playClick()} 
                    className="hover:text-acid transition-colors"
                  >
                    [CONTACT]
                  </a>
                </Magnetic>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-acid rounded-full animate-blink"></div>
                  <span>Open for Commissions</span>
                </div>
                <div className="border-l border-border pl-8">UTC {time}</div>
              </nav>

              <div className="flex items-center gap-2">
                <Magnetic>
                  <button 
                    onClick={toggleMute}
                    onMouseEnter={() => audioService.playClick()}
                    id="sound-toggle-btn"
                    className="font-mono text-[9px] font-bold tracking-[0.15em] border border-border px-3.5 py-1.5 bg-surface hover:bg-acid hover:text-bg hover:border-acid active:scale-95 transition-all uppercase"
                  >
                    [{isMuted ? 'SOUND_MUTED' : 'SOUND_ON'}]
                  </button>
                </Magnetic>

                <Magnetic>
                  <button 
                    onClick={toggleTheme}
                    onMouseEnter={() => audioService.playClick()}
                    id="theme-toggle-btn"
                    className="font-mono text-[9px] font-bold tracking-[0.15em] border border-border px-3.5 py-1.5 bg-surface hover:bg-acid hover:text-bg hover:border-acid active:scale-95 transition-all uppercase"
                  >
                    [{theme === 'dark' ? 'INVERT_THEME' : 'DARK_THEME'}]
                  </button>
                </Magnetic>
              </div>
            </div>
          </header>

          {/* Hero Section */}
          <motion.section 
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="mb-24"
          >
            <h1 className="text-6xl md:text-[140px] font-extrabold uppercase leading-[0.85] tracking-tighter mb-10 select-none">
              <span className="overflow-hidden block"><motion.span variants={itemVariants} className="block">Shaping</motion.span></span>
              <span className="overflow-hidden block text-acid"><motion.span variants={itemVariants} className="block">Visual</motion.span></span>
              <span className="overflow-hidden block"><motion.span variants={itemVariants} className="block">Stories.</motion.span></span>
            </h1>
            <motion.div variants={itemVariants} className="max-w-xl border-l-2 border-acid pl-8 py-2">
              <p className="font-mono text-lg text-text-sec leading-relaxed">
                I’m a Visual Communication student, curious about how design and storytelling shape digital experiences, and always looking to learn something new.
              </p>
            </motion.div>
          </motion.section>
        </div>

        {/* Marquee */}
        <div className="bg-acid text-bg py-5 overflow-hidden whitespace-nowrap marquee-tilted border-y-2 border-white mb-32">
          <div className="inline-block animate-scroll font-mono font-bold text-xl uppercase">
            <span className="moving-kinetic-text">
              /// VISUAL COMMUNICATION /// BRANDING /// TYPOGRAPHY /// MOTION DESIGN /// UI/UX /// EDITORIAL /// 3D RENDERING /// CREATIVE DIRECTION /// STRATEGY /// VISUAL COMMUNICATION /// BRANDING /// TYPOGRAPHY /// MOTION DESIGN /// UI/UX /// EDITORIAL /// 3D RENDERING /// CREATIVE DIRECTION /// STRATEGY
            </span>
          </div>
        </div>

        <div className="max-w-[1400px] mx-auto px-6">
          {/* Bio & Skills Section */}
          <section className="mb-32 grid grid-cols-1 lg:grid-cols-12 gap-12 border-t border-border pt-20">
          <div className="lg:col-span-7">
            <h2 className="text-4xl font-extrabold uppercase mb-8 tracking-tighter">
              Design <span className="text-acid underline decoration-2 underline-offset-8">Strategy</span>
            </h2>
            <div className="space-y-6 text-xl font-medium leading-relaxed max-w-2xl">
              <p>
                I’m Omkar, a Visual Communication student who believes visual language isn’t just communication it’s the strongest bridge between people in a digital-first world.
              </p>
              <p className="text-text-sec">
                My work spans branding, motion, and digital product design. I see each project as a space to explore typography and composition, creating bold, expressive visuals that still serve a clear message.
              </p>
            </div>
          </div>
          
          <div className="lg:col-span-5 bg-surface border border-border p-8 relative">
            <div className="absolute -top-3 -right-3 bg-acid text-bg px-3 py-1 font-mono text-[10px] font-bold uppercase tracking-widest">
              Toolkit
            </div>
            <h3 className="font-mono text-xs uppercase text-acid mb-6 tracking-[0.3em]">/// DESIGN_CORE.PKG</h3>
            <div className="flex flex-wrap gap-3">
              {SKILLS.map((skill) => (
                <SkillPill key={skill} skill={skill} />
              ))}
            </div>
          </div>
        </section>

        {/* Work Section */}
        <section id="work" className="mb-32 overflow-hidden">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-border pb-6 mb-8 gap-4">
            <div>
              <h2 className="text-5xl font-extrabold uppercase tracking-tighter">MY work</h2>
              <p className="font-mono text-[9px] text-acid uppercase tracking-[0.2em] mt-1 select-none">
                [ DRAG OR SCROLL HORIZONTALLY TO EXPLORE ]
              </p>
            </div>
            <div className="flex items-center gap-4">
              <span className="font-mono text-text-sec text-xs uppercase">[DRAGGABLE LIST]</span>
              <span className="font-mono text-text-sec text-xs">(2023 - 2024)</span>
            </div>
          </div>

          {/* Brutalist Tag Filter Bar */}
          <div className="flex flex-wrap gap-2.5 md:gap-4 mb-10 pb-2 overflow-x-auto no-scrollbar select-none">
            {['All', 'Branding', 'Motion', 'Editorial', 'Typography', 'Illustration'].map((tag) => {
              const isActive = selectedTag === tag;
              return (
                <Magnetic key={tag}>
                  <motion.button
                    onClick={() => {
                      setSelectedTag(tag);
                      audioService.playClick();
                    }}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    animate={isActive ? { scale: 1.03 } : { scale: 1 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 15 }}
                    className={`relative overflow-hidden font-mono text-[11px] md:text-xs font-bold uppercase tracking-widest border-2 px-5 py-2.5 bg-surface select-none cursor-pointer transition-all duration-150 ${
                      isActive 
                        ? 'border-acid text-black font-black shadow-[4px_4px_0px_rgba(255,255,255,0.15)]' 
                        : 'border-border text-white/60 hover:text-white hover:border-acid hover:shadow-[4px_4px_0px_var(--acid-color)] hover:-translate-x-[2px] hover:-translate-y-[2px] shadow-[3px_3px_0px_rgba(255,255,255,0.06)]'
                    }`}
                  >
                    {isActive && (
                      <motion.span
                        layoutId="activeTagIndicator"
                        className="absolute inset-0 bg-acid"
                        transition={{ type: 'spring', stiffness: 350, damping: 25 }}
                        style={{ zIndex: 0 }}
                      />
                    )}
                    <span className="relative z-10">[{tag}]</span>
                  </motion.button>
                </Magnetic>
              );
            })}
          </div>
          
          <div className="relative">
            <motion.div 
              ref={scrollRef}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseLeave}
              onClickCapture={handleClickCapture}
              className="flex gap-8 overflow-x-auto select-none pb-8 cursor-grab active:cursor-grabbing work-scrollbar"
            >
              {filteredProjects.map(project => (
                <motion.div 
                  key={project.id} 
                  variants={cardVariants}
                  initial="hidden"
                  whileInView="visible"
                  viewport={{ once: true, amount: 0.1 }}
                  className="w-[430px] max-w-[85vw] flex-shrink-0"
                >
                  <ProjectCard project={project} onClick={setSelectedProject} />
                </motion.div>
              ))}
              {/* Spacer at end to guarantee last item has margins and doesn't get cut off */}
              <div className="w-12 md:w-48 lg:w-[400px] flex-shrink-0 select-none pointer-events-none" />
            </motion.div>
          </div>
        </section>

        {/* Footer */}
        <footer id="contact" className="border-t border-border pt-20 pb-32 flex flex-col items-center">
          <h2 className="text-4xl md:text-6xl font-extrabold uppercase mb-12 text-center tracking-tighter">
            Let's create the <br /> 
            <motion.span 
              onClick={handleSecretClick}
              className="text-acid cursor-pointer select-none relative inline-block transition-colors duration-200"
              style={{ display: 'inline-block' }}
              animate={secretClicks > 0 ? {
                x: [
                  0, 
                  (Math.random() - 0.5) * secretClicks * 1.0, 
                  (Math.random() - 0.5) * secretClicks * 1.0, 
                  0
                ],
                y: [
                  0, 
                  (Math.random() - 0.5) * secretClicks * 1.0, 
                  (Math.random() - 0.5) * secretClicks * 1.0, 
                  0
                ],
                scale: 1 + (secretClicks * 0.006),
              } : {}}
              transition={secretClicks > 0 ? {
                duration: 0.12,
                ease: "easeInOut"
              } : {}}
              whileTap={{ scale: 0.95 }}
            >
              Future of Visuals.
            </motion.span>
          </h2>
          <div className="flex flex-wrap justify-center gap-6">
            <a 
              href="mailto:omkarbodas28@gmail.com" 
              className="px-8 py-3 border border-border font-mono text-sm uppercase tracking-widest hover:bg-acid hover:text-bg hover:border-acid transition-all duration-300"
            >
              Email
            </a>
            <a 
              href="tel:8999091716" 
              className="px-8 py-3 border border-border font-mono text-sm uppercase tracking-widest hover:bg-acid hover:text-bg hover:border-acid transition-all duration-300"
            >
              Contact
            </a>
          </div>
        </footer>
      </div>
      </div>

      {/* Project Detail Modal Overlay */}
      {selectedProject && (
        <ProjectDetail 
          project={selectedProject} 
          onBack={() => setSelectedProject(null)} 
        />
      )}

      {/* Back to Top Floating Button with Magnetic effect */}
      <AnimatePresence>
        {showBackToTop && !selectedProject && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 20, stiffness: 120 }}
            className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 select-none"
          >
            <Magnetic range={50} strength={0.4}>
              <button
                onClick={scrollToTop}
                onMouseEnter={() => audioService.playClick()}
                className="font-mono text-[9px] md:text-[10px] font-bold tracking-[0.15em] border border-border px-4 py-2.5 bg-surface text-white hover:text-bg hover:bg-acid hover:border-acid active:scale-95 cursor-pointer ease-out transition-all duration-150 uppercase shadow-[4px_4px_0px_rgba(255,255,255,0.1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px]"
                title="Back to Top"
              >
                [↑_TOP]
              </button>
            </Magnetic>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default App;
