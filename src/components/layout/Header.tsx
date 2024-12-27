import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ThemeToggle } from '../ui/ThemeToggle';
import { LanguageToggle } from '../ui/LanguageToggle';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { fetchVillaDetails } from '../../store/slices/villaSlice';

export const Header = () => {
  const { t, i18n } = useTranslation();
  const dispatch = useDispatch();
  const { villa } = useSelector((state: RootState) => state.villa);

  useEffect(() => {
    dispatch(fetchVillaDetails());
  }, [dispatch]);

  const getVillaName = () => {
    if (!villa) return t('common.villa');
    const currentLang = i18n.language as 'en' | 'th';
    return villa.name[currentLang] || villa.name.en;
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <div className="mr-8">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white transition-colors duration-200">
            {getVillaName()}
          </h1>
        </div>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <nav className="flex items-center space-x-2">
            <ThemeToggle />
            <LanguageToggle />
          </nav>
        </div>
      </div>
    </header>
  );
};