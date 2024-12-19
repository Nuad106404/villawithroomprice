import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { Eye, EyeOff, Mail, Lock, User } from 'lucide-react';
import { useAppDispatch } from '../../hooks/useAppDispatch';
import { useAppSelector } from '../../hooks/useAppSelector';
import { register, clearError } from '../../store/slices/authSlice';
import { AuthLayout } from './AuthLayout';

export function RegisterForm() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    // Clear any existing errors when component mounts
    dispatch(clearError());
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (error) {
      dispatch(clearError());
    }
    if (passwordError) {
      setPasswordError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setPasswordError(t('auth.passwordsMustMatch'));
      return;
    }
    if (formData.password.length < 8) {
      setPasswordError(t('auth.passwordTooShort'));
      return;
    }
    
    try {
      const resultAction = await dispatch(register({
        email: formData.email,
        password: formData.password,
        firstName: formData.firstName,
        lastName: formData.lastName
      })).unwrap();
      
      if (resultAction) {
        navigate('/admin/dashboard');
      }
    } catch (error: any) {
      // Error is handled by the reducer
      console.error('Registration error:', error);
    }
  };

  const inputVariants = {
    focus: { scale: 1.02 },
    blur: { scale: 1 },
  };

  return (
    <AuthLayout
      title={t('auth.register')}
      subtitle={t('auth.registerSubtitle')}
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        {(error || passwordError) && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-50 dark:bg-red-900/50 text-red-600 dark:text-red-200 p-3 rounded-lg text-sm"
          >
            {error || passwordError}
          </motion.div>
        )}

        {/* Name Fields */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('auth.firstName')}
            </label>
            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              animate="blur"
              className="relative"
            >
              <input
                id="firstName"
                name="firstName"
                type="text"
                value={formData.firstName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                required
              />
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </motion.div>
          </div>

          <div className="space-y-2">
            <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('auth.lastName')}
            </label>
            <motion.div
              variants={inputVariants}
              whileFocus="focus"
              animate="blur"
              className="relative"
            >
              <input
                id="lastName"
                name="lastName"
                type="text"
                value={formData.lastName}
                onChange={handleChange}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
                required
              />
              <User className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            </motion.div>
          </div>
        </div>

        {/* Email Input */}
        <div className="space-y-2">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('auth.email')}
          </label>
          <motion.div
            variants={inputVariants}
            whileFocus="focus"
            animate="blur"
            className="relative"
          >
            <input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
              required
            />
            <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
          </motion.div>
        </div>

        {/* Password Input */}
        <div className="space-y-2">
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('auth.password')}
          </label>
          <motion.div
            variants={inputVariants}
            whileFocus="focus"
            animate="blur"
            className="relative"
          >
            <input
              id="password"
              name="password"
              type={showPassword ? 'text' : 'password'}
              value={formData.password}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
              required
            />
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </motion.div>
        </div>

        {/* Confirm Password Input */}
        <div className="space-y-2">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            {t('auth.confirmPassword')}
          </label>
          <motion.div
            variants={inputVariants}
            whileFocus="focus"
            animate="blur"
            className="relative"
          >
            <input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full pl-10 pr-12 py-3 rounded-lg border border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-amber-500 dark:focus:ring-amber-400 focus:border-transparent dark:bg-gray-800 dark:text-white transition-all duration-200"
              required
            />
            <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-5 w-5" />
              ) : (
                <Eye className="h-5 w-5" />
              )}
            </button>
          </motion.div>
        </div>

        {/* Terms and Conditions */}
        <div className="flex items-start">
          <div className="flex items-center h-5">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              required
              className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-amber-600 focus:ring-amber-500 dark:focus:ring-amber-400"
            />
          </div>
          <div className="ml-3">
            <label htmlFor="terms" className="text-sm text-gray-600 dark:text-gray-400">
              {t('auth.agreeToTerms')}{' '}
              <a href="/terms" className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300">
                {t('auth.termsAndConditions')}
              </a>
            </label>
          </div>
        </div>

        {/* Submit Button */}
        <motion.button
          type="submit"
          disabled={isLoading}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full py-3 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-700 hover:to-amber-800 text-white font-medium rounded-lg shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
        >
          {isLoading ? (
            <div className="flex items-center justify-center space-x-2">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-5 h-5 border-2 border-white border-t-transparent rounded-full"
              />
              <span>{t('common.loading')}</span>
            </div>
          ) : (
            t('auth.registerButton')
          )}
        </motion.button>

        {/* Login Link */}
        <p className="text-center text-sm text-gray-600 dark:text-gray-400">
          {t('auth.alreadyHaveAccount')}{' '}
          <a
            href="/login"
            className="text-amber-600 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-300 font-medium transition-colors"
          >
            {t('auth.loginLink')}
          </a>
        </p>
      </form>
    </AuthLayout>
  );
}
