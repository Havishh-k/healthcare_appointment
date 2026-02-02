/**
 * Admin Layout
 * 
 * Layout wrapper for admin pages with sidebar navigation.
 * Includes admin role check - redirects non-admins.
 */
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Spinner } from '@/components/ui';
import AdminSidebar from './AdminSidebar';

const AdminLayout = () => {
    const { isAuthenticated, isAdmin, loading } = useAuth();

    // Show loading spinner while checking auth
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-100">
                <Spinner size="lg" />
            </div>
        );
    }

    // Redirect if not authenticated
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    // Redirect if not admin
    if (!isAdmin) {
        return <Navigate to="/dashboard" replace />;
    }

    return (
        <div className="flex min-h-screen bg-gray-100">
            <AdminSidebar />
            <main className="flex-1 overflow-auto">
                <div className="p-8">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
