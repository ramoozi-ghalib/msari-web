# 🔑 دليل وحصر متغيرات البيئة بـ Hostinger (Hostinger Environment Variables)

**الصفة الرسمية**: Production Deployment Engineer, Hostinger Platform Specialist  
**المشروع**: منصة مساري الرقمية (`msari_web`)  
**المستند**: `docs/deployment/HOSTINGER_ENVIRONMENT.md`  
**الحالة**: 📜 **المرجع المعتمد لضبط متغيرات البيئة ببيئة استضافة Hostinger Node.js**

---

> [!IMPORTANT]
> **إرشادات الضبط بداخل هوستنجر**:
> - يُرجى فتح قسم **Environment Variables (متغيرات البيئة)** بداخل لوحة تحكم تطبيق Node.js في Hostinger وإضافة المتغيرات الموضحة أدناه.
> - تحتوي القيم الموضحة بالأسفل على **أمثلة توضيحية فقط (Example Values)** ولا تحتوي على أي أسرار أو مفاتيح حقيقية.

---

## 📋 جدول حصر متغيرات البيئة المطلوبة

| اسم المتغير (Key) | إلزامي؟ | مثال للقيمة (Example Value) | الوصف الفني والغرض التشغيلي |
| :--- | :---: | :--- | :--- |
| **`NEXT_PUBLIC_APP_URL`** | 🔴 نعم | `https://salmon-alligator-771699.hostingersite.com` | رابط النطاق المعتمد للموقع لربط استدعاءات الـ APIs والـ Canonical SEO. |
| **`NEXTAUTH_URL`** | 🔴 نعم | `https://salmon-alligator-771699.hostingersite.com` | الرابط المعتمد لمنظومة المصادقة وتأمين جلسات تسجيل الدخول بـ NextAuth. |
| **`AUTH_URL`** | 🔴 نعم | `https://salmon-alligator-771699.hostingersite.com` | رابط الخادم المصرح لـ Auth.js v5. |
| **`AUTH_SECRET`** | 🔴 نعم | `c2a9a7b93e4f3a9e3b4a2e5d7c8a9f0e1c2b3d4f5a6b7c8d9e0f1a2b3c4d5e6f` | مفتاح التشفير والسر الأساسي لتوليد وتأمين رموز جلسات الـ JWT. |
| **`NEXTAUTH_SECRET`** | 🔴 نعم | `c2a9a7b93e4f3a9e3b4a2e5d7c8a9f0e1c2b3d4f5a6b7c8d9e0f1a2b3c4d5e6f` | مفتاح سر متوافق تراجعياً لتوليد الـ Cookies بـ NextAuth. |
| **`NODE_OPTIONS`** | 🔴 نعم | `--dns-result-order=ipv4first` | **مهم جداً**: توجيه محرك Node لإعطاء الأسبقية لـ IPv4 لمنع تعثر Proxy هوستنجر مع `localhost`. |
| **`HOSTNAME`** | 🔴 نعم | `127.0.0.1` | عنوان الاستماع الداخلي لخادم Next.js للربط مع موجه Nginx Proxy. |
| **`PORT`** | 🔴 نعم | `3000` | رقم المنفذ المخصص لاستماع التطبيق بـ بيئة الاستضافة. |
| **`FIREBASE_PROJECT_ID`** | 🔴 نعم | `msari-app-prod` | معرف مشروع فايبربيس لاسترجاع بيانات الفنادق والمدن بـ Server Runtime. |
| **`FIREBASE_CLIENT_EMAIL`**| 🔴 نعم | `firebase-adminsdk-xxxxx@msari-app.iam.gserviceaccount.com` | بريد حساب الخدمة المصرح لاتصال Firestore ببيئة الإنتاج. |
| **`FIREBASE_PRIVATE_KEY`** | 🔴 نعم | `"-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC...\n-----END PRIVATE KEY-----\n"` | المفتاح الخاص المعتمد لاتصال Firebase Admin SDK بـ Firestore. |

---

## 📌 أمر التشغيل النهائي بداخل Hostinger (Startup Command)

أمر التشغيل المعتمد الذي يجب ضبطه بداخل واجهة Hostinger Node.js Application:

```bash
npm run start
```

أو الأمر المباشر:

```bash
next start -H 127.0.0.1 -p 3000
```
