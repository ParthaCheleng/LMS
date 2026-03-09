import type { Metadata } from 'next';
import '@/styles/globals.css';

export const metadata: Metadata = {
    title: 'LMS - Learning Management System',
    description: 'A modern learning management system for structured video courses',
};

import HeaderAuth from '@/components/HeaderAuth';
import ThemeProvider from '@/components/ThemeProvider';
import ChatWidget from '@/components/ChatWidget';

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body className="min-h-screen bg-surface-50 text-surface-900 dark:bg-surface-950 dark:text-surface-50 antialiased transition-colors duration-200">
                <ThemeProvider>
                    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-surface-200 dark:border-surface-800 bg-white/90 dark:bg-surface-900/90 backdrop-blur-xl transition-colors duration-200">
                        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                            <div className="flex h-16 items-center justify-between">
                                <a href="/" className="flex items-center gap-2.5">
                                    <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-500">
                                        <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342" />
                                        </svg>
                                    </div>
                                    <span className="text-lg font-semibold text-surface-900">LMS Platform</span>
                                </a>

                                <div id="nav-auth-links">
                                    <HeaderAuth />
                                </div>
                            </div>
                        </div>
                    </nav>

                    {/* Main Content */}
                    <main className="pt-16">
                        {children}
                    </main>

                    <ChatWidget />
                </ThemeProvider>
            </body>
        </html>
    );
}
