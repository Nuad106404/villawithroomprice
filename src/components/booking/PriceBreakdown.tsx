import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { formatPrice } from '../../lib/utils';
import type { BookingCalculation } from '../../types/booking';

interface PriceBreakdownProps {
  breakdown: BookingCalculation;
}

export function PriceBreakdown({ breakdown }: PriceBreakdownProps) {
  const { t } = useTranslation();
  const { basePrice, numberOfNights, taxes, total } = breakdown;
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-3 text-sm"
    >
      <div className="flex justify-between text-gray-600 dark:text-gray-400">
        <span>
          {formatPrice(basePrice / numberOfNights)} × {numberOfNights} {numberOfNights === 1 ? t('common.night') : t('common.nights')}
        </span>
        <span>{formatPrice(basePrice)}</span>
      </div>
      <div className="flex justify-between text-gray-600 dark:text-gray-400">
        <span>{t('booking.payment.taxes')}</span>
        <span>{formatPrice(taxes)}</span>
      </div>
      <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
        <div className="flex justify-between font-medium text-gray-900 dark:text-white">
          <span>{t('common.total')}</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </motion.div>
  );
}