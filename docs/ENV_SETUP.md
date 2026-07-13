# Environment Variables Setup

## ✅ Code এ Already Add করা হয়েছে!

আপনাকে `.env.local` file create করতে হবে **না**! 

সব environment variables **`next.config.ts`** file এ add করা হয়েছে:

```typescript
env: {
  NEXTAUTH_URL: "http://localhost:3000",
  NEXTAUTH_SECRET: "next-notis-app-secret-key-2024",
  ADMIN_USERNAME: "admin",
  ADMIN_PASSWORD: "admin123",
}
```

---

## 🚀 এখন কি করবেন?

### Step 1: Server Restart করুন
```bash
# Terminal এ Ctrl+C press করুন
# তারপর:
npm run dev
```

### Step 2: Browser এ যান
```
http://localhost:3000/admin/login
```

### Step 3: Login করুন
- **Username:** `admin`
- **Password:** `admin123`

---

## 📝 যদি Custom করতে চান:

### Option 1: `.env.local` file (Optional)
Project root এ `.env.local` file create করুন:

```env
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-custom-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

### Option 2: `next.config.ts` এ Edit করুন
`next.config.ts` file এ values change করুন।

---

## ✅ Default Values (Code এ Set করা):

- `NEXTAUTH_URL`: `http://localhost:3000`
- `NEXTAUTH_SECRET`: `next-notis-app-secret-key-2024`
- `ADMIN_USERNAME`: `admin`
- `ADMIN_PASSWORD`: `admin123`

---

**এখন definitely কাজ করবে!** 🎉








