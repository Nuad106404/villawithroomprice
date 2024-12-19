import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  ArrowUpRight,
  ArrowDownRight,
  DollarSign,
  Calendar,
  TrendingUp,
  Star,
} from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  trend: {
    value: string;
    isPositive: boolean;
  };
}

function StatCard({ title, value, icon: Icon, trend }: StatCardProps) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
            {title}
          </p>
          <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">
            {value}
          </p>
        </div>
        <div className="p-3 bg-amber-100 dark:bg-amber-900/50 rounded-lg">
          <Icon className="w-6 h-6 text-amber-600 dark:text-amber-400" />
        </div>
      </div>
      <div className="mt-4 flex items-center">
        <span
          className={`text-sm font-medium ${
            trend.isPositive
              ? 'text-green-600 dark:text-green-400'
              : 'text-red-600 dark:text-red-400'
          }`}
        >
          {trend.value}
        </span>
        {trend.isPositive ? (
          <ArrowUpRight className="w-4 h-4 ml-1 text-green-600 dark:text-green-400" />
        ) : (
          <ArrowDownRight className="w-4 h-4 ml-1 text-red-600 dark:text-red-400" />
        )}
        <span className="text-sm text-gray-500 dark:text-gray-400 ml-1.5">vs last month</span>
      </div>
    </motion.div>
  );
}

export function DashboardPage() {
  const { t } = useTranslation();

  const stats = [
    {
      title: t('dashboard.totalBookings'),
      value: '2,345',
      icon: Calendar,
      trend: { value: '+12.5%', isPositive: true },
    },
    {
      title: t('dashboard.totalRevenue'),
      value: '$123.4k',
      icon: DollarSign,
      trend: { value: '+8.2%', isPositive: true },
    },
    {
      title: t('dashboard.activeUsers'),
      value: '1,234',
      icon: Users,
      trend: { value: '+5.3%', isPositive: true },
    },
    {
      title: t('dashboard.avgRating'),
      value: '4.8',
      icon: Star,
      trend: { value: '+0.3', isPositive: true },
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.overview')}
        </h1>
        <div className="flex space-x-3">
          <select className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
          </select>
          <button className="bg-amber-600 text-white px-4 py-2 rounded-lg hover:bg-amber-700 transition-colors">
            {t('dashboard.download')}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <StatCard key={stat.title} {...stat} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('dashboard.recentBookings')}
            </h2>
            <button className="text-sm text-amber-600 hover:text-amber-700 dark:hover:text-amber-500">
              {t('dashboard.viewAll')}
            </button>
          </div>
          <div className="space-y-4">
            {[1, 2, 3].map((_, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className="flex-shrink-0">
                    <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                      <Users className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    </div>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      John Doe
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      2 nights · 2 guests
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    $299.00
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Dec 12 - 14
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-gray-900 dark:text-white">
              {t('dashboard.performance')}
            </h2>
            <button className="text-sm text-amber-600 hover:text-amber-700 dark:hover:text-amber-500">
              {t('dashboard.viewReport')}
            </button>
          </div>
          <div className="space-y-4">
            {[
              { label: t('dashboard.occupancyRate'), value: '85%', trend: '+5%' },
              { label: t('dashboard.avgDailyRate'), value: '$199', trend: '+$12' },
              { label: t('dashboard.revenuePerRoom'), value: '$169', trend: '+$8' },
            ].map((metric, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-900/50 rounded-lg"
              >
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {metric.label}
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {metric.value}
                  </p>
                </div>
                <div className="flex items-center text-green-600 dark:text-green-400">
                  <TrendingUp className="w-4 h-4 mr-1" />
                  <span className="text-sm font-medium">{metric.trend}</span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
