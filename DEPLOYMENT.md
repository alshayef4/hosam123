# دليل رفع المشروع (Deployment Guide)

## الخيار 1: Render.com (الأسهل - مجاني)

### الخطوات:

1. **ارفع المشروع على GitHub**
   ```bash
   git init
   git add .
   git commit -m "initial commit"
   git remote add origin https://github.com/YOUR_USERNAME/payment-ledger.git
   git push -u origin main
   ```

2. **أنشئ حساب على [render.com](https://render.com)**

3. **أنشئ Web Service جديد**
   - اضغط "New" → "Web Service"
   - اربط حساب GitHub
   - اختر الـ repository
   - الإعدادات:
     - **Name**: payment-ledger
     - **Region**: Frankfurt (أقرب للشرق الأوسط)
     - **Runtime**: Node
     - **Build Command**: `pnpm install && pnpm run build`
     - **Start Command**: `pnpm run start`
     - **Plan**: Free

4. **أضف Environment Variables**
   من تبويب "Environment" أضف:
   | Key | Value |
   |-----|-------|
   | `NODE_ENV` | `production` |
   | `PORT` | `3000` |
   | `SUPABASE_URL` | قيمتك من Supabase |
   | `SUPABASE_KEY` | قيمتك من Supabase |
   | `DATABASE_URL` | رابط قاعدة البيانات |
   | `JWT_SECRET` | قيمة عشوائية قوية |
   | `VITE_APP_ID` | `payment-ledger` |

5. **اضغط Deploy** 🚀

---

## الخيار 2: Railway.app (أسرع - $5 مجاني شهرياً)

### الخطوات:

1. **ارفع المشروع على GitHub** (نفس الخطوة أعلاه)

2. **أنشئ حساب على [railway.app](https://railway.app)**

3. **أنشئ مشروع جديد**
   - اضغط "New Project"
   - اختر "Deploy from GitHub repo"
   - اختر الـ repository

4. **أضف Environment Variables**
   - نفس المتغيرات في الجدول أعلاه

5. **Railway يكتشف الإعدادات تلقائياً** من `package.json`

---

## الخيار 3: Docker (أي منصة)

المشروع يحتوي على `Dockerfile` جاهز. يعمل على:
- Railway
- Render
- Fly.io
- Google Cloud Run
- أي VPS

```bash
# بناء الصورة
docker build -t payment-ledger .

# تشغيل محلياً
docker run -p 3000:3000 --env-file .env payment-ledger
```

---

## ملاحظات مهمة

### الخطة المجانية (Render)
- ⚠️ الخدمة تنام بعد 15 دقيقة بدون زيارات
- ⚠️ أول request بعد النوم يأخذ ~30 ثانية
- ✅ مناسب للاستخدام الشخصي والتجريب

### الأمان
- ❌ لا ترفع ملف `.env` على GitHub
- ✅ استخدم Environment Variables من Dashboard المنصة
- ✅ غيّر `JWT_SECRET` لقيمة قوية في Production

### قاعدة البيانات
- Supabase Free Tier: 500MB storage, 2GB bandwidth
- كافي لمشروع صغير/متوسط
