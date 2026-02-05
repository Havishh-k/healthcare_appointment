/**
 * Doctor Layout
 * 
 * Dashboard layout for doctor portal with sidebar navigation.
 */
import { useState } from 'react';
import { Outlet, NavLink, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, Button, Spinner } from '@/components/ui';
import {
    LayoutDashboard,
    Calendar,
    ClipboardList,
    Clock,
    Settings,
    LogOut,
    Menu,
    X,
    Stethoscope,
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
    { to: '/doctor', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/doctor/schedule', icon: Calendar, label: 'My Schedule' },
    { to: '/doctor/appointments', icon: ClipboardList, label: 'Appointments' },
    { to: '/doctor/availability', icon: Clock, label: 'Availability' },
    { to: '/doctor/settings', icon: Settings, label: 'Settings' },
];

const DoctorLayout = () => {
    const { user, profile, role, loading, signOut } = useAuth();
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    // Show loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Spinner size="lg" />
            </div>
        );
    }

    // Redirect if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // Redirect if not a doctor
    if (role !== 'doctor' && role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    const handleLogout = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/50 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar - Glass Effect */}
            <aside
                className={cn(
                    'fixed top-0 left-0 z-50 h-full w-64',
                    'bg-gradient-to-b from-white/95 to-white/98 backdrop-blur-xl',
                    'border-r border-gray-200/50 shadow-2xl lg:shadow-md',
                    'transform transition-transform duration-200 lg:translate-x-0',
                    sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                )}
            >
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                            <Stethoscope className="w-5 h-5 text-white" />
                        </div>
                        <span className="font-bold text-lg text-gray-900">Doctor Portal</span>
                    </div>
                    <button
                        className="lg:hidden p-1 hover:bg-gray-100 rounded"
                        onClick={() => setSidebarOpen(false)}
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="p-4 space-y-1">
                    {navItems.map((item) => (
                        <NavLink
                            key={item.to}
                            to={item.to}
                            end={item.end}
                            onClick={() => setSidebarOpen(false)}
                            className={({ isActive }) =>
                                cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                                    isActive
                                        ? 'bg-primary text-white'
                                        : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                                )
                            }
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </NavLink>
                    ))}
                </nav>

                {/* User section */}
                <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-3">
                        <Avatar name={profile?.full_name} size="sm" />
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">
                                Dr. {profile?.full_name}
                            </p>
                            <p className="text-xs text-gray-500 truncate">
                                {profile?.email}
                            </p>
                        </div>
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        className="w-full gap-2"
                        onClick={handleLogout}
                    >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                    </Button>
                </div>
            </aside>

            {/* Main content */}
            <div className="lg:pl-64">
                {/* Top bar */}
                <header className="h-16 bg-white border-b border-gray-200 flex items-center px-4 lg:px-6">
                    <button
                        className="lg:hidden p-2 hover:bg-gray-100 rounded-lg mr-4"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>
                    <h1 className="text-lg font-semibold text-gray-900">
                        Welcome, Dr. {profile?.full_name?.split(' ')[0]}
                    </h1>
                </header>

                {/* Page content */}
                <main className="p-4 lg:p-6">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default DoctorLayout;
