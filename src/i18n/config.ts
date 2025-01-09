import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Import translations directly
const en = {
  common: {
    villa: 'Villa',
    perNight: 'per night',
    guests: 'guests',
    guest: 'guest',
    selectDates: 'Select Dates',
    bookNow: 'Book Now',
    total: 'Total',
    nights: 'nights',
    night: 'night',
    loading: 'Loading...',
    error: 'An error occurred',
    success: 'Success',
    continue: 'Continue',
    saving: 'Saving...',
    back: 'Back',
    cancel: 'Cancel',
    confirm: 'Confirm',
    max: 'Max',
    copy: 'Copy',
  }
};

const th = {
  common: {
    villa: 'วิลล่า',
    perNight: 'ต่อคืน',
    guests: 'แขก',
    guest: 'แขก',
    selectDates: 'เลือกวันที่',
    bookNow: 'จองเลย',
    total: 'ทั้งหมด',
    nights: 'คืน',
    night: 'คืน',
    loading: 'กำลังโหลด...',
    error: 'เกิดข้อผิดพลาด',
    success: 'สำเร็จ',
    continue: 'ดำเนินการต่อ',
    saving: 'กำลังบันทึก...',
    back: 'กลับ',
    cancel: 'ยกเลิก',
    confirm: 'ยืนยัน',
    max: 'สูงสุด',
    copy: 'คัดลอก',
  }
};

const resources = {
  en: { translation: en },
  th: { translation: th }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage']
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;