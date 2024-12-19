import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-gradient-to-br from-amber-50 via-white to-amber-100 dark:from-gray-900 dark:via-gray-800 dark:to-amber-900/20 flex items-center justify-center p-4 md:p-8 overflow-hidden">
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {/* Animated Circles */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -top-1/4 -right-1/4 w-[800px] h-[800px] rounded-full bg-amber-400 dark:bg-amber-600 blur-3xl"
        />
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 0.1 }}
          transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
          className="absolute -bottom-1/4 -left-1/4 w-[600px] h-[600px] rounded-full bg-amber-500 dark:bg-amber-700 blur-3xl"
        />
        
        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.02] dark:opacity-[0.05]" />
      </div>

      {/* Content Container */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative w-full max-w-lg mt-16 md:mt-20"
      >
        {/* Glass Card */}
        <div className="relative backdrop-blur-xl bg-white/80 dark:bg-gray-900/80 rounded-2xl shadow-2xl dark:shadow-amber-900/20 overflow-hidden">
          {/* Gradient Border */}
          <div className="absolute inset-0 rounded-2xl p-px bg-gradient-to-br from-amber-400/20 via-amber-500/20 to-amber-600/20" />

          {/* Inner Content */}
          <div className="relative p-8 md:p-12">
            {/* Header */}
            <div className="text-center mb-8">
              <motion.h1
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-amber-600 to-amber-700 dark:from-amber-400 dark:to-amber-500 bg-clip-text text-transparent"
              >
                {title}
              </motion.h1>
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.3 }}
                className="mt-2 text-gray-600 dark:text-gray-400"
              >
                {subtitle}
              </motion.p>
            </div>

            {/* Form Content */}
            {children}
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -z-10 inset-0 transform">
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-1/2 left-0 w-32 h-32 bg-gradient-to-br from-amber-400/10 to-amber-600/10 rounded-full blur-xl"
          />
          <motion.div
            initial={{ rotate: 0 }}
            animate={{ rotate: -360 }}
            transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-0 right-0 w-40 h-40 bg-gradient-to-br from-amber-500/10 to-amber-700/10 rounded-full blur-xl"
          />
        </div>
      </motion.div>
    </div>
  );
}
