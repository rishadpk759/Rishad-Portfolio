
import React from 'react';
import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { DataProvider } from './context';
import { HomePage, PortfolioPage, ProjectDetailPage, BlogPage, BlogPostPage, AboutPage, AdminLoginPage, AdminDashboardPage, AdminPortfolioManager, AdminBlogManager, AdminSettingsPage, AdminLayout, PublicLayout } from './pages';

const App: React.FC = () => {
    return (
        <DataProvider>
            <HashRouter>
                <AppRoutes />
            </HashRouter>
        </DataProvider>
    );
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
                </Route>

                {/* Admin Routes */}
                <Route path="/admin/login" element={<AdminLoginPage />} />
                <Route path="/admin" element={<AdminLayout />}>
                    <Route index element={<AdminDashboardPage />} />
                    <Route path="portfolio" element={<AdminPortfolioManager />} />
                    <Route path="blog" element={<AdminBlogManager />} />
                    <Route path="settings" element={<AdminSettingsPage />} />
                </Route>
            </Routes>
        </div>
    );
};

export default App;
