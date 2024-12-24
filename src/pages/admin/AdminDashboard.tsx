import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchDashboardStats, fetchRecentBookings } from '../../store/slices/adminSlice';
import { Card } from '../../components/ui/Card';
import { Calendar, Clock, DollarSign } from 'lucide-react';
import { formatPrice } from '../../lib/utils';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { stats, recentBookings, loading, error } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    const fetchData = async () => {
      await Promise.all([
        dispatch(fetchDashboardStats()),
        dispatch(fetchRecentBookings())
      ]);
    };
    fetchData();
  }, [dispatch]);

  if (error) {
    return (
      <div className="p-4">
        <div className="bg-red-50 text-red-500 p-4 rounded-lg">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-semibold">Dashboard Overview</h2>
      
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-4">
        <Card className="bg-blue-50 dark:bg-blue-900 p-4">
          <div className="flex items-center space-x-4">
            <Calendar className="h-8 w-8 text-blue-500 dark:text-blue-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Bookings</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {loading ? '...' : stats.totalBookings}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-yellow-50 dark:bg-yellow-900 p-4">
          <div className="flex items-center space-x-4">
            <Clock className="h-8 w-8 text-yellow-500 dark:text-yellow-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Pending Payments</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {loading ? '...' : stats.pendingPayments}
              </p>
            </div>
          </div>
        </Card>

        <Card className="bg-green-50 dark:bg-green-900 p-4">
          <div className="flex items-center space-x-4">
            <DollarSign className="h-8 w-8 text-green-500 dark:text-green-400" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Revenue</p>
              <p className="text-2xl font-semibold text-gray-900 dark:text-white">
                {loading ? '...' : formatPrice(stats.totalRevenue)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Recent Bookings */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold">Recent Bookings</h3>
        </div>
        <div className="p-4">
          {loading ? (
            <div className="text-center py-4">Loading...</div>
          ) : recentBookings.length > 0 ? (
            <div className="space-y-4">
              {recentBookings.map((booking) => (
                <div 
                  key={booking._id} 
                  className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {booking.customerName}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(booking.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className={`px-3 py-1 rounded-full text-sm ${
                      booking.status === 'confirmed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                        : booking.status === 'pending' || booking.status === 'pending_payment'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : booking.status === 'in_review'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-600 dark:text-gray-200'
                    }`}>
                      {booking.status === 'in_review' ? 'In review' : 
                       booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No recent bookings found
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
