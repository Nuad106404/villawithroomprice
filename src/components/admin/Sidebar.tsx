import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, CalendarRange, Settings } from 'lucide-react';
import { cn } from '../../lib/utils';

interface SidebarProps {
  className?: string;
  isMobileMenuOpen?: boolean;
}

const navItems = [
  {
    label: 'Overview',
    path: '/admin',
    icon: LayoutDashboard,
    exact: true,
  },
  {
    label: 'Bookings',
    path: '/admin/bookings',
    icon: CalendarRange,
  },
  {
    label: 'Settings',
    path: '/admin/settings',
    icon: Settings,
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ 
  className,
  isMobileMenuOpen = false
}) => {
  const [hoveredPath, setHoveredPath] = React.useState<string | null>(null);

  return (
    <aside
      className={cn(
        "fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out",
        "w-72 glass-morphism dark:glass-morphism-dark",
        "border-r border-surface-200/50 dark:border-surface-700/50",
        "lg:translate-x-0",
        isMobileMenuOpen ? "translate-x-0" : "-translate-x-full",
        className
      )}
    >
      {/* Logo */}
      <div className="h-16 flex items-center justify-center border-b border-surface-200/50 dark:border-surface-700/50">
        <span className="text-2xl font-display font-semibold text-gradient">
          Admin Panel
        </span>
      </div>

      {/* Navigation */}
      <nav className="h-[calc(100%-4rem)] p-4">
        <div className="space-y-2.5">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              onMouseEnter={() => setHoveredPath(item.path)}
              onMouseLeave={() => setHoveredPath(null)}
              className={({ isActive }) =>
                cn(
                  "group relative flex items-center w-full p-3 rounded-xl transition-all duration-300 ease-out",
                  "hover:bg-surface-100/80 dark:hover:bg-surface-800/80",
                  "focus:outline-none focus:ring-2 focus:ring-brand-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900",
                  isActive && [
                    "bg-brand-50 dark:bg-brand-900/20",
                    "before:absolute before:inset-0 before:rounded-xl",
                    "before:border before:border-brand-200/50 dark:before:border-brand-800/50",
                    "before:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]",
                    "after:absolute after:inset-0 after:rounded-xl",
                    "after:shadow-[0_0_12px_-3px_rgba(230,138,0,0.2)] dark:after:shadow-[0_0_12px_-3px_rgba(255,165,26,0.2)]",
                  ]
                )
              }
            >
              {({ isActive }) => (
                <>
                  {/* Hover gradient background */}
                  <div
                    className={cn(
                      "absolute inset-0 rounded-xl opacity-0 transition-opacity duration-300",
                      "bg-gradient-to-r from-brand-50/50 to-transparent dark:from-brand-900/20 dark:to-transparent",
                      hoveredPath === item.path && !isActive && "opacity-100"
                    )}
                  />
                  
                  {/* Icon */}
                  <item.icon
                    className={cn(
                      "relative h-5 w-5 flex-shrink-0 transition-all duration-300 ease-out mr-3",
                      isActive
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-surface-400 group-hover:text-surface-900 dark:text-surface-500 dark:group-hover:text-surface-300",
                      hoveredPath === item.path &&
                        !isActive &&
                        "translate-x-0.5 text-brand-500 dark:text-brand-400"
                    )}
                    aria-hidden="true"
                  />

                  {/* Label */}
                  <span
                    className={cn(
                      "relative text-sm font-medium transition-all duration-300 ease-out",
                      isActive
                        ? "text-brand-600 dark:text-brand-400"
                        : "text-surface-600 group-hover:text-surface-900 dark:text-surface-400 dark:group-hover:text-surface-200",
                      hoveredPath === item.path &&
                        !isActive &&
                        "translate-x-0.5 text-brand-500 dark:text-brand-400"
                    )}
                  >
                    {item.label}
                  </span>

                  {/* Active indicator line */}
                  <div
                    className={cn(
                      "absolute right-3 top-1/2 -translate-y-1/2 w-1 h-6 rounded-full transition-all duration-300 ease-out",
                      isActive
                        ? "bg-gradient-to-b from-brand-500 to-brand-600 opacity-100"
                        : "opacity-0",
                      hoveredPath === item.path &&
                        !isActive &&
                        "opacity-100 bg-gradient-to-b from-surface-300 to-surface-400 dark:from-surface-600 dark:to-surface-700 h-4"
                    )}
                  />
                </>
              )}
            </NavLink>
          ))}
        </div>

        {/* User section */}
        <div className="absolute bottom-8 left-4 right-4">
          <div 
            className={cn(
              "p-4 rounded-xl transition-all duration-300 ease-out",
              "bg-gradient-to-br from-surface-100/80 to-surface-50/80 dark:from-surface-800/80 dark:to-surface-900/80",
              "hover:from-surface-100 hover:to-surface-50 dark:hover:from-surface-800 dark:hover:to-surface-900",
              "backdrop-blur-sm",
              "border border-surface-200/50 dark:border-surface-700/50",
              "group"
            )}
          >
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand-400 to-brand-600 flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
                  <span className="text-white font-medium text-sm">A</span>
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full bg-green-500 border-2 border-white dark:border-surface-900" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-surface-900 dark:text-surface-100 truncate transition-colors">
                  Admin User
                </p>
                <p className="text-xs text-surface-500 dark:text-surface-400 truncate transition-colors">
                  admin@example.com
                </p>
              </div>
            </div>
          </div>
        </div>
      </nav>
    </aside>
  );
};
