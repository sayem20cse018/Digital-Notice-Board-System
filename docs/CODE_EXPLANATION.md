# 📚 Complete Code Explanation - GSTU CSE Department Website

## 🎯 Project Overview

এই project টি Next.js 14 (App Router) দিয়ে তৈরি করা হয়েছে। এটি একটি Department Display System যেখানে:
- **Main Display**: User শুধু দেখবে, scroll/zoom করতে পারবে না
- **Admin Panel**: Admin scroll করে professional ভাবে modify করতে পারবে

---

## 📁 Project Structure

```
next-notis-app/
├── app/
│   ├── (admin)/          # Admin routes
│   ├── (auth)/           # Authentication routes
│   ├── admin/            # Admin panel pages
│   │   ├── layout.tsx    # Admin layout (professional, scrollable)
│   │   ├── page.tsx      # Admin dashboard
│   │   ├── settings/     # Settings page
│   │   ├── best-alumni/  # Best Alumni management
│   │   ├── highlight-news/ # Highlight News management
│   │   └── ...
│   ├── components/       # Reusable components
│   │   ├── AutoCarousel.tsx      # Auto-sliding carousel
│   │   ├── ResearcherCarousel.tsx # Researcher carousel
│   │   ├── Clock.tsx             # Live clock
│   │   └── ...
│   ├── lib/              # Utility functions
│   │   ├── store.ts      # Database operations
│   │   ├── auth.ts       # Authentication
│   │   └── mongodb.ts    # MongoDB connection
│   ├── api/              # API routes
│   ├── page.tsx          # Main display page (NO SCROLL)
│   ├── layout.tsx        # Root layout
│   └── globals.css       # Global styles
├── public/               # Static files
└── types/                # TypeScript types
```

---

## 🔑 Key Files Explanation

### 1. **app/page.tsx** - Main Display Page

**Purpose**: User-এর জন্য main display page। এখানে scroll/zoom করা যাবে না।

**Key Features**:
```typescript
// Line 30: Prevent user interaction
<main className="h-full w-full flex relative bg-white overflow-hidden select-none" 
      style={{ touchAction: 'none', userSelect: 'none' }}>
```

**Layout Structure**:
- **Left Sidebar**: Best Alumni + Best Programmer
- **Middle Section**: Highlight News (carousel) + Researchers (carousel)
- **Right Sidebar**: Notice Board + CR & Office

**Important CSS Classes**:
- `overflow-hidden`: Scrolling বন্ধ
- `select-none`: Text select বন্ধ
- `touchAction: 'none'`: Touch gestures বন্ধ
- `fixed`: Sidebars fixed position

---

### 2. **app/layout.tsx** - Root Layout

**Purpose**: Website-এর main layout (header, footer, marquee)

**Header Layout**:
```typescript
// Logo (Left) | Clock (Center) | Dept Name (Right)
<div className="w-full flex items-center justify-between">
  <div className="flex-shrink-0">Logo</div>
  <div className="flex-1 flex justify-center">Clock</div>
  <div className="flex-shrink-0">Dept Name</div>
</div>
```

**Viewport Settings** (Line 14-20):
```typescript
viewport: {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,      // Zoom বন্ধ
  userScalable: false,  // User zoom করতে পারবে না
}
```

---

### 3. **app/admin/layout.tsx** - Admin Panel Layout

**Purpose**: Admin-এর জন্য professional, scrollable layout

**Key Differences from Main Page**:
- ✅ `min-h-screen`: Full height, scrollable
- ✅ `overflow-y-auto`: Scroll করতে পারবে
- ✅ Professional design: Better spacing, shadows, colors
- ✅ Sticky navigation: Top এ fixed

**Layout Structure**:
```typescript
<div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50">
  <nav className="sticky top-0">...</nav>  // Sticky header
  <main className="max-w-7xl mx-auto">     // Scrollable content
    {children}
  </main>
  <footer>...</footer>
</div>
```

---

### 4. **app/globals.css** - Global Styles

**Main Display Protection**:
```css
/* Prevent zooming */
html {
  touch-action: manipulation;
  -webkit-text-size-adjust: 100%;
}

/* No scroll for main page */
body:not(.admin-body) {
  overflow: hidden;
  touch-action: none;
}
```

**User Interaction Blocked**:
```css
* {
  -webkit-user-select: none;  /* Text select বন্ধ */
  user-select: none;
}

/* But allow links/buttons */
a, button {
  pointer-events: auto;  /* Links কাজ করবে */
  user-select: auto;
}
```

---

### 5. **app/components/AutoCarousel.tsx** - Auto Carousel Component

**Purpose**: Highlight News-এর জন্য auto-sliding carousel

**How it Works**:
```typescript
// Line 22-30: Auto slide every 5 seconds
useEffect(() => {
  const timer = setInterval(() => {
    setCurrentIndex((prev) => (prev + 1) % items.length);
  }, interval * 1000);  // 5 seconds
  return () => clearInterval(timer);
}, [items.length, interval]);
```

**Features**:
- Auto-slides every 5 seconds
- Navigation dots
- Image + Title + Description display
- Responsive design

---

### 6. **app/components/ResearcherCarousel.tsx** - Researcher Carousel

**Purpose**: Researchers-এর জন্য auto-sliding carousel

**Similar to AutoCarousel** but displays:
- Photo (circular)
- Name
- Title
- Bio

---

### 7. **app/lib/store.ts** - Database Operations

**Purpose**: MongoDB থেকে data fetch করা

**Key Functions**:
```typescript
// Get all Best Alumni
export async function getBestAlumni(): Promise<BestAlumni[]>

// Get Highlight News
export async function getHighlightNews(): Promise<HighlightNews[]>

// Get Researchers
export async function getResearchers(): Promise<Researcher[]>

// Get Notices
export async function getRightSidebarNotices(): Promise<RightSidebarNotice[]>

// Get Help Center (CR & Office)
export async function getHelpCenter(): Promise<HelpCenter[]>
```

---

## 🎨 Design Patterns

### 1. **Fixed Display Pattern** (Main Page)
```typescript
// Fixed height calculation
const availableHeight = "calc(100vh - 180px)";

// Fixed positioning
className="fixed left-0 top-[140px] bottom-[60px]"
```

### 2. **Responsive Design Pattern**
```typescript
// Mobile: hidden, Desktop: visible
className="hidden md:flex"

// Responsive widths
className="w-[300px] lg:w-[400px] xl:w-[500px]"
```

### 3. **Auto-Resize Pattern** (Sidebars)
```typescript
// Flexbox with overflow-hidden
className="flex-1 overflow-hidden flex flex-col"
style={{ maxHeight: 'calc(50% - 50px)' }}
```

---

## 🔒 Security & Authentication

### Admin Panel Protection:
```typescript
// app/admin/layout.tsx Line 36-42
const session = await getServerSession(authOptions);

if (!session) {
  redirect("/admin/login");  // Auto redirect to login
}
```

---

## 📱 Responsive Breakpoints

- **Mobile**: `< 768px` - Single column, simplified layout
- **Tablet**: `768px - 1024px` - Medium sidebars
- **Desktop**: `> 1024px` - Full layout with large sidebars

---

## 🎯 Key Features

### Main Display:
1. ✅ No scrolling - `overflow-hidden`
2. ✅ No zooming - `maximumScale: 1, userScalable: false`
3. ✅ No text selection - `select-none`
4. ✅ Fixed layout - সবকিছু viewport-এ fit
5. ✅ Auto carousels - Highlight News & Researchers

### Admin Panel:
1. ✅ Full scrolling - `overflow-y-auto`
2. ✅ Professional design - Modern UI
3. ✅ Sticky navigation - Always visible
4. ✅ Responsive - Mobile-friendly
5. ✅ Easy management - Scroll করে modify

---

## 🚀 How to Use

### For Users:
- শুধু website দেখবে
- Scroll/zoom করতে পারবে না
- Content auto-update হবে

### For Admins:
1. `/admin/login` - Login করুন
2. Navigation menu থেকে section select করুন
3. Scroll করে content modify করুন
4. Professional interface ব্যবহার করুন

---

## 📝 Important Notes

1. **Main Page**: User interaction সম্পূর্ণ blocked
2. **Admin Panel**: Full interaction allowed
3. **Images**: `object-contain` ব্যবহার করে full image দেখাবে
4. **Auto Carousels**: 5 seconds interval
5. **Responsive**: Mobile এবং Desktop-এ আলাদা layout

---

## 🔧 Customization

### Sidebar Widths:
```typescript
// app/page.tsx Line 34
className="w-[300px] lg:w-[400px] xl:w-[500px]"
```

### Carousel Interval:
```typescript
// app/page.tsx Line 103
<AutoCarousel interval={5} />  // Change to any seconds
```

### Colors:
```typescript
// Tailwind classes ব্যবহার করুন
className="bg-blue-600"  // Primary color
className="border-blue-300"  // Border color
```

---

## ✅ Summary

**Main Display**:
- Fixed, no scroll, no zoom
- Auto carousels
- Professional look
- User-friendly

**Admin Panel**:
- Scrollable
- Professional design
- Easy to manage
- Modern UI

এই code structure follow করে আপনি easily customize করতে পারবেন! 🎉

