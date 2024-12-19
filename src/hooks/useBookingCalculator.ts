import { useMemo } from 'react';
import { DateRange } from 'react-day-picker';
import { differenceInDays, addDays } from 'date-fns';

interface BookingCalculation {
  numberOfNights: number;
  basePrice: number;
  taxes: number;
  total: number;
}

export function useBookingCalculator(
  dateRange: DateRange | undefined,
  pricePerNight: number,
  taxRate: number = 0.12
): BookingCalculation {
  return useMemo(() => {
    if (!dateRange?.from || !dateRange?.to) {
      return {
        numberOfNights: 0,
        basePrice: 0,
        taxes: 0,
        total: 0,
      };
    }

    // Add one day to include the checkout day in the calculation
    const numberOfNights = differenceInDays(addDays(dateRange.to, 1), dateRange.from);
    const basePrice = numberOfNights * pricePerNight;
    const taxes = Math.round(basePrice * taxRate);
    const total = basePrice + taxes;

    return {
      numberOfNights,
      basePrice,
      taxes,
      total,
    };
  }, [dateRange, pricePerNight, taxRate]);
}