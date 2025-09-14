/*eslint-env browser*/
import React, { useState, useEffect, useRef } from 'react';
import { useData } from './context';
import { Link, useParams, Outlet, useNavigate, Navigate } from 'react-router-dom';
import { BottomNavBar, ProjectCard, BlogCard, ContactForm, AdminSidebar, PageTitle, Input, Textarea, Button, AnimatedText, CreativeImageFrame } from './components';

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
    
    // Ref for the About Me section to trigger its animation
    const aboutSectionRef = useRef<HTMLDivElement>(null);
    const [aboutAnimationProgress, setAboutAnimationProgress] = useState(0);

    // Refs for the horizontal scroll effect
    const workContainerRef = useRef<HTMLDivElement>(null);
    const horizontalTrackRef = useRef<HTMLDivElement>(null);

    // Intersection Observer for About Me text animation
    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    // Animate progress from 0 to 1 over 1.5 seconds
                    let startTime: number | null = null;
                    const duration = 1500;
                    const animate = (currentTime: number) => {
                        if (startTime === null) startTime = currentTime;
                        const elapsedTime = currentTime - startTime;
                        const progress = Math.min(elapsedTime / duration, 1);
                        setAboutAnimationProgress(progress);
                        if (progress < 1) {
                            requestAnimationFrame(animate);
                        }
                    };
                    requestAnimationFrame(animate);
                    observer.disconnect(); // Animate only once
                }
            },
            { threshold: 0.5 } // Trigger when 50% of the section is visible
        );

        if (aboutSectionRef.current) {
            observer.observe(aboutSectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    // Effect for the horizontal scroll gallery
    useEffect(() => {
        const container = workContainerRef.current;
        const track = horizontalTrackRef.current;

        if (!container || !track) return;

        const handleScroll = () => {
            const wrapper = track.parentElement;
            if (!wrapper) return;

            // --- MEASUREMENTS ---
            const containerTop = container.offsetTop;
            const viewportHeight = window.innerHeight;
            const currentScrollY = window.scrollY;
            
            // The total distance the track can be scrolled horizontally
            const maxScroll = track.scrollWidth - wrapper.clientWidth;

            // --- DEFINE THE ANIMATION WINDOW ---
            // The animation should not start immediately. It should wait until the user has
            // scrolled one full viewport height while the section is sticky. This creates
            // the "magic moment" where a static section becomes interactive.
            const scrollStartOffset = viewportHeight;

            // The animation will happen over a specific scroll distance.
            // Let's make it complete over 2 viewport heights of vertical scroll.
            const animationDistance = viewportHeight * 2;

            // Calculate the precise scrollY values for the start and end of the animation.
            const animationStartPoint = containerTop + scrollStartOffset;
            const animationEndPoint = animationStartPoint + animationDistance;
            
            // --- APPLY TRANSFORM BASED ON SCROLL POSITION ---
            
            // 1. Before the animation window: Pin the gallery at the start (translateX(0)).
            // This covers the initial view when the user first sees the section, making it look static.
            if (currentScrollY < animationStartPoint) {
                track.style.transform = 'translateX(0px)';
                return;
            }

            // 2. After the animation window: Pin the gallery at the end.
            // This ensures it stays at the end once the horizontal scroll is complete, before the next section appears.
            if (currentScrollY > animationEndPoint) {
                track.style.transform = `translateX(${-maxScroll}px)`;
                return;
            }

            // 3. Inside the animation window: Calculate the progress and apply the transform.
            const scrollWithinAnimation = currentScrollY - animationStartPoint;
            const progress = scrollWithinAnimation / animationDistance; // Progress from 0 to 1
            const transformX = -progress * maxScroll;

            track.style.transform = `translateX(${transformX}px)`;
        };
        
        const onResize = () => {
            handleScroll();
        }

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', onResize, { passive: true });

        // Set initial position on load
        handleScroll();

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', onResize);
        }
    }, []);

    return (
        <div className="relative">
             {/* 1. Fixed Hero Content (background layer) */}
            <div id="home-section" className="fixed top-0 left-0 w-full h-screen z-0 flex items-end justify-center bg-black text-white overflow-hidden animate-fadeIn">
                <h1 className="hero-text-bg absolute z-0 font-display top-0 pt-16">
                    RISHAD PK
                </h1>
                <div className="relative z-10">
                    <img
                        src="https://rhamiktnjbxwcryluvof.supabase.co/storage/v1/object/public/Cover%20Image/rishad%20pk%20site%20cover.png"
                        alt="Rishad PK"
                        className="w-auto max-h-[85vh] object-contain select-none"
                    />
                </div>
                <div className="absolute bottom-12 left-12 z-20 text-left max-w-sm">
                    <p className="font-sans text-lg text-gray-300 leading-relaxed">
                       Models you remember.
                       <br />
                       Faces you can't unsee.
                    </p>
                </div>
            </div>
            
            {/* 2. Scrollable Content (foreground layer) */}
            <div className="relative z-10">
                {/* Spacer div to push content below the hero */}
                <div id="home-section-spacer" className="h-screen" />

                {/* Wrapper for sticky sections */}
                <div className="relative">
                    {/* Section 2: About Me (Sticky) */}
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
                    
                    {/* Section 3: Work Preview (Scrolls over About) */}
                    <section id="work-section" className="relative z-20 bg-dark-bg">
                        {/* Tall container to define the scroll duration for the horizontal effect */}
                        <div ref={workContainerRef} className="h-[400vh] relative">
                             {/* Sticky content that stays in view while the tall container is scrolled */}
                            <div className="sticky top-0 h-screen w-full flex flex-col justify-center overflow-hidden">
                                <div className="container mx-auto px-6 mb-12">
                                     <p className="tracking-widest uppercase text-sm mb-4 text-gray-500 text-left">(02) WORKS</p>
                                </div>
                                <div className="horizontal-scroll-wrapper">
                                    <div ref={horizontalTrackRef} className="horizontal-scroll-track">
                                        {projects.map(project => (
                                            <Link to={`/portfolio/${project.id}`} key={project.id} className="work-gallery-item group block relative">
                                                <img src={project.thumbnail} alt={project.title} />
                                                <div className="absolute inset-0 bg-black/50 group-hover:bg-black/70 transition-all duration-300 flex items-end p-6">
                                                     <div className="transform translate-y-8 group-hover:translate-y-0 transition-transform duration-300">
                                                        <h3 className="font-display text-2xl text-white font-bold">{project.title}</h3>
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
                
                {/* Section 4: Contact */}
                <section id="contact-section" className="py-20 bg-dark-bg relative z-30">
                    <div className="container mx-auto px-6 text-center max-w-2xl">
                         <h2 className="font-display text-4xl font-bold text-white mb-4">Get In Touch</h2>
                         <p className="text-gray-400 mb-8">Have a project in mind or just want to say hello? I'd love to hear from you.</p>
                         <ContactForm />
                    </div>
                </section>
            </div>
        </div>
    );
};

export const PortfolioPage: React.FC = () => {
    const { projects } = useData();
    return (
        <div className="container mx-auto px-6 py-12 animate-fadeIn pt-16 min-h-screen">
            <h1 className="font-display text-5xl font-bold text-center mb-12 text-white">Our Work</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {projects.map(project => <ProjectCard key={project.id} project={project} />)}
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
        <div className="container mx-auto px-6 py-12 animate-fadeIn pt-16">
            <div className="text-center mb-12">
                <h1 className="font-display text-5xl font-bold text-white">{project.title}</h1>
                <p className="text-xl text-gray-400 mt-2">{project.client}</p>
            </div>
            <div className="mb-12">
                {project.images.map((img, index) => (
                    <img key={index} src={img} alt={`${project.title} - view ${index + 1}`} className="w-full h-auto object-cover rounded-lg mb-8 shadow-lg" />
                ))}
            </div>
            <div className="max-w-3xl mx-auto">
                <h2 className="font-display text-3xl font-bold text-white mb-4">Project Description</h2>
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{project.description}</p>
            </div>
        </div>
    );
};

export const BlogPage: React.FC = () => {
    const { blogPosts } = useData();
    return (
        <div className="container mx-auto px-6 py-12 animate-fadeIn pt-16 min-h-screen">
            <h1 className="font-display text-5xl font-bold text-center mb-12 text-white">From the Blog</h1>
            <div className="max-w-3xl mx-auto space-y-8">
                {blogPosts.map(post => <BlogCard key={post.id} post={post} />)}
            </div>
        </div>
    );
};

export const BlogPostPage: React.FC = () => {
    const { id } = useParams();
    const { blogPosts } = useData();
    const post = blogPosts.find(p => p.id === id);

    if (!post) return <div className="container mx-auto px-6 py-12 pt-16">Post not found.</div>;

    return (
        <div className="container mx-auto px-6 py-12 animate-fadeIn pt-16">
            <div className="max-w-3xl mx-auto">
                <h1 className="font-display text-5xl font-bold text-white leading-tight">{post.title}</h1>
                <p className="text-gray-500 mt-4">{post.date} by {post.author}</p>
                <img src={post.imageUrl} alt={post.title} className="w-full h-auto object-cover rounded-lg my-8 shadow-lg" />
                <div className="prose prose-invert prose-lg text-gray-300 leading-relaxed whitespace-pre-wrap">
                    {post.content}
                </div>
            </div>
        </div>
    );
};

export const AboutPage: React.FC = () => {
    const { settings } = useData();

    return (
        <section className="bg-white min-h-screen flex items-center">
            <div className="container mx-auto px-6 py-20 animate-fadeIn">
                <div className="grid grid-cols-1 md:grid-cols-10 gap-12 items-center">
                    <div className="w-full max-w-sm mx-auto md:col-span-3">
                        <CreativeImageFrame imageUrl={settings.about.photo} />
                    </div>
                    <div className="md:col-span-7">
                         <h1 className="font-display text-5xl font-bold text-black mb-6">About Me</h1>
                         <p className="text-black text-lg leading-spacious whitespace-pre-wrap">{settings.about.bio}</p>
                    </div>
                </div>
            </div>
        </section>
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
        // Simple hardcoded password check
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
                <h1 className="font-display text-3xl font-bold tracking-widest text-white text-center">AURA_ADMIN</h1>
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
                <h2 className="font-display text-2xl font-bold text-white mb-4">Quick Links</h2>
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
    // Simplified form state for this example
    const [title, setTitle] = useState('');
    const [client, setClient] = useState('');

    const handleAddProject = () => {
        if (!title || !client) return;
        addProject({ 
            title, client, 
            description: 'New project description.', 
            images: ['https://picsum.photos/seed/new-project/1920/1080'], 
            thumbnail: 'https://picsum.photos/seed/new-thumb/600/400', 
            isFeatured: false 
        });
        setTitle('');
        setClient('');
    };

    return (
        <div>
            <PageTitle subtitle="Add, edit, and manage your portfolio projects.">Portfolio Manager</PageTitle>
            <div className="bg-dark-card p-6 border border-dark-border rounded-lg mb-8">
                 <h3 className="font-display text-xl text-white mb-4">Add New Project</h3>
                 <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                     <Input placeholder="Project Title" value={title} onChange={e => setTitle(e.target.value)} />
                     <Input placeholder="Client Name" value={client} onChange={e => setClient(e.target.value)} />
                     <Button onClick={handleAddProject}>Add Project</Button>
                 </div>
            </div>

            <div className="bg-dark-card border border-dark-border rounded-lg overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-black/20">
                        <tr>
                            <th className="p-4 font-semibold">Title</th>
                            <th className="p-4 font-semibold">Client</th>
                            <th className="p-4 font-semibold text-center">Featured</th>
                            <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map(p => (
                            <tr key={p.id} className="border-t border-dark-border">
                                <td className="p-4">{p.title}</td>
                                <td className="p-4 text-gray-400">{p.client}</td>
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
                    <h3 className="font-display text-xl text-white mb-4">About Section</h3>
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