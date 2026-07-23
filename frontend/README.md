# واجهة وكالة براديس (Frontend)

واجهة لوحة التحكم لمنصة وكالة براديس، مبنية بـ **React 19 + TypeScript +
Tailwind CSS v4** عبر Vite، مع دعم كامل للعربية/RTL. دليل التصميم
الملزم موجود في `../docs/UI_DESIGN_GUIDELINES.md`، وقواعد جودة الكود في
`../CLAUDE.md`.

## الهيكل

```
src/
  components/    مكوّنات مشتركة (layout, ui) وProtectedRoute
  features/      كل ميزة في مجلدها (auth, dashboard) بمنطقها ومكوّناتها
  lib/            axios client، تخزين الجلسة، رموز التصميم
  types/          واجهات TypeScript مطابقة لمخرجات Pydantic schemas في الخلفية
  router.tsx      خريطة التوجيه الكاملة
```

## التشغيل

```bash
npm install
cp .env.example .env.local   # عدّل VITE_API_BASE_URL إذا كانت الخلفية على عنوان مختلف
npm run dev                  # http://localhost:5173
```

يتطلب تشغيل الخلفية (FastAPI) محلياً على العنوان المحدد في
`VITE_API_BASE_URL` حتى تعمل شاشة الدخول ولوحة التحكم فعلياً.

## البناء والفحص

```bash
npm run build   # tsc -b (فحص الأنواع) ثم vite build
npm run lint    # oxlint
```
