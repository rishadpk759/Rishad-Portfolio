import type { Project, BlogPost, SiteSettings, ProjectCategory } from './types';

export interface Service {
    title: string;
    description: string;
    imageUrl: string;
    points: string[];
}

export interface Experience {
    years: string;
    title: string;
    company: string;
}

export interface Fact {
    number: string;
    text: string;
}

export const PORTFOLIO_CATEGORIES: string[] = ['All', 'Branding', 'UI/UX', 'Marketing & Creatives'];

export const FACTS: Fact[] = [
    {
        number: '100+',
        text: 'Brands Served',
    },
    {
        number: '30+',
        text: 'Big Projects Done',
    },
    {
        number: '10+',
        text: 'Industries Served',
    },
    {
        number: '5',
        text: 'Years of Experience',
    },
    {
        number: '100%',
        text: 'Client Satisfaction',
    }
];

export const WORK_HISTORY: Experience[] = [
    {
        years: '2025 - Present',
        title: 'Lead Designer',
        company: 'Dhefor Trading Company, UAE',
    },
    {
        years: '2024 - Present',
        title: 'Senior Designer',
        company: 'Infinite Trading Company, KSA',
    },
    {
        years: '2023 - Present',
        title: 'Graphic Designer',
        company: 'Pacific TRading Company. Qatar',
    },
    {
        years: '2023 - 2023',
        title: 'Designer',
        company: 'Thakkol Creatives, Kozhikode',
    },
    {
        years: '2022 - Present',
        title: 'Freelance Designer',
        company: 'Global Clients',
    },
];

export const SERVICES: Service[] = [
    {
        title: 'Branding & Identity',
        description: 'Building unique brand identities that make businesses stand out and stay memorable.',
        imageUrl: 'https://picsum.photos/seed/branding-service/800/1200',
        points: ['Logo Design', 'Brand Guidelines', 'Visual Identity Systems']
    },
    {
        title: 'UI/UX & Digital Design',
        description: 'Designing clean, user-focused websites and digital experiences that deliver results.',
        imageUrl: 'https://picsum.photos/seed/uiux-service/800/1200',
        points: ['Website & App UI', 'Wireframes & Prototypes', 'Responsive Design']
    },
    {
        title: 'Digital Marketing & Strategy',
        description: 'Creating smart marketing designs and campaigns that drive growth and engagement.',
        imageUrl: 'https://picsum.photos/seed/marketing-service/800/1200',
        points: ['Social Media Creatives', 'Marketing Campaign Design', 'Presentation & Proposal Design']
    }
];

export const BLANK_SITE_SETTINGS: SiteSettings = {
    siteTitle: "Rishad's Portfolio",
    heroName: "RISHAD PK",
    heroImage: "",
    about: {
        bio: "",
        photo: ''
    },
    contact: {
        email: '',
        phone: ''
    },
    social: {
        twitter: '',
        linkedin: '',
        github: '',
        instagram: '',
        facebook: '',
        behance: '',
    }
};