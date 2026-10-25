import type { ReactElement, SVGProps } from 'react';

export const ICON_NAMES = ['search', 'cart', 'user', 'users', 'menu', 'close', 'arrow-right', 'arrow-left', 'chevron-down', 'chevron-right', 'chevron-left', 'plus', 'minus', 'trash', 'edit', 'check', 'star', 'heart', 'home', 'book', 'tag', 'filter', 'grid', 'list', 'calendar', 'clock', 'mail', 'phone', 'map-pin', 'info', 'alert', 'package', 'truck', 'credit-card', 'dollar', 'logout', 'login', 'settings', 'eye', 'download', 'upload', 'image', 'external', 'refresh', 'shield', 'bell', 'sun', 'moon', 'award', 'message', 'quote', 'sparkle'] as const;
export type IconName = (typeof ICON_NAMES)[number];

export interface IconProps extends Omit<SVGProps<SVGSVGElement>, 'name'> {
  name: IconName;
  size?: number;
  title?: string;
}

const ICONS: Record<IconName, ReactElement> = {
  'search': <><circle cx="11" cy="11" r="7" /><path d="M21 21l-4.3-4.3" /></>,
  'cart': <><circle cx="9" cy="21" r="1" /><circle cx="20" cy="21" r="1" /><path d="M1 1h4l2.7 13.4a2 2 0 002 1.6h9.7a2 2 0 002-1.6L23 6H6" /></>,
  'user': <><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
  'users': <><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 00-3-3.9M16 3.1a4 4 0 010 7.8" /></>,
  'menu': <><path d="M3 6h18M3 12h18M3 18h18" /></>,
  'close': <><path d="M18 6L6 18M6 6l12 12" /></>,
  'arrow-right': <><path d="M5 12h14M12 5l7 7-7 7" /></>,
  'arrow-left': <><path d="M19 12H5M12 19l-7-7 7-7" /></>,
  'chevron-down': <><path d="M6 9l6 6 6-6" /></>,
  'chevron-right': <><path d="M9 18l6-6-6-6" /></>,
  'chevron-left': <><path d="M15 18l-6-6 6-6" /></>,
  'plus': <><path d="M12 5v14M5 12h14" /></>,
  'minus': <><path d="M5 12h14" /></>,
  'trash': <><path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6M10 11v6M14 11v6" /></>,
  'edit': <><path d="M12 20h9M16.5 3.5a2.1 2.1 0 013 3L7 19l-4 1 1-4z" /></>,
  'check': <><path d="M20 6L9 17l-5-5" /></>,
  'star': <><path d="M12 2l3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1z" /></>,
  'heart': <><path d="M20.8 4.6a5.5 5.5 0 00-7.8 0L12 5.7l-1-1.1a5.5 5.5 0 00-7.8 7.8l1 1L12 21l7.8-7.8 1-1a5.5 5.5 0 000-7.8z" /></>,
  'home': <><path d="M3 10l9-7 9 7v10a2 2 0 01-2 2h-4v-7h-6v7H5a2 2 0 01-2-2z" /></>,
  'book': <><path d="M4 19.5A2.5 2.5 0 016.5 17H20M4 19.5V4.5A2.5 2.5 0 016.5 2H20v15H6.5A2.5 2.5 0 004 19.5z" /></>,
  'tag': <><path d="M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L2 12V2h10l8.6 8.6a2 2 0 010 2.8z" /><circle cx="7" cy="7" r="1" /></>,
  'filter': <><path d="M22 3H2l8 9.5V19l4 2v-8.5z" /></>,
  'grid': <><path d="M3 3h7v7H3zM14 3h7v7h-7zM14 14h7v7h-7zM3 14h7v7H3z" /></>,
  'list': <><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" /></>,
  'calendar': <><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></>,
  'clock': <><circle cx="12" cy="12" r="10" /><path d="M12 6v6l4 2" /></>,
  'mail': <><rect x="2" y="4" width="20" height="16" rx="2" /><path d="M22 6l-10 7L2 6" /></>,
  'phone': <><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.1.9.4 1.8.7 2.7a2 2 0 01-.5 2.1L8 9.8a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.4c.9.3 1.8.6 2.7.7a2 2 0 011.9 2.1z" /></>,
  'map-pin': <><path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0118 0z" /><circle cx="12" cy="10" r="3" /></>,
  'info': <><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></>,
  'alert': <><path d="M10.3 3.9L1.8 18a2 2 0 001.7 3h17a2 2 0 001.7-3L13.7 3.9a2 2 0 00-3.4 0zM12 9v4M12 17h.01" /></>,
  'package': <><path d="M21 16V8a2 2 0 00-1-1.7l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.7l7 4a2 2 0 002 0l7-4a2 2 0 001-1.7zM3.3 7l8.7 5 8.7-5M12 22V12" /></>,
  'truck': <><path d="M1 3h15v13H1zM16 8h4l3 3v5h-7z" /><circle cx="5.5" cy="18.5" r="2.5" /><circle cx="18.5" cy="18.5" r="2.5" /></>,
  'credit-card': <><rect x="1" y="4" width="22" height="16" rx="2" /><path d="M1 10h22" /></>,
  'dollar': <><path d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" /></>,
  'logout': <><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" /></>,
  'login': <><path d="M15 3h4a2 2 0 012 2v14a2 2 0 01-2 2h-4M10 17l5-5-5-5M15 12H3" /></>,
  'settings': <><circle cx="12" cy="12" r="3" /><path d="M19.4 15a1.7 1.7 0 00.3 1.8l.1.1a2 2 0 11-2.8 2.8l-.1-.1a1.7 1.7 0 00-1.8-.3 1.7 1.7 0 00-1 1.5V21a2 2 0 11-4 0v-.1a1.7 1.7 0 00-1.1-1.5 1.7 1.7 0 00-1.8.3l-.1.1a2 2 0 11-2.8-2.8l.1-.1a1.7 1.7 0 00.3-1.8 1.7 1.7 0 00-1.5-1H3a2 2 0 110-4h.1a1.7 1.7 0 001.5-1.1 1.7 1.7 0 00-.3-1.8l-.1-.1a2 2 0 112.8-2.8l.1.1a1.7 1.7 0 001.8.3H9a1.7 1.7 0 001-1.5V3a2 2 0 114 0v.1a1.7 1.7 0 001 1.5 1.7 1.7 0 001.8-.3l.1-.1a2 2 0 112.8 2.8l-.1.1a1.7 1.7 0 00-.3 1.8V9a1.7 1.7 0 001.5 1H21a2 2 0 110 4h-.1a1.7 1.7 0 00-1.5 1z" /></>,
  'eye': <><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" /></>,
  'download': <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3" /></>,
  'upload': <><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" /></>,
  'image': <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="8.5" cy="8.5" r="1.5" /><path d="M21 15l-5-5L5 21" /></>,
  'external': <><path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6M15 3h6v6M10 14L21 3" /></>,
  'refresh': <><path d="M23 4v6h-6M1 20v-6h6M20.5 9A9 9 0 005.6 5.6L1 10M23 14l-4.6 4.4A9 9 0 013.5 15" /></>,
  'shield': <><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></>,
  'bell': <><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 01-3.4 0" /></>,
  'sun': <><circle cx="12" cy="12" r="5" /><path d="M12 1v2M12 21v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M1 12h2M21 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" /></>,
  'moon': <><path d="M21 12.8A9 9 0 1111.2 3a7 7 0 009.8 9.8z" /></>,
  'award': <><circle cx="12" cy="8" r="7" /><path d="M8.2 13.9L7 23l5-3 5 3-1.2-9.1" /></>,
  'message': <><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" /></>,
  'quote': <><path d="M7 17h3l2-4V7H6v6h3zM15 17h3l2-4V7h-6v6h3z" /></>,
  'sparkle': <><path d="M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8zM19 17l.8 2.2L22 20l-2.2.8L19 23l-.8-2.2L16 20l2.2-.8z" /></>,
};

export function Icon({ name, size = 20, className = '', title, ...rest }: IconProps) {
  const body = ICONS[name] ?? ICONS.info;
  return (
    <svg
      className={('ds-icon ' + className).trim()}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden={title ? undefined : true}
      role={title ? 'img' : undefined}
      {...rest}
    >
      {title ? <title>{title}</title> : null}
      {body}
    </svg>
  );
}

export default Icon;
