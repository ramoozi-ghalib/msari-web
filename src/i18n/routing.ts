import {defineRouting} from 'next-intl/routing';
import {createNavigation} from 'next-intl/navigation';

export const routing = defineRouting({
  // A list of all locales that are supported
  locales: ['ar', 'en'],
  
  // Used when no locale matches
  defaultLocale: 'ar',
  
  // Unified locale prefix: 'always' ensures explicit /ar and /en canonical URLs matching sitemap.xml
  localePrefix: 'always' 
});

// Lightweight wrappers around Next.js' navigation APIs
// that will consider the routing configuration
export const {Link, redirect, usePathname, useRouter} =
  createNavigation(routing);
