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
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { formatPrice } from '../../lib/utils';

interface Booking {
  _id: string;
  customerInfo: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
  };
  bookingDetails: {
    checkIn: string;
    checkOut: string;
    rooms: number;
    totalPrice: number;
  };
  status: string;
  createdAt: string;
  payment?: {
    slipUrl: string;
    date: string;
  };
}

export function BookingConfirmation() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = React.useState(true);
  const [booking, setBooking] = React.useState<Booking | null>(null);

  const villa = useSelector((state: RootState) => state.villa.villa);
  const basePrice = villa?.pricePerNight || 0;
  const discountedPrice = villa?.discountedPrice || 0;

  const handleBackToMain = () => {
    navigate('/');
  };

  const generateReceipt = () => {
    if (!booking) return;

    // Create PDF with custom font size
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // Format currency for PDF
    const formatPDFPrice = (amount: number) => {
      return new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amount);
    };

    // Format booking reference
    const formatBookingRef = (id: string | undefined) => {
      if (!id) return 'No Reference';
      return id;
    };

    // Add gradient background
    const addGradientBackground = () => {
      doc.setFillColor(255, 248, 240); // Light amber background
      doc.rect(0, 0, pageWidth, pageHeight, 'F');

      // Add decorative elements
      doc.setFillColor(245, 158, 11); // Amber-500
      doc.circle(0, 0, 30, 'F'); // Top-left circle
      doc.circle(pageWidth, pageHeight, 40, 'F'); // Bottom-right circle
    };

    // Add header image or pattern
    const addHeaderPattern = () => {
      doc.setFillColor(251, 191, 36); // Amber-400
      doc.rect(0, 0, pageWidth, 25, 'F');
      
      // Add white text on amber background
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(18);
      const title = villa?.name?.en || 'Luxury Villa';
      const titleWidth = doc.getStringUnitWidth(title) * doc.getFontSize() / doc.internal.scaleFactor;
      doc.text(title, (pageWidth - titleWidth) / 2, 16);
    };

    // Helper function for section titles
    const addSectionTitle = (text: string, y: number) => {
      doc.setFillColor(245, 158, 11); // Amber-500
      doc.rect(15, y - 4, pageWidth - 30, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(11);
      doc.text(text, 20, y);
      return y + 10;
    };

    // Initialize PDF design
    addGradientBackground();
    addHeaderPattern();

    // Reset text color for content
    doc.setTextColor(31, 41, 55); // Gray-800

    // Add booking reference section
    let y = 35;
    doc.setFontSize(10);
    doc.text(`Booking Reference: ${booking._id ? booking._id : 'No Reference'}`, 20, y);
    doc.text(`Date: ${format(new Date(), 'PPP')}`, pageWidth - 70, y);
    y += 12;

    // Add booking details section
    y = addSectionTitle('Booking Details', y);
    const bookingDetails = [
      ['Check-in', format(new Date(booking.bookingDetails.checkIn), 'PPP')],
      ['Check-out', format(new Date(booking.bookingDetails.checkOut), 'PPP')],
      ['Status', booking.status.charAt(0).toUpperCase() + booking.status.slice(1).replace('_', ' ')],
    ];

    (doc as any).autoTable({
      startY: y,
      head: [],
      body: bookingDetails,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 70 },
      },
      margin: { left: 20, right: 20 },
      tableWidth: 110,
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // Add customer information section
    if (booking.customerInfo) {
      y = addSectionTitle('Customer Information', y);
      const customerInfo = [
        ['Name', `${booking.customerInfo.firstName} ${booking.customerInfo.lastName}`],
        ['Email', booking.customerInfo.email],
        ['Phone', booking.customerInfo.phone],
      ];

      (doc as any).autoTable({
        startY: y,
        head: [],
        body: customerInfo,
        theme: 'plain',
        styles: {
          fontSize: 9,
          cellPadding: 3,
        },
        columnStyles: {
          0: { fontStyle: 'bold', cellWidth: 40 },
          1: { cellWidth: 70 },
        },
        margin: { left: 20, right: 20 },
        tableWidth: 110,
      });

      y = (doc as any).lastAutoTable.finalY + 8;
    }

    // Add price breakdown section
    y = addSectionTitle('Price Details', y);
    const priceDetails = [
      ['Total Amount', `THB ${formatPDFPrice(booking.bookingDetails.totalPrice)}`]
    ];

    (doc as any).autoTable({
      startY: y,
      head: [],
      body: priceDetails,
      theme: 'plain',
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 40 },
        1: { cellWidth: 70 },
      },
      margin: { left: 20, right: 20 },
      tableWidth: 110,
    });

    y = (doc as any).lastAutoTable.finalY + 8;

    // Add payment slip if available
    if (booking.payment?.slipUrl) {
      y = addSectionTitle('Payment Slip', y);
      
      try {
        // Calculate dimensions to fit the slip image properly
        const maxWidth = pageWidth - 100; // Reduced width
        const maxHeight = 50; // Reduced height
        
        // Add the slip image
        doc.addImage(
          booking.payment.slipUrl,
          'JPEG',
          50, // Centered position
          y,
          maxWidth,
          maxHeight,
          undefined,
          'MEDIUM'
        );
        
        y += maxHeight + 8;
        
        // Add payment details
        const paymentInfo = [
          ['Payment Status', booking.status === 'confirmed' ? 'Paid' : 'Pending'],
          ['Payment Date', booking.payment?.date ? format(new Date(booking.payment.date), 'PPP') : 'Not yet paid'],
        ];

        (doc as any).autoTable({
          startY: y,
          head: [],
          body: paymentInfo,
          theme: 'plain',
          styles: {
            fontSize: 9,
            cellPadding: 3,
          },
          columnStyles: {
            0: { fontStyle: 'bold', cellWidth: 40 },
            1: { cellWidth: 70 },
          },
          margin: { left: 20, right: 20 },
          tableWidth: 110,
        });

        y = (doc as any).lastAutoTable.finalY + 8;
      } catch (error) {
        console.error('Error adding payment slip to PDF:', error);
        doc.setFontSize(9);
        doc.setTextColor(156, 163, 175);
        doc.text('Payment slip image could not be loaded', 20, y);
        y += 10;
      }
    }

    // Add footer with more space from the bottom if we have a payment slip
    const footerY = pageHeight - 15;
    doc.setFontSize(8);
    doc.setTextColor(156, 163, 175);
    doc.text('Thank you for choosing our villa. We look forward to your stay!', 20, footerY);
    doc.text('Generated on ' + format(new Date(), 'PPP'), pageWidth - 70, footerY);

    // Add QR Code if available (positioned relative to the footer)
    if (villa?.promptpayQRCode) {
      try {
        const qrSize = 30;
        const qrY = footerY - qrSize - 5;
        doc.addImage(
          villa.promptpayQRCode,
          'PNG',
          pageWidth - 40,
          qrY,
          qrSize,
          qrSize
        );
      } catch (error) {
        console.error('Error adding QR code to PDF:', error);
      }
    }

    // Save the PDF
    doc.save(`luxury-villa-receipt-${booking._id || 'no-reference'}.pdf`);
  };

  React.useEffect(() => {
    async function fetchBooking() {
      if (!id) {
        navigate('/');
        return;
      }

      try {
        const response = await bookingApi.getBooking(id);
        if (!response?.data?.booking) {
          toast.error(t('booking.errors.notFound'));
          navigate('/');
          return;
        }
        setBooking(response.data.booking);
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

  // Calculate total nights and price only if we have valid booking details
  const calculatePricing = () => {
    if (!booking?.bookingDetails?.checkIn || !booking?.bookingDetails?.checkOut) {
      return {
        totalNights: 0,
        totalPrice: 0,
        actualPricePerNight: 0
      };
    }

    const pricePerNight = basePrice;
    const actualPricePerNight = discountedPrice > 0 ? discountedPrice : pricePerNight;

    const totalNights = Math.ceil(
      (new Date(booking.bookingDetails.checkOut).getTime() - new Date(booking.bookingDetails.checkIn).getTime()) / 
      (1000 * 60 * 60 * 24)
    );

    const totalPrice = booking.bookingDetails.totalPrice || (actualPricePerNight * totalNights);

    return {
      totalNights,
      totalPrice,
      actualPricePerNight
    };
  };

  const { totalNights, totalPrice, actualPricePerNight } = calculatePricing();

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
                <p className="text-gray-600 dark:text-gray-400">{t('booking.confirmation.rooms')}</p>
                <p className="font-medium text-gray-900 dark:text-white">
                  {booking.bookingDetails.rooms} {t('booking.room', { count: booking.bookingDetails.rooms })}
                </p>
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
              {booking.customerInfo ? (
                <>
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
                </>
              ) : (
                <div className="col-span-2">
                  <p className="text-gray-600 dark:text-gray-400">{t('booking.confirmation.pendingInfo')}</p>
                </div>
              )}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="border-b border-gray-200 dark:border-gray-700 pb-6">
            <PriceBreakdown 
              breakdown={{
                basePrice: basePrice,
                numberOfNights: totalNights,
                discount: discountedPrice > 0 ? (basePrice - actualPricePerNight) * totalNights : undefined,
                discountedPrice: discountedPrice > 0 ? actualPricePerNight : undefined,
                total: totalPrice
              }} 
            />
          </div>

          {/* Download Receipt Button */}
          <div className="mt-6">
            <Button
              onClick={generateReceipt}
              className="w-full flex items-center justify-center gap-2 bg-amber-500 hover:bg-amber-600"
            >
              <Download className="w-5 h-5" />
              {t('booking.confirmation.downloadReceipt')}
            </Button>
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
            <ArrowLeft className="w-5 h-5" />
            {t('common.backToMain')}
          </Button>
        </div>
      </motion.div>
    </BookingLayout>
  );
}