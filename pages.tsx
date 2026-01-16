
import React, { useState, useEffect, useRef, useCallback, useMemo, Suspense } from 'react';
import { useData } from './context';
import { Link, useParams, Outlet, useNavigate, Navigate, NavLink } from 'react-router-dom';
import { MainNavbar, ProjectCard, BlogCard, ContactForm, AdminSidebar, PageTitle, AnimatedText, CreativeImageFrame, LazyImage, MarqueeGallery } from './components';
import { SiLinkedin, SiInstagram, SiFacebook, SiBehance } from 'react-icons/si';
import { HiOutlineViewList, HiOutlineViewGrid } from 'react-icons/hi';
import { AiOutlineHeart, AiFillHeart } from 'react-icons/ai';
import { SERVICES, WORK_HISTORY, FACTS, PORTFOLIO_CATEGORIES } from './constants';
import { Project, ProjectCategory, BlogPost, SiteSettings } from './types';
const ReactQuill = React.lazy(() => import('react-quill'));
import { supabase } from './supabaseClient';
import { initEmailJS, sendContactEmail } from './emailService';

// LAYOUTS
export const PublicLayout: React.FC = () => (
    <>
        <MainNavbar />
        <main className="pt-16 md:pt-20">
            <Outlet />
        </main>
    </>
);

export const AdminLayout: React.FC = () => {
    const { isAuthenticated, logout } = useData();
    const navigate = useNavigate();

    if (!isAuthenticated) {
        return <Navigate to="/admin/login" replace />;
    }
    
    const handleLogout = () => {
        logout();
        navigate('/admin/login');
    }

    return (
        <div className="admin-light-theme min-h-screen">
            <AdminSidebar onLogout={handleLogout} />
            <main className="p-8 min-h-screen bg-gray-50" style={{ marginLeft: '17rem' }}>
                <Outlet />
            </main>
        </div>
    );
};

// Interactive Coffee Doodle Component
const InteractiveCoffeeDoodle: React.FC = () => {
    const doodleRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const positionRef = useRef({ x: 0, y: 0 });
    const velocityRef = useRef({ x: 0, y: 0 });
    const animationFrameRef = useRef<number | null>(null);
    const mousePosRef = useRef({ x: 0, y: 0 });
    const isMouseNearRef = useRef(false);

    useEffect(() => {
        const container = containerRef.current;
        const doodle = doodleRef.current;
        if (!container || !doodle) return;

        const doodleSize = 72;
        const boundaryPadding = 80;
        let containerRect = container.getBoundingClientRect();
        
        // Initialize with a random slow velocity to keep it always moving
        const initialSpeed = 0.15;
        const initialAngle = Math.random() * Math.PI * 2;
        velocityRef.current = {
            x: Math.cos(initialAngle) * initialSpeed,
            y: Math.sin(initialAngle) * initialSpeed
        };
        
        const updatePosition = () => {
            if (!container || !doodle) return;
            
            containerRect = container.getBoundingClientRect();
            const containerWidth = containerRect.width;
            const containerHeight = containerRect.height;
            
            let { x, y } = positionRef.current;
            let { x: vx, y: vy } = velocityRef.current;
            
            // Calculate distance from mouse to doodle center
            const doodleCenterX = containerRect.left + containerRect.width / 2 + x;
            const doodleCenterY = containerRect.top + containerRect.height / 2 + y;
            const dx = mousePosRef.current.x - doodleCenterX;
            const dy = mousePosRef.current.y - doodleCenterY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            const repulsionRadius = 150;
            
            // Mouse repulsion - change direction to move away from mouse (all directions)
            if (distance < repulsionRadius && distance > 0) {
                const force = (repulsionRadius - distance) / repulsionRadius;
                const mouseAngle = Math.atan2(dy, dx);
                // Calculate opposite direction (180 degrees from mouse)
                const escapeAngle = mouseAngle + Math.PI;
                // Change velocity direction to escape from mouse
                const escapeSpeed = 0.3 * force;
                vx = Math.cos(escapeAngle) * escapeSpeed;
                vy = Math.sin(escapeAngle) * escapeSpeed;
            } else {
                // Maintain minimum speed to keep it always moving
                const currentSpeed = Math.sqrt(vx * vx + vy * vy);
                const minSpeed = 0.12;
                if (currentSpeed < minSpeed) {
                    // If too slow, add a small random velocity to keep it moving
                    const randomAngle = Math.random() * Math.PI * 2;
                    vx += Math.cos(randomAngle) * 0.05;
                    vy += Math.sin(randomAngle) * 0.05;
                }
                // Limit maximum speed for slow movement
                const maxSpeed = 0.25;
                if (currentSpeed > maxSpeed) {
                    const scale = maxSpeed / currentSpeed;
                    vx *= scale;
                    vy *= scale;
                }
            }
            
            // Apply velocity
            x += vx;
            y += vy;
            
            // Boundary collision detection and bounce (change direction)
            const maxX = (containerWidth - doodleSize) / 2 - boundaryPadding;
            const maxY = (containerHeight - doodleSize) / 2 - boundaryPadding;
            
            if (x > maxX) {
                x = maxX;
                vx = -Math.abs(vx); // Bounce to left
            } else if (x < -maxX) {
                x = -maxX;
                vx = Math.abs(vx); // Bounce to right
            }
            
            if (y > maxY) {
                y = maxY;
                vy = -Math.abs(vy); // Bounce upward
            } else if (y < -maxY) {
                y = -maxY;
                vy = Math.abs(vy); // Bounce downward
            }
            
            // No friction - keep it moving infinitely
            // Just ensure it maintains slow, continuous motion
            
            // Update position
            positionRef.current = { x, y };
            velocityRef.current = { x: vx, y: vy };
            
            doodle.style.transform = `translate(${x}px, ${y}px)`;
            
            animationFrameRef.current = requestAnimationFrame(updatePosition);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mousePosRef.current = { x: e.clientX, y: e.clientY };
            isMouseNearRef.current = true;
        };

        const handleMouseLeave = () => {
            isMouseNearRef.current = false;
        };

        container.addEventListener('mousemove', handleMouseMove);
        container.addEventListener('mouseleave', handleMouseLeave);
        
        // Start animation
        animationFrameRef.current = requestAnimationFrame(updatePosition);

        return () => {
            container.removeEventListener('mousemove', handleMouseMove);
            container.removeEventListener('mouseleave', handleMouseLeave);
            if (animationFrameRef.current) {
                cancelAnimationFrame(animationFrameRef.current);
            }
        };
    }, []);

    return (
        <div 
            ref={containerRef}
            className="coffee-doodle-container mb-16"
            style={{ 
                marginTop: '60px',
                width: '100%',
                height: '200px',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}
        >
            <div
                ref={doodleRef}
                className="coffee-doodle-interactive"
                style={{
                    position: 'absolute',
                    transition: 'transform 0.1s linear',
                    willChange: 'transform'
                }}
            >
                <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-white/60">
                    <path d="M18 8h1a4 4 0 0 1 0 8h-1"></path>
                    <path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path>
                    <line x1="6" y1="1" x2="6" y2="4"></line>
                    <line x1="10" y1="1" x2="10" y2="4"></line>
                    <line x1="14" y1="1" x2="14" y2="4"></line>
                </svg>
            </div>
        </div>
    );
};

// PUBLIC PAGES
export const HomePage: React.FC = () => {
    const { projects, settings, blogPosts } = useData();
    
    const aboutSectionRef = useRef<HTMLDivElement>(null);
    const [aboutAnimationProgress, setAboutAnimationProgress] = useState(0);

    // Work section simplified to static grid (no complex animations)
    
    const [activeServiceIndex, setActiveServiceIndex] = useState(0);
    const [serviceTextTranslateY, setServiceTextTranslateY] = useState(0);
    const [isMobile, setIsMobile] = useState<boolean>(false);
    const servicesContainerRef = useRef<HTMLDivElement>(null);

    const ROLES = ["Creative Designer", "UI/UX Designer", "Branding Specialist", "Visual Storyteller", "Design Strategist"];
    const [roleIndex, setRoleIndex] = useState(0);
    const [displayedRole, setDisplayedRole] = useState('');
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        const typingSpeed = 10;
        const deletingSpeed = 5;
        const pauseDuration = 1500;
        let timeoutId: number;
        const handleTyping = () => {
            const currentRole = ROLES[roleIndex];
            if (isDeleting) {
                if (displayedRole.length > 0) {
                    setDisplayedRole(currentRole.substring(0, displayedRole.length - 1));
                    timeoutId = window.setTimeout(handleTyping, deletingSpeed);
                } else {
                    setIsDeleting(false);
                    setRoleIndex((prevIndex) => (prevIndex + 1) % ROLES.length);
                }
            } else {
                if (displayedRole.length < currentRole.length) {
                    setDisplayedRole(currentRole.substring(0, displayedRole.length + 1));
                    timeoutId = window.setTimeout(handleTyping, typingSpeed);
                } else {
                    timeoutId = window.setTimeout(() => setIsDeleting(true), pauseDuration);
                }
            }
        };
        timeoutId = window.setTimeout(handleTyping, displayedRole.length > 0 ? typingSpeed : 500);
        return () => window.clearTimeout(timeoutId);
    }, [displayedRole, isDeleting, roleIndex]);

    useEffect(() => {
        const aboutSection = aboutSectionRef.current;
        if (!aboutSection) return;
        
        const handleScroll = () => {
            const sectionTop = aboutSection.offsetTop;
            const scrollY = window.scrollY;
            const viewportHeight = window.innerHeight;
            const sectionHeight = aboutSection.offsetHeight;
            
            if (scrollY >= sectionTop && scrollY <= sectionTop + sectionHeight) {
                const scrollInPin = scrollY - sectionTop;
                // Increased start buffer for more delay before animation starts
                const startBuffer = viewportHeight * 0.4;
                const animationDuration = Math.max(viewportHeight * 0.4, sectionHeight * 0.2);
                const effectiveScroll = Math.max(0, scrollInPin - startBuffer);
                const linearProgress = Math.min(1, effectiveScroll / animationDuration);
                // Smoother easing function for better animation
                const easeInOutCubic = (t: number) => t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
                const easedProgress = easeInOutCubic(linearProgress);
                setAboutAnimationProgress(easedProgress);
            } else if (scrollY < sectionTop) {
                setAboutAnimationProgress(0);
            } else {
                setAboutAnimationProgress(1);
            }
        };
        
        // Initial call
        handleScroll();
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    // Removed scroll-based sticky logic for Work section
    
    useEffect(() => {
        const interactiveItems = document.querySelectorAll('.work-gallery-item, .contact-cta-section, .portfolio-gallery-item');
        const handleMouseMove = (e: MouseEvent) => {
          const target = e.currentTarget as HTMLElement;
          const rect = target.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          target.style.setProperty('--cursor-x', `${x}px`);
          target.style.setProperty('--cursor-y', `${y}px`);
        };
        interactiveItems.forEach(item => item.addEventListener('mousemove', handleMouseMove as EventListener));
        return () => interactiveItems.forEach(item => item.removeEventListener('mousemove', handleMouseMove as EventListener));
    }, [projects]);
      
    useEffect(() => {
        const updateIsMobile = () => setIsMobile(window.innerWidth < 768);
        updateIsMobile();
        window.addEventListener('resize', updateIsMobile);
        return () => window.removeEventListener('resize', updateIsMobile);
    }, []);

    useEffect(() => {
        const container = servicesContainerRef.current;
        if (!container) return;
        
        if (isMobile) {
            // Disable sticky scroll logic on mobile; render stacked
            setServiceTextTranslateY(0);
            setActiveServiceIndex(0);
            return;
        }

        const handleScroll = () => {
            if (!container) return;
            
            const containerTop = container.offsetTop;
            const containerHeight = container.offsetHeight;
            const viewportHeight = window.innerHeight;
            const scrollY = window.scrollY;
            
            const stickyStart = containerTop;
            const stickyEnd = containerTop + containerHeight - viewportHeight;

            if (scrollY >= stickyStart && scrollY <= stickyEnd) {
                const scrollInContainer = scrollY - stickyStart;
                const maxScroll = containerHeight - viewportHeight;
                const scrollProgress = Math.min(scrollInContainer / maxScroll, 1);
                
                setServiceTextTranslateY(scrollInContainer);
                
                // Calculate which service should be active based on scroll progress
                const serviceIndex = Math.floor(scrollProgress * SERVICES.length);
                const newActiveIndex = Math.max(0, Math.min(serviceIndex, SERVICES.length - 1));
                
                if (activeServiceIndex !== newActiveIndex) {
                    setActiveServiceIndex(newActiveIndex);
                }
            } else if (scrollY < stickyStart) {
                setServiceTextTranslateY(0);
                setActiveServiceIndex(0);
            } else {
                setServiceTextTranslateY(Math.max(0, containerHeight - viewportHeight));
                setActiveServiceIndex(SERVICES.length - 1);
            }
        };
        
        // Initial call
        handleScroll();
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', handleScroll);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
        };
    }, [activeServiceIndex, isMobile]);

    return (
        <div className="relative">
            <div id="home-section" className="fixed top-0 left-0 w-full h-screen z-0 flex items-end bg-black text-white overflow-hidden animate-fadeIn">
                <div className="relative z-10 w-full h-full">
                    <img src={settings.heroImage} alt="Rishad PK" className="w-full h-full object-cover select-none animate-slow-zoom" />
                </div>
                <div className="absolute bottom-0 left-0 z-20 p-4" style={{ paddingBottom: isMobile ? '60px' : '120px', paddingLeft: isMobile ? '32px' : '120px' }}>
                    <h1 className="font-sans text-6xl md:text-8xl lg:text-9xl font-light text-white leading-tight mb-1 md:mb-3">
                        {settings.heroName}
                    </h1>
                    <p className="font-sans text-2xl text-gray-300 leading-relaxed">
                       {displayedRole}
                       <span className="typing-cursor"></span>
                    </p>
                </div>
            </div>
            
            <div className="relative z-10">
                <div id="home-section-spacer" className="h-screen" />

                <div className="relative">
                    <section id="about-section" ref={aboutSectionRef} className="h-screen sticky top-0 bg-white text-black flex items-center py-20 z-10">
                        <div className="container mx-auto px-6">
                            <div className="grid grid-cols-1 md:grid-cols-10 gap-12 items-center">
                                 <div className="w-full max-w-sm mx-auto md:col-span-3">
                                     <CreativeImageFrame imageUrl={settings.about.photo} />
                                 </div>
                                 <div className="md:text-left md:col-span-7 text-center md:text-left">
                                    <p className="tracking-widest uppercase text-sm mb-4 text-gray-500">(01) About Me</p>
                                    <AnimatedText text="I'm a creative designer specializing in branding, digital marketing, and UI/UX. My work blends strategy with design to craft impactful visuals and experiences." className="text-2xl md:text-3xl lg:text-5xl font-sans font-light leading-spacious" progress={aboutAnimationProgress} />
                                    <Link to="/about" className="animated-link-underline inline-block mt-8 uppercase tracking-widest text-sm font-semibold text-black">
                                        Learn more about me
                                    </Link>
                                 </div>
                            </div>
                        </div>
                    </section>
                    
                    <section id="work-section" className="relative z-20 bg-dark-bg flex flex-col justify-center" style={{ minHeight: '100vh' }}>
                        <div className="container mx-auto px-6">
                            <div className="mb-12">
                                <p className="tracking-widest uppercase text-sm mb-4 text-gray-400">(02) WORKS</p>
                                <div className="flex items-end justify-between">
                                    <h2 className="font-sans text-3xl md:text-5xl text-white font-light">Work Highlights</h2>
                                    <Link to="/portfolio" className="animated-link-underline-light text-gray-200 hover:text-white font-semibold text-sm md:text-base">View All →</Link>
                                </div>
                            </div>
                        </div>
                        <div style={{ width: '100vw', marginLeft: '50%', transform: 'translateX(-50%)' }}>
                            <MarqueeGallery items={projects.map(p => ({ id: p.id, src: p.thumbnail, alt: p.title }))} />
                        </div>
                    </section>
                </div>
                
                <section id="services-section" ref={servicesContainerRef} className="relative z-30 bg-dark-bg text-white">
                    <div className="services-container">
                        <div className="services-sticky-wrapper">
                            <div className="relative h-full w-full">
                                {/* Left side pattern strip */}
                                <div className="absolute left-0 top-0 bottom-0 w-20 bg-gray-900/30 service-pattern-strip hidden md:block"></div>
                                
                                {/* Main content grid */}
                                <div className="container mx-auto h-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center pl-0 md:pl-24">
                                    {isMobile ? (
                                        /* Mobile: Combined layout - each service grouped together */
                                        <div className="w-full space-y-16 md:space-y-0">
                                            {SERVICES.map((service, index) => (
                                                <div key={index} className="relative py-8">
                                                    {/* Background number */}
                                                    <div className="absolute left-0 top-1/2 -translate-y-1/2 service-bg-number">0{index + 1}</div>
                                                    
                                                    <div className="relative z-10 max-w-lg px-4">
                                                        {/* Service Label */}
                                                        <div className="flex items-center gap-4 mb-6">
                                                            <p className="service-phase-text">Service {index + 1}</p>
                                                            <div className="h-[1px] w-20 bg-gray-400"></div>
                                                        </div>
                                                        
                                                        {/* Title */}
                                                        <h3 className="font-sans text-4xl md:text-5xl lg:text-6xl font-light mb-8 text-white leading-tight service-main-title">
                                                            {service.title}
                                                        </h3>
                                                        
                                                        {/* Description */}
                                                        <p className="text-gray-300 mb-8 text-base md:text-lg leading-relaxed service-description">
                                                            {service.description}
                                                        </p>
                                                        
                                                        {/* Divider */}
                                                        <div className="h-[1px] w-full bg-gray-400 mb-8"></div>
                                                        
                                                        {/* Points */}
                                                        <ul className="service-points-list">
                                                            {service.points.map((point, pointIndex) => (
                                                                <li key={pointIndex} className="service-point-item text-base md:text-lg mb-4 text-gray-300 font-light">
                                                                    {point}
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <>
                                            {/* Desktop: Left side - Title */}
                                            <div className="overflow-hidden h-screen relative">
                                                <div className="w-full" style={{ transform: `translateY(-${serviceTextTranslateY}px)` }}>
                                                    {SERVICES.map((service, index) => (
                                                        <div key={index} data-index={index} className="service-text-item h-screen flex items-center relative">
                                                            {/* Background number */}
                                                            <div className="absolute left-0 top-1/2 -translate-y-1/2 service-bg-number">0{index + 1}</div>
                                                            
                                                            <div className="relative z-10 max-w-lg px-4 md:px-0">
                                                                <div className="flex items-center gap-4 mb-6">
                                                                    <p className="service-phase-text">Service {index + 1}</p>
                                                                    <div className="h-[1px] w-20 bg-gray-400"></div>
                                                                </div>
                                                                <h3 className="font-sans text-4xl md:text-5xl lg:text-6xl font-light mb-0 text-white leading-tight service-main-title">
                                                                    {service.title}
                                                                </h3>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            
                                            {/* Desktop: Right side - Description and Points */}
                                            <div className="overflow-hidden h-screen relative">
                                                <div className="w-full" style={{ transform: `translateY(-${serviceTextTranslateY}px)` }}>
                                                    {SERVICES.map((service, index) => (
                                                        <div key={index} className="service-text-item h-screen flex items-center">
                                                            <div className="max-w-lg px-4 md:px-0">
                                                                <p className="text-gray-300 mb-8 text-base md:text-lg leading-relaxed service-description">
                                                                    {service.description}
                                                                </p>
                                                                <div className="h-[1px] w-full bg-gray-400 mb-8"></div>
                                                                <ul className="service-points-list">
                                                                    {service.points.map((point, pointIndex) => (
                                                                        <li key={pointIndex} className="service-point-item text-base md:text-lg mb-4 text-gray-300 font-light">
                                                                            {point}
                                                                        </li>
                                                                    ))}
                                                                </ul>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                                
                                {/* Vertical Navigation Indicator - Right Edge */}
                                <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-4 service-nav-indicator">
                                    {SERVICES.map((_, index) => (
                                        <div key={index} className="relative flex flex-col items-center">
                                            <div className={`service-nav-number ${activeServiceIndex === index ? 'active' : ''}`}>
                                                0{index + 1}
                                            </div>
                                            {index < SERVICES.length - 1 && (
                                                <div className={`service-nav-line ${activeServiceIndex === index ? 'active' : ''}`}></div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                                
                                {/* Scroll Indicator - Bottom Center */}
                                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 service-scroll-indicator hidden md:block">
                                    SCROLL
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
                
                {/* Recent Blog Strip */}
                <section id="recent-blog-section" className="bg-white text-black py-12 border-t border-gray-200">
                    <div className="container mx-auto px-6">
                        <div className="mb-8 flex items-end justify-between">
                            <div>
                                <p className="tracking-widest uppercase text-sm mb-2 text-gray-500">(04) Recent Blog</p>
                                <h2 className="font-sans text-2xl md:text-4xl font-light">Latest Posts</h2>
                            </div>
                            <Link to="/blog" className="animated-link-underline inline-block text-black font-semibold text-sm md:text-base">View More →</Link>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                            {[...blogPosts]
                                .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                                .slice(0, 3)
                                .map((post) => (
                                    <Link key={post.id} to={`/blog/${post.id}`} className="block">
                                        <div className="rounded-lg border border-gray-200 overflow-hidden hover:shadow transition-shadow bg-white">
                                            <div className="w-full aspect-[3/2] bg-gray-100">
                                                <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover" />
                                            </div>
                                            <div className="p-3">
                                                <p className="text-sm font-medium line-clamp-2">{post.title}</p>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                        </div>
                    </div>
                </section>

                {/* Solid spacer to prevent hero showing through */}
                <div className="h-8 bg-white"></div>

                <section id="contact-section" className="contact-cta-section relative bg-dark-bg z-40 overflow-visible">
                    <Link to="/contact" className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen text-center text-white p-6">
                        {/* Interactive Floating Coffee Doodle */}
                        <InteractiveCoffeeDoodle />
                        <h2 className="font-sans text-2xl md:text-3xl font-light text-white/90 mb-4">Fuel me with coffee</h2>
                        <p className="font-sans text-sm md:text-base text-gray-400 mt-4 px-4">And I'll fuel your brand with design.</p>
                    </Link>
                </section>
            </div>
        </div>
    );
};

export const PortfolioPage: React.FC = () => {
    const { projects } = useData();
    const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

    return (
        <div className="bg-dark-bg min-h-screen">
            {/* Projects - List View (Default) */}
            {viewMode === 'list' && (
                <div className="portfolio-list-view">
                    {projects.map((project, index) => (
                        <Link 
                            to={`/portfolio/${project.id}`} 
                            key={project.id} 
                            className="portfolio-list-item group block relative w-full"
                            style={{ margin: 0, padding: 0 }}
                        >
                            <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden" style={{ margin: 0, padding: 0 }}>
                                <img 
                                    src={project.thumbnail} 
                                    alt={project.title} 
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                    style={{ display: 'block', margin: 0, padding: 0 }}
                                />
                            </div>
                        </Link>
                    ))}
                </div>
            )}

            {/* Projects - Grid View */}
            {viewMode === 'grid' && (
                <div className="container mx-auto px-6 pb-12">
                    <div className="portfolio-grid-view grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 md:gap-4">
                        {projects.map(project => (
                            <Link 
                                to={`/portfolio/${project.id}`} 
                                key={project.id} 
                                className="portfolio-grid-item group block relative overflow-hidden"
                            >
                                <div className="relative w-full aspect-[4/3] overflow-hidden">
                                    <img 
                                        src={project.thumbnail} 
                                        alt={project.title} 
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                    />
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}

            {/* View Toggle - Small Icon Buttons Bottom Right */}
            <div className="fixed bottom-6 right-6 z-60 portfolio-view-toggle">
                <div className="flex flex-col gap-2">
                    <button
                        onClick={() => setViewMode('list')}
                        className={`portfolio-toggle-icon-btn ${viewMode === 'list' ? 'active' : ''}`}
                        aria-label="List view"
                    >
                        <HiOutlineViewList size={16} />
                    </button>
                    <button
                        onClick={() => setViewMode('grid')}
                        className={`portfolio-toggle-icon-btn ${viewMode === 'grid' ? 'active' : ''}`}
                        aria-label="Grid view"
                    >
                        <HiOutlineViewGrid size={16} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export const ProjectDetailPage: React.FC = () => {
    const { id } = useParams();
    const { projects } = useData();
    const project = projects.find(p => p.id === id);
    if (!project) return <div className="container mx-auto px-6 py-12 pt-16">Project not found.</div>;
    return (
        <>
            <div className="animate-fadeIn pt-16">
                <div className="container mx-auto px-6 py-12">
                    <div className="text-center mb-12">
                        <h1 className="font-display text-3xl md:text-5xl font-bold text-white">{project.title}</h1>
                        <p className="text-lg md:text-xl text-gray-400 mt-2">{project.client}</p>
                    </div>
                </div>
                
                {/* Images - Full Width, No Gaps */}
                <div className="project-detail-images">
                    {[project.thumbnail, ...(project.images || [])]
                        .filter(Boolean)
                        .map((img, index) => (
                            <img key={index} src={img as string} alt={`${project.title} - view ${index + 1}`} className="project-detail-image" />
                        ))}
                </div>
                
                <div className="container mx-auto px-6 py-12">
                    <div className="max-w-3xl mx-auto">
                        <h2 className="font-display text-3xl font-bold text-white mb-4">Project Description</h2>
                        <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
                    </div>
                </div>
            </div>
            
            <section className="project-cta-section py-20">
                <div className="container mx-auto px-6 text-center max-w-2xl">
                    <h2 className="font-sans text-2xl md:text-3xl lg:text-4xl text-white font-light mb-6"> Do you need something like this? <br /> Just say hi, and let's get started. </h2>
                    <Link to="/contact" className="project-cta-button inline-block"> Contact Now </Link>
                </div>
            </section>
            <div className="h-32" />
        </>
    );
};

export const BlogPage: React.FC = () => {
    const { blogPosts } = useData();
    
    const sortedPosts = [...blogPosts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    const latestPost = sortedPosts[0];
    const olderPosts = sortedPosts.slice(1);

    if (!latestPost) {
        return (
            <div className="container mx-auto px-6 py-12 pt-16 min-h-screen text-center">
                <h1 className="font-sans text-5xl font-bold mb-12 text-white">From the Blog</h1>
                <p>No posts yet. Check back soon!</p>
            </div>
        );
    }

    return (
        <>
            <div className="container mx-auto px-6 py-12 animate-fadeIn pt-16 min-h-screen">
                <h1 className="font-sans text-3xl md:text-5xl font-bold text-center mb-12 text-white">From the Blog</h1>
                
                <Link to={`/blog/${latestPost.id}`} className="blog-featured-post group">
                    <div className="blog-thumb-2x1">
                        <img src={latestPost.imageUrl} alt={latestPost.title} className="transition-transform duration-300 group-hover:scale-105" />
                    </div>
                    <div className="flex flex-col justify-center">
                        <p className="font-display uppercase tracking-widest text-brand-cyan mb-4 text-sm">Latest Post</p>
                        <h2 className="font-sans text-4xl font-bold text-white mb-4 group-hover:text-brand-cyan transition-colors">{latestPost.title}</h2>
                        <div className="blog-meta mb-4">
                            <span>{latestPost.date}</span>
                            <div className="blog-meta-dot"></div>
                            <span>{latestPost.views.toLocaleString()} Views</span>
                        </div>
                        <p className="text-gray-400 leading-relaxed">{latestPost.excerpt}</p>
                    </div>
                </Link>

                <div className="blog-older-posts-grid">
                    {olderPosts.map(post => <BlogCard key={post.id} post={post} />)}
                </div>
            </div>
            <div className="h-32" />
        </>
    );
};

// Like Button Component
const LikeButton: React.FC<{ postId: string }> = ({ postId }) => {
    const [likes, setLikes] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadLikes = async () => {
            try {
                // Check if user has already liked (using localStorage)
                const likeKey = `liked_post_${postId}`;
                const hasLiked = localStorage.getItem(likeKey) === 'true';
                setIsLiked(hasLiked);

                // Get total likes count from Supabase
                const { data, error } = await supabase
                    .from('blog_post_likes')
                    .select('id')
                    .eq('post_id', postId);

                if (!error && data) {
                    setLikes(data.length);
                } else {
                    // Fallback: use localStorage count if table doesn't exist
                    const storedLikes = localStorage.getItem(`likes_count_${postId}`);
                    if (storedLikes) {
                        setLikes(parseInt(storedLikes, 10));
                    }
                }
            } catch (e) {
                // Fallback to localStorage if Supabase fails
                const likeKey = `liked_post_${postId}`;
                const hasLiked = localStorage.getItem(likeKey) === 'true';
                setIsLiked(hasLiked);
                const storedLikes = localStorage.getItem(`likes_count_${postId}`);
                if (storedLikes) {
                    setLikes(parseInt(storedLikes, 10));
                }
            } finally {
                setIsLoading(false);
            }
        };
        loadLikes();
    }, [postId]);

    const handleLike = async () => {
        const likeKey = `liked_post_${postId}`;
        const hasLiked = localStorage.getItem(likeKey) === 'true';
        
        if (hasLiked) {
            // Unlike
            try {
                // Get user identifier
                let userId = localStorage.getItem(`user_id_${postId}`);
                if (userId) {
                    const { error } = await supabase
                        .from('blog_post_likes')
                        .delete()
                        .eq('post_id', postId)
                        .eq('user_id', userId);

                    if (!error) {
                        localStorage.removeItem(likeKey);
                        localStorage.removeItem(`user_id_${postId}`);
                        setIsLiked(false);
                        setLikes(prev => {
                            const newCount = Math.max(0, prev - 1);
                            localStorage.setItem(`likes_count_${postId}`, newCount.toString());
                            return newCount;
                        });
                    }
                } else {
                    // Fallback: just update localStorage
                    localStorage.removeItem(likeKey);
                    setIsLiked(false);
                    setLikes(prev => {
                        const newCount = Math.max(0, prev - 1);
                        localStorage.setItem(`likes_count_${postId}`, newCount.toString());
                        return newCount;
                    });
                }
            } catch (e) {
                // Fallback to localStorage
                localStorage.removeItem(likeKey);
                setIsLiked(false);
                setLikes(prev => {
                    const newCount = Math.max(0, prev - 1);
                    localStorage.setItem(`likes_count_${postId}`, newCount.toString());
                    return newCount;
                });
            }
        } else {
            // Like
            try {
                const userId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                localStorage.setItem(`user_id_${postId}`, userId);

                const { error } = await supabase
                    .from('blog_post_likes')
                    .insert([{ post_id: postId, user_id: userId }]);

                if (!error) {
                    localStorage.setItem(likeKey, 'true');
                    setIsLiked(true);
                    setLikes(prev => {
                        const newCount = prev + 1;
                        localStorage.setItem(`likes_count_${postId}`, newCount.toString());
                        return newCount;
                    });
                } else {
                    // Fallback to localStorage if insert fails
                    localStorage.setItem(likeKey, 'true');
                    setIsLiked(true);
                    setLikes(prev => {
                        const newCount = prev + 1;
                        localStorage.setItem(`likes_count_${postId}`, newCount.toString());
                        return newCount;
                    });
                }
            } catch (e) {
                // Fallback to localStorage
                localStorage.setItem(likeKey, 'true');
                setIsLiked(true);
                setLikes(prev => {
                    const newCount = prev + 1;
                    localStorage.setItem(`likes_count_${postId}`, newCount.toString());
                    return newCount;
                });
            }
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center gap-2 text-gray-400">
                <AiOutlineHeart size={20} />
                <span>...</span>
            </div>
        );
    }

    return (
        <button
            onClick={handleLike}
            className="flex items-center gap-2 px-4 py-2 rounded-md border border-gray-600 hover:border-brand-cyan transition-colors duration-300 bg-dark-card hover:bg-dark-card/80"
            aria-label={isLiked ? 'Unlike this post' : 'Like this post'}
        >
            {isLiked ? (
                <AiFillHeart size={20} className="text-red-500" />
            ) : (
                <AiOutlineHeart size={20} className="text-gray-400" />
            )}
            <span className="text-sm font-sans text-gray-300">{likes.toLocaleString()}</span>
        </button>
    );
};

// Comment Section Component
const CommentSection: React.FC<{ postId: string }> = ({ postId }) => {
    const [comments, setComments] = useState<Array<{ id: string; name: string; comment: string; date: string }>>([]);
    const [name, setName] = useState('');
    const [comment, setComment] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadComments = async () => {
            try {
                const { data, error } = await supabase
                    .from('blog_post_comments')
                    .select('*')
                    .eq('post_id', postId)
                    .order('created_at', { ascending: false });

                if (!error && data) {
                    setComments(data.map(c => ({
                        id: c.id,
                        name: c.name || 'Anonymous',
                        comment: c.comment,
                        date: new Date(c.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    })));
                } else if (error) {
                    // If table doesn't exist, load from localStorage
                    const storedComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
                    setComments(storedComments);
                }
            } catch (e) {
                // Fallback to localStorage
                const storedComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
                setComments(storedComments);
            } finally {
                setIsLoading(false);
            }
        };
        loadComments();
    }, [postId]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!name.trim() || !comment.trim()) return;

        setIsSubmitting(true);
        try {
            const { data, error } = await supabase
                .from('blog_post_comments')
                .insert([{ post_id: postId, name: name.trim(), comment: comment.trim() }])
                .select()
                .single();

            if (error) {
                // Check if table doesn't exist
                if (error.code === 'PGRST116' || error.message?.includes('does not exist')) {
                    // Fallback to localStorage
                    const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
                    const newComment = {
                        id: commentId,
                        name: name.trim(),
                        comment: comment.trim(),
                        date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                    };
                    
                    // Store in localStorage
                    const storedComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
                    storedComments.push(newComment);
                    localStorage.setItem(`comments_${postId}`, JSON.stringify(storedComments));
                    
                    setComments(prev => [newComment, ...prev]);
                    setName('');
                    setComment('');
                    alert('Comment posted! (Note: Supabase table not found. Comment saved locally. Please create the blog_post_comments table in Supabase for persistent storage.)');
                } else {
                    console.error('Supabase error:', error);
                    alert(`Failed to submit comment: ${error.message || 'Unknown error'}. Please check the browser console for details.`);
                }
            } else if (data) {
                setComments(prev => [{
                    id: data.id,
                    name: data.name || 'Anonymous',
                    comment: data.comment,
                    date: new Date(data.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
                }, ...prev]);
                setName('');
                setComment('');
            }
        } catch (e: any) {
            console.error('Failed to submit comment:', e);
            // Fallback to localStorage on any error
            const commentId = `comment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            const newComment = {
                id: commentId,
                name: name.trim(),
                comment: comment.trim(),
                date: new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            };
            
            const storedComments = JSON.parse(localStorage.getItem(`comments_${postId}`) || '[]');
            storedComments.push(newComment);
            localStorage.setItem(`comments_${postId}`, JSON.stringify(storedComments));
            
            setComments(prev => [newComment, ...prev]);
            setName('');
            setComment('');
            alert('Comment posted! (Saved locally. Please create the blog_post_comments table in Supabase for persistent storage.)');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="mt-12 pt-8 border-t border-gray-700">
            <h3 className="font-sans text-2xl font-light text-white mb-6">Comments ({comments.length})</h3>
            
            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-8 space-y-4">
                <input
                    type="text"
                    placeholder="Your Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-dark-card border border-dark-border focus:border-brand-cyan focus:ring-0 rounded-md px-4 py-2 text-white placeholder-gray-500 transition-colors duration-300"
                    required
                />
                <textarea
                    placeholder="Write a comment..."
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    rows={4}
                    className="w-full bg-dark-card border border-dark-border focus:border-brand-cyan focus:ring-0 rounded-md px-4 py-2 text-white placeholder-gray-500 transition-colors duration-300 resize-none"
                    required
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2 bg-brand-cyan/10 border border-brand-cyan text-brand-cyan font-sans text-sm rounded-md hover:bg-brand-cyan hover:text-dark-bg transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isSubmitting ? 'Posting...' : 'Post Comment'}
                </button>
            </form>

            {/* Comments List */}
            {isLoading ? (
                <div className="text-gray-400 text-sm">Loading comments...</div>
            ) : comments.length === 0 ? (
                <div className="text-gray-400 text-sm">No comments yet. Be the first to comment!</div>
            ) : (
                <div className="space-y-6">
                    {comments.map((c) => (
                        <div key={c.id} className="bg-dark-card border border-dark-border rounded-md p-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-cyan font-sans text-sm font-semibold">
                                    {c.name.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                    <div className="font-sans text-sm font-medium text-white">{c.name}</div>
                                    <div className="font-sans text-xs text-gray-400">{c.date}</div>
                                </div>
                            </div>
                            <p className="font-sans text-sm text-gray-300 leading-relaxed ml-11">{c.comment}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export const BlogPostPage: React.FC = () => {
    const { id } = useParams();
    const { blogPosts } = useData();
    const post = blogPosts.find(p => p.id === id);
    if (!post) return <div className="container mx-auto px-6 py-12 pt-16">Post not found.</div>;
    
    useEffect(() => {
        // Increment real view count once per device per post within a cooldown
        const cooldownHours = 12;
        const storageKey = `viewed_post_${post.id}`;
        const lastViewed = localStorage.getItem(storageKey);
        const now = Date.now();
        const shouldIncrement = !lastViewed || (now - parseInt(lastViewed, 10)) > cooldownHours * 60 * 60 * 1000;
        if (!shouldIncrement) return;

        const increment = async () => {
            try {
                const { error } = await supabase
                    .from('blog_posts')
                    .update({ views: (post.views || 0) + 1 })
                    .eq('id', post.id);
                if (!error) {
                    localStorage.setItem(storageKey, now.toString());
                }
            } catch (e) {
                console.error('Failed to increment view:', e);
            }
        };
        increment();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [post?.id]);
    return (
        <>
            <div className="container mx-auto px-6 py-12 animate-fadeIn pt-16">
                <div className="max-w-3xl mx-auto blog-post-content">
                    <h1 className="font-sans text-3xl md:text-5xl font-bold text-white leading-tight">{post.title}</h1>
                    <div className="blog-meta my-4">
                        <span>{post.date}</span>
                        <div className="blog-meta-dot"></div>
                        <span>By {post.author}</span>
                        <div className="blog-meta-dot"></div>
                        <span>{post.views.toLocaleString()} Views</span>
                    </div>
                    <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover rounded-lg my-8 shadow-lg" />
                    <div className="prose prose-invert prose-lg text-gray-300 leading-relaxed whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: post.content || '' }} />
                    
                    {/* Like Button */}
                    <div className="mt-8">
                        <LikeButton postId={post.id} />
                    </div>
                    
                    {/* Comment Section */}
                    <CommentSection postId={post.id} />
                </div>
            </div>
            <div className="h-32" />
        </>
    );
};

export const AboutPage: React.FC = () => {
    const { settings } = useData();
    return (
        <>
            <section className="bg-white min-h-screen flex items-center py-20">
                <div className="container mx-auto px-6 animate-fadeIn">
                    <div className="grid grid-cols-1 md:grid-cols-10 gap-12 items-center">
                        <div className="w-full max-w-sm mx-auto md:col-span-3">
                            <CreativeImageFrame imageUrl={settings.about.photo} />
                        </div>
                        <div className="md:col-span-7 text-center md:text-left">
                             <h1 className="font-sans text-3xl md:text-5xl font-bold text-black mb-6">About Me</h1>
                             <p className="text-black text-base md:text-lg leading-spacious whitespace-pre-wrap">{settings.about.bio}</p>
                        </div>
                    </div>
                </div>
            </section>
            <section className="bg-dark-bg py-20">
                <div className="container mx-auto px-6">
                    <h2 className="font-sans text-2xl md:text-4xl font-bold text-white text-center mb-12">Work History</h2>
                    <div className="timeline-container">
                        {WORK_HISTORY.map((job, index) => (
                            <div key={index} className="timeline-item">
                                <p className="timeline-years">{job.years}</p>
                                <h3 className="timeline-title">{job.title}</h3>
                                <p className="timeline-company">{job.company}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <section className="facts-section py-20">
                <div className="container mx-auto px-6">
                    <h2 className="font-sans text-2xl md:text-4xl font-bold text-black text-center mb-12">By the Numbers</h2>
                    <div className="facts-grid">
                        {FACTS.map((fact, index) => (
                            <div key={index} className="fact-card">
                                <p className="fact-number">{fact.number}</p>
                                <p className="fact-text">{fact.text}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
            <div className="h-32" />
        </>
    );
};

export const ContactPage: React.FC = () => {
    const { settings } = useData();
    const [toastMessage, setToastMessage] = useState('');
    const [showToast, setShowToast] = useState(false);
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', message: '' });
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Initialize EmailJS on component mount
    useEffect(() => {
        initEmailJS();
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (isSubmitting) return;
        
        setIsSubmitting(true);
        
        try {
            const result = await sendContactEmail(formData);
            triggerToast(result.message);
            
            if (result.success) {
                setFormData({ name: '', email: '', phone: '', message: '' });
            }
        } catch (error) {
            console.error('Error submitting form:', error);
            triggerToast('Failed to send message. Please try again later.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const triggerToast = (message: string) => {
        setToastMessage(message);
        setShowToast(true);
        setTimeout(() => setShowToast(false), 3000);
    };

    const handleSocialClick = (platform: 'instagram' | 'facebook') => {
        triggerToast(platform === 'instagram' ? "Rishad is currently off the grid on Instagram, focusing on creating." : "Rishad prefers real connections over Facebook's algorithms.");
    };

    return (
        <div className="contact-page-light">
            <div className="container mx-auto px-6 py-12 pt-20 min-h-screen animate-fadeIn">
                <div className="max-w-2xl mx-auto text-center">
                    <h1 className="font-sans text-3xl md:text-5xl font-bold text-black">Get in Touch</h1>
                    <p className="text-gray-600 mt-4 text-base md:text-lg">Have a project in mind or just want to say hello? Drop me a line.</p>
                </div>
                <div className="max-w-2xl mx-auto mt-12">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <input name="name" type="text" placeholder="Your Name *" value={formData.name} onChange={handleInputChange} required className="w-full form-input-light rounded-md px-4 py-3" />
                        <input name="email" type="email" placeholder="Your Email *" value={formData.email} onChange={handleInputChange} required className="w-full form-input-light rounded-md px-4 py-3" />
                        <input name="phone" type="tel" placeholder="Your Phone (Optional)" value={formData.phone} onChange={handleInputChange} className="w-full form-input-light rounded-md px-4 py-3" />
                        <textarea name="message" placeholder="Your Message *" rows={6} value={formData.message} onChange={handleInputChange} required className="w-full form-input-light rounded-md px-4 py-3"></textarea>
                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className={`w-full btn-primary-dark py-3 rounded-md ${isSubmitting ? 'opacity-70 cursor-not-allowed' : ''}`}
                        >
                            {isSubmitting ? 'Sending...' : 'Send Message'}
                        </button>
                    </form>
                </div>
                <div className="max-w-2xl mx-auto mt-12 text-center">
                    <div className="social-links-container">
                        <a href={settings.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon-dark" aria-label="LinkedIn">
                           <SiLinkedin size={24} />
                        </a>
                        <a href={settings.social.behance} target="_blank" rel="noopener noreferrer" className="social-icon-dark" aria-label="Behance">
                            <SiBehance size={24} />
                        </a>
                        <button onClick={() => handleSocialClick('instagram')} className="social-icon-dark" aria-label="Instagram">
                             <SiInstagram size={24} />
                        </button>
                        <button onClick={() => handleSocialClick('facebook')} className="social-icon-dark" aria-label="Facebook">
                            <SiFacebook size={24} />
                        </button>
                    </div>
                </div>
            </div>
            <div className={`custom-toast ${showToast ? 'show' : ''}`} role="alert"> {toastMessage} </div>
            <div className="h-32" />
        </div>
    );
};

// NEW: Services standalone page
export const ServicesPage: React.FC = () => {
    const [activeIndex, setActiveIndex] = useState(0);
    const [translateY, setTranslateY] = useState(0);
    const [isMobile, setIsMobile] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const onResize = () => setIsMobile(window.innerWidth < 768);
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);

    useEffect(() => {
        const container = containerRef.current;
        if (!container || isMobile) return;
        const onScroll = () => {
            const top = container.offsetTop;
            const h = container.offsetHeight;
            const vh = window.innerHeight;
            const y = window.scrollY;
            const start = top;
            const end = top + h - vh;
            if (y < start) { setTranslateY(0); setActiveIndex(0); return; }
            if (y > end) { setTranslateY(Math.max(0, h - vh)); setActiveIndex(SERVICES.length - 1); return; }
            const sc = y - start;
            setTranslateY(sc);
            const progress = Math.min(sc / Math.max(1, h - vh), 1);
            setActiveIndex(Math.min(SERVICES.length - 1, Math.max(0, Math.floor(progress * SERVICES.length))));
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true } as any);
        window.addEventListener('resize', onScroll);
        return () => { window.removeEventListener('scroll', onScroll); window.removeEventListener('resize', onScroll); };
    }, [isMobile]);

    const ALL_SERVICES = [
        'Logo Design','Social Media Video Ads','Shopify Store Design & Setup','Business Cards Design','Explainer Videos','Product Visualization','Landing Page Design','Presentation Design','Social Media Post Design','Brand Guidelines Development','Package & Label Design','Wireframing & Prototyping','Motion Graphics Animation','SEO-Friendly Creative Content','Brochure Design','Infographics Design','Logo Animation','Event Promo Videos','WordPress Website Design','Corporate Profile Design','3D Product Mockups','E-commerce Store Design','Paid Ads Creatives (Google / Meta)','3D Modeling','Campaign Creative Strategy','Usability Testing & Improvements','Pitch Deck Design','Flyer & Poster Design','Event & Exhibition Branding','Web Banners & Hero Images','Content Planning & Calendar Creation','Dashboard / ERP UI Design','3D Logo Animation','Corporate Video Editing','Email Marketing Templates','Rebranding Solutions','Brand Positioning Support','Advertising Materials (banners, roll-ups, signage)','Reels / Shorts / TikTok Editing','User Journey & Flow Mapping','Website UI/UX Design','Creative Campaign Strategy','Copywriting for Ads & Creatives','Product Showcase Videos','Architectural Visualization','Landing Page Optimization','Product Image Enhancement & Mockups'
    ];

    const BIG_KEYWORDS = ['logo', 'brand', 'branding', 'social media', 'e-commerce', 'website', 'ui', 'ux', 'shopify', 'wordpress'];

    const getWeightClass = (name: string) => {
        const lower = name.toLowerCase();
        const big = BIG_KEYWORDS.some(k => lower.includes(k));
        if (big) return 'text-2xl md:text-4xl font-bold';
        if (name.length <= 18) return 'text-xl md:text-2xl font-semibold';
        return 'text-base md:text-lg font-medium';
    };

    return (
        <div className="bg-dark-bg text-white">
            <section className="relative z-10">
                <div className="services-container" ref={containerRef}>
                    <div className="services-sticky-wrapper">
                        <div className="relative h-full w-full">
                            {/* Left side pattern strip */}
                            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gray-900/30 service-pattern-strip hidden md:block"></div>
                            
                            {/* Main content grid */}
                            <div className="container mx-auto h-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center pl-0 md:pl-24">
                                {/* Left side - Title */}
                                <div className={`overflow-hidden ${isMobile ? '' : 'h-screen'} relative`}>
                                    <div className="w-full" style={!isMobile ? { transform: `translateY(-${translateY}px)` } : undefined}>
                                        {SERVICES.map((service, index) => (
                                            <div key={index} className={`service-text-item ${isMobile ? '' : 'h-screen'} flex items-center relative`}>
                                                {/* Background number */}
                                                <div className="absolute left-0 top-1/2 -translate-y-1/2 service-bg-number">0{index + 1}</div>
                                                
                                                <div className="relative z-10 max-w-lg px-4 md:px-0">
                                                    <div className="flex items-center gap-4 mb-6">
                                                        <p className="service-phase-text">Service {index + 1}</p>
                                                        <div className="h-[1px] w-20 bg-gray-400"></div>
                                                    </div>
                                                    <h3 className="font-sans text-4xl md:text-5xl lg:text-6xl font-light mb-0 text-white leading-tight service-main-title">
                                                        {service.title}
                                                    </h3>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                
                                {/* Right side - Description and Points */}
                                <div className={`overflow-hidden ${isMobile ? '' : 'h-screen'} relative`}>
                                    <div className="w-full" style={!isMobile ? { transform: `translateY(-${translateY}px)` } : undefined}>
                                        {SERVICES.map((service, index) => (
                                            <div key={index} className={`service-text-item ${isMobile ? '' : 'h-screen'} flex items-center`}>
                                                <div className="max-w-lg px-4 md:px-0">
                                                    <p className="text-gray-300 mb-8 text-base md:text-lg leading-relaxed service-description">
                                                        {service.description}
                                                    </p>
                                                    <div className="h-[1px] w-full bg-gray-400 mb-8"></div>
                                                    <ul className="service-points-list">
                                                        {service.points.map((point, pointIndex) => (
                                                            <li key={pointIndex} className="service-point-item text-base md:text-lg mb-4 text-gray-300 font-light">
                                                                {point}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            
                            {/* Vertical Navigation Indicator - Right Edge */}
                            <div className="absolute right-8 top-1/2 -translate-y-1/2 hidden md:flex flex-col items-center gap-4 service-nav-indicator">
                                {SERVICES.map((_, index) => (
                                    <div key={index} className="relative flex flex-col items-center">
                                        <div className={`service-nav-number ${activeIndex === index ? 'active' : ''}`}>
                                            0{index + 1}
                                        </div>
                                        {index < SERVICES.length - 1 && (
                                            <div className={`service-nav-line ${activeIndex === index ? 'active' : ''}`}></div>
                                        )}
                                    </div>
                                ))}
                            </div>
                            
                            {/* Scroll Indicator - Bottom Center */}
                            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 service-scroll-indicator hidden md:block">
                                SCROLL
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section className="project-cta-section py-20">
                <div className="container mx-auto px-6 text-center max-w-2xl">
                    <h2 className="font-sans text-2xl md:text-3xl lg:text-4xl text-white font-light mb-6">
                        Ready to start a project together?
                        <br />
                        Tell me what you need and I’ll help you ship it.
                    </h2>
                    <Link to="/contact" className="project-cta-button inline-block"> Contact Now </Link>
                </div>
            </section>
            <div className="h-32" />
        </div>
    );
};

// --- ADMIN PAGES ---
const AdminButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger', size?: 'sm' | 'md', loading?: boolean }> = ({ children, variant = 'primary', size = 'md', loading = false, disabled, ...props }) => {
    const variants = { primary: 'btn-admin-primary', secondary: 'btn-admin-secondary', danger: 'btn-admin-danger' };
    const sizes = { sm: 'sm', md: '' };
    return (
        <button 
            {...props} 
            disabled={disabled || loading}
            className={`btn-admin ${variants[variant]} ${sizes[size]} ${loading ? 'opacity-70 cursor-not-allowed' : ''}`}
        >
            {loading ? (
                <div className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                </div>
            ) : children}
        </button>
    );
};

const handleFileRead = (file: File, callback: (result: string) => void) => {
    const reader = new FileReader();
    reader.onload = () => callback(reader.result as string);
    reader.readAsDataURL(file);
};

export const AdminLoginPage: React.FC = () => {
    const { login } = useData();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');

        try {
            const result = await login(password);
            if (result.success) {
                navigate('/admin');
            } else {
                setError(result.message);
            }
        } catch (error) {
            setError('Login failed. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="h-screen flex items-center justify-center admin-light-theme">
            <div className="w-full max-w-sm p-8 admin-card">
                <h1 className="font-sans text-3xl font-bold tracking-widest text-center mb-2">ADMIN LOGIN</h1>
                <p className="text-center text-gray-600 text-sm mb-8">Secure access to portfolio management</p>
                <form onSubmit={handleLogin} className="space-y-6">
                    <div>
                        <label className="form-label-light block mb-2">Password</label>
                        <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter admin password" 
                            className="form-input-admin-light" 
                            disabled={isLoading}
                            required
                        />
                    </div>
                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded text-sm">
                            {error}
                        </div>
                    )}
                    <AdminButton 
                        type="submit" 
                        className="w-full" 
                        disabled={isLoading || !password.trim()}
                    >
                        {isLoading ? 'Authenticating...' : 'Login'}
                    </AdminButton>
                </form>
                <div className="mt-6 text-center text-xs text-gray-500">
                    <p>Session persists until manual logout</p>
                    <p>Failed attempts are rate limited</p>
                </div>
            </div>
        </div>
    );
};

export const AdminDashboardPage: React.FC = () => {
    const { projects, blogPosts } = useData();
    const totalReaders = useMemo(() => blogPosts.reduce((sum, p) => sum + (p.views || 0), 0), [blogPosts]);
    return (
        <div>
            <PageTitle subtitle="Welcome to your content management hub.">Dashboard</PageTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="admin-card p-6">
                    <h3 className="admin-page-subtitle font-semibold">Total Projects</h3>
                    <p className="text-4xl font-bold mt-2">{projects.length}</p>
                </div>
                <div className="admin-card p-6">
                    <h3 className="admin-page-subtitle font-semibold">Total Blog Posts</h3>
                    <p className="text-4xl font-bold mt-2">{blogPosts.length}</p>
                </div>
                <div className="admin-card p-6">
                    <h3 className="admin-page-subtitle font-semibold">Total Readers</h3>
                    <p className="text-4xl font-bold mt-2">{totalReaders.toLocaleString()}</p>
                </div>
            </div>
            <div className="mt-12">
                <h2 className="font-sans text-2xl font-bold mb-4">Quick Links</h2>
                 <div className="flex flex-wrap gap-4">
                    <Link to="/admin/portfolio"><AdminButton>Manage Portfolio</AdminButton></Link>
                    <Link to="/admin/blog"><AdminButton>Manage Blog</AdminButton></Link>
                    <Link to="/admin/services"><AdminButton>Manage Services</AdminButton></Link>
                    <Link to="/admin/settings"><AdminButton>Manage Settings</AdminButton></Link>
                </div>
            </div>
        </div>
    );
};

export const AdminPortfolioManager: React.FC = () => {
    const { projects, deleteProject, setFeaturedProject } = useData();
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <PageTitle subtitle="Add, edit, and manage your portfolio projects.">Portfolio Manager</PageTitle>
                <Link to="/admin/portfolio/add"> <AdminButton>New Project</AdminButton> </Link>
            </div>
            <div className="admin-card overflow-hidden">
                <table className="admin-table">
                    <thead>
                        <tr><th>Title</th><th>Client</th><th>Category</th><th className="text-center">Featured</th><th className="text-right">Actions</th></tr>
                    </thead>
                    <tbody>
                        {projects.map(p => (
                            <tr key={p.id}>
                                <td><p className="admin-table-title">{p.title}</p></td>
                                <td><p className="admin-table-meta">{p.client}</p></td>
                                <td><p className="admin-table-meta">{p.category}</p></td>
                                <td className="text-center">
                                    <button onClick={() => setFeaturedProject(p.id)} className={`w-6 h-6 rounded-full ${p.isFeatured ? 'bg-black' : 'bg-gray-300'}`} aria-label={`Set ${p.title} as featured`}></button>
                                </td>
                                <td>
                                    <div className="flex justify-end space-x-2">
                                        <Link to={`/admin/portfolio/edit/${p.id}`}> <AdminButton variant="secondary" size="sm">Edit</AdminButton> </Link>
                                        <AdminButton variant="danger" size="sm" onClick={() => deleteProject(p.id)}>Delete</AdminButton>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

// Quick stats component for table display
const PostEngagementStats: React.FC<{ postId: string }> = ({ postId }) => {
    const [stats, setStats] = useState({ likes: 0, comments: 0 });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const loadStats = async () => {
            try {
                const [likesRes, commentsRes] = await Promise.all([
                    supabase.from('blog_post_likes').select('id').eq('post_id', postId),
                    supabase.from('blog_post_comments').select('id').eq('post_id', postId)
                ]);

                setStats({
                    likes: likesRes.data?.length || 0,
                    comments: commentsRes.data?.length || 0
                });
            } catch (e) {
                console.error('Failed to load stats:', e);
            } finally {
                setIsLoading(false);
            }
        };
        loadStats();
    }, [postId]);

    if (isLoading) {
        return <span className="text-gray-400 text-sm">Loading...</span>;
    }

    return (
        <div className="flex items-center gap-3 text-sm">
            <span className="text-gray-300">
                <AiFillHeart size={14} className="inline text-red-500 mr-1" />
                {stats.likes}
            </span>
            <span className="text-gray-300">
                💬 {stats.comments}
            </span>
        </div>
    );
};

// Admin component to view and manage comments and likes
const AdminPostEngagement: React.FC<{ postId: string; postTitle: string }> = ({ postId, postTitle }) => {
    const [comments, setComments] = useState<Array<{ id: string; name: string; comment: string; date: string; created_at: string }>>([]);
    const [likes, setLikes] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const loadEngagement = async () => {
        setIsLoading(true);
        try {
            // Load comments
            const { data: commentsData, error: commentsError } = await supabase
                .from('blog_post_comments')
                .select('*')
                .eq('post_id', postId)
                .order('created_at', { ascending: false });

            if (!commentsError && commentsData) {
                setComments(commentsData.map(c => ({
                    id: c.id,
                    name: c.name || 'Anonymous',
                    comment: c.comment,
                    date: new Date(c.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
                    created_at: c.created_at
                })));
            }

            // Load likes count
            const { data: likesData, error: likesError } = await supabase
                .from('blog_post_likes')
                .select('id')
                .eq('post_id', postId);

            if (!likesError && likesData) {
                setLikes(likesData.length);
            }
        } catch (e) {
            console.error('Failed to load engagement:', e);
        } finally {
            setIsLoading(false);
        }
    };

    const handleDeleteComment = async (commentId: string) => {
        if (!confirm('Are you sure you want to delete this comment?')) return;

        try {
            const { error } = await supabase
                .from('blog_post_comments')
                .delete()
                .eq('id', commentId);

            if (!error) {
                setComments(prev => prev.filter(c => c.id !== commentId));
            } else {
                alert('Failed to delete comment. Please try again.');
            }
        } catch (e) {
            console.error('Failed to delete comment:', e);
            alert('Failed to delete comment. Please try again.');
        }
    };

    useEffect(() => {
        if (isOpen) {
            loadEngagement();
        }
    }, [isOpen, postId]);

    return (
        <>
            <AdminButton 
                variant="secondary" 
                size="sm" 
                onClick={() => setIsOpen(true)}
            >
                View Engagement
            </AdminButton>

            {isOpen && (
                <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
                    <div className="bg-dark-card border border-dark-border rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
                        <div className="p-6 border-b border-dark-border flex justify-between items-center">
                            <div>
                                <h3 className="font-sans text-xl font-semibold text-white">Engagement for: {postTitle}</h3>
                                <p className="text-sm text-gray-400 mt-1">{likes} Likes • {comments.length} Comments</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="text-gray-400 hover:text-white text-2xl font-bold"
                                aria-label="Close"
                            >
                                ×
                            </button>
                        </div>

                        <div className="overflow-y-auto flex-1 p-6 space-y-6">
                            {/* Likes Section */}
                            <div>
                                <h4 className="font-sans text-lg font-semibold text-white mb-4">Likes: {likes}</h4>
                                {likes === 0 ? (
                                    <p className="text-gray-400 text-sm">No likes yet.</p>
                                ) : (
                                    <div className="bg-dark-bg border border-dark-border rounded-md p-4">
                                        <p className="text-gray-300 text-sm">This post has {likes} {likes === 1 ? 'like' : 'likes'}.</p>
                                    </div>
                                )}
                            </div>

                            {/* Comments Section */}
                            <div>
                                <h4 className="font-sans text-lg font-semibold text-white mb-4">Comments: {comments.length}</h4>
                                {isLoading ? (
                                    <p className="text-gray-400 text-sm">Loading comments...</p>
                                ) : comments.length === 0 ? (
                                    <p className="text-gray-400 text-sm">No comments yet.</p>
                                ) : (
                                    <div className="space-y-4">
                                        {comments.map((comment) => (
                                            <div key={comment.id} className="bg-dark-bg border border-dark-border rounded-md p-4">
                                                <div className="flex justify-between items-start mb-2">
                                                    <div className="flex items-center gap-3">
                                                        <div className="w-8 h-8 rounded-full bg-brand-cyan/20 flex items-center justify-center text-brand-cyan font-sans text-sm font-semibold">
                                                            {comment.name.charAt(0).toUpperCase()}
                                                        </div>
                                                        <div>
                                                            <div className="font-sans text-sm font-medium text-white">{comment.name}</div>
                                                            <div className="font-sans text-xs text-gray-400">{comment.date}</div>
                                                        </div>
                                                    </div>
                                                    <AdminButton
                                                        variant="danger"
                                                        size="sm"
                                                        onClick={() => handleDeleteComment(comment.id)}
                                                    >
                                                        Delete
                                                    </AdminButton>
                                                </div>
                                                <p className="font-sans text-sm text-gray-300 leading-relaxed ml-11">{comment.comment}</p>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export const AdminBlogManager: React.FC = () => {
     const { blogPosts, deleteBlogPost } = useData();
    return (
        <div>
            <div className="flex justify-between items-center mb-8">
                <PageTitle subtitle="Create and manage your blog posts.">Blog Manager</PageTitle>
                <Link to="/admin/blog/add"> <AdminButton>New Post</AdminButton> </Link>
            </div>
            <div className="admin-card overflow-hidden">
                <table className="admin-table">
                    <thead><tr><th>Title</th><th>Date</th><th>Views</th><th>Engagement</th><th className="text-right">Actions</th></tr></thead>
                    <tbody>
                        {blogPosts.map(p => (
                            <tr key={p.id}>
                                <td><p className="admin-table-title">{p.title}</p></td>
                                <td><p className="admin-table-meta">{p.date}</p></td>
                                <td><p className="admin-table-meta">{p.views.toLocaleString()}</p></td>
                                <td>
                                    <PostEngagementStats postId={p.id} />
                                </td>
                                <td>
                                     <div className="flex justify-end space-x-2">
                                        <Link to={`/admin/blog/edit/${p.id}`}> <AdminButton variant="secondary" size="sm">Edit</AdminButton> </Link>
                                        <AdminPostEngagement postId={p.id} postTitle={p.title} />
                                        <AdminButton variant="danger" size="sm" onClick={() => deleteBlogPost(p.id)}>Delete</AdminButton>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export const AdminSettingsPage: React.FC = () => {
    const { settings, updateSettings, updatePassword } = useData();
    const [formState, setFormState] = useState<SiteSettings>(settings);
    const [showSuccess, setShowSuccess] = useState(false);
    const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
    const [passwordMessage, setPasswordMessage] = useState('');
    const [showPasswordForm, setShowPasswordForm] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

    useEffect(() => { setFormState(settings); }, [settings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormState(prev => ({ ...prev, [name]: value }));
    };

    const handleNestedChange = (section: keyof SiteSettings, field: string, value: string) => {
        setFormState(prev => ({ ...prev, [section]: { ...(prev[section] as object), [field]: value } }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'heroImage' | 'aboutPhoto') => {
        if (e.target.files && e.target.files[0]) {
            handleFileRead(e.target.files[0], (result) => {
                if (field === 'heroImage') setFormState(p => ({ ...p, heroImage: result }));
                else if (field === 'aboutPhoto') setFormState(p => ({ ...p, about: { ...p.about, photo: result } }));
            });
        }
    };
    
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await updateSettings(formState);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert("Failed to save settings. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordForm(prev => ({ ...prev, [name]: value }));
        setPasswordMessage('');
    };

    const handlePasswordSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            setPasswordMessage('New passwords do not match.');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            setPasswordMessage('New password must be at least 6 characters long.');
            return;
        }

        setIsUpdatingPassword(true);
        try {
            const result = await updatePassword(passwordForm.currentPassword, passwordForm.newPassword);
            setPasswordMessage(result.message);
            
            if (result.success) {
                setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
                setShowPasswordForm(false);
            }
        } catch (error) {
            setPasswordMessage('Failed to update password. Please try again.');
        } finally {
            setIsUpdatingPassword(false);
        }
    };

    return (
        <div>
            <PageTitle subtitle="Update your site's static content and contact info.">Content Settings</PageTitle>
            <div className="space-y-8 max-w-4xl">
                <div className="admin-card p-6">
                    <h3 className="font-sans text-xl mb-4">General Settings</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label-light block mb-2">Site Title (Browser Tab)</label>
                            <input name="siteTitle" value={formState.siteTitle} onChange={handleChange} className="form-input-admin-light"/>
                        </div>
                         <div>
                            <label className="form-label-light block mb-2">Hero Name (Homepage Large Text)</label>
                            <input name="heroName" value={formState.heroName} onChange={handleChange} className="form-input-admin-light"/>
                        </div>
                        <div>
                            <label className="form-label-light block mb-2">Hero Image</label>
                            <p className="form-input-hint">Recommended: 1920x1080px (16:9 ratio)</p>
                             <div className="image-upload-wrapper">
                                <img src={formState.heroImage} alt="Hero Preview" className="image-preview-admin" />
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'heroImage')} className="form-input-admin-light file-input flex-grow" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="admin-card p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-sans text-xl">Security Settings</h3>
                        <AdminButton 
                            variant="secondary" 
                            onClick={() => setShowPasswordForm(!showPasswordForm)}
                        >
                            {showPasswordForm ? 'Cancel' : 'Change Password'}
                        </AdminButton>
                    </div>
                    
                    {showPasswordForm && (
                        <form onSubmit={handlePasswordSubmit} className="space-y-4">
                            <div>
                                <label className="form-label-light block mb-2">Current Password</label>
                                <input 
                                    type="password" 
                                    name="currentPassword" 
                                    value={passwordForm.currentPassword} 
                                    onChange={handlePasswordChange} 
                                    className="form-input-admin-light"
                                    required
                                />
                            </div>
                            <div>
                                <label className="form-label-light block mb-2">New Password</label>
                                <input 
                                    type="password" 
                                    name="newPassword" 
                                    value={passwordForm.newPassword} 
                                    onChange={handlePasswordChange} 
                                    className="form-input-admin-light"
                                    required
                                    minLength={6}
                                />
                            </div>
                            <div>
                                <label className="form-label-light block mb-2">Confirm New Password</label>
                                <input 
                                    type="password" 
                                    name="confirmPassword" 
                                    value={passwordForm.confirmPassword} 
                                    onChange={handlePasswordChange} 
                                    className="form-input-admin-light"
                                    required
                                />
                            </div>
                            {passwordMessage && (
                                <div className={`px-4 py-3 rounded text-sm ${
                                    passwordMessage.includes('successfully') 
                                        ? 'bg-green-50 border border-green-200 text-green-700'
                                        : 'bg-red-50 border border-red-200 text-red-700'
                                }`}>
                                    {passwordMessage}
                                </div>
                            )}
                            <div className="flex space-x-4">
                                <AdminButton type="submit" loading={isUpdatingPassword}>Update Password</AdminButton>
                                <AdminButton type="button" variant="secondary" onClick={() => setShowPasswordForm(false)} disabled={isUpdatingPassword}>
                                    Cancel
                                </AdminButton>
                            </div>
                        </form>
                    )}
                    
                    {!showPasswordForm && (
                        <div className="text-gray-600 text-sm">
                            <p>• Password must be at least 6 characters long</p>
                            <p>• Current password: <span className="font-mono">Rishad@759#</span> (default)</p>
                            <p>• Click "Change Password" to update your admin password</p>
                        </div>
                    )}
                </div>

                <div className="admin-card p-6">
                    <h3 className="font-sans text-xl mb-4">About Section</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="form-label-light block mb-2">Bio</label>
                            <textarea rows={8} value={formState.about.bio} onChange={e => handleNestedChange('about', 'bio', e.target.value)} className="form-input-admin-light"/>
                        </div>
                         <div>
                            <label className="form-label-light block mb-2">Photo</label>
                            <p className="form-input-hint">Recommended: 400x400px (1:1 ratio)</p>
                             <div className="image-upload-wrapper">
                                <img src={formState.about.photo} alt="About Preview" className="image-preview-admin" />
                                <input type="file" accept="image/*" onChange={(e) => handleFileChange(e, 'aboutPhoto')} className="form-input-admin-light file-input flex-grow" />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="admin-card p-6">
                    <h3 className="font-sans text-xl mb-4">Social Media Links</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {Object.keys(formState.social).map((key) => (
                            <div key={key}>
                                <label className="form-label-light block mb-2 capitalize">{key}</label>
                                <input value={formState.social[key as keyof typeof formState.social]} onChange={e => handleNestedChange('social', key, e.target.value)} className="form-input-admin-light"/>
                            </div>
                        ))}
                    </div>
                </div>

                 <div className="text-right flex items-center justify-end">
                    {showSuccess && <p className="text-black mr-4">Settings saved successfully!</p>}
                    <AdminButton onClick={handleSave} loading={isSaving}>Save Settings</AdminButton>
                </div>
            </div>
        </div>
    );
};

const BLANK_PROJECT: Omit<Project, 'id'> = { title: '', client: '', category: 'Branding', description: '', thumbnail: '', images: [''], isFeatured: false };

export const AdminPortfolioEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { projects, addProject, updateProject } = useData();
    const isEditMode = id !== undefined;

    const [project, setProject] = useState(BLANK_PROJECT);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (isEditMode) {
            const existingProject = projects.find(p => p.id === id);
            if (existingProject) setProject(existingProject);
        }
    }, [id, projects, isEditMode]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setProject(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };
    
    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'thumbnail' | `image-${number}`) => {
        if (e.target.files && e.target.files[0]) {
            handleFileRead(e.target.files[0], (result) => {
                if (field === 'thumbnail') {
                    setProject(p => ({ ...p, thumbnail: result }));
                } else {
                    const index = parseInt(field.split('-')[1]);
                    const newImages = [...project.images];
                    newImages[index] = result;
                    setProject(p => ({ ...p, images: newImages }));
                }
            });
        }
    };

    const addImageInput = () => setProject(prev => ({ ...prev, images: [...prev.images, ''] }));
    const removeImageInput = (index: number) => {
        if (project.images.length > 1) setProject(prev => ({ ...prev, images: prev.images.filter((_, i) => i !== index) }));
    };

    const moveImageUp = (index: number) => {
        if (index > 0) {
            const newImages = [...project.images];
            [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
            setProject(prev => ({ ...prev, images: newImages }));
        }
    };

    const moveImageDown = (index: number) => {
        if (index < project.images.length - 1) {
            const newImages = [...project.images];
            [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
            setProject(prev => ({ ...prev, images: newImages }));
        }
    };

    const handleDragStart = (e: React.DragEvent, index: number) => {
        e.dataTransfer.setData('text/plain', index.toString());
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        const dragIndex = parseInt(e.dataTransfer.getData('text/plain'));
        if (dragIndex !== dropIndex) {
            const newImages = [...project.images];
            const draggedItem = newImages[dragIndex];
            newImages.splice(dragIndex, 1);
            newImages.splice(dropIndex, 0, draggedItem);
            setProject(prev => ({ ...prev, images: newImages }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate required fields
        if (!project.title.trim()) {
            alert("Please enter a project title.");
            return;
        }
        
        if (!project.client.trim()) {
            alert("Please enter a client name.");
            return;
        }
        
        if (!project.description.trim()) {
            alert("Please enter a project description.");
            return;
        }
        
        if (!project.thumbnail) {
            alert("Please upload a thumbnail image.");
            return;
        }
        
        setIsSubmitting(true);
        try {
            if (isEditMode) {
                await updateProject({ ...project, id });
            } else {
                await addProject(project);
            }
            navigate('/admin/portfolio');
        } catch (error) {
            console.error('Error saving project:', error);
            alert("Failed to save project. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div>
            <PageTitle>{isEditMode ? 'Edit Project' : 'Add New Project'}</PageTitle>
            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl pb-24">
                <div className="admin-card p-6 space-y-4">
                    <h3 className="font-sans text-xl">Project Details</h3>
                    <div>
                        <label className="form-label-light block mb-2">Project Title</label>
                        <input name="title" value={project.title} onChange={handleChange} required className="form-input-admin-light" />
                    </div>
                    <div>
                        <label className="form-label-light block mb-2">Client Name</label>
                        <input name="client" value={project.client} onChange={handleChange} required className="form-input-admin-light" />
                    </div>
                    <div>
                        <label className="form-label-light block mb-2">Category</label>
                        <select name="category" value={project.category} onChange={handleChange} className="form-input-admin-light">
                            <option>Branding</option> <option>UI/UX</option> <option>Marketing & Creatives</option>
                        </select>
                    </div>
                    <div>
                        <label className="form-label-light block mb-2">Description</label>
                        <textarea name="description" value={project.description} onChange={handleChange} rows={10} required className="form-input-admin-light" />
                    </div>
                </div>

                <div className="admin-card p-6 space-y-4">
                    <h3 className="font-sans text-xl">Project Images</h3>
                    <div>
                        <label className="form-label-light block mb-2">Thumbnail Image</label>
                        <p className="form-input-hint">Recommended: 600x400px (3:2 ratio)</p>
                        <div className="image-upload-wrapper">
                           {project.thumbnail && <img src={project.thumbnail} alt="Thumbnail Preview" className="image-preview-admin" />}
                           <input type="file" accept="image/*" onChange={e => handleFileChange(e, 'thumbnail')} required={!project.thumbnail} className="form-input-admin-light file-input flex-grow" />
                        </div>
                    </div>
                    <div>
                        <label className="form-label-light block mb-2">Project Detail Images</label>
                        <p className="form-input-hint">Recommended: 1920x1080px (16:9 ratio)</p>
                        <div className="image-upload-wrapper">
                            <input 
                                type="file" 
                                accept="image/*" 
                                multiple 
                                onChange={(e) => {
                                    const files = Array.from(e.target.files || []);
                                    if (files.length === 0) return;
                                    const readersDone: string[] = [];
                                    let remaining = files.length;
                                    files.forEach((file) => {
                                        const reader = new FileReader();
                                        reader.onload = () => {
                                            readersDone.push(reader.result as string);
                                            remaining -= 1;
                                            if (remaining === 0) {
                                                setProject(prev => ({ ...prev, images: [...(prev.images || []).filter(Boolean), ...readersDone] }));
                                            }
                                        };
                                        reader.readAsDataURL(file);
                                    });
                                }}
                                className="form-input-admin-light file-input"
                            />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
                            {(project.images || []).map((img, index) => (
                                <div 
                                    key={index} 
                                    className="relative group border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm hover:shadow-md transition-shadow"
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, index)}
                                    onDragOver={handleDragOver}
                                    onDrop={(e) => handleDrop(e, index)}
                                >
                                    <div className="relative">
                                        <img 
                                            src={img} 
                                            alt={`Detail ${index+1} Preview`} 
                                            className="w-full h-32 object-cover" 
                                        />
                                        <div className="absolute top-2 left-2 bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                            #{index + 1}
                                        </div>
                                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <div className="bg-black bg-opacity-70 text-white text-xs px-2 py-1 rounded">
                                                Drag to reorder
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-3 space-y-2">
                                        <div className="flex justify-between items-center">
                                            <span className="text-sm text-gray-600">Position {index + 1}</span>
                                            <div className="flex space-x-1">
                                                <button
                                                    type="button"
                                                    onClick={() => moveImageUp(index)}
                                                    disabled={index === 0}
                                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Move up"
                                                >
                                                    ↑
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => moveImageDown(index)}
                                                    disabled={index === project.images.length - 1}
                                                    className="p-1 text-gray-400 hover:text-gray-600 disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Move down"
                                                >
                                                    ↓
                                                </button>
                                            </div>
                                        </div>
                                        <AdminButton 
                                            type="button" 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => removeImageInput(index)}
                                            className="w-full"
                                        >
                                            Remove
                                        </AdminButton>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <Link to="/admin/portfolio"><AdminButton type="button" variant="secondary" disabled={isSubmitting}>Cancel</AdminButton></Link>
                    <AdminButton type="submit" loading={isSubmitting}>{isEditMode ? 'Save Changes' : 'Create Project'}</AdminButton>
                </div>
            </form>
        </div>
    );
};

const BLANK_POST: Omit<BlogPost, 'id'> = { title: '', author: 'Rishad PK', date: new Date().toISOString().split('T')[0], imageUrl: '', excerpt: '', content: '', views: 0 };

export const AdminServicesManager: React.FC = () => {
    const [services, setServices] = useState(SERVICES);
    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [showSuccess, setShowSuccess] = useState(false);
    const [isSaving, setIsSaving] = useState(false);

    const handleFileChange = (index: number, file: File) => {
        handleFileRead(file, (result) => {
            const newServices = [...services];
            newServices[index] = { ...newServices[index], imageUrl: result };
            setServices(newServices);
        });
    };

    const handleSave = async () => {
        setIsSaving(true);
        try {
            // In a real app, you'd save to Supabase here
            console.log('Saving services:', services);
            // Simulate API call delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div>
            <PageTitle subtitle="Manage your services section images and content.">Services Manager</PageTitle>
            
            <div className="space-y-6 max-w-4xl">
                {services.map((service, index) => (
                    <div key={index} className="admin-card p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-sans text-xl font-bold">{service.title}</h3>
                            <span className="text-sm text-gray-500">Service {index + 1}</span>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="form-label-light block mb-2">Service Image</label>
                                <p className="form-input-hint mb-4">Recommended: 800x1200px (2:3 ratio)</p>
                                <div className="image-upload-wrapper">
                                    <img src={service.imageUrl} alt={service.title} className="image-preview-admin h-32 w-auto" />
                                    <input 
                                        type="file" 
                                        accept="image/*" 
                                        onChange={(e) => e.target.files?.[0] && handleFileChange(index, e.target.files[0])} 
                                        className="form-input-admin-light file-input flex-grow" 
                                    />
                                </div>
                            </div>
                            
                            <div>
                                <label className="form-label-light block mb-2">Service Details</label>
                                <div className="space-y-3">
                                    <div>
                                        <label className="form-label-light block mb-1">Title</label>
                                        <input 
                                            value={service.title} 
                                            onChange={(e) => {
                                                const newServices = [...services];
                                                newServices[index] = { ...newServices[index], title: e.target.value };
                                                setServices(newServices);
                                            }}
                                            className="form-input-admin-light" 
                                        />
                                    </div>
                                    <div>
                                        <label className="form-label-light block mb-1">Description</label>
                                        <textarea 
                                            value={service.description} 
                                            onChange={(e) => {
                                                const newServices = [...services];
                                                newServices[index] = { ...newServices[index], description: e.target.value };
                                                setServices(newServices);
                                            }}
                                            rows={3}
                                            className="form-input-admin-light" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-4">
                            <label className="form-label-light block mb-2">Service Points</label>
                            <div className="space-y-2">
                                {service.points.map((point, pointIndex) => (
                                    <div key={pointIndex} className="flex items-center space-x-2">
                                        <input 
                                            value={point} 
                                            onChange={(e) => {
                                                const newServices = [...services];
                                                newServices[index].points[pointIndex] = e.target.value;
                                                setServices(newServices);
                                            }}
                                            className="form-input-admin-light flex-grow" 
                                        />
                                        <AdminButton 
                                            variant="danger" 
                                            size="sm" 
                                            onClick={() => {
                                                const newServices = [...services];
                                                newServices[index].points = newServices[index].points.filter((_, i) => i !== pointIndex);
                                                setServices(newServices);
                                            }}
                                            disabled={service.points.length <= 1}
                                        >
                                            Remove
                                        </AdminButton>
                                    </div>
                                ))}
                                <AdminButton 
                                    variant="secondary" 
                                    size="sm" 
                                    onClick={() => {
                                        const newServices = [...services];
                                        newServices[index].points.push('');
                                        setServices(newServices);
                                    }}
                                >
                                    Add Point
                                </AdminButton>
                            </div>
                        </div>
                    </div>
                ))}
                
                <div className="text-right flex items-center justify-end">
                    {showSuccess && <p className="text-black mr-4">Services updated successfully!</p>}
                    <AdminButton onClick={handleSave} loading={isSaving}>Save All Services</AdminButton>
                </div>
            </div>
        </div>
    );
};

export const AdminBlogEditor: React.FC = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { blogPosts, addBlogPost, updateBlogPost } = useData();
    const isEditMode = id !== undefined;
    const [post, setPost] = useState(BLANK_POST);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const quillRef = useRef<any>(null);

    // Load Quill CSS on demand to reduce initial bundle cost
    useEffect(() => {
        const id = 'quill-snow-css';
        if (!document.getElementById(id)) {
            const link = document.createElement('link');
            link.id = id;
            link.rel = 'stylesheet';
            link.href = 'https://cdn.jsdelivr.net/npm/react-quill@1.3.7/dist/quill.snow.css';
            document.head.appendChild(link);
        }
    }, []);

    useEffect(() => {
        if (isEditMode) {
            const existingPost = blogPosts.find(p => p.id === id);
            if (existingPost) {
                setPost(existingPost);
            } else if (blogPosts.length > 0 && !existingPost) {
                navigate('/admin/blog', { replace: true });
            }
        } else {
            setPost(BLANK_POST);
        }
    }, [id, blogPosts, isEditMode, navigate]);
    
    const handleContentChange = (content: string) => {
        setPost(prev => ({...prev, content}));
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setPost(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            handleFileRead(e.target.files[0], (result) => setPost(p => ({ ...p, imageUrl: result })));
        }
    };

    const imageHandler = useCallback(async () => {
        const input = document.createElement('input');
        input.setAttribute('type', 'file');
        input.setAttribute('accept', 'image/*');
        input.click();
    
        input.onchange = async () => {
            if (input.files && input.files[0]) {
                try {
                    const file = input.files[0];
                    
                    // Validate file size (max 5MB)
                    if (file.size > 5 * 1024 * 1024) {
                        alert("Image size must be less than 5MB");
                        return;
                    }
                    
                    const fileExt = file.name.split('.').pop() || 'jpg';
                    const fileName = `content-${Date.now()}.${fileExt}`;
                    const filePath = `blog-content/${fileName}`;
        
                    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
        
                    if (uploadError) {
                        console.error('Error uploading inline image:', uploadError);
                        alert("Image upload failed. Please try again.");
                        return;
                    }
        
                    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
                    const imageUrl = data.publicUrl;
        
                    const quill = quillRef.current?.getEditor();
                    if (quill) {
                        const range = quill.getSelection(true);
                        if (range) {
                            quill.insertEmbed(range.index, 'image', imageUrl);
                            quill.setSelection({ index: range.index + 1, length: 0 });
                        }
                    }
                } catch (error) {
                    console.error('Error in image handler:', error);
                    alert("An error occurred while uploading the image.");
                }
            }
        };
    }, []);

    const modules = useMemo(() => ({
        toolbar: {
            container: [
                [{ 'header': [1, 2, 3, false] }],
                ['bold', 'italic', 'underline'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                ['link', 'image'],
                ['clean']
            ],
            handlers: {
                image: imageHandler,
            }
        },
        clipboard: {
            matchVisual: false,
        }
    }), [imageHandler]);

    const formats = [
        'header', 'bold', 'italic', 'underline',
        'list', 'bullet', 'link', 'image'
    ];
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Validate required fields
        if (!post.title.trim()) {
            alert("Please enter a title for the blog post.");
            return;
        }
        
        if (!post.excerpt.trim()) {
            alert("Please enter an excerpt for the blog post.");
            return;
        }
        
        if (!post.content.trim()) {
            alert("Please enter content for the blog post.");
            return;
        }
        
        setIsSubmitting(true);
        try {
            if (isEditMode) {
                await updateBlogPost({ ...post, id, views: blogPosts.find(p=>p.id===id)?.views || 0 });
            } else {
                await addBlogPost(post);
            }
            navigate('/admin/blog');
        } catch (error) {
            console.error('Error saving blog post:', error);
            alert("Failed to save blog post. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    return (
        <div>
            <PageTitle>{isEditMode ? 'Edit Post' : 'Add New Post'}</PageTitle>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl pb-24">
                 <div className="admin-card p-6 space-y-4">
                    <div>
                        <label className="form-label-light block mb-2">Post Title</label>
                        <input name="title" value={post.title} onChange={handleChange} required className="form-input-admin-light"/>
                    </div>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="form-label-light block mb-2">Author</label>
                            <input name="author" value={post.author} onChange={handleChange} required className="form-input-admin-light"/>
                        </div>
                        <div>
                            <label className="form-label-light block mb-2">Date</label>
                            <input name="date" type="date" value={post.date} onChange={handleChange} required className="form-input-admin-light"/>
                        </div>
                     </div>
                    <div>
                        <label className="form-label-light block mb-2">Cover Image (Thumbnail)</label>
                        <p className="form-input-hint">Recommended: 800x400px (2:1 ratio)</p>
                        <div className="image-upload-wrapper">
                            {post.imageUrl && <img src={post.imageUrl} alt="Post Preview" className="image-preview-admin" />}
                            <input name="imageUrl" type="file" accept="image/*" onChange={handleCoverFileChange} required={!post.imageUrl} className="form-input-admin-light file-input flex-grow" />
                        </div>
                    </div>
                     <div>
                        <label className="form-label-light block mb-2">Excerpt (Short Summary)</label>
                        <textarea name="excerpt" value={post.excerpt} onChange={handleChange} rows={3} required className="form-input-admin-light"/>
                    </div>
                    <div>
                        <label className="form-label-light block mb-2">Content</label>
                        <Suspense fallback={<div className="p-4 text-gray-500">Loading editor…</div>}>
                            <ReactQuill
                                ref={quillRef as any}
                                theme="snow"
                                value={post.content || ''}
                                onChange={handleContentChange}
                                modules={modules}
                                formats={formats}
                                className="admin-rte-container"
                            />
                        </Suspense>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <Link to="/admin/blog"><AdminButton type="button" variant="secondary" disabled={isSubmitting}>Cancel</AdminButton></Link>
                    <AdminButton type="submit" loading={isSubmitting}>{isEditMode ? 'Save Changes' : 'Create Post'}</AdminButton>
                </div>
            </form>
        </div>
    );
};