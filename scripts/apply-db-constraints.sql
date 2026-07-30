-- =============================================================================
-- Msari Web — Database Constraint Fixes
-- تاريخ: 2026-04-17
-- التشغيل: في Supabase Dashboard → SQL Editor، أو عبر psql
-- =============================================================================

-- ─── 1. تمكين امتداد btree_gist (مطلوب للـ EXCLUDE Constraint) ────────────────
CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ─── 2. EXCLUDE Constraint — منع Double Booking على مستوى DB (C-4) ────────────
-- يمنع حجز نفس الغرفة في تواريخ متداخلة بحالة PENDING أو CONFIRMED
-- هذا هو الخط الأخير للدفاع — لا يمكن تجاوزه حتى لو تغيّر الكود
ALTER TABLE bookings
  ADD CONSTRAINT no_room_overlap
  EXCLUDE USING GIST (
    "roomId"                            WITH =,
    tsrange("checkIn", "checkOut", '[)') WITH &&
  )
  WHERE (status IN ('PENDING', 'CONFIRMED'));

-- ─── 3. إزالة حقل hotelCount من جدول cities (C-5) ───────────────────────────
-- القيمة ستُحسَب دائماً من _count في استعلامات Prisma
ALTER TABLE cities DROP COLUMN IF EXISTS "hotelCount";

-- ─── 4. فهرس على guestEmail في bookings (L-1) ────────────────────────────────
-- يُسرّع البحث النصي في لوحة الأدمين
CREATE INDEX IF NOT EXISTS "bookings_guestEmail_idx"
  ON bookings ("guestEmail");

-- ─── 5. فهرس مركّب على reviews (L-2) ────────────────────────────────────────
-- يُسرّع جلب التقييمات المرئية لفندق معيّن
CREATE INDEX IF NOT EXISTS "reviews_hotelId_isVisible_idx"
  ON reviews ("hotelId", "isVisible");

-- ─── 6. Unique Constraint على reviews — منع التقييم المتكرر (M-4) ────────────
ALTER TABLE reviews
  ADD CONSTRAINT "reviews_userId_hotelId_key"
  UNIQUE ("userId", "hotelId");

-- =============================================================================
-- تحقق: بعد التشغيل، تأكد من عدم وجود أخطاء
-- إذا رأيت "already exists" فالـ constraint موجود مسبقاً — لا بأس
-- =============================================================================
