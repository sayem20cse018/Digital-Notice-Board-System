# 🚀 MongoDB Connect - Quick Guide

## আপনার Existing MongoDB Connection String ব্যবহার করুন

### ✅ Step 1: `.env.local` File এ Connection String যোগ করুন

1. Project root এ `.env.local` file open করুন (যদি না থাকে, create করুন)

2. এই line টি add করুন:
   ```env
   DATABASE_URL="আপনার_connection_string"
   ```

### 📋 Connection String Examples:

#### Local MongoDB:
```env
DATABASE_URL="mongodb://localhost:27017/next-notis-app"
```

#### MongoDB Atlas:
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database-name"
```

#### With Authentication:
```env
DATABASE_URL="mongodb://username:password@localhost:27017/database-name"
```

### ✅ Step 2: Server চালু করুন

```bash
npm install
npm run dev
```

### ✅ Step 4: Test করুন

1. Browser এ যান: `http://localhost:3000/admin/login`
2. Login করুন (admin / admin123)
3. Admin panel থেকে data add করুন
4. যদি data save হয়, তাহলে connection successful! 🎉

---

## 💡 আপনার Existing Connection String কোথায় পাবেন?

### MongoDB Compass থেকে:
1. MongoDB Compass open করুন
2. Connection string copy করুন
3. Database name change করুন (যদি প্রয়োজন হয়)

### MongoDB Atlas থেকে:
1. Atlas dashboard এ যান
2. "Connect" button click করুন
3. "Connect your application" select করুন
4. Connection string copy করুন

### Command Line থেকে:
```bash
# MongoDB running আছে কিনা check করুন
mongosh --eval "db.version()"
```

---

## ⚠️ Important:

- Connection string এ `mongodb://` বা `mongodb+srv://` থাকতে হবে
- Database name সঠিক হতে হবে
- Username/Password সঠিক হতে হবে (যদি authentication থাকে)

---

## 🆘 যদি Error আসে:

1. **MongoDB Server চালু আছে?**
   - Local MongoDB: Service check করুন
   - Atlas: Internet connection check করুন

2. **Connection String Format:**
   - `mongodb://` দিয়ে শুরু হতে হবে
   - Database name শেষে থাকতে হবে

3. **Temporary Test (Database ছাড়া):**
   ```env
   SKIP_DB=1
   ```

---

**আপনার existing connection string `.env.local` এ add করুন এবং server চালু করুন!** ✅



