import React, { useState } from 'react';
import { MoonIcon, SunIcon, BellIcon, Search, UserCircle, Command, X, Menu } from 'lucide-react';
import { useThemeContext } from '../../context/ThemeContext';
import { cn } from '../../lib/utils';

interface DashboardHeaderProps {
  className?: string;
  onMobileMenuToggle?: () => void;
  isMobileMenuOpen?: boolean;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({ 
  className,
  onMobileMenuToggle,
  isMobileMenuOpen 
}) => {
  const { theme, toggleTheme } = useThemeContext();
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchExpanded, setIsSearchExpanded] = useState(false);

  const handleSearchFocus = () => {
    setIsSearchFocused(true);
    setIsSearchExpanded(true);
  };

  const handleSearchBlur = () => {
    setIsSearchFocused(false);
    if (!searchQuery) {
      setIsSearchExpanded(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    setIsSearchExpanded(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('admin-search');
      if (searchInput) {
        searchInput.focus();
      }
    }
  };

  React.useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 right-0 left-0 z-30 h-16 glass-morphism dark:glass-morphism-dark",
        "border-b border-surface-200/50 dark:border-surface-700/50",
        className
      )}
    >
      <div className="h-full px-4 flex items-center justify-between gap-4">
        {/* Mobile menu button */}
        <button
          type="button"
          onClick={onMobileMenuToggle}
          className={cn(
            "lg:hidden p-2 rounded-lg transition-colors duration-200",
            "text-surface-600 hover:text-surface-900 hover:bg-surface-100/50",
            "dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800/50",
            "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900"
          )}
        >
          <span className="sr-only">
            {isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          </span>
          {isMobileMenuOpen ? (
            <X className="h-5 w-5" />
          ) : (
            <Menu className="h-5 w-5" />
          )}
        </button>

        {/* Search */}
        <div 
          className={cn(
            "transition-all duration-300 ease-in-out",
            isSearchExpanded ? "flex-1 max-w-xl" : "w-40 md:w-64 lg:w-80",
          )}
        >
          <div className="relative group">
            <div 
              className={cn(
                "absolute inset-0 rounded-lg transition-all duration-300",
                "bg-surface-100/30 dark:bg-surface-800/30",
                isSearchFocused && "ring-1 ring-surface-200 dark:ring-surface-700"
              )}
            />
            <div className="relative flex items-center">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Search 
                  className={cn(
                    "h-4 w-4 transition-colors duration-300",
                    "text-surface-400"
                  )} 
                  aria-hidden="true" 
                />
              </div>
              <input
                id="admin-search"
                type="search"
                placeholder={isSearchExpanded ? "Search..." : "Search"}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={handleSearchFocus}
                onBlur={handleSearchBlur}
                className={cn(
                  "block w-full rounded-lg border-0 py-1.5 pl-10",
                  isSearchExpanded ? "pr-14" : "pr-4",
                  "bg-transparent",
                  "text-surface-900 dark:text-surface-100",
                  "placeholder:text-surface-400/80 dark:placeholder:text-surface-500/80",
                  "focus:outline-none focus:ring-0",
                  "text-sm transition-all duration-300",
                )}
              />
              <div 
                className={cn(
                  "absolute inset-y-0 right-0 flex items-center pr-3 gap-2",
                  "transition-opacity duration-200",
                  !isSearchExpanded && "opacity-0"
                )}
              >
                {searchQuery && (
                  <button
                    onClick={clearSearch}
                    className={cn(
                      "p-1 rounded-md transition-all duration-200",
                      "text-surface-400 hover:text-surface-500",
                      "dark:text-surface-500 dark:hover:text-surface-400",
                      "focus:outline-none"
                    )}
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
                <kbd 
                  className={cn(
                    "hidden sm:flex h-5 items-center gap-1 rounded px-1.5",
                    "text-[10px] font-medium text-surface-400",
                    "transition-opacity duration-300",
                    isSearchFocused && "opacity-0"
                  )}
                >
                  <Command className="h-3 w-3" />
                  K
                </kbd>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Notifications */}
          <button
            type="button"
            className={cn(
              "relative p-2 rounded-lg transition-colors duration-200",
              "text-surface-600 hover:text-surface-900 hover:bg-surface-100/50",
              "dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800/50",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900"
            )}
          >
            <span className="sr-only">View notifications</span>
            <BellIcon className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-brand-500 ring-2 ring-white dark:ring-surface-900" />
          </button>

          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            className={cn(
              "p-2 rounded-lg transition-colors duration-200",
              "text-surface-600 hover:text-surface-900 hover:bg-surface-100/50",
              "dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800/50",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900"
            )}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <SunIcon className="h-5 w-5" />
            ) : (
              <MoonIcon className="h-5 w-5" />
            )}
          </button>

          {/* Profile */}
          <button
            type="button"
            className={cn(
              "flex items-center gap-2 px-2 py-1.5 rounded-lg transition-colors duration-200",
              "text-surface-600 hover:text-surface-900 hover:bg-surface-100/50",
              "dark:text-surface-400 dark:hover:text-surface-200 dark:hover:bg-surface-800/50",
              "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900"
            )}
          >
            <span className="sr-only">Open user menu</span>
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center">
              <span className="text-white font-medium text-sm">A</span>
            </div>
            <span className="hidden sm:block text-sm font-medium">Admin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
