# MSARI Hostinger Limits Report (observed values only — no estimates)
| Item | Status | Evidence |
|---|---|---|
| Process stability (sequential loads) | VERIFIED | 20+ sequential requests, no drops |
| Build works from GitHub main | VERIFIED | operator deploy succeeded (screenshot) |
| Deployment timeout | NOT EXPOSED | unknown — record from panel on next deploy |
| RAM / CPU / limits | NOT EXPOSED | unknown — read from Hostinger plan/panel |
| Bandwidth/transfer | NOT EXPOSED | unknown |
| Env var count/size limits | VERIFIED (by success) | 14 vars accepted |
| Rollback | NOT TESTED | confirm panel capability before any prod use |
| Logs/monitoring | NOT TESTED | confirm availability |
| Cron/background | NOT NEEDED | app requires none (verified: no cron configs) |
| CDN/SSL | VERIFIED (SSL) | `https://` served, HSTS present |
| Auto-deploy (GitHub) | VERIFIED (observed) | branch-linked deploy succeeded |
| Uptime behavior | NOT TESTED (long-term) | observe over days |
