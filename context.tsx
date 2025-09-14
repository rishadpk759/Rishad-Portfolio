
import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import { Project, BlogPost, SiteSettings } from './types';
import { BLANK_SITE_SETTINGS } from './constants';
import { supabase } from './supabaseClient';

// --- HELPER FUNCTIONS ---

// New helper to get file extension from MIME type
const getExtensionFromMimeType = (mimeType: string): string => {
    const mimeMap: { [key: string]: string } = {
        'image/jpeg': 'jpg',
        'image/png': 'png',
        'image/gif': 'gif',
        'image/webp': 'webp',
        'image/svg+xml': 'svg',
    };
    return mimeMap[mimeType] || 'bin';
}

// Converts a base64 string to a File object
const dataURLtoFile = (dataurl: string, filename: string): File => {
    const arr = dataurl.split(',');
    const mimeMatch = arr[0].match(/:(.*?);/);
    if (!mimeMatch) throw new Error('Invalid mime type');
    const mime = mimeMatch[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
    }
    const extension = getExtensionFromMimeType(mime);
    const filenameWithExt = `${filename}.${extension}`;
    return new File([u8arr], filenameWithExt, { type: mime });
};

// Uploads a base64 image string to Supabase storage
const uploadBase64Image = async (base64String: string, bucket: string): Promise<string> => {
    if (!base64String.startsWith('data:image')) {
        return base64String; // It's already a URL, so no need to upload
    }
    const file = dataURLtoFile(base64String, `upload-${Date.now()}`);
    const filePath = `${bucket}/${file.name}`;

    const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
    if (uploadError) {
        console.error('Error uploading image to Supabase:', uploadError.message);
        throw new Error(`Supabase upload failed: ${uploadError.message}`);
    }

    const { data } = supabase.storage.from('images').getPublicUrl(filePath);
    return data.publicUrl;
};

// --- DATA CONTEXT ---
interface DataContextType {
    projects: Project[];
    blogPosts: BlogPost[];
    settings: SiteSettings;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: () => void;
    logout: () => void;
    updateProject: (project: Project) => Promise<void>;
    addProject: (project: Omit<Project, 'id'>) => Promise<void>;
    deleteProject: (id: string) => Promise<void>;
    updateBlogPost: (post: BlogPost) => Promise<void>;
    addBlogPost: (post: Omit<BlogPost, 'id'>) => Promise<void>;
    deleteBlogPost: (id: string) => Promise<void>;
    updateSettings: (settings: SiteSettings) => Promise<void>;
    setFeaturedProject: (id: string) => Promise<void>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
    const [settings, setSettings] = useState<SiteSettings>(BLANK_SITE_SETTINGS);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
    const [isLoading, setIsLoading] = useState<boolean>(true);

    // Fetch all data from Supabase on initial load
    useEffect(() => {
        const fetchAllData = async () => {
            setIsLoading(true);
            try {
                const [projectsRes, blogPostsRes, settingsRes] = await Promise.all([
                    supabase.from('projects').select('*').order('created_at', { ascending: false }),
                    supabase.from('blog_posts').select('*').order('date', { ascending: false }),
                    supabase.from('settings').select('*').eq('id', 1).single()
                ]);

                if (projectsRes.error) throw projectsRes.error;
                if (blogPostsRes.error) throw blogPostsRes.error;
                if (settingsRes.error) throw settingsRes.error;
                
                setProjects(projectsRes.data || []);
                setBlogPosts(blogPostsRes.data || []);
                
                // Format settings from DB response to match nested structure
                if (settingsRes.data) {
                    setSettings({
                        siteTitle: settingsRes.data.siteTitle,
                        heroName: settingsRes.data.heroName,
                        heroImage: settingsRes.data.heroImage,
                        about: { bio: settingsRes.data.about_bio, photo: settingsRes.data.about_photo },
                        contact: { email: settingsRes.data.contact_email, phone: settingsRes.data.contact_phone },
                        social: {
                            twitter: settingsRes.data.social_twitter,
                            linkedin: settingsRes.data.social_linkedin,
                            github: settingsRes.data.social_github,
                            instagram: settingsRes.data.social_instagram,
                            facebook: settingsRes.data.social_facebook,
                            behance: settingsRes.data.social_behance,
                        }
                    });
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllData();
    }, []);
    
    // Periodically increment random view counts
    useEffect(() => {
        const interval = setInterval(async () => {
             if (blogPosts.length === 0) return;
             const randomIndex = Math.floor(Math.random() * blogPosts.length);
             const postToUpdate = blogPosts[randomIndex];
             const randomIncrement = Math.floor(Math.random() * 5) + 1;
             const newViews = (postToUpdate.views || 0) + randomIncrement;

             const { error } = await supabase
                .from('blog_posts')
                .update({ views: newViews })
                .eq('id', postToUpdate.id);
            
            if (!error) {
                setBlogPosts(prevPosts => prevPosts.map(p => p.id === postToUpdate.id ? {...p, views: newViews} : p));
            }
        }, 15000); // every 15 seconds
        return () => clearInterval(interval);
    }, [blogPosts]);


    const login = () => setIsAuthenticated(true);
    const logout = () => setIsAuthenticated(false);

    const addProject = async (projectData: Omit<Project, 'id'>) => {
        const thumbnail = await uploadBase64Image(projectData.thumbnail, 'thumbnails');
        const images = await Promise.all(projectData.images.map(img => uploadBase64Image(img, 'project-images')));
        
        const { data, error } = await supabase.from('projects').insert([{...projectData, thumbnail, images}]).select();
        if (error) throw error;
        if (data) setProjects(prev => [data[0], ...prev]);
    };

    const updateProject = async (updatedProject: Project) => {
        const thumbnail = await uploadBase64Image(updatedProject.thumbnail, 'thumbnails');
        const images = await Promise.all(updatedProject.images.map(img => uploadBase64Image(img, 'project-images')));
        
        const { data, error } = await supabase.from('projects').update({...updatedProject, thumbnail, images}).eq('id', updatedProject.id).select();
        if (error) throw error;
        if (data) setProjects(prev => prev.map(p => p.id === updatedProject.id ? data[0] : p));
    };

    const deleteProject = async (id: string) => {
        const { error } = await supabase.from('projects').delete().eq('id', id);
        if (error) throw error;
        setProjects(prev => prev.filter(p => p.id !== id));
    };

    const setFeaturedProject = async (id: string) => {
        await supabase.from('projects').update({ isFeatured: false }).neq('id', id);
        await supabase.from('projects').update({ isFeatured: true }).eq('id', id);
        setProjects(prev => prev.map(p => ({ ...p, isFeatured: p.id === id })));
    };
    
    const addBlogPost = async (postData: Omit<BlogPost, 'id'>) => {
        const imageUrl = await uploadBase64Image(postData.imageUrl, 'blog-covers');

        const { data, error } = await supabase.from('blog_posts').insert([{ ...postData, imageUrl, views: 0 }]).select();
        if (error) throw error;
        if (data) setBlogPosts(prev => [data[0], ...prev]);
    };

    const updateBlogPost = async (updatedPost: BlogPost) => {
        const imageUrl = await uploadBase64Image(updatedPost.imageUrl, 'blog-covers');

        const { data, error } = await supabase.from('blog_posts').update({ ...updatedPost, imageUrl }).eq('id', updatedPost.id).select();
        if (error) throw error;
        if (data) setBlogPosts(prev => prev.map(p => p.id === updatedPost.id ? data[0] : p));
    };

    const deleteBlogPost = async (id: string) => {
        const { error } = await supabase.from('blog_posts').delete().eq('id', id);
        if (error) throw error;
        setBlogPosts(prev => prev.filter(p => p.id !== id));
    };

    const updateSettings = async (newSettings: SiteSettings) => {
        const [heroImage, aboutPhoto] = await Promise.all([
            uploadBase64Image(newSettings.heroImage, 'site-assets'),
            uploadBase64Image(newSettings.about.photo, 'site-assets')
        ]);
        
        // Flatten nested structure for DB update
        const settingsForDb = {
            siteTitle: newSettings.siteTitle,
            heroName: newSettings.heroName,
            heroImage,
            about_bio: newSettings.about.bio,
            about_photo: aboutPhoto,
            contact_email: newSettings.contact.email,
            contact_phone: newSettings.contact.phone,
            social_twitter: newSettings.social.twitter,
            social_linkedin: newSettings.social.linkedin,
            social_github: newSettings.social.github,
            social_instagram: newSettings.social.instagram,
            social_facebook: newSettings.social.facebook,
            social_behance: newSettings.social.behance,
        };
        
        const { error } = await supabase.from('settings').update(settingsForDb).eq('id', 1);
        if (error) throw error;
        setSettings(newSettings);
    };

    const value = {
        projects,
        blogPosts,
        settings,
        isAuthenticated,
        isLoading,
        login,
        logout,
        addProject,
        updateProject,
        deleteProject,
        setFeaturedProject,
        addBlogPost,
        updateBlogPost,
        deleteBlogPost,
        updateSettings,
    };

    return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};

export const useData = () => {
    const context = useContext(DataContext);
    if (context === undefined) {
        throw new Error('useData must be used within a DataProvider');
    }
    return context;
};
