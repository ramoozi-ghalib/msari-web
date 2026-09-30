// src/app/[locale]/template.tsx
//
// Page-transition wrapper: Next re-mounts templates on every navigation,
// so each incoming page automatically plays the enter animation
// (fade + subtle rise, CSS-only). No layout/SEO/data impact.
export default function LocaleTemplate({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="animate-page-enter">{children}</div>;
}
