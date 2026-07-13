# Image Edit Guide - কোথায় Image Names Edit করতে হবে

এই guide টি আপনাকে জানাবে কোথায় কোথায় image names এবং paths edit করতে হবে।

## 📁 Image Folder Location

**সব images এখন `public/images/` folder এ আছে।**

### Image Files:
- `cse_logo.jpg` - Department logo
- `gstu.png` - University logo
- `MrinalKantiBaowaly.jpg` - Teacher photo
- `saleh Ahmed Pic.jpg` - Teacher photo
- `News1.jpg` - News image
- `Notish1 .jpg` - Notice image
- `All Routine .jpg` - Routine image
- `mews.jpg` - News image
- `llll.png` - Other image

---

## 🔧 কোথায় Edit করতে হবে:

### 1. **Department Logo (Header Logo)**
**File:** `app/layout.tsx`  
**Line:** 19  
**Current:** `/images/cse_logo.jpg`  
**Edit:** Logo URL change করতে হলে এখানে edit করুন

```typescript
let logoUrl: string | null = (stored?.logoUrl as string | null) || '/images/cse_logo.jpg';
```

**Admin Panel থেকে:** `/admin/settings` page এ গিয়ে "Logo URL" field এ নতুন image path দিন।

---

### 2. **Default Logo (Demo Settings)**
**File:** `app/lib/store.ts`  
**Line:** 18  
**Current:** `/images/cse_logo.jpg`  
**Edit:** Default logo path change করতে হলে

```typescript
logoUrl: "/images/cse_logo.jpg",
```

---

## 📝 Image Path Format

Next.js এ `public` folder এর files directly serve হয়, তাই:
- ✅ Correct: `/images/cse_logo.jpg`
- ❌ Wrong: `/public/images/cse_logo.jpg`
- ❌ Wrong: `./images/cse_logo.jpg`

---

## 🎯 Admin Panel থেকে Image Change করা

1. **Admin Panel Login করুন:** `/admin/login`
2. **Settings page এ যান:** `/admin/settings`
3. **"Logo URL" field এ নতুন path দিন:**
   - Example: `/images/your-new-logo.jpg`
4. **Save করুন**

---

## 📂 New Image Add করা

1. **Image file টি `public/images/` folder এ রাখুন**
2. **File name:** lowercase, no spaces (better)
   - ✅ Good: `new_logo.jpg`
   - ❌ Bad: `New Logo.jpg`
3. **Admin Panel এ path দিন:** `/images/new_logo.jpg`

---

## 🔍 Image Reference Check করা

Image path খুঁজে পেতে:
```bash
# Search for image references
grep -r "images/" app/
grep -r "Images/" app/
```

---

## ⚠️ Important Notes

1. **File names এ space avoid করুন** - use underscore `_` instead
2. **Case sensitive:** `/images/logo.jpg` ≠ `/images/Logo.jpg`
3. **Extension check করুন:** `.jpg`, `.png`, `.jpeg` etc.
4. **Admin Panel থেকে change করলে automatically save হবে**

---

## 📍 Quick Reference

| Location | File | Purpose |
|----------|------|---------|
| Header Logo | `app/layout.tsx` (line 19) | Main department logo |
| Default Logo | `app/lib/store.ts` (line 18) | Fallback logo |
| Admin Settings | `/admin/settings` | Change via UI |

---

**Need Help?** Check the admin panel at `/admin` for easy management!









