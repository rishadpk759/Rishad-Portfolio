import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './context';
import { HomePage, PortfolioPage, ProjectDetailPage, BlogPage, BlogPostPage, AboutPage, ContactPage, AdminLoginPage, AdminDashboardPage, AdminPortfolioManager, AdminBlogManager, AdminSettingsPage, AdminLayout, PublicLayout, AdminPortfolioEditor, AdminBlogEditor } from './pages';

const App: React.FC = () => {
    return (
        <DataProvider>
            <HashRouter>
                <AppContent />
            </HashRouter>
        </DataProvider>
    );
};

const AppContent: React.FC = () => {
    const { settings } = useData();

    // Effect to handle the pre-loading screen and dynamic title
    useEffect(() => {
        document.title = settings.siteTitle;
        const loader = document.getElementById('loader');
        const loaderName = document.querySelector('#loader .loader-name');
        if (loaderName) {
            loaderName.textContent = settings.heroName;
        }

        if (loader) {
            const timer = setTimeout(() => {
                loader.classList.add('loader-hidden');
                setTimeout(() => {
                    loader.style.display = 'none';
                }, 500);
            }, 2500);
            return () => clearTimeout(timer);
        }
    }, [settings]);

    return <AppRoutes />;
};

const AppRoutes: React.FC = () => {
    const location = useLocation();

    return (
        <div key={location.pathname}>
            <Routes>
                {/* Public Routes */}
                <Route element={<PublicLayout />}>
                    <Route path="/" element={<HomePage />} />
                    <Route path="/portfolio" element={<PortfolioPage />} />
                    <Route path="/portfolio/:id" element={<ProjectDetailPage />} />
                    <Route path="/blog" element={<BlogPage />} />
                    <Route path="/blog/:id" element={<BlogPostPage />} />
                    <Route path="/about" element={<AboutPage />} />
                    <Route path="/contact" element={<ContactPage />} />
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="portfolio" element={<AdminPortfolioManager />} />
                    <Route path="portfolio/add" element={<AdminPortfolioEditor />} />
                    <Route path="portfolio/edit/:id" element={<AdminPortfolioEditor />} />
                    <Route path="blog" element={<AdminBlogManager />} />
                    <Route path="blog/add" element={<AdminBlogEditor />} />
                    <Route path="blog/edit/:id" element={<AdminBlogEditor />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
            </Routes>
        </div>
    );
};

export default App;