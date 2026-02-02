/**
 * PageLayout Component
 * 
 * Standard page layout with optional sidebar for dashboard views.
 */
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { cn } from '@/lib/utils';

const PageLayout = ({
    children,
    showSidebar = false,
    showFooter = true,
    className,
}) => {
    return (
        <div className="min-h-screen flex flex-col bg-gray-50">
            <Header />

            <div className="flex-1 flex">
                {showSidebar && <Sidebar />}

                <main
                    className={cn(
                        'flex-1',
                        showSidebar ? 'p-6' : '',
                        className
                    )}
                >
                    {children}
                </main>
            </div>

            {showFooter && <Footer />}
        </div>
    );
};

// Dashboard layout variant (with sidebar, no footer)
export const DashboardLayout = ({ children, className }) => (
    <PageLayout showSidebar showFooter={false} className={className}>
        {children}
    </PageLayout>
);

// Landing layout variant (no sidebar, with footer)
export const LandingLayout = ({ children, className }) => (
    <PageLayout showSidebar={false} showFooter className={className}>
        {children}
    </PageLayout>
);

export default PageLayout;
