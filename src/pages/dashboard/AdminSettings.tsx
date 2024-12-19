import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Bell, Mail, Lock, Globe, Moon, Sun } from 'lucide-react';
import { useTranslation } from 'react-i18next';

interface SettingsSectionProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

function SettingsSection({ title, description, children }: SettingsSectionProps) {
  return (
    <div className="py-6">
      <div className="md:grid md:grid-cols-3 md:gap-6">
        <div className="md:col-span-1">
          <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">{title}</h3>
          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">{description}</p>
        </div>
        <div className="mt-5 md:mt-0 md:col-span-2">
          <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-6">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

export function AdminSettings() {
  const { t, i18n } = useTranslation();
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [darkMode, setDarkMode] = useState(false);
  const [language, setLanguage] = useState('en');

  const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    setLanguage(newLang);
    i18n.changeLanguage(newLang);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (darkMode) {
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
    }
  };

  return (
    <div className="max-w-7xl mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          {t('dashboard.settings')}
        </h1>
      </div>

      <div className="bg-white dark:bg-gray-800 shadow-sm rounded-lg overflow-hidden">
        <div className="divide-y divide-gray-200 dark:divide-gray-700">
          <SettingsSection
            title={t('settings.notifications')}
            description={t('settings.notificationsDesc')}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <Bell className="h-5 w-5 text-gray-400 mr-3" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('settings.pushNotifications')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('settings.pushNotificationsDesc')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${
                    emailNotifications ? 'bg-amber-600' : 'bg-gray-200 dark:bg-gray-700'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                  onClick={() => setEmailNotifications(!emailNotifications)}
                >
                  <span
                    className={`${
                      emailNotifications ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            title={t('settings.appearance')}
            description={t('settings.appearanceDesc')}
          >
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {darkMode ? (
                    <Moon className="h-5 w-5 text-gray-400 mr-3" />
                  ) : (
                    <Sun className="h-5 w-5 text-gray-400 mr-3" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {t('settings.darkMode')}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {t('settings.darkModeDesc')}
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  className={`${
                    darkMode ? 'bg-amber-600' : 'bg-gray-200 dark:bg-gray-700'
                  } relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none`}
                  onClick={toggleDarkMode}
                >
                  <span
                    className={`${
                      darkMode ? 'translate-x-5' : 'translate-x-0'
                    } pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out`}
                  />
                </button>
              </div>
            </div>
          </SettingsSection>

          <SettingsSection
            title={t('settings.language')}
            description={t('settings.languageDesc')}
          >
            <div className="space-y-4">
              <div className="flex items-center">
                <Globe className="h-5 w-5 text-gray-400 mr-3" />
                <select
                  value={language}
                  onChange={handleLanguageChange}
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 dark:border-gray-600 focus:outline-none focus:ring-amber-500 focus:border-amber-500 sm:text-sm rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value="en">English</option>
                  <option value="th">ไทย</option>
                  <option value="zh">中文</option>
                </select>
              </div>
            </div>
          </SettingsSection>
        </div>
      </div>
    </div>
  );
}
