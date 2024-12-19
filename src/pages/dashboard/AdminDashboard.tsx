import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Users, Calendar, TrendingUp } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ReactNode;
  trend?: string;
  trendUp?: boolean;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, icon, trend, trendUp }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
  >
    <div className="flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
        <p className="text-2xl font-semibold text-gray-900 dark:text-white mt-1">{value}</p>
      </div>
      <div className="p-3 bg-amber-100 dark:bg-amber-900 rounded-lg">
        {icon}
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center">
        <TrendingUp
          className={`h-4 w-4 ${
            trendUp ? 'text-green-500' : 'text-red-500'
          }`}
        />
        <span
          className={`ml-2 text-sm font-medium ${
            trendUp ? 'text-green-500' : 'text-red-500'
          }`}
        >
          {trend}
        </span>
      </div>
    )}
  </motion.div>
);

const AdminDashboard: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">Welcome to your admin dashboard</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Bookings"
          value="128"
          icon={<Calendar className="h-6 w-6 text-amber-600" />}
          trend="+12.5% from last month"
          trendUp={true}
        />
        <StatCard
          title="Active Users"
          value="2,847"
          icon={<Users className="h-6 w-6 text-amber-600" />}
          trend="+8.2% from last month"
          trendUp={true}
        />
        <StatCard
          title="Revenue"
          value="฿458,200"
          icon={<BarChart3 className="h-6 w-6 text-amber-600" />}
          trend="+15.3% from last month"
          trendUp={true}
        />
        <StatCard
          title="Occupancy Rate"
          value="87%"
          icon={<TrendingUp className="h-6 w-6 text-amber-600" />}
          trend="+5.1% from last month"
          trendUp={true}
        />
      </div>

      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Activity</h2>
          <div className="space-y-4">
            {[
              { time: '2 hours ago', text: 'New booking received from John Doe' },
              { time: '4 hours ago', text: 'Payment confirmed for booking #1234' },
              { time: '6 hours ago', text: 'Booking cancelled by user #5678' },
              { time: '8 hours ago', text: 'New user registration: jane@example.com' },
            ].map((activity, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="flex-shrink-0 w-2 h-2 mt-2 rounded-full bg-amber-600" />
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">{activity.text}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-2 gap-4">
            {[
              { text: 'View All Bookings', href: '/admin/bookings' },
              { text: 'Manage Users', href: '/admin/users' },
              { text: 'View Reports', href: '/admin/reports' },
              { text: 'Settings', href: '/admin/settings' },
            ].map((action, index) => (
              <a
                key={index}
                href={action.href}
                className="flex items-center justify-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors duration-200"
              >
                <span className="text-sm font-medium text-gray-900 dark:text-white">
                  {action.text}
                </span>
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default AdminDashboard;
