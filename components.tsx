import React, { useState, useEffect, useRef } from 'react';
import type { Project, BlogPost } from './types';
import { NavLink, useLocation } from 'react-router-dom';

// --- Custom Hooks ---

const useScrollSpy = (ids: string[], options: IntersectionObserverInit) => {
    const [activeId, setActiveId] = useState<string>('');
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const elements = ids.map(id => document.getElementById(id)).filter(el => el) as Element[];
        if (elements.length === 0) return;
        
        observer.current?.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            // Pick the most visible entry to avoid flicker across adjacent sections
            let topEntry: IntersectionObserverEntry | null = null;
            for (const entry of entries) {
                if (!entry.isIntersecting) continue;
                if (!topEntry || entry.intersectionRatio > topEntry.intersectionRatio) {
                    topEntry = entry;
                }
            }
            if (topEntry && topEntry.target && (topEntry.target as HTMLElement).id) {
                setActiveId((topEntry.target as HTMLElement).id);
            }
        }, options);

        elements.forEach(el => observer.current?.observe(el));

        return () => observer.current?.disconnect();
    }, [ids, options]);

    return activeId;
}

// --- NEW: Scroll-driven Animated Text Component ---
export const AnimatedText: React.FC<{ text: string, className?: string, progress: number }> = ({ text, className, progress }) => {
    const revealedCount = Math.floor(progress * text.length);
    const words = text.split(' ');
    let charIndex = 0;

    return (
        <h2 className={`${className} animated-text-reveal`} aria-label={text}>
            {words.map((word, wordIndex) => {
                const wordWithSpace = word + (wordIndex < words.length - 1 ? ' ' : '');
                return (
                    <span key={wordIndex} style={{ display: 'inline-block', whiteSpace: 'pre' }}>
                        {wordWithSpace.split('').map((char, charInWordIndex) => {
                            const isRevealed = charIndex < revealedCount;
                            const color = isRevealed ? '#000000' : '#9ca3af';
                            charIndex++;
                            return (
                                <span key={charInWordIndex} style={{ color }}>
                                    {char}
                                </span>
                            );
                        })}
                    </span>
                );
            })}
        </h2>
    );
};


// --- UI Components ---

export const BottomNavBar: React.FC = () => {
    const location = useLocation();
    const isHomePage = location.pathname === '/';
    
    const sectionIds = ['home-section-spacer', 'about-section', 'work-section', 'services-section', 'recent-blog-section', 'contact-section'];
    
    const activeSection = useScrollSpy(isHomePage ? sectionIds : [], { 
        threshold: 0.15,
        rootMargin: '0px 0px -40% 0px'
    });

    // Order aligned with homepage sections: Home, About, Work, Service, then standalone pages
    const links = [
        { name: 'Home', path: '/', sectionId: 'home-section-spacer' },
        { name: 'About', path: '/about', sectionId: 'about-section' },
        { name: 'Work', path: '/portfolio', sectionId: 'work-section' },
        { name: 'Service', path: '/services', sectionId: 'services-section' },
        { name: 'Blog', path: '/blog', sectionId: 'recent-blog-section' },
        { name: 'Contact', path: '/contact', sectionId: 'contact-section' },
    ];
    
    return (
        <nav className="bottom-nav-container animate-fadeIn">
            <div className="bottom-nav-inner">
                {links.map((link) => {
                // Special-case Service: always navigate to /services, but reflect active by scroll on homepage
                if (link.name === 'Service') {
                    const extraActive = isHomePage && activeSection === link.sectionId;
                    return (
                        <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) => `bottom-nav-link ${(isActive || extraActive) ? 'active' : ''}`}
                        >
                            {link.name}
                        </NavLink>
                    );
                }

                if (isHomePage && link.sectionId) {
                    const isActive = activeSection === link.sectionId;
                    return (
                        <a
                            key={link.name}
                            href={`#${link.sectionId}`}
                            onClick={(e) => {
                                e.preventDefault();
                                document.getElementById(link.sectionId!)?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className={`bottom-nav-link ${isActive ? 'active' : ''}`}
                        >
                            {link.name}
                        </a>
                    );
                } 
                else {
                    return (
                         <NavLink
                            key={link.name}
                            to={link.path}
                            className={({ isActive }) => `bottom-nav-link ${isActive ? 'active' : ''}`}
                         >
                             {link.name}
                         </NavLink>
                    );
                }
            })}
            </div>
        </nav>
    );
};


export const ProjectCard: React.FC<{ project: Project }> = ({ project }) => (
    <NavLink to={`/portfolio/${project.id}`} className="group block bg-dark-card border border-dark-border rounded-lg overflow-hidden transition-all duration-300 hover:border-brand-cyan hover:shadow-lg hover:shadow-brand-cyan/10 hover:-translate-y-2">
        <div className="relative overflow-hidden h-48">
            <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
            <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition-all duration-300 flex items-end p-4">
                 <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                    <h3 className="font-sans text-xl text-white font-bold">{project.title}</h3>
                    <p className="text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{project.client}</p>
                </div>
            </div>
        </div>
    </NavLink>
);

export const BlogCard: React.FC<{ post: BlogPost }> = ({ post }) => (
    <NavLink to={`/blog/${post.id}`} className="group block bg-dark-card border border-dark-border rounded-lg transition-all duration-300 hover:border-brand-cyan hover:shadow-lg hover:shadow-brand-cyan/10 hover:-translate-y-1">
        <div className="blog-thumb-2x1 rounded-t-lg">
            <img src={post.imageUrl} alt={post.title} className="transition-transform duration-300 group-hover:scale-105" />
        </div>
        <div className="p-6">
            <h3 className="font-sans text-xl text-white font-bold group-hover:text-brand-cyan transition-colors duration-300">{post.title}</h3>
            <div className="blog-meta mt-2">
                <span>{post.date}</span>
                <div className="blog-meta-dot"></div>
                <span>{post.views.toLocaleString()} Views</span>
            </div>
            <p className="text-gray-400 mt-4">{post.excerpt}</p>
        </div>
    </NavLink>
);

// --- Reveal on scroll wrapper ---
export const Reveal: React.FC<{ children: React.ReactNode; delayMs?: number; className?: string; threshold?: number; y?: number; startScale?: number }> = ({ children, delayMs = 0, className = '', threshold = 0.1, y = 16, startScale = 0.95 }) => {
    const ref = useRef<HTMLDivElement | null>(null);
    const [inView, setInView] = useState(false);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setInView(true);
                        io.disconnect();
                    }
                });
            },
            { threshold, rootMargin: '0px 0px -15% 0px' }
        );
        io.observe(el);
        return () => io.disconnect();
    }, [threshold]);

    const style: React.CSSProperties = {
        transitionDelay: `${delayMs}ms`,
        transform: inView ? 'translateY(0) scale(1)' : `translateY(${y}px) scale(${startScale})`,
        opacity: inView ? 1 : 0,
    };

    return (
        <div
            ref={ref}
            className={`transform will-change-transform transition-opacity transition-transform duration-[900ms] ease-[cubic-bezier(0.22,1,0.36,1)] ${className}`}
            style={style}
        >
            {children}
        </div>
    );
};

// --- Lazy Image with skeleton ---
export const LazyImage: React.FC<{ src: string; alt: string; className?: string; loading?: 'lazy' | 'eager'; delayMs?: number; disableReveal?: boolean; direction?: 'up' | 'none' }> = ({ src, alt, className, loading = 'lazy', delayMs = 0, disableReveal = false, direction = 'up' }) => {
    const [isLoaded, setIsLoaded] = useState(false);
    const [isInView, setIsInView] = useState(false);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setIsInView(true);
                        observer.disconnect();
                    }
                });
            },
            { threshold: 0.2, rootMargin: '0px 0px -20% 0px' }
        );
        observer.observe(el);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isInView || isLoaded) return;
        const timeoutId = window.setTimeout(() => {
            // Fallback to show the image animation even if the browser defers the load event
            setIsLoaded(true);
        }, 800);
        return () => window.clearTimeout(timeoutId);
    }, [isInView, isLoaded]);

    const transitionClasses = 'transform will-change-transform transition-opacity transition-transform duration-[800ms] ease-[cubic-bezier(0.22,1,0.36,1)]';
    const hiddenTransform = direction === 'up' ? 'opacity-0 translate-y-8 scale-95' : 'opacity-0 scale-95';
    const visibleTransform = 'opacity-100 translate-y-0 scale-100';
    const animatedClasses = disableReveal
        ? `${className || ''}`
        : `${className || ''} ${transitionClasses} ${isInView ? visibleTransform : hiddenTransform}`;
    const style: React.CSSProperties | undefined = disableReveal ? undefined : { transitionDelay: `${delayMs}ms` };

    return (
        <div ref={containerRef} className="relative w-full h-full overflow-hidden">
            <img
                src={src}
                alt={alt}
                loading={loading}
                onLoad={() => setIsLoaded(true)}
                decoding="async"
                style={style}
                className={animatedClasses}
            />
            {(!isLoaded || !isInView) && <div className="absolute inset-0 bg-white/10 animate-pulse" />}
        </div>
    );
};

// --- NEW: Marquee Gallery ---
export const MarqueeGallery: React.FC<{ items: { id: string; src: string; alt: string }[] }> = ({ items }) => {
    const trackRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isDragging, setIsDragging] = useState(false);
    const dragState = useRef<{ startX: number; scrollLeft: number }>({ startX: 0, scrollLeft: 0 });

    // Duplicate items to create seamless loop
    const smallItems = items.map(i => ({ ...i }));
    const duplicated = [...smallItems, ...smallItems, ...smallItems];

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        // Start from middle copy to allow dragging both ways
        const oneWidth = el.scrollWidth / 3;
        el.scrollLeft = oneWidth;
    }, [items.length]);

    useEffect(() => {
        const el = containerRef.current;
        if (!el) return;
        let rafId: number;
        const speedPxPerFrame = 0.5; // subtle, smooth
        const animate = () => {
            if (!isPaused && !isDragging) {
                el.scrollLeft += speedPxPerFrame;
                const oneWidth = el.scrollWidth / 3;
                if (el.scrollLeft >= oneWidth * 2) {
                    el.scrollLeft -= oneWidth;
                }
            }
            rafId = requestAnimationFrame(animate);
        };
        rafId = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(rafId);
    }, [isPaused, isDragging]);

    const onPointerDown: React.PointerEventHandler<HTMLDivElement> = (e) => {
        const el = containerRef.current;
        if (!el) return;
        setIsDragging(true);
        el.setPointerCapture(e.pointerId);
        dragState.current.startX = e.clientX;
        dragState.current.scrollLeft = el.scrollLeft;
    };

    const onPointerMove: React.PointerEventHandler<HTMLDivElement> = (e) => {
        if (!isDragging) return;
        const el = containerRef.current;
        if (!el) return;
        const dx = e.clientX - dragState.current.startX;
        el.scrollLeft = dragState.current.scrollLeft - dx;
        const oneWidth = el.scrollWidth / 3;
        if (el.scrollLeft <= oneWidth * 0.5) el.scrollLeft += oneWidth;
        if (el.scrollLeft >= oneWidth * 2.5) el.scrollLeft -= oneWidth;
    };

    const onPointerUpOrLeave: React.PointerEventHandler<HTMLDivElement> = (e) => {
        setIsDragging(false);
        const el = containerRef.current;
        if (!el) return;
        try { el.releasePointerCapture((e as any).pointerId); } catch {}
    };

    return (
        <div
            ref={containerRef}
            className="relative overflow-hidden group cursor-grab active:cursor-grabbing select-none"
            onMouseEnter={() => setIsPaused(true)}
            onMouseLeave={() => setIsPaused(false)}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUpOrLeave}
            onPointerLeave={onPointerUpOrLeave}
        >
            <div ref={trackRef} className="flex items-center gap-4 py-2">
                {duplicated.map((item, idx) => (
                    <img
                        key={`${item.id}-${idx}`}
                        src={item.src}
                        alt={item.alt}
                        className="h-24 w-auto object-cover rounded-md border border-white/10 shadow-sm"
                        loading="lazy"
                        decoding="async"
                        draggable={false}
                    />
                ))}
            </div>
        </div>
    );
};

// --- Minimal Icons ---
export const IconLinkedIn: React.FC<{ className?: string; size?: number }> = ({ className, size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="2" y="2" width="20" height="20" rx="2" ry="2"></rect>
        <line x1="8" y1="11" x2="8" y2="16"></line>
        <line x1="8" y1="8" x2="8" y2="8"></line>
        <path d="M12 16v-5h3a3 3 0 0 1 3 3v2"></path>
    </svg>
);

export const IconBehance: React.FC<{ className?: string; size?: number }> = ({ className, size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M4 8h6a3 3 0 0 1 0 6H4z"></path>
        <path d="M4 11h5"></path>
        <path d="M14 10h6"></path>
        <path d="M14 14h6"></path>
    </svg>
);

export const IconInstagram: React.FC<{ className?: string; size?: number }> = ({ className, size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <rect x="3" y="3" width="18" height="18" rx="4" ry="4"></rect>
        <circle cx="12" cy="12" r="3"></circle>
        <line x1="17" y1="7" x2="17" y2="7"></line>
    </svg>
);

export const IconFacebook: React.FC<{ className?: string; size?: number }> = ({ className, size = 24 }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
        <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
    </svg>
);

export const ContactForm: React.FC = () => (
     <form className="space-y-4">
        <input type="text" placeholder="Your Name" className="w-full bg-dark-card border border-dark-border focus:border-brand-cyan focus:ring-0 rounded-md px-4 py-2 transition-colors duration-300" />
        <input type="email" placeholder="Your Email" className="w-full bg-dark-card border border-dark-border focus:border-brand-cyan focus:ring-0 rounded-md px-4 py-2 transition-colors duration-300" />
        <textarea placeholder="Your Message" rows={5} className="w-full bg-dark-card border border-dark-border focus:border-brand-cyan focus:ring-0 rounded-md px-4 py-2 transition-colors duration-300"></textarea>
        <button type="submit" className="w-full bg-brand-cyan/10 border border-brand-cyan text-brand-cyan font-bold py-3 rounded-md hover:bg-brand-cyan hover:text-dark-bg transition-all duration-300">
            Send Message
        </button>
    </form>
);

export const CreativeImageFrame: React.FC<{ imageUrl: string }> = ({ imageUrl }) => {
    return (
        <div className="creative-image-wrapper" aria-label="A framed photograph of the site author.">
            <div className="image-frame-corner top-left"></div>
            <div className="image-frame-corner top-right"></div>
            <div className="creative-image-inner">
                <img src={imageUrl} alt="Photograph of the site author" className="creative-image" />
            </div>
            <div className="image-frame-corner bottom-left"></div>
            <div className="image-frame-corner bottom-right"></div>
        </div>
    );
};


export const AdminSidebar: React.FC<{ onLogout: () => void }> = ({ onLogout }) => (
    <div className="fixed left-0 top-0 w-64 h-screen admin-sidebar-light flex flex-col p-4 z-10 overflow-y-auto">
        <h1 className="admin-sidebar-title text-xl font-bold tracking-widest text-center py-4">ADMIN PANEL</h1>
        <nav className="flex-grow mt-8 space-y-2">
            <AdminNavLink to="/admin">Dashboard</AdminNavLink>
            <AdminNavLink to="/admin/portfolio">Portfolio</AdminNavLink>
            <AdminNavLink to="/admin/blog">Blog</AdminNavLink>
            <AdminNavLink to="/admin/services">Services</AdminNavLink>
            <AdminNavLink to="/admin/settings">Settings</AdminNavLink>
        </nav>
        <button onClick={onLogout} className="w-full text-left p-3 rounded-md admin-logout-btn">
            Logout
        </button>
    </div>
);

const AdminNavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
    return (
        <NavLink 
            to={to} 
            end 
            className={({ isActive }) => `block p-3 rounded-md admin-nav-link ${isActive ? 'active' : ''}`}
        >
            {children}
        </NavLink>
    );
};


export const PageTitle: React.FC<{ children: React.ReactNode; subtitle?: string }> = ({ children, subtitle }) => (
    <div className="mb-8">
        <h1 className="font-sans text-4xl font-bold admin-page-title">{children}</h1>
        {subtitle && <p className="admin-page-subtitle mt-1">{subtitle}</p>}
    </div>
);