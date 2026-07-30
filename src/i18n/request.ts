import {getRequestConfig} from 'next-intl/server';
import {routing} from './routing';
import arMessages from '../../messages/ar.json';
import enMessages from '../../messages/en.json';

const messagesMap: Record<string, any> = {
  ar: arMessages,
  en: enMessages,
};

export default getRequestConfig(async ({requestLocale}) => {
  let locale = await requestLocale;
  console.log('[BOOT-2] Executing src/i18n/request.ts -> Locale:', locale);
 
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
 
  return {
    locale,
    messages: messagesMap[locale] || arMessages
  };
});
