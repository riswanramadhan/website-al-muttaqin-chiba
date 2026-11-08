import * as React from "react";
import { BookOpen, CalendarDays, CircleQuestionMark, FileText, HandHeart, Languages, Megaphone, Mic, Newspaper, Utensils } from "lucide-react";
import type { SearchType } from "./search";

/** Ikon per tipe hasil pencarian. */
export const SEARCH_TYPE_ICONS: Record<SearchType, React.ComponentType<{ className?: string }>> = {
  page: FileText,
  announcement: Megaphone,
  event: CalendarDays,
  lecture: Mic,
  news: Newspaper,
  faq: CircleQuestionMark,
  program: BookOpen,
  dictionary: Languages,
  dua: HandHeart,
  halal: Utensils,
};
