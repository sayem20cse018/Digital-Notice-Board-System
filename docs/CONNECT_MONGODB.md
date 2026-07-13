# MongoDB Connect করার সহজ উপায়

## আপনার Existing MongoDB Connection String ব্যবহার করুন

### Step 1: `.env.local` File এ Connection String যোগ করুন

Project root এ `.env.local` file open করুন এবং এই line টি add করুন:

```env
DATABASE_URL="আপনার_মongoDB_connection_string_এখানে"
```

### Step 2: Connection String Format

#### Local MongoDB:
```env
DATABASE_URL="mongodb://localhost:27017/next-notis-app"
```

#### MongoDB Atlas (Cloud):
```env
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/database-name"
```

#### Example (আপনার existing connection):
```env
DATABASE_URL="mongodb://127.0.0.1:27017/your-database-name"
```

### Step 3: Dependencies install করে server চালু করুন

```bash
npm install
npm run dev
```

## ✅ Connection Test করুন

Server চালু করার পর, admin panel এ যান:
- URL: `http://localhost:3000/admin/login`
- Login করুন এবং data add করুন
- যদি data MongoDB তে save হয়, তাহলে connection successful! 🎉

## 🔍 Troubleshooting

### যদি Connection Error আসে:

1. **MongoDB Server চালু আছে কিনা check করুন**
   ```bash
   # MongoDB service check করুন
   ```

2. **Connection String সঠিক কিনা verify করুন**
   - Username/Password সঠিক?
   - Database name সঠিক?
   - Port number সঠিক? (default: 27017)

3. **Database ছাড়া test করতে:**
   `.env.local` এ এই line add করুন:
   ```env
   SKIP_DB=1
   ```

## 📝 Complete `.env.local` Example

```env
# MongoDB Connection
DATABASE_URL="mongodb://localhost:27017/next-notis-app"

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=next-notis-app-secret-key-2024

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123

# Database (comment out করুন MongoDB use করতে)
# SKIP_DB=1
```

## 🚀 Ready!

এখন আপনার existing MongoDB connection string `.env.local` এ add করুন এবং server চালু করুন!