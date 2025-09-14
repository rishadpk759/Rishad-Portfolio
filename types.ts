
export type ProjectCategory = 'Branding' | 'UI/UX' | 'Marketing & Creatives';

export interface Project {
    id: string;
    title: string;
    client: string;
    description: string;
    images: string[];
    isFeatured: boolean;
    thumbnail: string;
    category: ProjectCategory;
}

export interface BlogPost {
    id: string;
    title: string;
    date: string;
    author: string;
    excerpt: string;
    content: string;
    imageUrl: string;
}

export interface SiteSettings {
    about: {
        bio: string;
        photo: string;
    };
    contact: {
        email: string;
        phone: string;
    };
    social: {
        twitter: string;
        linkedin: string;
        github: string;
        instagram: string;
        facebook: string;
        behance: string;
    };
}