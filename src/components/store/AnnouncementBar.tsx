'use client';

import { useT } from '@/lib/i18n/useT';

export function AnnouncementBar() {
  const { t } = useT();
  return (
    <div
      className="text-center py-2.5 px-4 text-xs font-medium tracking-widest uppercase"
      style={{ background: 'var(--ink)', color: 'var(--cream)' }}
    >
      {t.announcementBar}
    </div>
  );
}
