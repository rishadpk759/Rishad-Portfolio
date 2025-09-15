
import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useData } from './context';
import { Link, useParams, Outlet, useNavigate, Navigate, NavLink } from 'react-router-dom';
import { BottomNavBar, ProjectCard, BlogCard, ContactForm, AdminSidebar, PageTitle, AnimatedText, CreativeImageFrame } from './components';
import { SERVICES, WORK_HISTORY, FACTS, PORTFOLIO_CATEGORIES } from './constants';
import { Project, ProjectCategory, BlogPost, SiteSettings } from './types';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { supabase } from './supabaseClient';

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
        <div className="flex h-screen admin-light-theme">
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
            <div id="home-section" className="fixed top-0 left-0 w-full h-screen z-0 flex items-end justify-center bg-black text-white overflow-hidden animate-fadeIn">
                <h1 className="hero-text-bg absolute z-0 font-display top-0 pt-16">
                    {settings.heroName}
                </h1>
                <div className="relative z-10">
                    <img src={settings.heroImage} alt="Rishad PK" className="hero-image select-none animate-slow-zoom" />
                </div>
                <div className="home-hero-subtext">
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
                    
                    <section id="work-section" className="relative z-20 bg-dark-bg py-20">
                        <div className="container mx-auto px-6">
                            <div className="mb-10">
                                <p className="tracking-widest uppercase text-sm mb-4 text-gray-400">(02) WORKS</p>
                                <div className="flex items-end justify-between">
                                    <h2 className="font-sans text-3xl md:text-5xl text-white font-light">Work Highlights</h2>
                                    <Link to="/portfolio" className="animated-link-underline-light text-gray-200 hover:text-white font-semibold text-sm md:text-base">View All →</Link>
                                </div>
                            </div>
                            <div className="grid grid-cols-1 gap-8">
                                {projects.slice(0, Math.min(12, projects.length)).map((project) => (
                                    <Link to={`/portfolio/${project.id}`} key={project.id} className="group block">
                                        <div className="relative overflow-hidden rounded-xl bg-white/5">
                                            <div className="w-full aspect-[3/2]">
                                                <img src={project.thumbnail} alt={project.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.02]" />
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 p-4 bg-gradient-to-t from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                                                <h3 className="font-sans text-base md:text-lg font-semibold text-white truncate">{project.title}</h3>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        </div>
                    </section>
                </div>
                
                <section id="services-section" ref={servicesContainerRef} className="relative z-30 bg-white text-black">
                    <div className="services-container">
                        <div className="services-sticky-wrapper">
                            <div className="container mx-auto h-full grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                                <div className={`overflow-hidden ${isMobile ? '' : 'h-screen'} relative`}>
                                    <div className="w-full" style={!isMobile ? { transform: `translateY(-${serviceTextTranslateY}px)` } : undefined}>
                                        {SERVICES.map((service, index) => (
                                            <div key={index} data-index={index} className={`service-text-item ${isMobile ? '' : 'h-screen'} flex items-center`}>
                                                <div className="max-w-md px-4 md:px-0">
                                                    <div className="flex items-center gap-4 mb-4">
                                                        <p className="service-phase-text">SERVICE 0{index + 1}</p>
                                                        <div className="h-[1px] w-16 bg-gray-300"></div>
                                                    </div>
                                                    <h3 className="font-sans text-2xl md:text-4xl font-bold mb-4 text-black">{service.title}</h3>
                                                    <p className="text-gray-600 mb-6 text-sm md:text-base">{service.description}</p>
                                                    <ul className="service-points-list">
                                                        {service.points.map((point, pointIndex) => (
                                                            <li key={pointIndex} className="service-point-item text-sm md:text-base"> {point} </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="h-full flex items-center justify-center relative hidden md:flex">
                                    <div className="service-image-container">
                                        {SERVICES.map((service, index) => (
                                            <img key={index} src={service.imageUrl} alt={service.title} className={`service-image ${activeServiceIndex === index ? 'active' : ''}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section id="contact-section" className="contact-cta-section relative bg-dark-bg z-40 overflow-hidden">
                    <Link to="/contact" className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen text-center text-white p-6">
                        <h2 className="hero-text-bg whitespace-normal" dangerouslySetInnerHTML={{ __html: 'FUEL ME WITH <br /> COFFEE' }} />
                        <p className="font-sans text-lg md:text-xl lg:text-3xl text-gray-400 mt-8 px-4"> And I'll fuel your brand with design. </p>
                    </Link>
                </section>
            </div>
        </div>
    );
};

export const PortfolioPage: React.FC = () => {
    const { projects } = useData();
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [columnCount, setColumnCount] = useState(1);
    
    const filteredProjects = projects.filter(p => selectedCategory === 'All' || p.category === selectedCategory);
    
    useEffect(() => {
        const computeColumns = () => {
            const w = window.innerWidth;
            if (w >= 1280) return 4;
            if (w >= 1024) return 3;
            if (w >= 640) return 2;
            return 1;
        };
        const update = () => setColumnCount(computeColumns());
        update();
        window.addEventListener('resize', update);
        return () => window.removeEventListener('resize', update);
    }, []);

    return (
        <div className="animate-fadeIn">
            <div className="container mx-auto px-6 pt-20">
                <p className="tracking-widest uppercase text-sm mb-4 text-gray-500">(03) PORTFOLIO</p>
                <h1 className="font-sans text-3xl md:text-5xl font-bold text-white">Selected Works</h1>
            </div>
            <div className="container mx-auto px-6 pb-12">
                <div className="grid grid-cols-1 gap-8">
                    {filteredProjects.map(project => (
                        <Link to={`/portfolio/${project.id}`} key={project.id} className="group block relative rounded-lg overflow-hidden">
                            <img src={project.thumbnail} alt={project.title} className="w-full h-auto block" />
                            <div className="absolute inset-0 bg-black/0 hover:bg-black/40 transition-colors duration-300 flex items-end p-4">
                                <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                    <h3 className="font-sans text-lg md:text-xl text-white font-bold">{project.title}</h3>
                                    <p className="text-xs md:text-sm text-gray-300">{project.client}</p>
                                </div>
                            </div>
                        </Link>
                    ))}
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
                    <h1 className="font-sans text-3xl md:text-5xl font-bold text-white">{project.title}</h1>
                    <p className="text-lg md:text-xl text-gray-400 mt-2">{project.client}</p>
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

export const BlogPostPage: React.FC = () => {
    const { id } = useParams();
    const { blogPosts } = useData();
    const post = blogPosts.find(p => p.id === id);
    if (!post) return <div className="container mx-auto px-6 py-12 pt-16">Post not found.</div>;
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

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log('Form submitted:', formData);
        triggerToast("Thanks for your message! I'll be in touch.");
        setFormData({ name: '', email: '', phone: '', message: '' });
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
                        <button type="submit" className="w-full btn-primary-dark py-3 rounded-md"> Send Message </button>
                    </form>
                </div>
                <div className="max-w-2xl mx-auto mt-12 text-center">
                    <div className="social-links-container">
                        <a href={settings.social.linkedin} target="_blank" rel="noopener noreferrer" className="social-icon-dark" aria-label="LinkedIn">
                           <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect x="2" y="9" width="4" height="12"></rect><circle cx="4" cy="4" r="2"></circle></svg>
                        </a>
                        <a href={settings.social.behance} target="_blank" rel="noopener noreferrer" className="social-icon-dark" aria-label="Behance">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 6H6v12h8c2.21 0 4-1.79 4-4s-1.79-4-4-4m0 6H8v-4h6c1.1 0 2 .9 2 2s-.9 2-2 2m7-10h-4v2h4V2z"/></svg>
                        </a>
                        <button onClick={() => handleSocialClick('instagram')} className="social-icon-dark" aria-label="Instagram">
                             <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
                        </button>
                        <button onClick={() => handleSocialClick('facebook')} className="social-icon-dark" aria-label="Facebook">
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
            <div className={`custom-toast ${showToast ? 'show' : ''}`} role="alert"> {toastMessage} </div>
            <div className="h-32" />
        </div>
    );
};

// --- ADMIN PAGES ---
const AdminButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'secondary' | 'danger', size?: 'sm' | 'md' }> = ({ children, variant = 'primary', size = 'md', ...props }) => {
    const variants = { primary: 'btn-admin-primary', secondary: 'btn-admin-secondary', danger: 'btn-admin-danger' };
    const sizes = { sm: 'sm', md: '' };
    return <button {...props} className={`btn-admin ${variants[variant]} ${sizes[size]}`}>{children}</button>;
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
        <div className="h-screen flex items-center justify-center admin-light-theme">
            <div className="w-full max-w-sm p-8 admin-card">
                <h1 className="font-sans text-3xl font-bold tracking-widest text-center">ADMIN LOGIN</h1>
                <form onSubmit={handleLogin} className="mt-8 space-y-6">
                    <div>
                        <label className="form-label-light block mb-2">Password</label>
                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className="form-input-admin-light" />
                    </div>
                     {error && <p className="text-red-500 text-sm">{error}</p>}
                    <AdminButton type="submit" className="w-full"> Login </AdminButton>
                </form>
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
                    <thead><tr><th>Title</th><th>Date</th><th>Views</th><th className="text-right">Actions</th></tr></thead>
                    <tbody>
                        {blogPosts.map(p => (
                            <tr key={p.id}>
                                <td><p className="admin-table-title">{p.title}</p></td>
                                <td><p className="admin-table-meta">{p.date}</p></td>
                                <td><p className="admin-table-meta">{p.views.toLocaleString()}</p></td>
                                <td>
                                     <div className="flex justify-end space-x-2">
                                        <Link to={`/admin/blog/edit/${p.id}`}> <AdminButton variant="secondary" size="sm">Edit</AdminButton> </Link>
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
    const { settings, updateSettings } = useData();
    const [formState, setFormState] = useState<SiteSettings>(settings);
    const [showSuccess, setShowSuccess] = useState(false);

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
        try {
            await updateSettings(formState);
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 2000);
        } catch (error) {
            console.error('Error saving settings:', error);
            alert("Failed to save settings. Please try again.");
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
                    <AdminButton onClick={handleSave}>Save Settings</AdminButton>
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
        }
    };

    return (
        <div>
            <PageTitle>{isEditMode ? 'Edit Project' : 'Add New Project'}</PageTitle>
            <form onSubmit={handleSubmit} className="space-y-8 max-w-4xl">
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
                        <div className="space-y-2">
                        {project.images.map((img, index) => (
                            <div key={index} className="flex items-center space-x-2">
                                <div className="image-upload-wrapper flex-grow">
                                    {img && <img src={img} alt={`Detail ${index+1} Preview`} className="image-preview-admin h-16 w-16" />}
                                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, `image-${index}`)} required={!img} className="form-input-admin-light file-input flex-grow" />
                                </div>
                                <AdminButton type="button" variant="danger" size="sm" onClick={() => removeImageInput(index)} disabled={project.images.length <= 1}> Remove </AdminButton>
                            </div>
                        ))}
                        </div>
                        <AdminButton type="button" variant="secondary" size="sm" onClick={addImageInput} className="mt-4">Add Image</AdminButton>
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <Link to="/admin/portfolio"><AdminButton type="button" variant="secondary">Cancel</AdminButton></Link>
                    <AdminButton type="submit">{isEditMode ? 'Save Changes' : 'Create Project'}</AdminButton>
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

    const handleFileChange = (index: number, file: File) => {
        handleFileRead(file, (result) => {
            const newServices = [...services];
            newServices[index] = { ...newServices[index], imageUrl: result };
            setServices(newServices);
        });
    };

    const handleSave = () => {
        // In a real app, you'd save to Supabase here
        console.log('Saving services:', services);
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);
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
                    <AdminButton onClick={handleSave}>Save All Services</AdminButton>
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
    const quillRef = useRef<ReactQuill>(null);

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
        }
    };
    
    return (
        <div>
            <PageTitle>{isEditMode ? 'Edit Post' : 'Add New Post'}</PageTitle>
            <form onSubmit={handleSubmit} className="space-y-6 max-w-4xl">
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
                        <ReactQuill
                            ref={quillRef}
                            theme="snow"
                            value={post.content || ''}
                            onChange={handleContentChange}
                            modules={modules}
                            formats={formats}
                            className="admin-rte-container"
                        />
                    </div>
                </div>

                <div className="flex justify-end space-x-4">
                    <Link to="/admin/blog"><AdminButton type="button" variant="secondary">Cancel</AdminButton></Link>
                    <AdminButton type="submit">{isEditMode ? 'Save Changes' : 'Create Post'}</AdminButton>
                </div>
            </form>
        </div>
    );
};