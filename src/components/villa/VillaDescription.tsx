import React from 'react';
import { MapPin, Users, Home, Star } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { VillaSlideshow } from './VillaSlideshow';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  }
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0 }
};

export function VillaDescription() {
  const { t } = useTranslation();

  return (
    <div className="relative">
      {/* Hero Section with Slideshow */}
      <div className="relative -mx-4 sm:-mx-6 lg:-mx-8 xl:-mx-12 mb-12">
        <VillaSlideshow />
      </div>

      {/* Main Content */}
      <motion.div
        variants={container}
        initial="hidden"
        animate="show"
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16"
      >
        {/* Title Section */}
        <motion.div variants={item} className="text-center space-y-4">
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 dark:text-white">
            {t('villa.name')}
          </h1>
          <div className="flex items-center justify-center space-x-2 text-amber-600">
            <Star className="w-5 h-5 fill-current" />
            <span className="text-lg font-medium">4.9</span>
            <span className="text-gray-500 dark:text-gray-400">
              (128 {t('villa.reviewsstar')})
            </span>
          </div>
        </motion.div>

        {/* Features Grid */}
        <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-900/30 p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="relative z-10 flex flex-col h-full">
              <MapPin className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('villa.location')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 flex-grow">
                {t('villa.beachfront')}
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-900/30 p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="relative z-10 flex flex-col h-full">
              <Users className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('villa.capacity')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 flex-grow">
                {t('villa.maxGuests')}
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          <div className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 shadow-xl dark:shadow-gray-900/30 p-8 hover:shadow-2xl transition-shadow duration-300">
            <div className="relative z-10 flex flex-col h-full">
              <Home className="w-8 h-8 text-amber-600 mb-4" />
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                {t('villa.size')}
              </h3>
              <p className="text-gray-500 dark:text-gray-400 flex-grow">
                350 {t('villa.sqm')}
              </p>
            </div>
            <div className="absolute inset-0 bg-gradient-to-br from-amber-50 to-amber-100 dark:from-amber-900/10 dark:to-amber-900/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </motion.div>

        {/* Description Section */}
        <motion.div 
          variants={item} 
          className="prose dark:prose-invert max-w-none bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-gray-900/30 p-8 md:p-12"
        >
          <h2 className="text-3xl font-semibold mb-6">{t('villa.aboutTitle')}</h2>
          <p className="text-gray-600 dark:text-gray-300 leading-relaxed text-lg">
            {t('villa.description')}
          </p>
        </motion.div>
      </motion.div>

      {/* Background Decorations */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-[800px] h-[800px] rounded-full bg-amber-50 dark:bg-amber-900/20 blur-3xl opacity-20" />
        <div className="absolute -bottom-1/2 -left-1/2 w-[800px] h-[800px] rounded-full bg-amber-50 dark:bg-amber-900/20 blur-3xl opacity-20" />
      </div>
    </div>
  );
}