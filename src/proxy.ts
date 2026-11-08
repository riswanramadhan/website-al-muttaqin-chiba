import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

/**
 * Next.js 16 memakai proxy.ts (sebelumnya middleware.ts).
 * next-intl mendeteksi bahasa dari cookie/Accept-Language dan menambahkan prefix locale.
 */
export default createMiddleware(routing);

export const config = {
  // Lewati API, aset Next, file statis (mengandung titik), panel admin, dan route service worker.
  matcher: ["/((?!api|admin|serwist|_next|_vercel|.*\\..*).*)"],
};
