import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    const localeAuthPath = path.join(process.cwd(), 'src', 'app', '[locale]', 'auth');
    const authGroupPath = path.join(process.cwd(), 'src', 'app', '[locale]', '(auth)');
    const mainGroupPath = path.join(process.cwd(), 'src', 'app', '[locale]', '(main)');
    
    // We also need to move other pages to (main) if we want (auth) to not inherit layout.tsx.
    // Wait, actually, if layout.tsx is in app/[locale]/layout.tsx, it wraps EVERYTHING inside [locale].
    // If the user wants `app/[locale]/(auth)/layout.tsx` to have NO Header/Footer, then `app/[locale]/layout.tsx` MUST NOT have Header/Footer.
    // The user's instructions: "AUTH LAYOUT RULES: - NO Header - NO Footer".
    // This implies we need to hide the header/footer in the auth layout or app layout.
    // Let's just do exactly what they asked: move auth to (auth).
    
    if (!fs.existsSync(authGroupPath)) {
      fs.mkdirSync(authGroupPath, { recursive: true });
    }
    
    // Move auth to (auth)/auth
    // Wait, the user said "MOVE login page register page INTO (auth) group".
    // If they want the url to be /auth/login, it must be `(auth)/auth/login`.
    const newAuthPath = path.join(authGroupPath, 'auth');
    
    if (fs.existsSync(localeAuthPath) && !fs.existsSync(newAuthPath)) {
      fs.renameSync(localeAuthPath, newAuthPath);
    }
    
    // Delete session-redirect API
    const sessionRedirectPath = path.join(process.cwd(), 'src', 'app', 'api', 'session-redirect');
    if (fs.existsSync(sessionRedirectPath)) {
      fs.rmSync(sessionRedirectPath, { recursive: true, force: true });
    }

    return NextResponse.json({ success: true, message: "Moved successfully" });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
