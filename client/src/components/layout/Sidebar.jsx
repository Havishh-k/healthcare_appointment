/**
 * Sidebar Component
 * 
 * Collapsible sidebar for dashboard with role-based menu items.
 */
import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Stethoscope,
    Building2,
    Clock,
    Settings,
    ChevronLeft,
    ChevronRight,
} from 'lucide-react';

const Sidebar = ({ className }) => {
    const [collapsed, setCollapsed] = useState(false);
    const { role } = useAuth();
    const location = useLocation();

    // Role-based menu items
    const menuItems = {
        patient: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: Calendar, label: 'My Appointments', href: '/appointments' },
            { icon: Stethoscope, label: 'Find Doctors', href: '/doctors' },
            { icon: Building2, label: 'Departments', href: '/departments' },
            { icon: Settings, label: 'Settings', href: '/settings' },
        ],
        doctor: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/dashboard' },
            { icon: Calendar, label: 'Appointments', href: '/appointments' },
            { icon: Clock, label: 'My Schedule', href: '/schedule' },
            { icon: Users, label: 'Patients', href: '/patients' },
            { icon: Settings, label: 'Settings', href: '/settings' },
        ],
        admin: [
            { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
            { icon: Users, label: 'Users', href: '/admin/users' },
            { icon: Stethoscope, label: 'Doctors', href: '/admin/doctors' },
            { icon: Building2, label: 'Departments', href: '/admin/departments' },
            { icon: Calendar, label: 'Appointments', href: '/admin/appointments' },
            { icon: Settings, label: 'Settings', href: '/admin/settings' },
        ],
    };

    const items = menuItems[role] || menuItems.patient;

    return (
        <aside
            className={cn(
                'hidden md:flex bg-white border-r border-gray-100 h-screen sticky top-16 transition-all duration-300',
                collapsed ? 'w-16' : 'w-64',
                className
            )}
        >
            <div className="flex flex-col h-full">
                {/* Navigation */}
                <nav className="flex-1 p-3 space-y-1">
                    {items.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.href;

                        return (
                            <NavLink
                                key={item.href}
                                to={item.href}
                                className={cn(
                                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors',
                                    'hover:bg-gray-50',
                                    isActive && 'bg-primary-50 text-primary-700 font-medium'
                                )}
                            >
                                <Icon
                                    className={cn(
                                        'w-5 h-5 flex-shrink-0',
                                        isActive ? 'text-primary-600' : 'text-gray-500'
                                    )}
                                />
                                {!collapsed && (
                                    <span className="text-sm">{item.label}</span>
                                )}
                            </NavLink>
                        );
                    })}
                </nav>

                {/* Collapse Toggle */}
                <div className="p-3 border-t border-gray-100">
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-gray-500 hover:bg-gray-50 transition-colors"
                    >
                        {collapsed ? (
                            <ChevronRight className="w-5 h-5" />
                        ) : (
                            <>
                                <ChevronLeft className="w-5 h-5" />
                                <span className="text-sm">Collapse</span>
                            </>
                        )}
                    </button>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
