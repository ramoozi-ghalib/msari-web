# MSARI — Booking Email to info@msari.net: Diagnostic Report (READ-ONLY, NO FIX)
**Question:** how did user-booking emails reach info@msari.net, and why did they stop after the WordPress deletion?

## Eliminated (with evidence)
| # | Suspect | Evidence | Verdict |
|---|---|---|---|
| 1 | Mobile app sending mail | No SMTP/SendGrid/mailer code; zero `app.msari.net`/PHP/`http.post` calls; `info@` appears only in static legal text (l10n) | NOT the sender — app writes Firestore only |
| 2 | Cloud Functions backend | Zero matches: nodemailer/smtp/sendMail/sendgrid/mailgun/gmail/`/mail`/info@ in `functions/` | NOT the sender |
| 3 | Firebase Trigger Email extension | `ext:list` on msariapp-v2: **no extensions installed** | NOT the sender |
| 4 | Mail-queue collections | `mail`, `emails`, `email_queue`, `notifications`: all empty/absent | No queue ever existed |
| 5 | Dashboard auto-send | Only a manual `mailto:` link launcher (`bookings_screen.dart:397`) | Manual only, not automatic |
| 6 | Website backend | `info@` only as contact display (CMS settings default, SEO, contact page) | NOT the sender |

## Remaining Explanation (only consistent one)
The relay lived on the deleted Hostinger hosting: a WordPress plugin (Firestore-sync → `wp_mail` via Hostinger SMTP) or a standalone PHP script and/or Hostinger cron job polling new bookings. All died with `public_html`. Nothing in any audited codebase could have sent those emails.
**To confirm (operator, 5 minutes):** open ONE old booking email in webmail → «view original/headers» → record `From`, `X-Mailer`, first `Received` hop, and the DATE of the newest booking email (expected: stops at WP-deletion day). Also check hPanel Cron Jobs list for a booking-related schedule (account-level crons survive site deletion — a failing cron now would be definitive proof).

## Proposed Safe Fixes (AWAITING APPROVAL — none implemented)
- **A (recommended): Firebase-native sender** — Firestore `onCreate` trigger on booking entries → transactional provider (SendGrid/Mailgun SMTP or Trigger Email extension) to info@ + customer. Survives any hosting change; logged; retryable. Needs: provider account + backend deploy + secret handling.
- **B (fragile, not recommended):** recreate Hostinger PHP relay + cron. Repeats the exact failure mode (invisible infra, dies with hosting).
- **C (zero-infra):** keep dashboard manual notify + in-app admin notifications (already exist).
- Constraints for any option: no SMTP credentials in repos; no PII beyond booking facts; rate-limit + failure logging.

## Scope Integrity
Zero files modified in any repo. Probes were read-only (grep, ext:list, Firestore reads).

## Addendum — Dashboard Inspection (`D:\projects\msari_dashboard`, read-only)
- No email-sending infrastructure: zero SMTP/Gmail/SendGrid/API-mail code.
- No references to deleted hosting, PHP/WP endpoints, `app.msari.net`, or cron callers.
- `info@msari.net` occurrences are display-only: contact defaults
  (`website_settings`, model defaults), legal text, a super-admin identifier
  (`customers_screen.dart:25`), and one UI label (`bookings_screen.dart:1122`).
- Revalidation still targets `https://msari.net/api/revalidate` (correct post-cutover).
- Conclusion: dashboard neither sent the booking emails nor broke when hosting
  was deleted. The Gmail linkage the operator recalls lived in the deleted
  Hostinger PHP/cron relay (likely Gmail SMTP relay credentials inside the
  removed scripts) — unrecoverable from repos; check the downloaded WP backup
  for mailer `*.php` files / WP-Cron schedules if archaeology is ever needed.

`END`
