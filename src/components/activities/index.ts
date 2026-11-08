/**
 * Ekspor publik modul activities (PRD-06). Kontrak minimal untuk beranda & App home,
 * ditambah komponen pendukung halaman modul ini.
 */
export { EventCard, registrationState } from "./event-card"; // Server: { event: MosqueEvent; locale: Locale; compact?: boolean; past?: boolean }
export { LectureCard, youtubeThumbnail } from "./lecture-card"; // Server: { lecture: Lecture; locale: Locale }
export { NewsCard } from "./news-card"; // Server: { post: NewsPost; locale: Locale }
export { AnnouncementList, AnnouncementItem, isNewAnnouncement } from "./announcement-list"; // Server: { announcements: Announcement[]; locale: Locale; compact?: boolean; share?: boolean }
export { LiveStatusBanner } from "./live-status-banner"; // Client: { channelId?: string; locale: Locale; tone?: "default" | "inverse"; nextLecture?: NextLecture; channelUrl?: string }
export type { NextLecture, LiveApiResponse } from "./live-status-banner";

export { LectureBrowser } from "./lecture-browser"; // Client: { lectures: Lecture[]; locale: Locale }
export { EventBrowser } from "./event-browser"; // Client: { upcoming: MosqueEvent[]; past: MosqueEvent[]; locale: Locale; initialTab?: "upcoming" | "past" }
export { NewsBrowser } from "./news-browser"; // Client: { announcements: Announcement[]; posts: NewsPost[]; locale: Locale }
export { EventRegistrationForm } from "./event-registration-form"; // Client: { eventSlug; eventTitle; locale; full; closed }
export { AddToCalendar } from "./add-to-calendar"; // Server: { event: MosqueEvent; locale: Locale; siteUrl: string; size?: "sm" | "md" }
export { ShareButton } from "./share-button"; // Client: { title; text?; url?; label?; iconOnly? } & ButtonProps
export { AppLectureList } from "./app-lecture-list"; // Client: { lectures: Lecture[]; locale: Locale }
export { googleCalendarUrl, icsPath, buildIcs, toCalendarStamp } from "./calendar-links";
export { registrationSchema } from "./registration-schema";
export type { RegistrationInput, RegistrationOutput, RegistrationResult, RegistrationStatus } from "./registration-schema";
