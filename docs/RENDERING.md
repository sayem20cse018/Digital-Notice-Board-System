# Rendering & Performance Analysis

## Problem Summary

প্রতিটা image এবং QR code বারবার re-fetch হচ্ছিল, এবং কিছুক্ষণ পর backend থেকে কোনো data আসছিল না।

---

## Root Causes (3টি Critical Bug)

### Bug 1 — AutoCarousel Infinite Loop ⚠️ CRITICAL

**File:** `app/components/user-window/AutoCarousel.tsx`

**Problem:**
```js
// ❌ WRONG — items array is a new reference on every render
useEffect(() => {
  ...
}, [items, currentIndex, defaultInterval]);
```

`items` হলো একটা array prop। React এ array/object props প্রতিটা render এ নতুন reference তৈরি করে, এমনকি data একই থাকলেও। তাই:

1. Component render হয় → `items` নতুন reference → `useEffect` fire হয়
2. `setAnimating(true)` call হয় → state change → re-render
3. Re-render → `items` আবার নতুন reference → `useEffect` আবার fire
4. **অনন্ত loop** → প্রতি cycle এ image re-fetch হয়

**Fix:**
```js
// ✅ CORRECT — use stable primitive values as dependencies
useEffect(() => {
  ...
}, [items.length, currentIndex, defaultInterval, items[currentIndex]?.slideDuration]);
```

`items.length` এবং `slideDuration` হলো number/primitive — শুধু data সত্যিই পরিবর্তন হলে effect re-run করে।

---

### Bug 2 — Window Focus Listener 🔥 HIGH

**File:** `app/components/user-window/DisplayRealtimeRefresh.tsx`

**Problem:**
```js
// ❌ WRONG — triggers full page re-render on every tab switch
window.addEventListener("focus", refresh);
```

Display board একটা TV বা monitor এ সবসময় open থাকে। Admin যখন `localhost:3000/admin` থেকে `localhost:3000` (display) তে switch করে, `window focus` event fire হয় এবং `router.refresh()` call হয়।

প্রতিটা `router.refresh()` এ `page.tsx` এ **16টা parallel MongoDB query** চলে:
- getDepartmentSettings
- getAdminPreferences  
- getBestAlumni
- getBestProgrammers
- getTeacherListPublic
- getHighlightNews
- getSecureResults
- getRightSidebarNotices
- getHelpCenter
- getResearchers
- getClassRoutineQr
- getExamRoutineQr
- getProjectShowcase
- getRoomDirectory
- getAboutUs
- getEventsBoard

এছাড়া `layout.tsx` এ আরও 2টা query। মোট **18টা simultaneous MongoDB connection** প্রতিটা refresh এ।

Atlas M0 Free Tier এর connection limit: **500 connections**। কিন্তু এতগুলো rapid request এ connection pool exhausted হয়ে যায়।

**Fix:**
```js
// ✅ CORRECT — only timer-based refresh, no focus listener
useEffect(() => {
  const id = setInterval(() => router.refresh(), effectiveMs);
  return () => clearInterval(id);
}, [intervalSeconds]);
```

---

### Bug 3 — force-dynamic + force-no-store Conflict 📛 MEDIUM

**File:** `app/page.tsx`, `app/layout.tsx`

**Problem:**
```js
// ❌ WRONG — two conflicting cache directives
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
```

`force-dynamic` মানে: প্রতিটা request এ fresh render।
`force-no-store` মানে: সব fetch() call cache করা যাবে না।

দুটো একসাথে দিলে Next.js কনফিউজড হয় এবং কিছু internal caching optimization বন্ধ হয়ে যায়, যা request overhead বাড়ায়।

**Fix:**
```js
// ✅ CORRECT — force-dynamic একাই যথেষ্ট
export const dynamic = "force-dynamic";
```

---

## Network Request Flow (Before Fix)

```
Tab Switch → window focus event
    ↓
router.refresh() called
    ↓
page.tsx re-renders
    ↓
16 MongoDB queries fire simultaneously
    ↓
AutoCarousel receives new items array
    ↓
useEffect([items, ...]) detects new reference
    ↓
setAnimating(true) → re-render
    ↓
AutoCarousel receives new items array AGAIN
    ↓
Infinite loop begins
    ↓
Every iteration: all images re-fetched from server
    ↓
QR images (api.qrserver.com) re-requested on every loop
    ↓
MongoDB connection pool exhausted
    ↓
New queries fail → data disappears from display
```

---

## Network Request Flow (After Fix)

```
Timer fires every 60 seconds (minimum)
    ↓
router.refresh() called ONCE
    ↓
16 MongoDB queries fire ONCE
    ↓
AutoCarousel receives new items array
    ↓
useEffect([items.length, currentIndex, ...]) — primitives
    ↓
Effect only re-runs if item count actually changed
    ↓
Smooth slideshow, no infinite loop
    ↓
Images cached by browser between refreshes
    ↓
QR images cached — no repeated requests
```

---

## Changes Made

| File | Change | Reason |
|------|--------|--------|
| `AutoCarousel.tsx` | `[items, ...]` → `[items.length, currentIndex, slideDuration]` | Prevent infinite useEffect loop |
| `DisplayRealtimeRefresh.tsx` | Remove `window focus` listener | Prevent 18 DB queries on tab switch |
| `DisplayRealtimeRefresh.tsx` | Minimum interval 30s → 60s | Reduce DB load |
| `page.tsx` | Remove `fetchCache = "force-no-store"` | Avoid conflicting cache directives |
| `layout.tsx` | Remove `fetchCache = "force-no-store"` | Same reason |

---

## Recommendations

1. **Refresh interval:** Admin panel এ Control Center থেকে refresh interval 120s বা তার বেশি রাখো — display board সাধারণত real-time update দরকার নেই, 2 মিনিট acceptable।

2. **MongoDB Atlas:** M0 Free Tier এ connection limit আছে। Production এ M2+ tier বা dedicated cluster ব্যবহার করো।

3. **Image caching:** QR images এবং upload images এর জন্য Cloudinary এর built-in CDN cache ব্যবহার হচ্ছে — এটা ঠিক আছে।

4. **Static QR:** QR code গুলো যদি খুব বেশি পরিবর্তন না হয়, সেগুলো static generate করে `public/` এ রাখলে Vercel CDN থেকে serve হবে।
