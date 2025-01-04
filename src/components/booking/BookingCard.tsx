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
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

const isWeekend = (date: Date): boolean => {
  const day = date.getDay();
  return day === 0 || day === 6; // 0 is Sunday, 6 is Saturday
};

export function BookingCard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [date, setDate] = React.useState<DateRange | undefined>();
  const [guests, setGuests] = React.useState(2);
  const [isLoading, setIsLoading] = React.useState(false);
  const villa = useSelector((state: RootState) => state.villa.villa);
  const maxGuests = villa?.maxGuests || 4;

  // Get pricing for display based on selected date
  const getDisplayPrice = () => {
    if (!date?.from || !villa?.pricing) {
      // Default to weekday pricing if no date selected
      return villa?.pricing?.weekday || { regular: 0, discounted: 0 };
    }
    const selectedDate = new Date(date.from);
    return isWeekend(selectedDate) ? villa.pricing.weekend : villa.pricing.weekday;
  };

  const displayPricing = getDisplayPrice();
  const regularPrice = displayPricing.regular;
  const discountedPrice = displayPricing.discounted;

  // Calculate breakdown of nights and total price
  const calculatePriceBreakdown = () => {
    if (!date?.from || !date?.to || !villa?.pricing) {
      return {
        weekdayNights: 0,
        weekendNights: 0,
        regularTotal: 0,
        discountedTotal: 0
      };
    }

    let weekdayNights = 0;
    let weekendNights = 0;
    const currentDate = new Date(date.from);
    const endDate = new Date(date.to);

    while (currentDate < endDate) {
      if (isWeekend(currentDate)) {
        weekendNights++;
      } else {
        weekdayNights++;
      }
      currentDate.setDate(currentDate.getDate() + 1);
    }

    const weekdayRegular = weekdayNights * (villa.pricing.weekday.regular || 0);
    const weekdayDiscounted = weekdayNights * (villa.pricing.weekday.discounted || villa.pricing.weekday.regular || 0);
    const weekendRegular = weekendNights * (villa.pricing.weekend.regular || 0);
    const weekendDiscounted = weekendNights * (villa.pricing.weekend.discounted || villa.pricing.weekend.regular || 0);

    return {
      weekdayNights,
      weekendNights,
      regularTotal: weekdayRegular + weekendRegular,
      discountedTotal: weekdayDiscounted + weekendDiscounted
    };
  };

  const priceBreakdown = calculatePriceBreakdown();
  const totalNights = priceBreakdown.weekdayNights + priceBreakdown.weekendNights;
  const totalPrice = priceBreakdown.discountedTotal;
  const regularTotalPrice = priceBreakdown.regularTotal;

  // Format price display strings
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'THB',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const getPriceDisplay = () => {
    const hasWeekday = priceBreakdown.weekdayNights > 0;
    const hasWeekend = priceBreakdown.weekendNights > 0;
    const weekdayPrice = villa?.pricing?.weekday?.discounted || villa?.pricing?.weekday?.regular || 0;
    const weekendPrice = villa?.pricing?.weekend?.discounted || villa?.pricing?.weekend?.regular || 0;

    if (hasWeekday && hasWeekend) {
      return `${formatPrice(weekdayPrice)} × ${priceBreakdown.weekdayNights} ${t('common.weekdayNights')}, ${formatPrice(weekendPrice)} × ${priceBreakdown.weekendNights} ${t('common.weekendNights')}`;
    } else if (hasWeekday) {
      return `${formatPrice(weekdayPrice)} × ${priceBreakdown.weekdayNights} ${t('common.nights')}`;
    } else if (hasWeekend) {
      return `${formatPrice(weekendPrice)} × ${priceBreakdown.weekendNights} ${t('common.nights')}`;
    }
    return '';
  };

  const getRegularPriceDisplay = () => {
    const hasWeekday = priceBreakdown.weekdayNights > 0;
    const hasWeekend = priceBreakdown.weekendNights > 0;
    const weekdayRegular = villa?.pricing?.weekday?.regular || 0;
    const weekendRegular = villa?.pricing?.weekend?.regular || 0;

    if (hasWeekday && hasWeekend) {
      return `${formatPrice(weekdayRegular)} × ${priceBreakdown.weekdayNights} ${t('common.weekdayNights')}, ${formatPrice(weekendRegular)} × ${priceBreakdown.weekendNights} ${t('common.weekendNights')}`;
    } else if (hasWeekday) {
      return `${formatPrice(weekdayRegular)} × ${priceBreakdown.weekdayNights} ${t('common.nights')}`;
    } else if (hasWeekend) {
      return `${formatPrice(weekendRegular)} × ${priceBreakdown.weekendNights} ${t('common.nights')}`;
    }
    return '';
  };

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
    if (guests < 1 || guests > maxGuests) {
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
          <div className="relative w-full sm:w-auto">
            {/* Price Container with Artistic Background */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50 dark:from-amber-900/20 dark:via-amber-800/20 dark:to-amber-900/20 p-4 sm:p-6">
              {/* Decorative Elements */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_107%,rgba(253,230,138,0.3)_0%,rgba(251,191,36,0.1)_5%,rgba(217,119,6,0.05)_45%,rgba(180,83,9,0.1)_60%,transparent_70%)] dark:bg-[radial-gradient(circle_at_30%_107%,rgba(253,230,138,0.1)_0%,rgba(251,191,36,0.05)_5%,rgba(217,119,6,0.02)_45%,rgba(180,83,9,0.05)_60%,transparent_70%)]"></div>
              <div className="absolute -right-4 -bottom-4 w-32 h-32 bg-amber-500/10 dark:bg-amber-400/5 rounded-full blur-2xl"></div>
              
              <div className="relative space-y-4">
                {/* Current Price Display */}
                <div className="flex flex-col items-center sm:items-start space-y-2">
                  {discountedPrice > 0 && (
                    <div className="absolute -right-2 -top-2 transform rotate-12">
                      <div className="relative">
                        <div className="absolute inset-0 bg-red-500 rounded-full blur-sm opacity-20"></div>
                        <span className="relative inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gradient-to-r from-red-500 to-red-600 text-white shadow-sm">
                          -{Math.round(((regularPrice - discountedPrice) / regularPrice) * 100)}%
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Main Price Display */}
                  <div className="relative">
                    <span className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-800 dark:from-amber-400 dark:to-amber-600 bg-clip-text text-transparent tracking-tight">
                      {discountedPrice > 0 ? formatPrice(discountedPrice) : formatPrice(regularPrice)}
                    </span>
                    <span className="ml-2 text-sm text-amber-700/70 dark:text-amber-300/70">/ {t('common.perNight')}</span>
                  </div>

                  {discountedPrice > 0 && (
                    <div className="relative mt-1">
                      <span className="text-base text-gray-500/80 dark:text-gray-400/80 line-through decoration-red-500/30 decoration-2">
                        {formatPrice(regularPrice)}
                      </span>
                      <div className="absolute -inset-x-1 top-1/2 h-[1px] bg-gradient-to-r from-transparent via-red-500/30 to-transparent"></div>
                    </div>
                  )}
                </div>

                {/* Weekday/Weekend Price Info */}
                <div className="border-t border-amber-200/30 dark:border-amber-700/30 pt-3 space-y-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-700/70 dark:text-amber-300/70">{t('common.weekdayPrice')}</span>
                    <span className="font-medium text-amber-800 dark:text-amber-200">
                      {formatPrice(villa?.pricing?.weekday?.regular || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-amber-700/70 dark:text-amber-300/70">{t('common.weekendPrice')}</span>
                    <span className="font-medium text-amber-800 dark:text-amber-200">
                      {formatPrice(villa?.pricing?.weekend?.regular || 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center sm:justify-start text-gray-600 dark:text-gray-300">
            <Users className="w-5 h-5 mr-2" />
            <span>
              {guests} {t('common.guests')}
            </span>
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
              {t('booking.guests')} ({t('common.max')} {maxGuests})
            </label>
            <div className="relative">
              <select
                value={guests}
                onChange={(e) => setGuests(Number(e.target.value))}
                className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 transition-colors text-base sm:text-sm touch-manipulation"
              >
                {Array.from({ length: maxGuests }, (_, i) => i + 1).map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? t('common.guest') : t('common.guests')}
                  </option>
                ))}
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <Users className="h-4 w-4 text-gray-500" />
              </div>
            </div>
          </div>

          {totalNights > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="space-y-3 pt-4 border-t border-gray-200 dark:border-gray-700"
            >
              {(villa?.pricing?.weekday?.discounted || villa?.pricing?.weekend?.discounted) && (
                <div className="flex justify-between text-sm sm:text-base">
                  <div className="flex flex-col">
                    <span className="text-gray-500 line-through">{getRegularPriceDisplay()}</span>
                    <span className="text-gray-600 dark:text-gray-400">
                      {getPriceDisplay()}
                    </span>
                  </div>
                  <div className="flex flex-col items-end">
                    <span className="text-gray-500 line-through">
                      {formatPrice(regularTotalPrice)}
                    </span>
                    <span className="text-gray-600 dark:text-gray-400">{formatPrice(totalPrice)}</span>
                  </div>
                </div>
              )}
              {!(villa?.pricing?.weekday?.discounted || villa?.pricing?.weekend?.discounted) && (
                <div className="flex justify-between text-sm sm:text-base text-gray-600 dark:text-gray-400">
                  <span>{getPriceDisplay()}</span>
                  <span>{formatPrice(totalPrice)}</span>
                </div>
              )}
              {(villa?.pricing?.weekday?.discounted || villa?.pricing?.weekend?.discounted) && (
                <div className="flex justify-between text-sm sm:text-base text-green-600">
                  <span>{t('common.youSave')}</span>
                  <span>
                    {formatPrice(regularTotalPrice - totalPrice)}
                  </span>
                </div>
              )}
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