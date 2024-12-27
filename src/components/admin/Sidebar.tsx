import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  CalendarDays, 
  Home, 
  Hotel,
  Wallet 
} from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  isMobileMenuOpen?: boolean;
}

export const Sidebar: React.FC<SidebarProps> = ({ isMobileMenuOpen }) => {
  const menuItems = [
    {
      label: 'Dashboard',
      path: '/admin',
      icon: LayoutDashboard,
    },
    {
      label: 'Bank',
      path: '/admin/bank',
      icon: Wallet,
    },
    {
      label: 'Villa',
      path: '/admin/villa',
      icon: Hotel,
    },
    {
      label: 'Bookings',
      path: '/admin/bookings',
      icon: CalendarDays,
    },
    {
      label: 'Back to Home',
      path: '/',
      icon: Home,
    }
  ];

  return (
    <div
      className={cn(
        'fixed inset-y-0 left-0 z-40 w-72 transform bg-white dark:bg-gray-800 shadow-lg transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      )}
    >
      <div className="h-16 flex items-center justify-center border-b dark:border-gray-700">
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
      </div>
      
      <nav className="p-4 space-y-2">
        {menuItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-amber-50 text-amber-600 dark:bg-amber-900 dark:text-amber-400'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
              )
            }
          >
            {item.icon && <item.icon className="w-5 h-5" />}
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>
    </div>
  );
};
