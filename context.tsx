
import React, { createContext, useState, useContext, ReactNode } from 'react';
import { Project, BlogPost, SiteSettings } from './types';
import { INITIAL_PROJECTS, INITIAL_BLOG_POSTS, INITIAL_SITE_SETTINGS } from './constants';

interface DataContextType {
    projects: Project[];
    blogPosts: BlogPost[];
    settings: SiteSettings;
    isAuthenticated: boolean;
    login: () => void;
    logout: () => void;
    updateProject: (project: Project) => void;
    addProject: (project: Omit<Project, 'id'>) => void;
    deleteProject: (id: string) => void;
    updateBlogPost: (post: BlogPost) => void;
    addBlogPost: (post: Omit<BlogPost, 'id'>) => void;
    deleteBlogPost: (id: string) => void;
    updateSettings: (settings: SiteSettings) => void;
    setFeaturedProject: (id: string) => void;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

export const DataProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
    const [blogPosts, setBlogPosts] = useState<BlogPost[]>(INITIAL_BLOG_POSTS);
    const [settings, setSettings] = useState<SiteSettings>(INITIAL_SITE_SETTINGS);
    const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

    const login = () => setIsAuthenticated(true);
    const logout = () => setIsAuthenticated(false);

    const addProject = (projectData: Omit<Project, 'id'>) => {
        const newProject: Project = { ...projectData, id: `project-${Date.now()}` };
        setProjects(prev => [newProject, ...prev]);
    };

    const updateProject = (updatedProject: Project) => {
        setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    };

    const deleteProject = (id: string) => {
        setProjects(prev => prev.filter(p => p.id !== id));
    };

    const setFeaturedProject = (id: string) => {
        setProjects(prev => prev.map(p => ({ ...p, isFeatured: p.id === id })));
    };
    
    const addBlogPost = (postData: Omit<BlogPost, 'id'>) => {
        const newPost: BlogPost = { ...postData, id: `post-${Date.now()}` };
        setBlogPosts(prev => [newPost, ...prev]);
    };

    const updateBlogPost = (updatedPost: BlogPost) => {
        setBlogPosts(prev => prev.map(p => p.id === updatedPost.id ? updatedPost : p));
    };

    const deleteBlogPost = (id: string) => {
        setBlogPosts(prev => prev.filter(p => p.id !== id));
    };

    const updateSettings = (newSettings: SiteSettings) => {
        setSettings(newSettings);
    };

    const value = {
        projects,
        blogPosts,
        settings,
        isAuthenticated,
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
