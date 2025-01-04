import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { ArrowLeft, Check, Download } from 'lucide-react';
import { bookingApi } from '../../services/api';
import { Button } from '../ui/button';
import { BookingSteps } from './BookingSteps';
import { PriceBreakdown } from './PriceBreakdown';
import { CountdownTimer } from './CountdownTimer';
import { format } from 'date-fns';
import { BookingLayout } from './BookingLayout';
import jsPDF from 'jspdf';
import { formatPrice } from '../../lib/utils';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';

export function BookingConfirmation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = React.useState(true);
  const [booking, setBooking] = React.useState(null);
  const { villa } = useSelector((state: RootState) => state.villa);

  const handleBackToMain = () => {
    navigate('/');
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });
    
    // Set font
    doc.setFont('helvetica', 'normal');
    
    // Add decorative header
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 210, 40, 'F');
    doc.setDrawColor(218, 165, 32); // Gold color
    doc.setLineWidth(0.5);
    doc.line(15, 40, 195, 40);

    // Add luxury title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor(32, 32, 32);
    const villaName = villa?.name?.en || 'LUXURY POOL VILLA';
    doc.text(villaName.toUpperCase(), 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Booking Confirmation', 105, 30, { align: 'center' });

    // Reset text color
    doc.setTextColor(0, 0, 0);
    
    // Add booking reference
    doc.setFontSize(10);
    doc.setTextColor(128, 128, 128);
    doc.text(`Booking Reference: ${booking._id}`, 105, 50, { align: 'center' });
    doc.text(`Booking Date: ${format(new Date(), 'PPP')}`, 105, 55, { align: 'center' });

    // Add decorative line
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(0.3);
    doc.line(40, 60, 170, 60);
    
    // Add booking details with improved styling
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(32, 32, 32);
    doc.text('Booking Details', 20, 75);
    
    // Add golden decorative element
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(0.3);
    doc.line(20, 78, 80, 78);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(64, 64, 64);

    // Two-column layout for booking details
    const col1X = 20;
    const col2X = 110;
    let y = 90;

    // Column 1
    doc.text('Check-in:', col1X, y);
    doc.setFont('helvetica', 'bold');
    doc.text(format(new Date(booking.bookingDetails.checkIn), 'PPP'), col1X + 30, y);
    
    // Column 2
    doc.setFont('helvetica', 'normal');
    doc.text('Check-out:', col2X, y);
    doc.setFont('helvetica', 'bold');
    doc.text(format(new Date(booking.bookingDetails.checkOut), 'PPP'), col2X + 30, y);

    y += 15;
    doc.setFont('helvetica', 'normal');
    doc.text('Guests:', col1X, y);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.bookingDetails.guests.toString(), col1X + 30, y);

    doc.setFont('helvetica', 'normal');
    doc.text('Status:', col2X, y);
    doc.setFont('helvetica', 'bold');
    const statusText = {
      pending: 'Pending',
      in_review: 'In Review',
      confirmed: 'Confirmed',
      cancelled: 'Cancelled',
    }[booking.status] || booking.status;
    doc.text(statusText, col2X + 30, y);

    // Customer Information section
    y += 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(32, 32, 32);
    doc.text('Guest Information', 20, y);
    
    // Add golden decorative element
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(0.3);
    doc.line(20, y + 3, 90, y + 3);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(64, 64, 64);
    
    y += 15;
    doc.text('Guest Name:', col1X, y);
    doc.setFont('helvetica', 'bold');
    doc.text(`${booking.customerInfo.firstName} ${booking.customerInfo.lastName}`, col1X + 35, y);
    
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Email:', col1X, y);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.customerInfo.email, col1X + 35, y);
    
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Phone:', col1X, y);
    doc.setFont('helvetica', 'bold');
    doc.text(booking.customerInfo.phone, col1X + 35, y);

    // Price Breakdown section
    y += 30;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(32, 32, 32);
    doc.text('Price Details', 20, y);
    
    // Add golden decorative element
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(0.3);
    doc.line(20, y + 3, 80, y + 3);

    const numberOfNights = Math.ceil(
      (new Date(booking.bookingDetails.checkOut).getTime() - 
       new Date(booking.bookingDetails.checkIn).getTime()) / 
      (1000 * 60 * 60 * 24)
    );
    const basePrice = booking.bookingDetails.totalPrice * 0.93;
    const taxes = booking.bookingDetails.totalPrice * 0.07;
    
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(64, 64, 64);
    
    y += 15;
    doc.text('Base Price:', col1X, y);
    doc.setFont('helvetica', 'bold');
    doc.text(formatPrice(basePrice), col2X, y);
    
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Number of Nights:', col1X, y);
    doc.setFont('helvetica', 'bold');
    doc.text(numberOfNights.toString(), col2X, y);
    
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.text('Taxes & Fees:', col1X, y);
    doc.setFont('helvetica', 'bold');
    doc.text(formatPrice(taxes), col2X, y);

    // Add decorative line before total
    y += 5;
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(0.3);
    doc.line(col1X, y, 170, y);
    
    y += 10;
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text('Total:', col1X, y);
    doc.text(formatPrice(booking.bookingDetails.totalPrice), col2X, y);

    // Add footer with decorative elements
    doc.setDrawColor(218, 165, 32);
    doc.setLineWidth(0.5);
    doc.line(15, 270, 195, 270);
    
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 275, 210, 22, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(128, 128, 128);
    doc.text(`Thank you for choosing ${villaName}`, 105, 282, { align: 'center' });
    doc.text('We look forward to welcoming you', 105, 288, { align: 'center' });

    // Save the PDF
    doc.save(`luxury-villa-booking-${booking._id}.pdf`);
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
            onClick={handleDownloadPDF}
            className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 mb-4"
          >
            <Download className="w-4 h-4" />
            {t('booking.confirmation.downloadReceipt')}
          </Button>
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