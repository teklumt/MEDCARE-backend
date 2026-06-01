/**
 * Tests for multi-language (EN/AM) utility logic.
 */

type Language = 'en' | 'am';

const translations: Record<Language, Record<string, string>> = {
  en: {
    login: 'Login',
    signup: 'Sign Up',
    search: 'Search medications...',
    cart: 'My Cart',
    orders: 'My Orders',
    profile: 'Profile',
    logout: 'Logout',
    healthAssistant: 'Health Assistant',
    findPharmacy: 'Find a Pharmacy',
    deliveryTracking: 'Track Delivery',
    noResults: 'No results found',
  },
  am: {
    login: 'ግባ',
    signup: 'ተመዝገብ',
    search: 'መድሃኒቶችን ፈልግ...',
    cart: 'ጋሪዬ',
    orders: 'ትዕዛዞቼ',
    profile: 'መገለጫ',
    logout: 'ውጣ',
    healthAssistant: 'የጤና ረዳት',
    findPharmacy: 'ፋርማሲ ፈልግ',
    deliveryTracking: 'ዴሊቨሪ ተከታተል',
    noResults: 'ምንም ውጤት አልተገኘም',
  },
};

const t = (lang: Language, key: string): string => translations[lang][key] ?? key;

const getSupportedLanguages = () => Object.keys(translations) as Language[];

const isLanguageSupported = (lang: string): lang is Language => lang === 'en' || lang === 'am';

describe('Language utilities', () => {
  describe('t (translate)', () => {
    it('returns English text for en locale', () => {
      expect(t('en', 'login')).toBe('Login');
      expect(t('en', 'search')).toBe('Search medications...');
    });

    it('returns Amharic text for am locale', () => {
      expect(t('am', 'login')).toBe('ግባ');
      expect(t('am', 'cart')).toBe('ጋሪዬ');
    });

    it('returns the key itself when translation is missing', () => {
      expect(t('en', 'unknownKey')).toBe('unknownKey');
    });

    it('all EN keys have AM equivalents', () => {
      const enKeys = Object.keys(translations.en);
      const amKeys = Object.keys(translations.am);
      enKeys.forEach(k => expect(amKeys).toContain(k));
    });
  });

  describe('getSupportedLanguages', () => {
    it('returns both supported languages', () => {
      const langs = getSupportedLanguages();
      expect(langs).toContain('en');
      expect(langs).toContain('am');
      expect(langs).toHaveLength(2);
    });
  });

  describe('isLanguageSupported', () => {
    it('accepts en and am', () => {
      expect(isLanguageSupported('en')).toBe(true);
      expect(isLanguageSupported('am')).toBe(true);
    });

    it('rejects unsupported languages', () => {
      expect(isLanguageSupported('fr')).toBe(false);
      expect(isLanguageSupported('ar')).toBe(false);
      expect(isLanguageSupported('')).toBe(false);
    });
  });

  describe('translation completeness', () => {
    it('EN and AM have the same number of keys', () => {
      expect(Object.keys(translations.en).length).toBe(Object.keys(translations.am).length);
    });

    it('no Amharic translation is empty', () => {
      Object.values(translations.am).forEach(v => expect(v.trim()).not.toBe(''));
    });
  });
});
