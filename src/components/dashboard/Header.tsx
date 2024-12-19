import React from 'react';
import { Bell, Sun, Moon } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAppSelector } from '../../hooks/useAppSelector';

interface HeaderProps {
  toggleTheme: () => void;
  isDarkMode: boolean;
}

export function Header({ toggleTheme, isDarkMode }: HeaderProps) {
  const { user } = useAppSelector((state) => state.auth);

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex-1" />
          
          <div className="flex items-center space-x-4">
            {/* Theme Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleTheme}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              {isDarkMode ? (
                <Sun className="w-5 h-5" />
              ) : (
                <Moon className="w-5 h-5" />
              )}
            </motion.button>

            {/* Notifications */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="p-2 text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors relative"
            >
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
            </motion.button>

            {/* User Profile */}
            <div className="flex items-center space-x-3">
              <motion.img
                whileHover={{ scale: 1.05 }}
                src={`https://ui-avatars.com/api/?name=${encodeURIComponent(
                  user?.firstName || ''
                )}+${encodeURIComponent(
                  user?.lastName || ''
                )}&background=random`}
                alt="User avatar"
                className="w-8 h-8 rounded-full"
              />
              <div className="hidden md:flex flex-col">
                <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                  {user?.firstName} {user?.lastName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
