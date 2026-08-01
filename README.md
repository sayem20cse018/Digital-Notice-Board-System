# Digital Notice Board System

A web-based digital notice board system for university departments. Built with Next.js, MongoDB Atlas, and Tailwind CSS. Deployed on Vercel.

**Live Demo:** https://csegstu.vercel.app

---

## What It Does

- **Display Board** — A full-screen display shown on a TV/monitor in the department. Shows highlight news, department achievers, programming stars, class routine QR, exam routine QR, results, teacher list, help center, events, and more.
- **Admin Panel** — A protected dashboard at `/admin` where staff can manage all content — upload files, generate QR codes, control which sections are visible, and edit the class routine table.

---

## Admin Panel

Go to `/admin/login` to access the admin panel.

Default credentials (change these in Vercel environment variables):
```
Username: admin
Password: admin123
```

### Admin Features
| Section | What you can manage |
|---|---|
| Highlight News | Slideshow images and text on the display board |
| Department Achievers | Staff/alumni achievements with photo |
| Programming Stars | Top programmers with photo |
| Class Routine | Table editor (click cells to edit) + file upload |
| Exam Routine | File upload with auto QR |
| Results | Up to 4 password-protected result slots |
| Teacher List | Upload teacher list PDF/image |
| Help Center | Office and CRS contact + QR |
| Events | Upcoming events with date, time, venue |
| Room Directory | Room info with QR |
| Project Showcase | Student projects |
| Settings | Department name, university name, logos, marquee text |
| Control Center | Turn sections on/off, change display theme |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router) |
| Database | MongoDB Atlas |
| Styling | Tailwind CSS |
| Auth | NextAuth.js (JWT) |
| File Upload | Cloudinary |
| QR Generation | api.qrserver.com |
| Deployment | Vercel |

---

## Project Structure

```
app/
  page.tsx          → Main display board (public)
  layout.tsx        → Header with dept name, clock, weather
  admin/            → Admin panel pages (protected)
  api/              → Backend API routes
  components/       → UI components
    user-window/    → Display board sections
    admin-panel/    → Admin UI components
  view/             → QR scan destination pages
  lib/              → Backend logic (DB, auth, QR utils)
data/               → Local JSON fallback (dev only)
docs/               → Documentation
public/             → Static images and assets
```

---

## Setup & Deployment

### 1. Clone the repository
```bash
git clone https://github.com/sayem20cse018/Digital-Notice-Board-System.git
cd Digital-Notice-Board-System
npm install
```

### 2. Create `.env.local`
Copy `.env.local.example` and fill in your values:
```
DATABASE_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/notis-app
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret
ADMIN_USERNAME=admin
ADMIN_PASSWORD=your-password
PUBLIC_APP_URL=http://localhost:3000
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_UPLOAD_PRESET=your-unsigned-preset
```

### 3. Run locally
```bash
npm run dev
```

Open http://localhost:3000 for the display board.
Open http://localhost:3000/admin for the admin panel.

### 4. Deploy to Vercel
1. Push to GitHub
2. Import repo in [vercel.com](https://vercel.com)
3. Add all environment variables from `.env.local.example`
4. Deploy

---

## QR Code System

Each section that has a file (Class Routine, Exam Routine, Help Center, Teacher List, Results) generates a QR code automatically when you save. Scanning the QR on a phone opens a mobile-friendly view page showing the file.

- Class Routine QR → `/view/routine/class` (live table editor)
- Exam Routine QR → `/view/file/{id}?type=exam-routine`
- Results QR → `/view/results` (password protected)
- Teacher List QR → `/view/teacher-list/{id}`
- Room Directory QR → `/view/rooms`

---

## License

Built by the Department of Computer Science and Engineering, GSTU.
