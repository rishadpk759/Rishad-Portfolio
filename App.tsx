import React, { useEffect } from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DataProvider, useData } from './context';
import { HomePage, PortfolioPage, ProjectDetailPage, BlogPage, BlogPostPage, AboutPage, ContactPage, ServicesPage, AdminLoginPage, AdminDashboardPage, AdminPortfolioManager, AdminBlogManager, AdminSettingsPage, AdminLayout, PublicLayout, AdminPortfolioEditor, AdminBlogEditor, AdminServicesManager } from './pages';

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
            (loaderName as HTMLElement).textContent = settings.heroName;
        }

        if (loader) {
            // Disable scrolling while loader is visible
            const previousOverflow = document.body.style.overflow;
            const previousTouchAction = (document.body.style as any).touchAction as string | undefined;
            document.body.style.overflow = 'hidden';
            (document.body.style as any).touchAction = 'none';
            const timer = setTimeout(() => {
                loader.classList.add('loader-hidden');
                setTimeout(() => {
                    (loader as HTMLElement).style.display = 'none';
                    // Re-enable scrolling
                    document.body.style.overflow = previousOverflow || '';
                    (document.body.style as any).touchAction = previousTouchAction || '';
                }, 500);
            }, 2500);
            return () => {
                clearTimeout(timer);
                // Ensure scroll is restored on unmount or dependency change
                document.body.style.overflow = previousOverflow || '';
                (document.body.style as any).touchAction = previousTouchAction || '';
            };
        }
    }, [settings]);

    return <>
        <ScrollToTop />
        <AppRoutes />
    </>;
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
                    <Route path="/services" element={<ServicesPage />} />
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
                    <Route path="services" element={<AdminServicesManager />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
            </Routes>
        </div>
    );
};

export default App;

// Scroll to top on route change
const ScrollToTop: React.FC = () => {
    const location = useLocation();
    useEffect(() => {
        window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }, [location.pathname]);
    return null;
};