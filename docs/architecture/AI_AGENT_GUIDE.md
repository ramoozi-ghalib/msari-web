# 🤖 دليل وتعليمات حوكمة المطورين ووكلاء الذكاء الاصطناعي (AI Agent & Developer Governance Guide)

**المشروع**: منصة مساري (`msari_web`)  
**الملف**: `docs/architecture/AI_AGENT_GUIDE.md`  
**الصفة**: 📜 **دليل حوكمة إلزامي وقاطع لكل مطور أو وكيل AI يعمل على المنظومة**
**الحالة المعمارية الحالية**: 🟢 **Clean Slate — إزالة لوحة التحكم القديمة وحماية البيانات التشغيلية**

---

> [!CAUTION]
> **قوانين حوكمة مشددة وإلزامية (Mandatory Governance Rules)**:
> يتوجب على أي مطور بشري (Human Developer) أو وكيل ذكاء اصطناعي (AI Agent) يقرأ أو يعدل في مشروع `msari_web` الالتزام التام بالقواعد التالية دون أي استثناء.

---

## 📜 1. التعليمات القاطعة والإلزامية (Mandatory Directives)

### 1️⃣ إزالة لوحة التحكم و CMS القديم (Legacy CMS Removed):
- تم استئصال وحذف لوحة التحكم القديمة (`/admin`) ومكوناتها (`src/components/cms/**`, `src/actions/cms.ts`, `src/types/cms.ts`, `AdminSidebar.tsx`) بالكامل من المشروع.
- **يُحظر منعاً باتاً** إعادة بناء أو إنشاء أي مسارات تحت `/admin` أو استدعاء أي مكونات من الـ CMS القديم إلا بموافقة صريحة ومخطط معماري جديد معتمد.

### 2️⃣ حظر إنشاء مجموعات `web_*` القديمة بناءً على الوثائق المؤرشفة:
- جميع الوثائق المعمارية السابقة التي تصف مجموعات Firestore ببادئة (`web_*`) مثل `web_blocks`, `web_destination_pages`, `web_pages`, `web_media`, `web_navigation`, `web_footer`, `web_seo`, `web_settings`, `web_admins` هي **وثائق تاريخية ملغاة** وتم نقلها إلى `docs/archive/`.
- **يُحظر منعاً باتاً** إنشاء أي مجموعات `web_*` في Firestore لمجرد ورود ذكرها في الوثائق التاريخية أو المقترحات القديمة.

### 3️⃣ حماية البيانات التشغيلية الصارمة (Operational Data Protection):
- **يُمنع منعاً باتاً** حذف أو تعديل أو ترحيل أو إعادة هيكلة المجموعات التشغيلية الحية:
  - `hotels` (بيانات الفنادق والغرف والأسعار)
  - `destinations` (بيانات المدن والوجهات السياحية)
  - `discounts` (العروض والخصومات)
  - `bookings` (حجوزات العملاء)
  - `users` (حسابات المستخدمين والعملاء)
  - `bank_accounts` (الحسابات البنكية للمنصة)
- لا يجوز المساس بأي بيانات تشغيلية كجزء من عمليات التنظيف أو التوثيق أو التطوير.

### 4️⃣ تحديد مصدر الحقيقة من الكود الفعلي (Inspect Current Code as Source of Truth):
- مصدر الحقيقة الحالي للموقع العام (Public Website) يتم استخلاصه **حصرياً من الكود المصدري الفعلي والبيانات التشغيلية الحية**، وليس من افتراضات الوثائق المؤرشفة.
- صفحات الموقع العام (`/`, `/hotels`, `/destinations/[slug]`, `/about`, `/contact`, `/terms`, `/privacy`, `/app`, `/flights`, `/cars`) تعمل باستقلالية ومحمية تماماً.

### 5️⃣ حظر استخدام الـ SQL أو Prisma للتشغيل (No SQL / Prisma Operational Usage):
- يُمنع منعاً باتاً استدعاء أو استخدام Prisma أو Supabase لإنشاء جداول جديدة. المرجع الموحد لقواعد البيانات في المشروع هو **Firebase Firestore**.

---

## 📌 2. ملخص قواعد الحظر لوكلاء الذكاء الاصطناعي (Prohibited Actions List)

- ❌ **ممنوع** إنشاء أو إعادة إحياء مسارات `/admin` أو `/[locale]/admin`.
- ❌ **ممنوع** إنشاء مجموعات `web_*` في Firestore بناءً على وثائق الأرشيف.
- ❌ **ممنوع** تعديل أو حذف أي بيانات في `hotels`, `destinations`, `bookings`, `users`.
- ❌ **ممنوع** تعديل استعلام `web_blog` في `src/actions/blog.ts` لحماية أي مقالات إنتاجية سابقة.
- ❌ **ممنوع** تعديل أو إعادة كتابة ملفات التخطيط الحالية (`Header.tsx`, `Footer.tsx`, `ConditionalLayout.tsx`) أو الصفحة الرئيسية (`page.tsx`) دون تكليف صريح.
- ❌ **ممنوع** تجاوز طبقة الأمان `adminGuard` في أي Server Action تشغيلي.

---

## 📚 3. هيكل الوثائق المعتمد (Approved Documentation Structure)

1. **الوثائق النشطة (Active Governance)**:
   - `docs/architecture/AI_AGENT_GUIDE.md`: دليل حوكمة الذكاء الاصطناعي الحالي والمعتمد.
   - `docs/deployment/PRODUCTION_DEPLOYMENT_GUIDE.md`: دليل النشر والتشغيل على الخوادم.
   - `docs/deployment/HOSTINGER_ENVIRONMENT.md`: متغيرات البيئة للإنتاج.
   - `SEO_MIGRATION_AR.md`: خريطة تحويل وتوجيه روابط SEO.

2. **الوثائق المؤرشفة (Archived & Historical)**:
   - جميع المخططات السابقة الملغاة محفوظة في `docs/archive/` للأغراض المرجعية فقط وتحمل ترويسة تحذيرية بعدم استخدامها كمعمارية حالية.
