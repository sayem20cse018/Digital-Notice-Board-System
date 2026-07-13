# GSTU CSE — Project Folder Guide (বাংলা + English)

> এই ফাইল দেখে আপনি পুরো প্রজেক্টের কোড কোথায় আছে, কী কাজ করে — সহজে বুঝতে পারবেন।

---

## Quick Start (localhost চালু করতে)

```bash
npm install
npm run dev          # webpack mode (OneDrive-এ safe)
```

- **User site:** http://localhost:3000
- **Admin panel:** http://localhost:3000/admin/login

> **OneDrive সমস্যা:** প্রজekt Desktop-এ OneDrive folder-এ থাকলে Turbopack error হতে পারে। তাই default `dev` script এখন `--webpack` ব্যবহার করে।

---

## Folder Map (মূল স্ট্রাকচার)

```
next-notis-app/
│
├── app/
│   ├── page.tsx                    ← USER: Main display (homepage)
│   ├── layout.tsx                  ← USER: Header, marquee, footer
│   ├── globals.css                 ← Global styles
│   │
│   ├── components/
│   │   ├── public/                 ← USER-এর জন্য components
│   │   │   └── sections/           ← Homepage-এর প্রতিটি section আলাদা ফাইল
│   │   │       ├── BestAlumniSection.tsx
│   │   │       ├── BestProgrammersSection.tsx
│   │   │       ├── HighlightNewsSection.tsx
│   │   │       ├── ResearchersSection.tsx
│   │   │       ├── NoticeBoardSection.tsx
│   │   │       ├── ResultsQrSection.tsx      ← Exam Results QR (ডান sidebar)
│   │   │       ├── TeacherListSection.tsx    ← Teacher List QR (বাম sidebar)
│   │   │       └── HelpCenterSection.tsx
│   │   │
│   │   ├── admin/                  ← ADMIN-এর shared UI
│   │   │   ├── AdminPageHeader.tsx
│   │   │   ├── AdminFlashMessage.tsx
│   │   │   └── AdminCard.tsx
│   │   │
│   │   ├── AutoCarousel.tsx        ← Highlight news slider
│   │   ├── ResearcherCarousel.tsx
│   │   ├── Clock.tsx               ← Live clock (header)
│   │   ├── ImageUpload.tsx         ← Admin image upload
│   │   ├── FileUpload.tsx
│   │   ├── SignOutButton.tsx
│   │   └── SuccessMessage.tsx
│   │
│   ├── view/                       ← QR scan-এর পর password page
│   │   └── [type]/[id]/            ← result বা teacher-list দেখার page
│   │
│   ├── admin/                      ← ADMIN PANEL (সব /admin/* URL)
│   │   ├── layout.tsx              ← Admin nav + auth guard
│   │   ├── page.tsx                ← Dashboard
│   │   ├── login/                  ← Login page
│   │   ├── settings/               ← Dept name, logo, welcome text
│   │   ├── best-alumni/            ← Best Alumni manage
│   │   ├── best-programmer/        ← Best Programmer manage
│   │   ├── highlight-news/         ← Highlight News manage
│   │   ├── researcher/             ← Researchers manage
│   │   ├── right-sidebar-notice/   ← Notice board manage
│   │   ├── help-center/            ← Help center / CR office
│   │   ├── news/                   ← News (legacy)
│   │   ├── notices/                ← Notices (legacy)
│   │   ├── events/                 ← Events
│   │   ├── results/                ← Results
│   │   ├── quotes/                 ← Quotes
│   │   ├── achievements/           ← Achievements
│   │   ├── routine/                ← Class routine
│   │   └── exam-routine/           ← Exam routine
│   │
│   ├── api/                        ← Backend API (MongoDB CRUD)
│   │   ├── best-alumni/route.ts
│   │   ├── best-programmer/route.ts
│   │   ├── highlight-news/route.ts
│   │   ├── researcher/route.ts
│   │   ├── right-sidebar-notice/route.ts
│   │   ├── help-center/route.ts
│   │   ├── news/route.ts
│   │   ├── notices/route.ts
│   │   ├── events/route.ts
│   │   ├── results/route.ts
│   │   ├── quotes/route.ts
│   │   ├── achievements/route.ts
│   │   ├── teachers/route.ts
│   │   ├── routine/route.ts
│   │   ├── upcoming/route.ts
│   │   ├── upload/route.ts
│   │   └── auth/[...nextauth]/route.ts
│   │
│   └── lib/                        ← Core logic
│       ├── types/index.ts          ← TypeScript types (সব model)
│       ├── store.ts                ← Public data fetch (MongoDB)
│       ├── admin-store.ts          ← Admin server actions
│       ├── mongodb.ts              ← DB connection
│       ├── auth.ts                 ← NextAuth login
│       └── config.ts               ← SKIP_DB flag
│
├── public/
│   ├── images/                     ← Static images
│   └── uploads/                    ← Admin uploaded files
│
└── types/next-auth.d.ts            ← Auth type extensions
```

---

## Section → File → Admin → API (Mapping Table)

| Homepage Section (User দেখে) | Component File | Admin Page | API Route |
|---|---|---|---|
| Best Alumni (বাম) | `components/public/sections/BestAlumniSection.tsx` | `/admin/best-alumni` | `/api/best-alumni` |
| Best Programmers (বাম) | `BestProgrammersSection.tsx` | `/admin/best-programmer` | `/api/best-programmer` |
| Highlight News (মাঝ) | `HighlightNewsSection.tsx` | `/admin/highlight-news` | `/api/highlight-news` |
| Researchers (মাঝ) | `ResearchersSection.tsx` | `/admin/researcher` | `/api/researcher` |
| Notice Board (ডান) | `NoticeBoardSection.tsx` | `/admin/right-sidebar-notice` | `/api/right-sidebar-notice` |
| Exam Results QR (ডান, Help-এর আগে) | `ResultsQrSection.tsx` | `/admin/results` | `/api/secure-results` |
| Teacher List QR (বাম) | `TeacherListSection.tsx` | `/admin/teacher-list` | `/api/teacher-list` |
| Help Center (ডান) | `HelpCenterSection.tsx` | `/admin/help-center` | `/api/help-center` |
| Header Logo & Name | `layout.tsx` | `/admin/settings` | cookies + store |
| Live Clock | `components/Clock.tsx` | — | — |

---

## Data Flow (কিভাবে data চলে)

```
Admin form submit
    ↓
/api/[section]/route.ts  (POST / PUT / DELETE)
    ↓
MongoDB collection
    ↓
app/lib/store.ts  (getBestAlumni, getHighlightNews, ...)
    ↓
app/page.tsx  (Server Component — data fetch)
    ↓
components/public/sections/*  (UI render)
    ↓
User screen
```

---

## User vs Admin — পার্থক্য

| | User (Homepage) | Admin Panel |
|---|---|---|
| URL | `/` | `/admin/*` |
| Scroll | না (fixed screen) | হ্যাঁ |
| Zoom | বন্ধ | চালু |
| Edit | শুধু দেখা | Create / Edit / Delete |
| Layout | `app/page.tsx` + sections | `app/admin/layout.tsx` |
| Auth | লাগে না | Login লাগে |

---

## Environment Variables (.env.local)

```env
DATABASE_URL=mongodb+srv://...
NEXTAUTH_SECRET=your-secret
NEXTAUTH_URL=http://localhost:3000
PUBLIC_APP_URL=http://192.168.1.5:3000   # QR scan-এর জন্য (অথবা Settings-এ দিন)
```

**QR Scan Fix:** Phone থেকে QR কাজ করতে Settings → Public Site URL-এ PC-র network IP দিন (যেমন `http://192.168.1.5:3000`), তারপর Results/Teacher List আবার Save করুন।

DB ছাড়া test করতে:
```bash
set SKIP_DB=1
npm run dev
```

---

## npm Scripts

| Command | কাজ |
|---|---|
| `npm run dev` | Development server (webpack) |
| `npm run dev:turbo` | Turbopack (OneDrive-এ problem হতে পারে) |
| `npm run dev:nodb` | DB ছাড়া run |
| `npm run build` | Production build |
| `npm run start` | Production server |

---

## কোন ফাইল edit করবেন?

- **Homepage section design:** `app/components/public/sections/`
- **Admin page logic:** `app/admin/[section]/page.tsx`
- **API logic:** `app/api/[section]/route.ts`
- **Database queries:** `app/lib/store.ts`
- **Types:** `app/lib/types/index.ts`
- **Colors/styles:** Tailwind classes + `app/globals.css`

---

## Summary

- **User code** → `app/page.tsx` + `app/components/public/`
- **Admin code** → `app/admin/` + `app/components/admin/`
- **Backend** → `app/api/` + `app/lib/`
- **Types** → `app/lib/types/index.ts`

এই structure follow করলে নতুন section add করা সহজ হবে: section component → admin page → API route → store function। 🎉
