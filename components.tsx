import React, { useState, useEffect, useRef } from 'react';
import type { Project, BlogPost } from './types';
import { NavLink, useLocation } from 'react-router-dom';

// --- Custom Hooks ---

const useScrollSpy = (ids: string[], options: IntersectionObserverInit) => {
    const [activeId, setActiveId] = useState<string>('');
    const observer = useRef<IntersectionObserver | null>(null);

    useEffect(() => {
        const elements = ids.map(id => document.getElementById(id)).filter(el => el);
        if (elements.length === 0) return;
        
        observer.current?.disconnect();
        observer.current = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setActiveId(entry.target.id);
                }
            });
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
    
    const sectionIds = ['home-section-spacer', 'about-section', 'work-section', 'services-section'];
    
    const activeSection = useScrollSpy(isHomePage ? sectionIds : [], { 
        threshold: 0.3
    });

    const links = [
        { name: 'Home', path: '/', sectionId: 'home-section-spacer' },
        { name: 'About', path: '/about', sectionId: 'about-section' },
        { name: 'Work', path: '/portfolio', sectionId: 'work-section' },
        { name: 'Blog', path: '/blog' },
        { name: 'Service', path: '/#services-section', sectionId: 'services-section' },
        { name: 'Contact', path: '/contact' },
    ];
    
    return (
        <nav className="bottom-nav-container animate-fadeIn">
            {links.map((link) => {
                if (isHomePage && link.sectionId) {
                    const isActive = activeSection === link.sectionId;
                    return (
                        <a
                            key={link.name}
                            href={link.path.startsWith('/#') ? `#${link.sectionId}` : link.path}
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
        <div className="w-full h-48 rounded-t-lg overflow-hidden">
             <img src={post.imageUrl} alt={post.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
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
    <div className="w-64 admin-sidebar-light flex flex-col p-4 flex-shrink-0">
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