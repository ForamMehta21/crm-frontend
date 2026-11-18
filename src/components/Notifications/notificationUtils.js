import EventAvailableOutlinedIcon from '@mui/icons-material/EventAvailableOutlined';
import PhoneInTalkOutlinedIcon from '@mui/icons-material/PhoneInTalkOutlined';
import AlarmOutlinedIcon from '@mui/icons-material/AlarmOutlined';

export const TYPE_META = {
  daily_followup: { icon: EventAvailableOutlinedIcon, tone: 'primary', label: 'Daily follow-ups' },
  call_today: { icon: PhoneInTalkOutlinedIcon, tone: 'info', label: 'Calls today' },
  call_reminder: { icon: AlarmOutlinedIcon, tone: 'warning', label: 'Call reminder' },
};

export const typeMeta = (type) => TYPE_META[type] || TYPE_META.daily_followup;

export const timeAgo = (iso) => {
  const diff = Math.max(0, Date.now() - new Date(iso).getTime());
  const min = Math.round(diff / 60000);
  if (min < 1) return 'just now';
  if (min < 60) return `${min} min ago`;
  const hours = Math.round(min / 60);
  if (hours < 24) return `${hours} h ago`;
  const days = Math.round(hours / 24);
  if (days < 7) return `${days} d ago`;
  return new Date(iso).toLocaleDateString('en-IN', { timeZone: 'Asia/Kolkata', day: 'numeric', month: 'short' });
};

// Where a notification takes you: a single lead opens that lead, a list opens the notifications page
export const notificationTarget = (n) => {
  const leads = (n.leads || []).filter(Boolean);
  if (leads.length === 1) return `/leads/view/${leads[0]._id || leads[0]}`;
  if (n.type === 'daily_followup' || n.type === 'call_today') return '/';
  return '/notifications';
};

// True when a stored call time is exactly midnight IST (a date was saved without a time)
export const isMidnightIST = (iso) => {
  const t = new Date(iso).toLocaleTimeString('en-GB', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
  return t === '00:00';
};

export const formatCallTime = (iso) => {
  if (!iso) return '—';
  if (isMidnightIST(iso)) return 'Any time';
  return new Date(iso).toLocaleTimeString('en-IN', { timeZone: 'Asia/Kolkata', hour: '2-digit', minute: '2-digit' });
};

// ---- Browser pop-ups ----

export const browserNotificationsSupported = () => typeof window !== 'undefined' && 'Notification' in window;

export const browserPermission = () => (browserNotificationsSupported() ? window.Notification.permission : 'unsupported');

const seenKey = (adminId) => `crm-notif-seen-${adminId}`;

const readSeen = (adminId) => {
  try {
    return localStorage.getItem(seenKey(adminId));
  } catch {
    return null;
  }
};

const writeSeen = (adminId, iso) => {
  try {
    localStorage.setItem(seenKey(adminId), iso);
  } catch {
    // storage unavailable (private mode) — pop-ups may repeat, nothing else breaks
  }
};

/**
 * Shows a browser pop-up for each unread notification newer than the last one this
 * browser has seen. The first time, it only records a starting point so a fresh login
 * is not flooded with old notifications.
 */
export const popUpNewNotifications = (adminId, items, onClick) => {
  if (!adminId || !items?.length) return;
  const newest = items.reduce((max, n) => (n.createdAt > max ? n.createdAt : max), '');
  const seen = readSeen(adminId);

  if (!seen) {
    writeSeen(adminId, newest);
    return;
  }

  const fresh = items.filter((n) => !n.read && n.createdAt > seen);
  if (newest > seen) writeSeen(adminId, newest);
  if (!fresh.length || browserPermission() !== 'granted') return;

  fresh.slice(0, 3).forEach((n) => {
    try {
      const popup = new window.Notification(n.title, {
        body: n.message || typeMeta(n.type).label,
        tag: n._id,
        icon: '/icons/icon.svg',
      });
      popup.onclick = () => {
        window.focus();
        onClick(n);
        popup.close();
      };
    } catch {
      // Some mobile browsers only allow notifications from a service worker; the bell still shows them
    }
  });
};
