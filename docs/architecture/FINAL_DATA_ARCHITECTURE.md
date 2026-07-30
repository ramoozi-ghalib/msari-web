# 📊 التوثيق المعماري النهائي لبيانات المنظومة (Final Data Architecture Specification)

**المشروع**: منصة مساري (`msari_web`)  
**الدور الرسمي**: Chief Software Architect, Enterprise Solution Architect & Data Architecture Lead  
**الحالة المعمارية**: 📜 **مستند رسمي معتمد لبناء وإدارة بيانات المشروع (Baseline Architecture Specification)**

---

## 📑 1. الملخص التنفيذي (Executive Summary)

تثبت هذه الوثيقة معمارية البيانات النهائية لمنصة مساري (`msari_web`). تُعتمد هذه المعمارية كمرجع موحد وصريح يحدد لكل جزء في المنظومة: أين يتم تخزينه، من يديره، من يستهلكه، وكيف تتم مزامنته دون أي تداخل بين **بيانات تطبيق الجوال** و **محتوى الموقع الإلكتروني**.

---

## 🗺️ 2. مصفوفة ملكية وتصنيف البيانات (Data Ownership Matrix)

| الوحدة / الصفحة | مصدر البيانات | هل ترتبط بالتطبيق؟ | هل تتبع للـ Website CMS؟ | هل هي API خارجي؟ | لوحة الإدارة المسؤولة |
| :--- | :--- | :---: | :---: | :---: | :--- |
| **المستخدمون والمصادقة** | Firebase Auth Shared | 🟢 نعم | 🔴 لا | 🔴 لا | Application Admin |
| **الفنادق المحلية والغرف** | Firestore (`hotels`, `rooms`) | 🟢 نعم | 🔴 لا | 🔴 لا | Application Admin |
| **الحجوزات والعمليات** | Firestore (`bookings`) | 🟢 نعم | 🔴 لا | 🔴 لا | Application Admin |
| **الحسابات البنكية للمزودين** | Firestore (`bank_accounts`) | 🟢 نعم | 🔴 لا | 🔴 لا | Application Admin |
| **إعلانات التطبيق** | Firestore (`ads`) | 🟢 نعم | 🔴 لا | 🔴 لا | Application Admin |
| **قائمة المدن الأساسية** | Firestore (`destinations`) | 🟢 نعم | 🔴 لا | 🔴 لا | Application Admin |
| **تفاصيل الوجهة (الوصف والمعالم)**| Firestore (`web_destinations`) | 🔴 لا | 🟢 نعم | 🔴 لا | Website CMS Admin |
| **أسطول وحجوزات السيارات** | Firestore (`web_cars`, `web_car_bookings`) | 🔴 لا | 🟢 نعم | 🔴 لا | Website CMS Admin |
| **محتوى الهيرو والرئيسية** | Firestore (`web_homepage`) | 🔴 لا | 🟢 نعم | 🔴 لا | Website CMS Admin |
| **أقسام الشركاء والمميزات** | Firestore (`web_sections`, `web_partners`) | 🔴 لا | 🟢 نعم | 🔴 لا | Website CMS Admin |
| **الأسئلة الشائعة (FAQ)** | Firestore (`web_faq`) | 🔴 لا | 🟢 نعم | 🔴 لا | Website CMS Admin |
| **الصفحات الثابتة (من نحن/الخصوصية)**| Firestore (`web_pages`) | 🔴 لا | 🟢 نعم | 🔴 لا | Website CMS Admin |
| **إعدادات الموقع والـ SEO** | Firestore (`web_settings`, `web_seo`) | 🔴 لا | 🟢 نعم | 🔴 لا | Website CMS Admin |
| **الفنادق العالمية** | External API Proxy | 🔴 لا | 🔴 لا | 🟢 نعم | لا تحتاج لوحة (Direct API) |
| **رحلات وحجوزات الطيران** | Flight Engine API | 🟢 نعم | 🔴 لا | 🟢 نعم | مشتركة عبر الـ API |

---

## 🗄️ 3. تصميم مجموعات البيانات بـ (Firebase Firestore Collections Design)

تعتمد المنظومة على **Firebase Firestore** كمصدر بيانات موحد مع فصل صريح باستخدام بادئة (`web_`) للمجموعات المخصصة للموقع:

```
Firestore Root
├── 📁 app_collections (مجموعات التطبيق المشتركة)
│   ├── 📄 hotels
│   ├── 📄 bookings
│   ├── 📄 users
│   └── 📄 destinations
│
└── 📁 website_cms_collections (مجموعات الموقع المستقلة)
    ├── 📄 web_settings
    ├── 📄 web_homepage
    ├── 📄 web_destinations
    ├── 📄 web_cars
    ├── 📄 web_car_bookings
    ├── 📄 web_pages
    ├── 📄 web_seo_pages
    ├── 📄 web_banners
    ├── 📄 web_partners
    └── 📄 web_faq
```

### 📐 المواصفات الهيكلية للمجموعات (Schema Specifications):

#### 1. `web_settings`
مجموعة تحوي وثيقة فريدة لتخزين الإعدادات العامة للموقع، روابط التواصل الاجتماعي، والواتساب.

#### 2. `web_homepage`
وثيقة تخزين نصوص وعناوين الهيرو، ترتيب الأقسام، ونصوص صندوق الشركاء باللغتين العربية والإنجليزية.

#### 3. `web_destinations`
مجموعة وثائق تخزن التفاصيل التحريرية لكل مدينة (الوصف التاريخي، المناخ، قائمة المعالم والصور، الأسئلة الشائعة الخاصة بالمدينة، والـ SEO).

#### 4. `web_cars`
مجموعة وثائق تخزن بيانات السيارات، الفئات (SUV/اقتصادية/فان)، سعة الركاب والحقائب، أسعار التوصيل للمطارات والتنقل بين المدن، وحالة التوفر.

#### 5. `web_seo_pages`
مجموعة وثائق تخزن الـ Meta Title, Meta Description, Keywords, و OG Image المخصصة لكل مسار بداخل الموقع.

---

## 🎛️ 4. وحدات وموديولات لوحة تحكم الموقع (Website Admin Modules)

تتكون **لوحة تحكم الموقع (Website Admin)** من الموديولات المخصصة التالية:

1. **Dashboard Overview**: ملخص وزيارات وإحصائيات الموقع.
2. **Homepage & Hero Manager**: إدارة نصوص وصور الهيرو والأقسام التسويقية.
3. **Destinations CMS Manager**: إدارة تفاصيل والمعالم والـ SEO لكل مدينة.
4. **Cars & Fleet Manager**: إدارة السيارات، الفئات، الأسعار، وحجوزات السيارات.
5. **Pages Manager**: إدارة الصفحات الثابتة (من نحن، سياسة الخصوصية، الشروط).
6. **SEO & Metadata Manager**: إدارة العناوين والميتا تاجز لكافة مسارات الموقع.
7. **Website Settings & Contact**: إدارة هاتف الواتساب، البريد، وروابط التواصل.
8. **Partners & Banners Manager**: إدارة بنرات وشعارات الشركاء.
9. **FAQ Manager**: إدارة الأسئلة الشائعة وتصنيفاتها.

---

## ❓ 5. الأسئلة المعمارية المفتوحة (Open Architectural Questions)

> [!NOTE]
> هذا القسم مخصص لتوثيق التساؤلات المعمارية القابلة للبت والقرار حصراً من قِبل صاحب المشروع:

1. **إدارة حجوزات السيارات**: هل يُفضل ربط حجوزات السيارات بلوحة التحكم فقط أم إرسال إشعار لحظي عبر الواتساب لإدارة السيارات بمجرد طلب العميل؟
2. **إشعارات البنرات الإعلانية**: هل يُكتفى بنظام البنرات الثابتة في `web_banners` أم ربطها بمحرك تحليلات النقرات (Click Analytics)؟
