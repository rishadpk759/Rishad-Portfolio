import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useData } from './context';
import { Link, useParams, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { BottomNavBar, ProjectCard, BlogCard, ContactForm, AdminSidebar, PageTitle, Input, Textarea, Button, AnimatedText, CreativeImageFrame } from './components';
import { SERVICES, WORK_HISTORY, FACTS, PORTFOLIO_CATEGORIES } from './constants';
import { ProjectCategory } from './types';

// LAYOUTS
export const PublicLayout: React.FC = () => (
    <>
        <main>
            <Outlet />
        </main>
        <BottomNavBar />
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
        <div className="flex h-screen bg-dark-bg text-gray-300">
            <AdminSidebar onLogout={handleLogout} />
            <main className="flex-1 p-8 overflow-y-auto">
                <Outlet />
            </main>
        </div>
    );
};


// PUBLIC PAGES
export const HomePage: React.FC = () => {
    const { projects, settings } = useData();
    
    const aboutSectionRef = useRef<HTMLDivElement>(null);
    const [aboutAnimationProgress, setAboutAnimationProgress] = useState(0);

    const workContainerRef = useRef<HTMLDivElement>(null);
    const horizontalTrackRef = useRef<HTMLDivElement>(null);
    
    const [activeServiceIndex, setActiveServiceIndex] = useState(0);
    const [serviceTextTranslateY, setServiceTextTranslateY] = useState(0);
    const servicesContainerRef = useRef<HTMLDivElement>(null);

    const ROLES = [
        "Creative Designer",
        "UI/UX Designer",
        "Branding Specialist",
        "Visual Storyteller",
        "Design Strategist"
    ];
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
            if (scrollY >= sectionTop && scrollY <= sectionTop + viewportHeight) {
                const scrollInPin = scrollY - sectionTop;
                const startBuffer = viewportHeight * 0.5;
                const animationDuration = viewportHeight * 0.5;
                const effectiveScroll = scrollInPin - startBuffer;
                const linearProgress = Math.min(1, Math.max(0, effectiveScroll / animationDuration));
                const easeInOut = (t: number) => t * t * (3 - 2 * t);
                const easedProgress = easeInOut(linearProgress);
                setAboutAnimationProgress(easedProgress);
            } else if (scrollY < sectionTop) {
                setAboutAnimationProgress(0);
            } else {
                setAboutAnimationProgress(1);
            }
        };
        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        const container = workContainerRef.current;
        const track = horizontalTrackRef.current;
        if (!container || !track) return;
        const animationData = { containerHeight: 0, maxScroll: 0 };
        const handleScroll = () => {
            const { containerHeight, maxScroll } = animationData;
            if (maxScroll <= 0) return;
            const firstItem = track.querySelector('.work-gallery-item') as HTMLElement;
            if (!firstItem) return;
            const viewportWidth = window.innerWidth;
            const firstItemWidth = firstItem.offsetWidth;
            const trackPaddingLeft = parseFloat(getComputedStyle(track).paddingLeft);
            const centerOffset = (viewportWidth / 2) - (firstItemWidth / 2);
            const initialTransformX = centerOffset - trackPaddingLeft;
            const containerTop = container.offsetTop;
            const currentScrollY = window.scrollY;
            const scrollInContainer = currentScrollY - containerTop;
            const pinDuration = containerHeight - window.innerHeight;
            const bufferZone = pinDuration * (2 / 3);
            const animationZone = pinDuration - bufferZone;
            if (scrollInContainer < bufferZone) {
                track.style.transform = `translateX(${initialTransformX}px)`;
            } else if (scrollInContainer >= pinDuration) {
                track.style.transform = `translateX(${initialTransformX - maxScroll}px)`;
            } else {
                const progress = Math.max(0, Math.min(1, (scrollInContainer - bufferZone) / animationZone));
                const currentTransformX = initialTransformX - (progress * maxScroll);
                track.style.transform = `translateX(${currentTransformX}px)`;
            }
        };
        const setupAndResizeHandler = () => {
            if (!container || !track) return;
            const wrapper = track.parentElement;
            if (!wrapper) return;
            const maxScroll = track.scrollWidth - wrapper.clientWidth;
            animationData.maxScroll = maxScroll > 0 ? maxScroll : 0;
            const newContainerHeight = window.innerHeight + (maxScroll > 0 ? maxScroll : 0);
            container.style.height = `${newContainerHeight}px`;
            animationData.containerHeight = newContainerHeight;
            handleScroll();
        };
        const resizeObserver = new ResizeObserver(setupAndResizeHandler);
        resizeObserver.observe(track);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);
    
    useEffect(() => {
        const interactiveItems = document.querySelectorAll('.work-gallery-item, .contact-cta-section');
        const handleMouseMove = (e: MouseEvent) => {
          const target = e.currentTarget as HTMLElement;
          const rect = target.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          target.style.setProperty('--cursor-x', `${x}px`);
          target.style.setProperty('--cursor-y', `${y}px`);
        };
        interactiveItems.forEach(item => {
          item.addEventListener('mousemove', handleMouseMove as EventListener);
        });
        return () => {
          interactiveItems.forEach(item => {
            item.removeEventListener('mousemove', handleMouseMove as EventListener);
          });
        };
    }, [projects]);
      
    useEffect(() => {
        const container = servicesContainerRef.current;
        if (!container) return;
        const handleScroll = () => {
            const containerTop = container.offsetTop;
            const containerHeight = container.offsetHeight;
            const viewportHeight = window.innerHeight;
            const scrollY = window.scrollY;
            const stickyStart = containerTop;
            const stickyEnd = containerTop + containerHeight - viewportHeight;
            if (scrollY >= stickyStart && scrollY <= stickyEnd) {
                const scrollInContainer = scrollY - stickyStart;
                setServiceTextTranslateY(scrollInContainer);
                const index = Math.floor((scrollInContainer + viewportHeight / 2) / viewportHeight);
                const newActiveIndex = Math.max(0, Math.min(index, SERVICES.length - 1));
                const invertedIndex = SERVICES.length - 1 - newActiveIndex;
                setActiveServiceIndex(prevIndex => prevIndex !== invertedIndex ? invertedIndex : prevIndex);
            } else if (scrollY < stickyStart) {
                setServiceTextTranslateY(0);
                setActiveServiceIndex(SERVICES.length - 1);
            } else {
                setServiceTextTranslateY(containerHeight - viewportHeight);
                setActiveServiceIndex(0);
            }
        };
        const timeoutId = setTimeout(() => {
            handleScroll();
            window.addEventListener('scroll', handleScroll, { passive: true });
        }, 100);
        const resizeHandler = () => handleScroll();
        window.addEventListener('resize', resizeHandler);
        return () => {
            clearTimeout(timeoutId);
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', resizeHandler);
        };
    }, []);

    return (
        <div className="relative">
            <div id="home-section" className="fixed top-0 left-0 w-full h-screen z-0 flex items-end justify-center bg-black text-white overflow-hidden animate-fadeIn">
                <h1 className="hero-text-bg absolute z-0 font-display top-0 pt-16">
                    RISHAD PK
                </h1>
                <div className="relative z-10">
                    <img
                        src="https://rhamiktnjbxwcryluvof.supabase.co/storage/v1/object/public/Cover%20Image/rishad%20pk%20site%20cover.png"
                        alt="Rishad PK"
                        className="w-auto max-h-[85vh] object-contain select-none animate-slow-zoom"
                    />
                </div>
                <div className="absolute bottom-12 left-12 z-20 text-left max-w-sm">
                    <p className="font-sans text-xl text-gray-300 leading-relaxed h-8">
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
                                 <div className="md:text-left md:col-span-7">
                                    <p className="tracking-widest uppercase text-sm mb-4 text-gray-500">(01) About Me</p>
                                    <AnimatedText 
                                        text="I’m a creative designer specializing in branding, digital marketing, and UI/UX. My work blends strategy with design to craft impactful visuals and experiences."
                                        className="text-3xl md:text-5xl font-sans font-light leading-spacious"
                                        progress={aboutAnimationProgress}
                                    />
                                    <Link to="/about"
                                       className="animated-link-underline inline-block mt-8 uppercase tracking-widest text-sm font-semibold text-black">
                                        Learn more about me
                                    </Link>
                                 </div>
                            </div>
                        </div>
                    </section>
                    
                    <section id="work-section" className="relative z-20 bg-dark-bg">
                        <div ref={workContainerRef} className="relative">
                            <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
                                <div className="container mx-auto px-6 mb-8 flex justify-between items-end">
                                    <div>
                                        <p className="tracking-widest uppercase text-sm mb-4 text-gray-500 text-left">(02) WORKS</p>
                                        <h2 className="font-sans text-4xl text-white font-light">Work Highlights</h2>
                                    </div>
                                    <Link to="/portfolio" className="animated-link-underline-light text-white font-semibold hidden md:inline-block">
                                        View All Works →
                                    </Link>
                                </div>
                                <div className="horizontal-scroll-wrapper">
                                    <div ref={horizontalTrackRef} className="horizontal-scroll-track">
                                        {projects.map(project => (
                                            <Link to="/portfolio" key={project.id} className="work-gallery-item group block relative">
                                                <img src={project.thumbnail} alt={project.title} />
                                                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition-all duration-300 flex items-end p-6">
                                                     <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                                                        <h3 className="font-sans text-2xl text-white font-bold">{project.title}</h3>
                                                        <p className="text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{project.client}</p>
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </section>
                </div>
                
                <section id="services-section" className="relative z-30 bg-white text-black">
                    <div ref={servicesContainerRef} className="services-container">
                        <div className="services-sticky-wrapper">
                            <div className="container mx-auto h-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className="h-full overflow-hidden">
                                    <div style={{ transform: `translateY(-${serviceTextTranslateY}px)` }}>
                                        {SERVICES.map((service, index) => (
                                            <div key={index} data-index={index} className="service-text-item">
                                                <div className="max-w-md">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <p className="service-phase-text">SERVICE 0{index + 1}</p>
                                                        <div className="h-[1px] w-16 bg-gray-300"></div>
                                                    </div>
                                                    <h3 className="font-sans text-4xl font-bold mb-4 text-black">{service.title}</h3>
                                                    <p className="text-gray-600 mb-6">{service.description}</p>
                                                    <ul className="service-points-list">
                                                        {service.points.map((point, pointIndex) => (
                                                            <li key={pointIndex} className="service-point-item">
                                                                {point}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-full flex items-center justify-center">
                                    <div className="service-image-container">
                                        {SERVICES.map((service, index) => (
                                            <img
                                                key={index}
                                                src={service.imageUrl}
                                                alt={service.title}
                                                className={`service-image ${activeServiceIndex === index ? 'active' : ''}`}
                                            />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="contact-section" className="contact-cta-section relative bg-dark-bg z-40 overflow-hidden">
                    <a href={`mailto:${settings.contact.email}`} className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen text-center text-white p-6">
                        <h2 className="hero-text-bg whitespace-normal" dangerouslySetInnerHTML={{ __html: 'FUEL ME WITH <br /> COFFEE' }} />
                        <p className="font-sans text-xl md:text-3xl text-gray-400 mt-8">
                            And I’ll fuel your brand with design.
                        </p>
                    </a>
                </section>
            </div>
        </div>
    );
};

export const PortfolioPage: React.FC = () => {
    const { projects } = useData();
    const [selectedCategory, setSelectedCategory] = useState('All');
    
    const wrapperRef = useRef<HTMLDivElement>(null);
    const trackRef = useRef<HTMLDivElement>(null);
    const progressBarRef = useRef<HTMLDivElement>(null);
    
    const filteredProjects = projects.filter(p => selectedCategory === 'All' || p.category === selectedCategory);

    const animationData = useRef({
        wrapperHeight: 0,
        maxScroll: 0,
    }).current;
    
    useEffect(() => {
        const wrapper = wrapperRef.current;
        const track = trackRef.current;
        if (!wrapper || !track) return;
        
        const handleScroll = () => {
            const { wrapperHeight, maxScroll } = animationData;
            if (maxScroll <= 0) return;

            const wrapperTop = wrapper.offsetTop;
            const currentScrollY = window.scrollY;
            const scrollInWrapper = currentScrollY - wrapperTop;

            if (scrollInWrapper < 0) {
                if (trackRef.current) trackRef.current.style.transform = `translateX(0px)`;
                if (progressBarRef.current) progressBarRef.current.style.setProperty('--progress', '0');
                return;
            }

            const pinDuration = wrapperHeight - window.innerHeight;
            if (pinDuration <= 0) return;

            const progress = Math.max(0, Math.min(1, scrollInWrapper / pinDuration));
            if (trackRef.current) trackRef.current.style.transform = `translateX(-${progress * maxScroll}px)`;
            if (progressBarRef.current) progressBarRef.current.style.setProperty('--progress', `${progress}`);
        };

        const setupAndResizeHandler = () => {
            if (!wrapper || !track) return;
            const maxScroll = track.scrollWidth - track.clientWidth;
            animationData.maxScroll = Math.max(0, maxScroll);
            const newHeight = window.innerHeight + animationData.maxScroll;
            wrapper.style.height = `${newHeight}px`;
            animationData.wrapperHeight = newHeight;
            handleScroll(); // Recalculate on resize
        };

        const resizeObserver = new ResizeObserver(setupAndResizeHandler);
        resizeObserver.observe(track);
        
        window.addEventListener('scroll', handleScroll, { passive: true });
        
        // Initial setup
        setupAndResizeHandler();
        
        return () => {
            resizeObserver.disconnect();
            window.removeEventListener('scroll', handleScroll);
        };
    }, [filteredProjects, animationData]);

    useEffect(() => {
        const interactiveItems = document.querySelectorAll('.portfolio-gallery-item');
        const handleMouseMove = (e: MouseEvent) => {
          const target = e.currentTarget as HTMLElement;
          const rect = target.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const y = e.clientY - rect.top;
          target.style.setProperty('--cursor-x', `${x}px`);
          target.style.setProperty('--cursor-y', `${y}px`);
        };
        interactiveItems.forEach(item => {
          item.addEventListener('mousemove', handleMouseMove as EventListener);
        });
        return () => {
          interactiveItems.forEach(item => {
            item.removeEventListener('mousemove', handleMouseMove as EventListener);
          });
        };
    }, [filteredProjects]);

    return (
        <div ref={wrapperRef} className="portfolio-page-wrapper animate-fadeIn">
            <div className="portfolio-sticky-container">
                <div className="container mx-auto px-6 pt-20 flex-shrink-0">
                    <p className="tracking-widest uppercase text-sm mb-4 text-gray-500">(03) PORTFOLIO</p>
                    <h1 className="font-sans text-5xl font-bold text-white">Selected Works</h1>
                    <div className="category-filters">
                        {PORTFOLIO_CATEGORIES.map(category => (
                            <button
                                key={category}
                                onClick={() => setSelectedCategory(category)}
                                className={`category-filter-btn ${selectedCategory === category ? 'active' : ''}`}
                            >
                                {category}
                            </button>
                        ))}
                    </div>
                </div>
                
                <div className="portfolio-gallery-container">
                    <div ref={trackRef} className="portfolio-gallery-track">
                        {filteredProjects.map(project => (
                            <Link to={`/portfolio/${project.id}`} key={project.id} className="portfolio-gallery-item group block relative">
                                <img src={project.thumbnail} alt={project.title} />
                                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition-all duration-300 flex items-end p-6">
                                    <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                                        <h3 className="font-sans text-2xl text-white font-bold">{project.title}</h3>
                                        <p className="text-sm text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-100">{project.client}</p>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
                <div className="portfolio-progress-bar-container">
                    <div ref={progressBarRef} className="portfolio-progress-bar"></div>
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
            <div className="container mx-auto px-6 py-12 animate-fadeIn pt-16">
                <div className="text-center mb-12">
                    <h1 className="font-sans text-5xl font-bold text-white">{project.title}</h1>
                    <p className="text-xl text-gray-400 mt-2">{project.client}</p>
                </div>
                <div className="mb-12">
                    {project.images.map((img, index) => (
                        <img key={index} src={img} alt={`${project.title} - view ${index + 1}`} className="project-detail-image" />
                    ))}
                </div>
                <div className="max-w-3xl mx-auto">
                    <h2 className="font-sans text-3xl font-bold text-white mb-4">Project Description</h2>
                    <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
                </div>
            </div>
            
            <section className="project-cta-section py-20">
                <div className="container mx-auto px-6 text-center max-w-2xl">
                    <h2 className="font-sans text-3xl md:text-4xl text-white font-light mb-6">
                        Do you need something like this?
                        <br />
                        Just say hi, and let’s get started.
                    </h2>
                    <Link to="/#contact-section" className="project-cta-button inline-block">
                        Contact Now
                    </Link>
                </div>
            </section>

            <div className="h-32" />
        </>
    );
};

export const BlogPage: React.FC = () => {
    const { blogPosts } = useData();
    return (
        <>
            <div className="container mx-auto px-6 py-12 animate-fadeIn pt-16 min-h-screen">
                <h1 className="font-sans text-5xl font-bold text-center mb-12 text-white">From the Blog</h1>
                <div className="max-w-3xl mx-auto space-y-8">
                    {blogPosts.map(post => <BlogCard key={post.id} post={post} />)}
                </div>
            </div>
            <div className="h-32" />
        </>
    );
};

export const BlogPostPage: React.FC = () => {
    const { id } = useParams();
    const { blogPosts } = useData();
    const post = blogPosts.find(p => p.id === id);

    if (!post) return <div className="container mx-auto px-6 py-12 pt-16">Post not found.</div>;

    return (
        <>
            <div className="container mx-auto px-6 py-12 animate-fadeIn pt-16">
                <div className="max-w-3xl mx-auto">
                    <h1 className="font-sans text-5xl font-bold text-white leading-tight">{post.title}</h1>
                    <p className="text-gray-500 mt-4">{post.date} by {post.author}</p>
                    <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover rounded-lg my-8 shadow-lg" />
                    <div className="prose prose-invert prose-lg text-gray-300 leading-relaxed whitespace-pre-wrap">
                        {post.content}
                    </div>
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
                        <div className="md:col-span-7">
                             <h1 className="font-sans text-5xl font-bold text-black mb-6">About Me</h1>
                             <p className="text-black text-lg leading-spacious whitespace-pre-wrap">{settings.about.bio}</p>
                        </div>
                    </div>
                </div>
            </section>
            
            <section className="bg-dark-bg py-20">
                <div className="container mx-auto px-6">
                    <h2 className="font-sans text-4xl font-bold text-white text-center mb-12">Work History</h2>
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
                    <h2 className="font-sans text-4xl font-bold text-black text-center mb-12">By the Numbers</h2>
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


// ADMIN PAGES
export const AdminLoginPage: React.FC = () => {
    const { login } = useData();
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault();
        if (password === 'admin') {
            login();
            navigate('/admin');
        } else {
            setError('Invalid password');
        }
    };

    return (
        <div className="h-screen flex items-center justify-center bg-dark-bg">
            <div className="w-full max-w-sm p-8 bg-dark-card border border-dark-border rounded-lg shadow-2xl shadow-brand-cyan/10">
                <h1 className="font-sans text-3xl font-bold tracking-widest text-white text-center">AURA_ADMIN</h1>
                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                    <div>
                        <label className="text-sm font-bold text-gray-400 block mb-2">Password</label>
                        <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
                    </div>
                     {error && <p className="text-red-500 text-sm">{error}</p>}
                    <Button type="submit" className="w-full">
                        Login
                    </Button>
                </form>
            </div>
        </div>
    );
};

export const AdminDashboardPage: React.FC = () => {
    const { projects, blogPosts } = useData();

    return (
        <div>
            <PageTitle subtitle="Welcome to your content management hub.">Dashboard</PageTitle>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-dark-card p-6 border border-dark-border rounded-lg">
                    <h3 className="text-gray-400 font-semibold">Total Projects</h3>
                    <p className="text-4xl font-bold text-white mt-2">{projects.length}</p>
                </div>
                <div className="bg-dark-card p-6 border border-dark-border rounded-lg">
                    <h3 className="text-gray-400 font-semibold">Total Blog Posts</h3>
                    <p className="text-4xl font-bold text-white mt-2">{blogPosts.length}</p>
                </div>
            </div>
            <div className="mt-12">
                <h2 className="font-sans text-2xl font-bold text-white mb-4">Quick Links</h2>
                 <div className="flex flex-wrap gap-4">
                    <Link to="/admin/portfolio"><Button>Manage Portfolio</Button></Link>
                    <Link to="/admin/blog"><Button>Manage Blog</Button></Link>
                    <Link to="/admin/settings"><Button>Manage Settings</Button></Link>
                </div>
            </div>
        </div>
    );
};

export const AdminPortfolioManager: React.FC = () => {
    const { projects, addProject, deleteProject, setFeaturedProject } = useData();
    const [title, setTitle] = useState('');
    const [client, setClient] = useState('');
    const [category, setCategory] = useState<ProjectCategory>('Branding');

    const handleAddProject = () => {
        if (!title || !client) return;
        addProject({ 
            title, client, category,
            description: 'New project description.', 
            images: ['https://picsum.photos/seed/new-project/1920/1080'], 
            thumbnail: 'https://picsum.photos/seed/new-thumb/600/400', 
            isFeatured: false 
        });
        setTitle('');
        setClient('');
        setCategory('Branding');
    };

    return (
        <div>
            <PageTitle subtitle="Add, edit, and manage your portfolio projects.">Portfolio Manager</PageTitle>
            <div className="bg-dark-card p-6 border border-dark-border rounded-lg mb-8">
                 <h3 className="font-sans text-xl text-white mb-4">Add New Project</h3>
                 <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                     <Input placeholder="Project Title" value={title} onChange={e => setTitle(e.target.value)} />
                     <Input placeholder="Client Name" value={client} onChange={e => setClient(e.target.value)} />
                     <select 
                        value={category} 
                        onChange={e => setCategory(e.target.value as ProjectCategory)}
                        className="w-full bg-dark-card border border-dark-border focus:border-brand-cyan focus:ring-0 rounded-md px-4 py-2 transition-colors duration-300 text-white"
                     >
                        <option>Branding</option>
                        <option>UI/UX</option>
                        <option>Marketing & Creatives</option>
                     </select>
                     <Button onClick={handleAddProject}>Add Project</Button>
                 </div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/20">
                        <tr>
                            <th className="p-4 font-semibold">Title</th>
                            <th className="p-4 font-semibold">Client</th>
                            <th className="p-4 font-semibold">Category</th>
                            <th className="p-4 font-semibold text-center">Featured</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(p => (
                            <tr key={p.id} className="border-t border-dark-border">
                                <td className="p-4">{p.title}</td>
                                <td className="p-4 text-gray-400">{p.client}</td>
                                <td className="p-4 text-gray-400">{p.category}</td>
                                <td className="p-4 text-center">
                                    <button onClick={() => setFeaturedProject(p.id)} className={`w-6 h-6 rounded-full ${p.isFeatured ? 'bg-brand-cyan' : 'bg-gray-600'}`} aria-label={`Set ${p.title} as featured`}></button>
                                </td>
                                <td className="p-4 text-right">
                                    <div className="flex justify-end space-x-2">
                                        <Button variant="secondary" size="sm">Edit</Button>
                                        <Button variant="danger" size="sm" onClick={() => deleteProject(p.id)}>Delete</Button>
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

export const AdminBlogManager: React.FC = () => {
     const { blogPosts, deleteBlogPost } = useData();
    return (
        <div>
            <PageTitle subtitle="Create and manage your blog posts.">Blog Manager</PageTitle>
             <div className="text-right mb-6">
                <Button>New Post</Button>
            </div>
            <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/20">
                        <tr>
                            <th className="p-4 font-semibold">Title</th>
                            <th className="p-4 font-semibold">Date</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {blogPosts.map(p => (
                            <tr key={p.id} className="border-t border-dark-border">
                                <td className="p-4">{p.title}</td>
                                <td className="p-4 text-gray-400">{p.date}</td>
                                <td className="p-4 text-right">
                                     <div className="flex justify-end space-x-2">
                                        <Button variant="secondary" size="sm">Edit</Button>
                                        <Button variant="danger" size="sm" onClick={() => deleteBlogPost(p.id)}>Delete</Button>
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
    const { settings, updateSettings } = useData();
    const [formState] = useState(settings);
    
    const handleChange = <T extends keyof typeof formState.about>(section: 'about', field: T, value: (typeof formState.about)[T]) => {
         // A more complete implementation would use setFormState
    };

    const handleSave = () => {
        updateSettings(formState);
        alert('Settings saved!');
    };

    return (
        <div>
            <PageTitle subtitle="Update your site's static content and contact info.">Content Settings</PageTitle>
            <div className="space-y-8">
                <div className="bg-dark-card p-6 border border-dark-border rounded-lg">
                    <h3 className="font-sans text-xl text-white mb-4">About Section</h3>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Bio</label>
                            <Textarea rows={8} defaultValue={formState.about.bio} onChange={e => handleChange('about', 'bio', e.target.value)} />
                        </div>
                         <div>
                            <label className="text-sm font-bold text-gray-400 block mb-2">Photo URL</label>
                            <Input defaultValue={formState.about.photo} onChange={e => handleChange('about', 'photo', e.target.value)} />
                        </div>
                    </div>
                </div>
                 <div className="text-right">
                    <Button onClick={handleSave}>Save Settings</Button>
                </div>
            </div>
        </div>
    );
};