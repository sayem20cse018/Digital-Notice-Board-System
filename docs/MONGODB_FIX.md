# MongoDB Replica Set Error Fix

## সমস্যা:
```
Invalid `prisma.newsItem.create()` invocation: Prisma needs to perform transactions, which requires your MongoDB server to be run as a replica set.
```

## সমাধান:

### Step 1: `.env.local` File Update করুন

`.env.local` file-এ `DATABASE_URL` update করুন এবং `directConnection=true` parameter যোগ করুন:

```env
DATABASE_URL="mongodb://localhost:27017/NotishBoard?directConnection=true"
```

**অথবা** যদি MongoDB Atlas ব্যবহার করেন:

```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/NotishBoard?directConnection=true"
```

### Step 2: Server Restart করুন

`.env.local` update করার পর dev server restart করুন:

```bash
# Ctrl+C দিয়ে server stop করুন
npm run dev
```

### Step 3: Test করুন

1. Admin Panel → News → Data add করুন
2. "Save" button click করুন
3. Success message দেখবেন এবং database-এ save হবে

## ✅ এখন কাজ করবে:

- ✅ Image upload করবেন → Database-এ save হবে
- ✅ Data add করবেন → Main page-এ সাথে সাথে দেখাবে
- ✅ Save button click করবেন → Success message দেখবেন

## ⚠️ Important:

- `directConnection=true` parameter MongoDB standalone mode-এর জন্য প্রয়োজন
- Replica set setup করার দরকার নেই
- Local MongoDB এবং MongoDB Atlas দুটোতেই কাজ করবে

