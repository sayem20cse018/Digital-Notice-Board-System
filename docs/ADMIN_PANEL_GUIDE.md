# Admin Panel Access Guide

## 🔐 Admin Panel কোথায়?

Admin Panel access করতে এই URL এ যান:

**Login Page:** `n`  
**Direct Access:** `http://localhost:3000/admin` (auto redirect to login)

---

## 📝 Default Login Credentials

**প্রথমবার login করার জন্য:**

- **Username:** `admin`
- **Password:** `admin123`

> ⚠️ **Important:** প্রথম login এর পর এই credentials automatically save হবে database এ। পরে password change করতে পারবেন।

---

## 🚀 কিভাবে Access করবেন?

### Method 1: Browser এ Direct URL
1. Browser open করুন
2. Address bar এ type করুন: `http://localhost:3000/admin/login`
3. Enter press করুন
4. Username এবং Password দিন
5. "Sign In" button click করুন

### Method 2: Development Server থেকে
1. Terminal এ project folder এ যান
2. Run করুন: `npm run dev`
3. Browser automatically open হবে `http://localhost:3000`
4. URL change করুন: `/admin/login` add করুন

---

## 🎯 Admin Panel Features

Login করার পর আপনি access করতে পারবেন:

### 📊 Dashboard
- **URL:** `/admin`
- Overview of all sections
- Quick access cards

### ⚙️ Settings
- **URL:** `/admin/settings`
- Department name change
- Logo URL update
- Marquee text edit

### 👨‍🏫 Teachers
- **URL:** `/admin/teachers`
- Add new teachers
- Edit teacher info (name, title, bio)
- Feature/Unfeature teachers
- Delete teachers

### 💬 Quotes
- **URL:** `/admin/quotes`
- Add inspirational quotes
- Manage quotes

### 📰 News
- **URL:** `/admin/news`
- Create news articles
- Publish/Draft news
- Delete news

### 📅 Events
- **URL:** `/admin/events`
- Add upcoming events
- Set event dates
- Publish events

### 🏆 Achievements
- **URL:** `/admin/achievements`
- Showcase achievements
- Add descriptions

### 📊 Results
- **URL:** `/admin/results`
- Add exam results
- Link to result pages

### 📋 Notices
- **URL:** `/admin/notices`
- Create public notices
- Upload PDFs
- Manage notice order

---

## 🔒 Security Tips

1. **Password Change করুন:** প্রথম login এর পর strong password set করুন
2. **Environment Variables:** Production এ `.env` file এ secure credentials রাখুন
3. **Session:** Auto logout হবে যদি inactive থাকেন

---

## 🆘 Troubleshooting

### Login করতে পারছি না
- ✅ Username/Password সঠিক আছে কিনা check করুন
- ✅ Database connection আছে কিনা verify করুন
- ✅ Server running আছে কিনা check করুন

### "Invalid credentials" Error
- Default credentials try করুন: `admin` / `admin123`
- Database reset করতে হতে পারে

### Page Not Found
- URL সঠিক আছে কিনা check করুন: `/admin/login`
- Server restart করুন

---

## 📍 Quick Links

| Section | URL |
|---------|-----|
| Login | `/admin/login` |
| Dashboard | `/admin` |
| Settings | `/admin/settings` |
| Teachers | `/admin/teachers` |
| News | `/admin/news` |
| Events | `/admin/events` |
| Quotes | `/admin/quotes` |
| Results | `/admin/results` |
| Notices | `/admin/notices` |
| Achievements | `/admin/achievements` |

---

## 💡 Tips

1. **Navigation Bar:** Admin panel এর top এ navigation bar আছে সব sections এর জন্য
2. **Auto Save:** সব changes automatically save হবে
3. **View Site:** Top right corner এ "👁️ View Site" button আছে main site দেখার জন্য
4. **Sign Out:** Top right corner এ sign out button আছে

---

**Need Help?** Check the code or contact the developer!









