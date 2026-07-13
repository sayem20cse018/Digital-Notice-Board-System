# 🚀 Quick Start Guide - Admin Panel Access

## ⚡ Fast Setup (Database ছাড়া)

### Step 1: Server চালু করুন
```bash
npm run dev
```

অথবা database ছাড়া চালু করতে:
```bash
npm run dev:nodb
```

### Step 2: Browser এ যান
```
http://localhost:3000/admin/login
```

### Step 3: Login করুন
- **Username:** `admin`
- **Password:** `admin123`

---

## 🔧 যদি Login না হয়

### Option 1: Database ছাড়া চালু করুন
```bash
npm run dev:nodb
```

### Option 2: Environment Variable Set করুন
`.env.local` file তৈরি করুন (যদি না থাকে):

```env
SKIP_DB=1
NEXTAUTH_SECRET=your-secret-key-here
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

তারপর:
```bash
npm run dev
```

---

## ✅ Check করুন

1. ✅ Server running আছে? Terminal এ `Ready` message দেখতে হবে
2. ✅ Port 3000 এ আছে? `http://localhost:3000` open করুন
3. ✅ Login page দেখতে পাচ্ছেন? `/admin/login` এ যান
4. ✅ Credentials সঠিক? `admin` / `admin123`

---

## 🆘 Common Issues

### "Invalid credentials" Error
- Username: `admin` (exact match)
- Password: `admin123` (exact match)
- Case sensitive নয়, কিন্তু exact match হতে হবে

### Page Not Loading
- Server restart করুন: `Ctrl+C` then `npm run dev`
- Browser cache clear করুন
- Different browser try করুন

### Database Error
- `npm run dev:nodb` use করুন
- অথবা `.env.local` এ `SKIP_DB=1` add করুন

---

## 📞 Need Help?

1. Terminal এ error message check করুন
2. Browser console এ error check করুন (F12)
3. Server logs দেখুন

---

**Default Credentials:**
- Username: `admin`
- Password: `admin123`








