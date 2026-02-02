/**
 * Admin Sidebar Navigation
 */
import { NavLink } from 'react-router-dom';
import {
    LayoutDashboard,
    Calendar,
    Users,
    Building2,
    UserCircle,
    Settings,
    LogOut
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const navItems = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/admin/appointments', icon: Calendar, label: 'Appointments' },
    { to: '/admin/doctors', icon: Users, label: 'Doctors' },
    { to: '/admin/departments', icon: Building2, label: 'Departments' },
    { to: '/admin/patients', icon: UserCircle, label: 'Patients' },
];

const AdminSidebar = () => {
    const { signOut, profile } = useAuth();

    return (
        <aside className="w-64 bg-gray-900 text-white flex flex-col min-h-screen">
            {/* Logo */}
            <div className="p-6 border-b border-gray-800">
                <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    🏥 HealthBook
                </h1>
                <p className="text-xs text-gray-400 mt-1">Admin Panel</p>
            </div>

            {/* Navigation */}
            <nav className="flex-1 p-4">
                <ul className="space-y-1">
                    {navItems.map(({ to, icon: Icon, label, end }) => (
                        <li key={to}>
                            <NavLink
                                to={to}
                                end={end}
                                className={({ isActive }) =>
                                    `flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive
                                        ? 'bg-primary-600 text-white'
                                        : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                                    }`
                                }
                            >
                                <Icon className="w-5 h-5" />
                                {label}
                            </NavLink>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* User Section */}
            <div className="p-4 border-t border-gray-800">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-primary-600 flex items-center justify-center">
                        {profile?.full_name?.charAt(0) || 'A'}
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                            {profile?.full_name || 'Admin'}
                        </p>
                        <p className="text-xs text-gray-400 truncate">
                            {profile?.email || 'admin@healthbook.com'}
                        </p>
                    </div>
                </div>
                <button
                    onClick={signOut}
                    className="w-full flex items-center gap-2 px-4 py-2 text-gray-300 hover:bg-gray-800 hover:text-white rounded-lg transition-colors"
                >
                    <LogOut className="w-4 h-4" />
                    Sign Out
                </button>
            </div>
        </aside>
    );
};

export default AdminSidebar;
