import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { ArrowRight, ArrowLeft } from 'lucide-react';
import { bookingApi } from '../../services/api';
import { BookingSteps } from './BookingSteps';
import { Button } from '../ui/button';
import { QRCode } from './QRCode';
import { PaymentDetails } from './PaymentDetails';
import { SlipUpload } from './SlipUpload';
import cn from 'classnames';
import { BookingLayout } from './BookingLayout';
import { motion } from 'framer-motion';
import { CountdownTimer } from './CountdownTimer';

export function PaymentMethod() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const [isLoading, setIsLoading] = React.useState(true);
  const [booking, setBooking] = React.useState(null);
  const [selectedMethod, setSelectedMethod] = React.useState<'bank_transfer' | 'promptpay'>('promptpay');
  const [paymentSlipUrl, setPaymentSlipUrl] = React.useState<string>('');
  const [selectedFile, setSelectedFile] = React.useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = React.useState<string>('');
  const [isPaymentConfirmed, setIsPaymentConfirmed] = React.useState(false);

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
        // If booking has payment slip, set confirmed state
        if (bookingData.paymentSlipUrl) {
          setPaymentSlipUrl(bookingData.paymentSlipUrl);
          setIsPaymentConfirmed(true);
        }
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

  const handlePaymentMethodSelect = async (method: string) => {
    try {
      await bookingApi.updateBooking(id, {
        paymentMethod: method,
        status: 'pending_payment'
      });
      navigate(`/booking/${id}/confirmation`);
    } catch (error) {
      console.error('Error updating payment method:', error);
      toast.error(t('booking.errors.updateFailed'));
    }
  };

  const handleFileSelect = (file: File) => {
    if (isPaymentConfirmed) return;
    setSelectedFile(file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleConfirmPayment = async () => {
    if (!selectedFile || isPaymentConfirmed) return;

    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append('slip', selectedFile);

      const response = await fetch('/api/upload/slip', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setPaymentSlipUrl(data.fileUrl);
      setIsPaymentConfirmed(true);
      
      // Update booking payment status
      await bookingApi.updateBooking(id!, {
        status: 'pending',
        paymentDetails: {
          method: selectedMethod,
          slipUrl: data.fileUrl,
          status: 'pending'
        }
      });

      toast.success(t('payment.success.confirmed'));
      navigate(`/booking/${id}/confirmation`);
    } catch (error) {
      console.error('Error confirming payment:', error);
      toast.error(t('payment.errors.confirmFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading || !booking) {
    return <div className="flex justify-center items-center min-h-screen">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    </div>;
  }

  return (
    <BookingLayout>
      <BookingSteps currentStep={2} />
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mt-8"
      >
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t('booking.payment.selectMethod')}
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            {t('booking.payment.choosePreferred')}
          </p>
          {booking && (
            <div className="mt-4">
              <CountdownTimer
                startTime={new Date(booking.createdAt)}
                endTime={new Date(booking.expiresAt)}
                onExpire={() => {
                  toast.error(t('booking.errors.expired'));
                  navigate('/');
                }}
              />
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          <Button
            type="button"
            variant={selectedMethod === 'bank_transfer' ? 'default' : 'outline'}
            onClick={() => setSelectedMethod('bank_transfer')}
            className={cn(
              "group relative p-6 sm:p-8 rounded-2xl transition-all duration-300",
              "backdrop-blur-sm backdrop-filter",
              "hover:scale-[1.02] hover:shadow-xl",
              "border-2",
              selectedMethod === 'bank_transfer' 
                ? "bg-white/90 dark:bg-gray-800/90 border-amber-500/50 shadow-lg shadow-amber-500/10" 
                : "bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50",
              "overflow-hidden"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900 dark:text-white">
                {t('booking.payment.bankTransfer')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('booking.payment.bankTransferDesc')}
              </p>
            </div>
          </Button>

          <Button
            type="button"
            variant={selectedMethod === 'promptpay' ? 'default' : 'outline'}
            onClick={() => setSelectedMethod('promptpay')}
            className={cn(
              "group relative p-6 sm:p-8 rounded-2xl transition-all duration-300",
              "backdrop-blur-sm backdrop-filter",
              "hover:scale-[1.02] hover:shadow-xl",
              "border-2",
              selectedMethod === 'promptpay' 
                ? "bg-white/90 dark:bg-gray-800/90 border-amber-500/50 shadow-lg shadow-amber-500/10" 
                : "bg-white/50 dark:bg-gray-800/50 border-gray-200/50 dark:border-gray-700/50",
              "overflow-hidden"
            )}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative z-10">
              <h3 className="font-bold text-base sm:text-lg mb-2 text-gray-900 dark:text-white">
                {t('booking.payment.promptPay')}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {t('booking.payment.promptPayDesc')}
              </p>
            </div>
          </Button>
        </div>

        {selectedMethod === 'promptpay' ? (
          <div className="w-full max-w-2xl mx-auto">
            <div className={cn(
              "relative w-full",
              "bg-white/90 dark:bg-gray-800/90",
              "rounded-2xl shadow-xl shadow-amber-500/10",
              "p-6 sm:p-8",
              "backdrop-blur-sm"
            )}>
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent rounded-2xl" />
              
              <div className="relative space-y-6">
                {/* QR Code Section */}
                <QRCode 
                  amount={booking.bookingDetails.totalPrice} 
                  promptpayId="0123456789"
                />

                {/* Instructions */}
                <div className="w-full max-w-md mx-auto">
                  <div className="bg-amber-50/50 dark:bg-amber-900/20 rounded-xl p-4">
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                      {t('booking.payment.instructions')}
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <li>{t('booking.payment.step1')}</li>
                      <li>{t('booking.payment.step2')}</li>
                      <li>{t('booking.payment.step3')}</li>
                      <li>{t('booking.payment.step4')}</li>
                    </ol>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 sm:p-8 shadow-xl shadow-amber-500/10 backdrop-blur-sm">
            <PaymentDetails booking={{ customerInfo: booking.customerInfo, bookingDetails: booking }} />
          </div>
        )}

        <div className="border-t border-gray-200/50 dark:border-gray-700/50 pt-8">
          <div className="max-w-md mx-auto space-y-6">
            <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg">
              {isPaymentConfirmed ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t('booking.slip.uploaded')}
                  </h3>
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                    <img
                      src={paymentSlipUrl}
                      alt={t('booking.slip.upload.title')}
                      className="absolute inset-0 h-full w-full object-cover"
                    />
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {t('booking.slip.cantChange')}
                  </p>
                </div>
              ) : (
                <SlipUpload
                  onUpload={handleFileSelect}
                  onRemove={() => {
                    setSelectedFile(null);
                    setPreviewUrl('');
                  }}
                  uploadedFile={selectedFile}
                  previewUrl={previewUrl}
                />
              )}
            </div>

            {selectedFile && !isPaymentConfirmed && (
              <div className="bg-white/90 dark:bg-gray-800/90 rounded-2xl p-6 shadow-lg">
                <div className="relative aspect-[3/4] w-full overflow-hidden rounded-lg">
                  <img
                    src={previewUrl}
                    alt={t('booking.slip.upload.title')}
                    className="absolute inset-0 h-full w-full object-cover"
                  />
                </div>
              </div>
            )}

            {/* Payment Actions */}
            <div className="space-y-4">
              {!isPaymentConfirmed ? (
                <Button
                  onClick={handleConfirmPayment}
                  disabled={isLoading || !selectedFile}
                  className="w-full"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    </div>
                  ) : (
                    t('booking.payment.confirm')
                  )}
                </Button>
              ) : (
                <div className="flex flex-col sm:flex-row gap-4">
                  <Button
                    onClick={() => navigate(`/booking/${id}`)}
                    variant="outline"
                    className="w-full flex items-center justify-center gap-2"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    {t('common.previous')}
                  </Button>
                  <Button
                    onClick={() => navigate(`/booking/${id}/confirmation`)}
                    className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700"
                  >
                    {t('common.next')}
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </motion.div>
    </BookingLayout>
  );
}