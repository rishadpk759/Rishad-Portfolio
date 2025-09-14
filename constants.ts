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

export const INITIAL_PROJECTS: Project[] = [
    {
        id: 'project-1',
        title: 'Project Cyberscape',
        client: 'SynthWave Inc.',
        description: 'A full branding and UI/UX design for a next-generation music streaming platform. The design focuses on a neon-noir aesthetic, creating an immersive experience for users. We developed a custom design system to ensure consistency across all platforms.',
        images: ['https://picsum.photos/seed/cyberscape1/1920/1080', 'https://picsum.photos/seed/cyberscape2/1920/1080', 'https://picsum.photos/seed/cyberscape3/1920/1080'],
        isFeatured: true,
        thumbnail: 'https://picsum.photos/seed/cyberscape-thumb/600/400',
        category: 'UI/UX',
    },
    {
        id: 'project-2',
        title: 'Neo-Tokyo Ad Campaign',
        client: 'Future Dynamics',
        description: 'A series of futuristic ad visuals for a high-tech product launch. The campaign was rolled out across digital billboards in major cities, blending photorealism with sci-fi elements.',
        images: ['https://picsum.photos/seed/neotokyo1/1920/1080', 'https://picsum.photos/seed/neotokyo2/1920/1080'],
        isFeatured: false,
        thumbnail: 'https://picsum.photos/seed/neotokyo-thumb/600/400',
        category: 'Marketing & Creatives',
    },
    {
        id: 'project-3',
        title: 'Starlight AR App',
        client: 'Cosmic Ventures',
        description: 'UI/UX design for an augmented reality mobile application that allows users to explore constellations. The interface is minimal and gesture-based to not obstruct the camera view.',
        images: ['https://picsum.photos/seed/starlight1/1920/1080'],
        isFeatured: false,
        thumbnail: 'https://picsum.photos/seed/starlight-thumb/600/400',
        category: 'UI/UX',
    },
    {
        id: 'project-4',
        title: 'AURA Identity',
        client: 'AURA Collective',
        description: 'Complete brand identity for a creative agency. The logo, typography, and color palette were designed to reflect a modern, edgy, and sophisticated style.',
        images: ['https://picsum.photos/seed/aura1/1920/1080', 'https://picsum.photos/seed/aura2/1920/1080'],
        isFeatured: false,
        thumbnail: 'https://picsum.photos/seed/aura-thumb/600/400',
        category: 'Branding',
    },
    {
        id: 'project-5',
        title: 'Quantum PC Visuals',
        client: 'Quantum Leap Computing',
        description: 'Marketing visuals for a quantum computer, emphasizing its power and futuristic nature through abstract particle animations and sleek hardware renders.',
        images: ['https://picsum.photos/seed/quantum1/1920/1080'],
        isFeatured: false,
        thumbnail: 'https://picsum.photos/seed/quantum-thumb/600/400',
        category: 'Marketing & Creatives',
    },
    {
        id: 'project-6',
        title: 'EcoPlanet Branding',
        client: 'Green Future Initiative',
        description: 'A fresh and optimistic brand identity for an environmental NGO. The design language uses organic shapes and a vibrant color palette to inspire action and hope.',
        images: ['https://picsum.photos/seed/eco1/1920/1080'],
        isFeatured: false,
        thumbnail: 'https://picsum.photos/seed/eco-thumb/600/400',
        category: 'Branding',
    },
    {
        id: 'project-7',
        title: 'Project Cyberscape v2',
        client: 'SynthWave Inc.',
        description: 'An updated branding and UI/UX design for the next phase of the music streaming platform, focusing on user-generated content and social features.',
        images: ['https://picsum.photos/seed/cyberscape-v2/1920/1080'],
        isFeatured: false,
        thumbnail: 'https://picsum.photos/seed/cyberscape-v2-thumb/600/400',
        category: 'UI/UX',
    },
    {
        id: 'project-8',
        title: 'Downtown Ad Campaign',
        client: 'Future Dynamics',
        description: 'A localized version of the Neo-Tokyo ad campaign, adapted for North American markets with new visuals and messaging.',
        images: ['https://picsum.photos/seed/downtown/1920/1080'],
        isFeatured: false,
        thumbnail: 'https://picsum.photos/seed/downtown-thumb/600/400',
        category: 'Marketing & Creatives',
    },
    {
        id: 'project-9',
        title: 'Moonlight AR App',
        client: 'Cosmic Ventures',
        description: 'A companion app to Starlight, this time focusing on lunar exploration and the history of space missions to the moon.',
        images: ['https://picsum.photos/seed/moonlight/1920/1080'],
        isFeatured: false,
        thumbnail: 'https://picsum.photos/seed/moonlight-thumb/600/400',
        category: 'UI/UX',
    },
    {
        id: 'project-10',
        title: 'AURA v2 Identity',
        client: 'AURA Collective',
        description: 'An evolution of the original brand identity, introducing motion design principles and a more dynamic color system for digital applications.',
        images: ['https://picsum.photos/seed/aurav2/1920/1080'],
        isFeatured: false,
        thumbnail: 'https://picsum.photos/seed/aurav2-thumb/600/400',
        category: 'Branding',
    },
     {
        id: 'project-11',
        title: 'Project DataStream',
        client: 'InfoCorp',
        description: 'UI/UX for a complex data visualization dashboard, making big data accessible and understandable through interactive charts and graphs.',
        images: ['https://picsum.photos/seed/datastream/1920/1080'],
        isFeatured: false,
        thumbnail: 'https://picsum.photos/seed/datastream-thumb/600/400',
        category: 'UI/UX',
    },
    {
        id: 'project-12',
        title: 'Velocity Racing UI',
        client: 'Adrenaline Games',
        description: 'In-game user interface design for a futuristic racing game, focusing on high-speed legibility and a HUD that feels integrated with the cockpit.',
        images: ['https://picsum.photos/seed/velocity/1920/1080'],
        isFeatured: false,
        thumbnail: 'https://picsum.photos/seed/velocity-thumb/600/400',
        category: 'UI/UX',
    }
];

export const INITIAL_BLOG_POSTS: BlogPost[] = [
    {
        id: 'post-1',
        title: 'The Rise of Neuromorphic Design',
        date: '2024-07-15',
        author: 'Alex Drake',
        excerpt: 'Exploring how design is adapting to brain-computer interfaces and what it means for the future of UI/UX.',
        content: 'Neuromorphic design is not just a trend; it\'s a paradigm shift. As technology becomes more integrated with our biology, the interfaces we design must become more intuitive, predictive, and seamless. This article delves into the core principles of neuromorphic design, showcasing examples from cutting-edge labs and conceptual projects that are paving the way for a new era of human-computer interaction.',
        imageUrl: 'https://picsum.photos/seed/neuro-post/800/400'
    },
    {
        id: 'post-2',
        title: 'Minimalism in a Maximalist World',
        date: '2024-06-28',
        author: 'Alex Drake',
        excerpt: 'How to create impactful, minimalist designs that cut through the noise of a digitally saturated world.',
        content: 'In an age of information overload, minimalism is more than an aesthetic choice; it\'s a functional necessity. Clean layouts, purposeful typography, and a restrained color palette can create a sense of calm and clarity, making content more accessible and engaging. We will analyze how giants like Apple and Google use minimalist principles to dominate their markets and how you can apply these techniques to your own work.',
        imageUrl: 'https://picsum.photos/seed/minimal-post/800/400'
    }
];

export const INITIAL_SITE_SETTINGS: SiteSettings = {
    about: {
        bio: "I'm a multidisciplinary graphic designer with a passion for crafting futuristic and minimalist digital experiences. With over a decade in the industry, I specialize in brand identity, UI/UX design, and creating visually stunning narratives that bridge the gap between technology and art. My work is driven by a desire to push boundaries and create interfaces that are not only beautiful but also intuitive and meaningful.",
        photo: 'https://rhamiktnjbxwcryluvof.supabase.co/storage/v1/object/public/Cover%20Image/Rishad.jpg'
    },
    contact: {
        email: 'contact@auradesign.dev',
        phone: '+1 (555) 123-4567'
    },
    social: {
        twitter: 'https://twitter.com',
        linkedin: 'https://linkedin.com',
        github: 'https://github.com'
    }
};