import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ArrowLeft, Check } from 'lucide-react';
import { bookingApi } from '../../services/api';
import { Button } from '../ui/button';
import { BookingSteps } from './BookingSteps';
import { PriceBreakdown } from './PriceBreakdown';
import { CountdownTimer } from './CountdownTimer';
import { format } from 'date-fns';
import { BookingLayout } from './BookingLayout';

export function BookingConfirmation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = React.useState(true);
  const [booking, setBooking] = React.useState(null);

  const handleBackToMain = () => {
    navigate('/');
  };

  React.useEffect(() => {
    async function fetchBooking() {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const bookingData = await bookingApi.getBooking(id);
        if (!bookingData) {
          toast.error(t('booking.errors.notFound'));
          navigate('/');
          return;
        }
        setBooking(bookingData);
      } catch (error) {
        console.error('Error fetching booking:', error);
        toast.error(t('booking.errors.fetchFailed'));
        navigate('/');
      } finally {
        setIsLoading(false);
      }
    }

    fetchBooking();
  }, [id, navigate, t]);

  if (isLoading || !booking) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <BookingLayout>
      <BookingSteps currentStep={3} />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('booking.confirmation.title')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('booking.confirmation.subtitle')}
          </p>
        </div>

        <div className="space-y-6">
          {/* Booking Details */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">{t('booking.confirmation.details')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400">{t('booking.confirmation.checkIn')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(booking.bookingDetails.checkIn), 'PPP')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">{t('booking.confirmation.checkOut')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {format(new Date(booking.bookingDetails.checkOut), 'PPP')}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">{t('booking.confirmation.guests')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{booking.bookingDetails.guests}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">{t('booking.confirmation.status')}</p>
                <p className="font-medium capitalize text-gray-900 dark:text-white">
                  {t(`booking.confirmation.statusTypes.${booking.status}`)}
                </p>
              </div>
            </div>
          </div>

          {/* Customer Information */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">{t('booking.confirmation.customerInfo')}</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-gray-600 dark:text-gray-400">{t('booking.confirmation.name')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.customerInfo.firstName} {booking.customerInfo.lastName}
                </p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">{t('booking.form.email')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{booking.customerInfo.email}</p>
              </div>
              <div>
                <p className="text-gray-600 dark:text-gray-400">{t('booking.form.phone')}</p>
                <p className="font-medium text-gray-900 dark:text-white">{booking.customerInfo.phone}</p>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <h3 className="font-semibold mb-4 text-gray-900 dark:text-white">{t('booking.confirmation.priceBreakdown')}</h3>
            <PriceBreakdown 
              breakdown={{
                basePrice: booking.bookingDetails.totalPrice * 0.93,
                numberOfNights: Math.ceil(
                  (new Date(booking.bookingDetails.checkOut).getTime() - 
                   new Date(booking.bookingDetails.checkIn).getTime()) / 
                  (1000 * 60 * 60 * 24)
                ),
                taxes: booking.bookingDetails.totalPrice * 0.07,
                total: booking.bookingDetails.totalPrice
              }} 
            />
          </div>

          {/* Payment Timer */}
          {booking.status === 'pending_payment' && (
            <div className="mt-6">
              <CountdownTimer
                expiryTime={new Date(booking.createdAt).getTime() + 24 * 60 * 60 * 1000}
                onExpire={() => {
                  toast.error(t('booking.payment.expired'));
                  navigate('/');
                }}
              />
            </div>
          )}
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleBackToMain}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
          >
            {t('common.backToMain')}
          </Button>
        </div>
      </motion.div>
    </BookingLayout>
  );
}