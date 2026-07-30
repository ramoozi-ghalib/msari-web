'use client';

interface BookingGuardProps {
  children: React.ReactNode;
  hotelSlug?: string;
}

export default function BookingGuard({ children }: BookingGuardProps) {
  // TODO: Restore guard logic when Next-Auth / backend sessions are integrated.
  // Guard will check session via useSession() and redirect to /auth/login if unauthenticated.
  return <>{children}</>;
}
