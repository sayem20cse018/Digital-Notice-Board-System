/** Shared data models used across public display, admin panel, and API routes. */

export type BestAlumni = {
  id: string;
  title: string;
  imageUrl?: string | null;
  linkUrl?: string | null;
  note?: string | null;
  displayOrder: number;
};

export type BestProgrammer = {
  id: string;
  name: string;
  photoUrl?: string | null;
  description?: string | null;
  displayOrder: number;
};

export type HighlightNews = {
  id: string;
  title: string;
  imageUrl?: string | null;
  description?: string | null;
  linkUrl?: string | null;
  displayOrder: number;
  slideDuration?: number | null;
};

export type Researcher = {
  id: string;
  name: string;
  photoUrl?: string | null;
  title?: string | null;
  bio?: string | null;
  publicationTitle?: string | null;
  publishedAt?: string | null;
  displayOrder: number;
};

export type RightSidebarNotice = {
  id: string;
  title: string;
  imageUrl?: string | null;
  fileUrl?: string | null;
  displayOrder: number;
  published: boolean;
};

export type HelpCenter = {
  id: string;
  officeName: string;
  phoneNumber: string;
  qrCodeUrl?: string | null;
  fileUrl?: string | null;
  contactType: "office" | "crs";
  displayOrder: number;
};

export type DeptSettings = {
  departmentName: string;
  logoUrl?: string | null;
  universityName?: string | null;
  universityLogoUrl?: string | null;
  marqueeText?: string | null;
  headerBackgroundImages?: string[];
  headerSlideshowInterval?: number;
  highlightSlideDuration?: number;
  /** Public URL for QR codes — phones must reach this (not localhost). */
  publicSiteUrl?: string | null;
};

export type SecureResultSlot = {
  id: string;
  slotNumber: number;
  title: string;
  fileUrl?: string | null;
  qrCodeUrl?: string | null;
  published: boolean;
};

export type TeacherListItem = {
  id: string;
  title: string;
  fileUrl?: string | null;
  qrCodeUrl?: string | null;
  published: boolean;
};

export type Notice = {
  id: string;
  title: string;
  body?: string | null;
  pdfUrl?: string | null;
  createdAt: Date;
};

export type News = {
  id: string;
  title: string;
  createdAt: Date;
  imageUrl?: string | null;
};

export type Event = {
  id: string;
  title: string;
  description?: string | null;
  when: string;
  imageUrl?: string | null;
};

export type Result = {
  id: string;
  examName: string;
  linkUrl: string;
  publishedAt: Date;
};

export type Achievement = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
};

export type RoutineItem = {
  id: string;
  className: string;
  dayOfWeek: number;
  period: number;
  subject: string;
  teacher?: string | null;
  room?: string | null;
};

export type Quote = {
  id: string;
  text: string;
  authorName: string;
};

export type ApiResponse<T = unknown> = {
  success: boolean;
  data?: T;
  message?: string;
};

export type ProjectShowcaseItem = {
  id: string;
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  linkUrl?: string | null;
  displayOrder: number;
  published: boolean;
};

export type RoomDirectoryItem = {
  id: string;
  roomName: string;
  description?: string | null;
  floor?: string | null;
  imageUrl?: string | null;
  fileUrl?: string | null;
  qrCodeUrl?: string | null;
  displayOrder: number;
  published: boolean;
};

export type AboutUs = {
  id: string;
  heading: string;
  body: string;
  imageUrl?: string | null;
  published: boolean;
};
