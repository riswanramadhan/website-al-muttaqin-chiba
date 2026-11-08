import * as React from "react";

/**
 * Ikon media sosial sebagai SVG inline (lucide 1.x tidak lagi menyertakan ikon merek).
 * Semua memakai currentColor dan mengikuti ukuran tombol lewat className.
 */
type IconProps = React.SVGProps<SVGSVGElement>;

function base(props: IconProps) {
  return {
    viewBox: "0 0 24 24",
    width: 20,
    height: 20,
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
  };
}

export function YouTubeIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M2.5 12c0-2.6.2-4.4.5-5.3.3-.9 1-1.5 1.9-1.7C6.6 4.7 9.1 4.5 12 4.5s5.4.2 7.1.5c.9.2 1.6.8 1.9 1.7.3.9.5 2.7.5 5.3s-.2 4.4-.5 5.3c-.3.9-1 1.5-1.9 1.7-1.7.3-4.2.5-7.1.5s-5.4-.2-7.1-.5c-.9-.2-1.6-.8-1.9-1.7-.3-.9-.5-2.7-.5-5.3Z" />
      <path d="m10 9 5 3-5 3V9Z" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function InstagramIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.3" cy="6.7" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

export function FacebookIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M14 8.5V7a1.5 1.5 0 0 1 1.5-1.5H17V3h-2.5A4 4 0 0 0 10.5 7v1.5H8V12h2.5v9h3.5v-9h2.6l.4-3.5H14Z" />
    </svg>
  );
}

export function WhatsAppIcon(props: IconProps) {
  return (
    <svg {...base(props)}>
      <path d="M3.5 20.5l1.3-4.2A8.5 8.5 0 1 1 8 19.3l-4.5 1.2Z" />
      <path d="M9.2 8.6c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .5.4l.7 1.7c.1.2 0 .4-.1.5l-.5.6c-.1.1-.2.3 0 .5a6 6 0 0 0 2.8 2.6c.2.1.4.1.5-.1l.6-.7c.2-.2.3-.2.5-.1l1.7.8c.2.1.3.2.3.4a2 2 0 0 1-1.5 1.9c-.6.2-1.4.3-3.1-.5a9 9 0 0 1-3.9-3.6c-.9-1.5-.7-2.4-.5-3Z" fill="currentColor" stroke="none" />
    </svg>
  );
}
