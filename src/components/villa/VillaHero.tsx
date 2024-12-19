import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

export function VillaHero() {
  const { t } = useTranslation();

  return (
    <div className="relative h-[80vh] lg:h-[70vh] w-full overflow-hidden">
      <motion.img
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1.5 }}
        src="https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?auto=format&fit=crop&w=2000&q=80"
        alt={t('villa.heroAlt')}
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/30 to-transparent">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="absolute bottom-0 left-0 right-0 p-8"
        >
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              {t('villa.experienceLuxury')}
            </h2>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl">
              {t('villa.escapeDescription')}
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}