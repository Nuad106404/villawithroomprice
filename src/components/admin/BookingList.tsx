import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { format } from 'date-fns';
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  CheckCircle,
  XCircle,
  MoreVertical,
  Calendar,
  Edit2,
  Trash2,
} from 'lucide-react';
import { axiosInstance } from '../../lib/axios';

interface Booking {
  _id: string;
  bookingId: string;
  customer: {
    firstName: string;
    lastName: string;
    email: string;
    phone?: string;
  };
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
  };
  amount: number;
  status: 'pending' | 'approved' | 'canceled';
  specialRequests?: string;
  createdAt: string;
}

interface BookingListResponse {
  bookings: Booking[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export function BookingList() {
  const { t } = useTranslation();
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string>('');
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({});

  // Fetch bookings
  const { data, isLoading } = useQuery<BookingListResponse>({
    queryKey: ['bookings', page, search, status, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(search && { search }),
        ...(status && { status }),
        ...(dateRange.from && { dateFrom: dateRange.from.toISOString() }),
        ...(dateRange.to && { dateTo: dateRange.to.toISOString() }),
      });

      const response = await axiosInstance.get(`/api/admin/bookings?${params}`);
      return response.data;
    },
  });

  // Update booking status
  const updateStatus = useMutation({
    mutationFn: async ({
      bookingId,
      status,
    }: {
      bookingId: string;
      status: string;
    }) => {
      const response = await axiosInstance.patch(
        `/api/admin/bookings/${bookingId}`,
        { status }
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  // Delete booking
  const deleteBooking = useMutation({
    mutationFn: async (bookingId: string) => {
      await axiosInstance.delete(`/api/admin/bookings/${bookingId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">
          {t('admin.bookings.title')}
        </h1>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t('admin.bookings.searchPlaceholder')}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent dark:bg-gray-700 dark:text-white appearance-none"
            >
              <option value="">{t('admin.bookings.allStatuses')}</option>
              <option value="pending">{t('admin.bookings.statusPending')}</option>
              <option value="approved">{t('admin.bookings.statusApproved')}</option>
              <option value="canceled">{t('admin.bookings.statusCanceled')}</option>
            </select>
            <Filter className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* Date Range */}
          <div className="relative">
            <input
              type="date"
              value={dateRange.from?.toISOString().split('T')[0] || ''}
              onChange={(e) =>
                setDateRange((prev) => ({
                  ...prev,
                  from: e.target.value ? new Date(e.target.value) : undefined,
                }))
              }
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          <div className="relative">
            <input
              type="date"
              value={dateRange.to?.toISOString().split('T')[0] || ''}
              onChange={(e) =>
                setDateRange((prev) => ({
                  ...prev,
                  to: e.target.value ? new Date(e.target.value) : undefined,
                }))
              }
              className="w-full pl-10 pr-4 py-2 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent dark:bg-gray-700 dark:text-white"
            />
            <Calendar className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden">
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
                  {t('admin.bookings.guests')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.bookings.amount')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.bookings.status')}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {t('admin.bookings.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {data?.bookings.map((booking) => (
                <motion.tr
                  key={booking._id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {booking.bookingId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900 dark:text-white">
                      {`${booking.customer.firstName} ${booking.customer.lastName}`}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {booking.customer.email}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(booking.checkIn), 'MMM d')} -{' '}
                    {format(new Date(booking.checkOut), 'MMM d, yyyy')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {booking.guests.adults + booking.guests.children}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${booking.amount.toFixed(2)}
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
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() =>
                          updateStatus.mutate({
                            bookingId: booking._id,
                            status:
                              booking.status === 'pending'
                                ? 'approved'
                                : 'pending',
                          })
                        }
                        className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300"
                      >
                        {booking.status === 'pending' ? (
                          <CheckCircle className="h-5 w-5" />
                        ) : (
                          <XCircle className="h-5 w-5" />
                        )}
                      </button>
                      <button
                        onClick={() => {
                          // Handle edit
                        }}
                        className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        <Edit2 className="h-5 w-5" />
                      </button>
                      <button
                        onClick={() => {
                          if (
                            window.confirm(
                              t('admin.bookings.deleteConfirmation')
                            )
                          ) {
                            deleteBooking.mutate(booking._id);
                          }
                        }}
                        className="text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {data?.pagination && (
          <div className="px-6 py-4 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                {t('admin.bookings.showing', {
                  from: (page - 1) * 10 + 1,
                  to: Math.min(page * 10, data.pagination.total),
                  total: data.pagination.total,
                })}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <span className="text-sm text-gray-700 dark:text-gray-300">
                {page} / {data.pagination.pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.pages, p + 1))}
                disabled={page === data.pagination.pages}
                className="px-3 py-1 rounded-md bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 disabled:opacity-50"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
