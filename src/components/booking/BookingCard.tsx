import React from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Users, ArrowRight, ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from 'react-toastify';
import { DateRange } from 'react-day-picker';
import { Button } from '../ui/button';
import { Calendar } from '../ui/calendar';
import { bookingApi } from '../../services/api';
import { formatPrice } from '../../lib/utils';
import cn from 'classnames';

const pricePerNight = 299;

export function BookingCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [guests, setGuests] = React.useState(2);
  const [isLoading, setIsLoading] = React.useState(false);

  const totalNights = date?.from && date?.to
    ? Math.ceil((date.to.getTime() - date.from.getTime()) / (1000 * 60 * 60 * 24))
    : 0;

  const totalPrice = totalNights * pricePerNight;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate dates
    if (!date?.from || !date?.to) {
      toast.error(t('booking.errors.selectDates'));
      return;
    }

    // Validate that check-in is not in the past
    const now = new Date();
    now.setHours(0, 0, 0, 0);
    if (date.from < now) {
      toast.error(t('booking.errors.pastDate'));
      return;
    }

    // Validate that check-out is after check-in
    if (date.to <= date.from) {
      toast.error(t('booking.errors.invalidDateRange'));
      return;
    }

    // Validate number of guests
    if (guests < 1 || guests > 4) {
      toast.error(t('booking.errors.invalidGuests'));
      return;
    }

    setIsLoading(true);
    try {
      const booking = await bookingApi.createBooking({
        bookingDetails: {
          checkIn: date.from,
          checkOut: date.to,
          guests,
          totalPrice
        },
        status: 'pending'
      });

      if (!booking?._id) {
        throw new Error('Invalid booking response');
      }

      toast.success(t('booking.success.created'));
      // Navigate to the first step (customer info)
      navigate(`/booking/${booking._id}`);
    } catch (error) {
      console.error('Error creating booking:', error);
      toast.error(t('booking.errors.createFailed'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      className="w-full max-w-[450px] md:max-w-none mx-auto bg-white dark:bg-gray-800 rounded-3xl shadow-2xl overflow-hidden"
    >
      <div className="p-4 sm:p-6 md:p-8">
        <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-4 sm:gap-8 mb-6 sm:mb-8">
          <div className="text-center sm:text-left">
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-amber-500 to-amber-700 bg-clip-text text-transparent">
              {formatPrice(pricePerNight)}
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">/ {t('common.perNight')}</span>
          </div>
          <div className="flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-300">
            <Users className="w-5 h-5 mr-2" />
            <span>{guests} {guests === 1 ? t('common.guest') : t('common.guests')}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div>
            <h3 className="text-base sm:text-lg font-medium text-gray-900 dark:text-white mb-3 sm:mb-4 text-center sm:text-left">
              {t('booking.selectDates')}
            </h3>
            <div className="relative bg-gradient-to-br from-amber-50/50 to-amber-100/50 dark:from-gray-700/50 dark:to-gray-600/50 rounded-2xl p-3 sm:p-6">
              <div className="absolute inset-0 backdrop-blur-sm rounded-2xl"></div>
              <div className="relative">
                <Calendar
                  mode="range"
                  defaultMonth={new Date()}
                  selected={date}
                  onSelect={setDate}
                  numberOfMonths={1}
                  disabled={{ before: new Date() }}
                  showOutsideDays={false}
                  classNames={{
                    months: "flex flex-col space-y-4",
                    month: "space-y-4 w-full",
                    caption: "flex justify-center pt-1 relative items-center",
                    caption_label: "text-sm font-medium text-gray-900 dark:text-white",
                    nav: "space-x-1 flex items-center",
                    nav_button: cn(
                      "inline-flex items-center justify-center rounded-md text-sm font-medium touch-manipulation",
                      "h-8 w-8 sm:h-7 sm:w-7 bg-transparent p-0 opacity-50 hover:opacity-100",
                      "text-gray-800 dark:text-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800",
                      "disabled:pointer-events-none disabled:opacity-50"
                    ),
                    nav_button_previous: "absolute left-1",
                    nav_button_next: "absolute right-1",
                    table: "w-full border-collapse space-y-1",
                    head_row: "flex",
                    head_cell: cn(
                      "text-gray-500 dark:text-gray-400 rounded-md w-9 font-normal text-[0.8rem]",
                      "flex-1 text-center"
                    ),
                    row: "flex w-full mt-2",
                    cell: cn(
                      "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
                      "flex-1 h-10 sm:h-9 items-center justify-center touch-manipulation"
                    ),
                    day: cn(
                      "inline-flex w-10 h-10 sm:w-9 sm:h-9 items-center justify-center rounded-full",
                      "text-gray-900 dark:text-gray-100 hover:bg-amber-100 dark:hover:bg-amber-800",
                      "aria-selected:opacity-100 hover:opacity-100 touch-manipulation"
                    ),
                    day_range_start: "day-range-start",
                    day_range_end: "day-range-end",
                    day_selected: cn(
                      "bg-amber-500 text-white hover:bg-amber-600",
                      "dark:bg-amber-600 dark:text-white dark:hover:bg-amber-700"
                    ),
                    day_today: "bg-gray-100 dark:bg-gray-800",
                    day_outside: "opacity-50",
                    day_disabled: "opacity-50 cursor-not-allowed",
                    day_range_middle: cn(
                      "aria-selected:bg-amber-100 dark:aria-selected:bg-amber-800/50",
                      "aria-selected:text-gray-900 dark:aria-selected:text-gray-100"
                    ),
                    day_hidden: "invisible",
                  }}
                  components={{
                    IconLeft: () => <ChevronLeft className="h-5 w-5 sm:h-4 sm:w-4" />,
                    IconRight: () => <ChevronRight className="h-5 w-5 sm:h-4 sm:w-4" />,
                  }}
                />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center sm:text-left">
              {t('booking.guests')}
            </label>
            <select
              value={guests}
              onChange={(e) => setGuests(Number(e.target.value))}
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 transition-colors text-base sm:text-sm touch-manipulation"
            >
              {[1, 2, 3, 4].map((num) => (
                <option key={num} value={num}>
                  {num} {num === 1 ? t('common.guest') : t('common.guests')}
                </option>
              ))}
            </select>
          </div>

          {totalNights > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-400">
                <span>{formatPrice(pricePerNight)} × {totalNights} {t('common.nights')}</span>
                <span>{formatPrice(pricePerNight * totalNights)}</span>
              </div>
              <div className="flex justify-between font-semibold text-base sm:text-lg text-gray-900 dark:text-white">
                <span>{t('common.total')}</span>
                <span>{formatPrice(totalPrice)}</span>
              </div>
            </motion.div>
          )}

          <Button
            type="submit"
            disabled={!date?.from || !date?.to || isLoading}
            className={cn(
              "w-full h-14 sm:h-12 rounded-xl",
              "bg-gradient-to-r from-amber-500 to-amber-600",
              "hover:from-amber-600 hover:to-amber-700",
              "text-white font-medium text-base sm:text-sm",
              "transition-all duration-200",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center space-x-2",
              "touch-manipulation"
            )}
          >
            <span>{isLoading ? t('common.pleaseWait') : t('common.bookNow')}</span>
            <ArrowRight className="w-5 h-5 sm:w-4 sm:h-4" />
          </Button>
        </form>
      </div>
    </motion.div>
  );
}