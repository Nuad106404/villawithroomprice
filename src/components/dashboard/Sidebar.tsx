import React from 'react';
import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  LayoutDashboard,
  Users,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Calendar,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { logout } from '../../store/slices/authSlice';

interface SidebarProps {
  isCollapsed: boolean;
  toggleSidebar: () => void;
}

export function Sidebar({ isCollapsed, toggleSidebar }: SidebarProps) {
  const { t } = useTranslation();
  const dispatch = useAppDispatch();

  const handleLogout = () => {
    dispatch(logout());
    // Navigate to home page after logout
    window.location.href = '/';
  };

  const menuItems = [
    {
      path: '/admin/dashboard',
      name: t('dashboard.overview'),
      icon: LayoutDashboard,
    },
    {
      path: '/admin/bookings',
      name: t('dashboard.bookings'),
      icon: Calendar,
    },
    {
      path: '/admin/users',
      name: t('dashboard.users'),
      icon: Users,
    },
    {
      path: '/admin/settings',
      name: t('dashboard.settings'),
      icon: Settings,
    },
  ];

  return (
    <motion.div
      initial={{ width: isCollapsed ? 80 : 250 }}
      animate={{ width: isCollapsed ? 80 : 250 }}
      className="h-screen bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col"
    >
      <div className="p-4 flex items-center justify-between">
        {!isCollapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-xl font-bold text-amber-600"
          >
            Admin
          </motion.span>
        )}
        <button
          onClick={toggleSidebar}
          className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
        >
          {isCollapsed ? (
            <ChevronRight className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          ) : (
            <ChevronLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
          )}
        </button>
      </div>

      <nav className="flex-1 overflow-y-auto">
        <ul className="p-2 space-y-1">
          {menuItems.map((item) => (
            <motion.li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center px-4 py-2 rounded-lg transition-colors ${
                    isActive
                      ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-600 dark:text-amber-400'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }`
                }
              >
                <item.icon className="h-5 w-5" />
                {!isCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="ml-3"
                  >
                    {item.name}
                  </motion.span>
                )}
              </NavLink>
            </motion.li>
          ))}
        </ul>
      </nav>

      <div className="p-2 border-t border-gray-200 dark:border-gray-800">
        <button
          onClick={handleLogout}
          className="w-full flex items-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
        >
          <LogOut className="h-5 w-5" />
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="ml-3"
            >
              {t('auth.logout')}
            </motion.span>
          )}
        </button>
      </div>
    </motion.div>
  );
}
