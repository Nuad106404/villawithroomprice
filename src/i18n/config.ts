import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';

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

i18next
  .use(initReactI18next)
  .init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  }, (err) => {
    if (err) {
      console.error('Error initializing i18next:', err);
    }
  });

export default i18next;