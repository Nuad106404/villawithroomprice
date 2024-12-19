import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import {
  CalendarDays,
  CheckCircle,
  Clock,
  XCircle,
  DollarSign,
  Users,
  Star,
  Home
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import { axiosInstance } from '../../lib/axios';

interface BookingSummary {
  total: number;
  approved: number;
  pending: number;
  canceled: number;
  revenue: number;
}

interface RecentBooking {
  _id: string;
  bookingId: string;
  customer: {
    firstName: string;
    lastName: string;
  };
  checkIn: string;
  checkOut: string;
  status: 'pending' | 'approved' | 'canceled';
  amount: number;
}

export function Dashboard() {
  const { t } = useTranslation();

  const { data: bookingSummary } = useQuery<BookingSummary>({
    queryKey: ['bookingSummary'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/admin/bookings/summary');
      return response.data;
    },
  });

  const { data: recentBookings } = useQuery<RecentBooking[]>({
    queryKey: ['recentBookings'],
    queryFn: async () => {
      const response = await axiosInstance.get('/api/admin/bookings/recent');
      return response.data;
    },
  });

  const stats = [
    {
      label: t('admin.dashboard.totalBookings'),
      value: bookingSummary?.total || 0,
      icon: CalendarDays,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: t('admin.dashboard.approvedBookings'),
      value: bookingSummary?.approved || 0,
      icon: CheckCircle,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: t('admin.dashboard.pendingBookings'),
      value: bookingSummary?.pending || 0,
      icon: Clock,
      color: 'text-amber-600',
      bgColor: 'bg-amber-100',
    },
    {
      label: t('admin.dashboard.canceledBookings'),
      value: bookingSummary?.canceled || 0,
      icon: XCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold mt-1">{stat.value}</p>
              </div>
              <div className={`p-3 rounded-full ${stat.bgColor}`}>
                <stat.icon className={`w-6 h-6 ${stat.color}`} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold">
            {t('admin.dashboard.recentBookings')}
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-900/50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.bookings.bookingId')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.bookings.customer')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.bookings.dates')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.bookings.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.bookings.amount')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {recentBookings?.map((booking) => (
                <tr
                  key={booking._id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {booking.bookingId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {`${booking.customer.firstName} ${booking.customer.lastName}`}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(booking.checkIn), 'MMM d')} -{' '}
                    {format(new Date(booking.checkOut), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        booking.status === 'approved'
                          ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                          : booking.status === 'pending'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/20 dark:text-amber-400'
                          : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
                      }`}
                    >
                      {t(`admin.bookings.status${booking.status}`)}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${booking.amount.toFixed(2)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.a
          href="/admin/bookings"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/20">
              <CalendarDays className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {t('admin.dashboard.manageBookings')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('admin.dashboard.manageBookingsDesc')}
              </p>
            </div>
          </div>
        </motion.a>

        <motion.a
          href="/admin/property"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-amber-100 dark:bg-amber-900/20">
              <Home className="w-6 h-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {t('admin.dashboard.manageProperty')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('admin.dashboard.managePropertyDesc')}
              </p>
            </div>
          </div>
        </motion.a>

        <motion.a
          href="/admin/reviews"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow"
        >
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-100 dark:bg-green-900/20">
              <Star className="w-6 h-6 text-green-600 dark:text-green-400" />
            </div>
            <div>
              <h3 className="text-lg font-semibold">
                {t('admin.dashboard.manageReviews')}
              </h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                {t('admin.dashboard.manageReviewsDesc')}
              </p>
            </div>
          </div>
        </motion.a>
      </div>
    </div>
  );
}
