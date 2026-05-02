'use client';

import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { useLanguage } from '@/lib/i18n/LanguageContext';

export default function Greeting() {
  const { t } = useLanguage();
  const [greetingKey, setGreetingKey] = useState('dashboard.goodMorning');
  const [time, setTime] = useState('');
  const [userName, setUserName] = useState('Abebe'); // Default fallback

  useEffect(() => {
    // Attempt to retrieve the names from localStorage
    const updateName = () => {
      const fName = localStorage.getItem('medcare_first_name');
      const uName = localStorage.getItem('medcare_user_name');
      
      if (fName && fName.trim() !== '') {
        setUserName(fName.trim());
      } else if (uName && uName.trim() !== '') {
        setUserName(uName.trim());
      } else {
        setUserName('Guest');
      }
    };
    
    updateName();
    
    window.addEventListener('medcare_profile_updated', updateName);

    const updateTime = () => {
      const now = new Date();
      const hour = now.getHours();
      
      if (hour < 12) setGreetingKey('dashboard.goodMorning');
      else if (hour < 18) setGreetingKey('dashboard.goodAfternoon');
      else setGreetingKey('dashboard.goodEvening');

      setTime(now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }));
    };

    updateTime();
    const interval = setInterval(updateTime, 60000); // Update every minute
    return () => {
      clearInterval(interval);
      window.removeEventListener('medcare_profile_updated', updateName);
    };
  }, []);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="mb-8"
    >
      <h1 className="text-4xl md:text-5xl font-serif text-brand-950 mb-2">
        {t(greetingKey)}, {userName}.
      </h1>
      <p className="text-gray-500 font-medium text-lg">
        {t('dashboard.timeInAddis').replace('{time}', time)} {t('dashboard.howCanWeHelp')}
      </p>
    </motion.div>
  );
}
