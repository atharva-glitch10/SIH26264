import { useSyncExternalStore } from 'react';

export type Lang = 'en' | 'hi';

const STORAGE_KEY = 'aicte_lang';

const en = {
  // Sidebar
  'nav.centralDashboard': 'Central Dashboard',
  'nav.overview': 'Overview',
  'nav.institutions': 'Institutions',
  'nav.allCases': 'All Cases',
  'nav.overlapAlerts': 'Overlap Alerts',
  'nav.workflow': 'Workflow & Transfers',
  'nav.import': 'Bulk Import',
  'nav.reports': 'Reports & Analytics',
  'nav.dataQuality': 'Data Quality & Review',
  'nav.settings': 'Settings & Rules',
  'nav.overdue': 'overdue',
  'nav.connectedBureaus': 'Connected Bureaus',
  'nav.portal': 'Grievance & Regulation Portal',
  // Header
  'header.searchPlaceholder': 'Search institution, AICTE Permanent ID, case ref (e.g. INST-1001 or Alpha)...',
  'header.signOut': 'Sign out',
  'header.alertsTitle': 'System Alerts',
  'header.notifications': 'System Notifications & Warnings',
  'header.noAlerts': 'No active alerts.',
  'header.language': 'Language',
  // Login
  'login.title': 'Officer sign in',
  'login.subtitle': 'Use your officer ID or official email.',
  'login.username': 'Officer ID / Email',
  'login.password': 'Password',
  'login.submit': 'Sign in',
  'login.submitting': 'Signing in…',
  'login.failed': 'Login failed',
  'login.complainant': 'Complainant?',
  'login.track': 'Track your complaint status',
  // Overview
  'overview.title': 'Centralized Institution Monitoring Dashboard',
  'overview.total': 'Total Complaints',
  'overview.underProcess': 'Under Process',
  'overview.pending': 'Pending Scrutiny',
  'overview.disposed': 'Disposed / Resolved',
  'overview.transferred': 'Transferred',
  'overview.escalated': 'Escalated',
  'overview.overdue': 'Overdue SLA',
  'overview.multiBureau': 'Multi-Bureau Colleges',
  'overview.workload': 'Workload by Bureau / Cell',
  'overview.statusDistribution': 'Status Distribution',
  'overview.ageing': 'Pending Case Ageing Analysis',
  'overview.monthly': 'Monthly Received vs Disposed',
  'overview.highAttention': 'High Attention Institutions (Concurrent Multi-Bureau Activity)',
} as const;

export type TKey = keyof typeof en;

const hi: Record<TKey, string> = {
  'nav.centralDashboard': 'केंद्रीय डैशबोर्ड',
  'nav.overview': 'अवलोकन',
  'nav.institutions': 'संस्थान',
  'nav.allCases': 'सभी मामले',
  'nav.overlapAlerts': 'ओवरलैप अलर्ट',
  'nav.workflow': 'कार्यप्रवाह और स्थानांतरण',
  'nav.import': 'बल्क आयात',
  'nav.reports': 'रिपोर्ट और विश्लेषण',
  'nav.dataQuality': 'डेटा गुणवत्ता और समीक्षा',
  'nav.settings': 'सेटिंग और नियम',
  'nav.overdue': 'विलंबित',
  'nav.connectedBureaus': 'संबद्ध ब्यूरो',
  'nav.portal': 'शिकायत एवं विनियमन पोर्टल',
  'header.searchPlaceholder': 'संस्थान, AICTE स्थायी आईडी, मामला संदर्भ खोजें (जैसे INST-1001 या Alpha)...',
  'header.signOut': 'साइन आउट',
  'header.alertsTitle': 'सिस्टम अलर्ट',
  'header.notifications': 'सिस्टम सूचनाएँ और चेतावनियाँ',
  'header.noAlerts': 'कोई सक्रिय अलर्ट नहीं।',
  'header.language': 'भाषा',
  'login.title': 'अधिकारी साइन इन',
  'login.subtitle': 'अपनी अधिकारी आईडी या आधिकारिक ईमेल का उपयोग करें।',
  'login.username': 'अधिकारी आईडी / ईमेल',
  'login.password': 'पासवर्ड',
  'login.submit': 'साइन इन करें',
  'login.submitting': 'साइन इन हो रहा है…',
  'login.failed': 'लॉगिन विफल रहा',
  'login.complainant': 'शिकायतकर्ता?',
  'login.track': 'अपनी शिकायत की स्थिति देखें',
  'overview.title': 'केंद्रीकृत संस्थान निगरानी डैशबोर्ड',
  'overview.total': 'कुल शिकायतें',
  'overview.underProcess': 'प्रक्रियाधीन',
  'overview.pending': 'जाँच लंबित',
  'overview.disposed': 'निपटाई / समाधानित',
  'overview.transferred': 'स्थानांतरित',
  'overview.escalated': 'उच्चस्तरीय',
  'overview.overdue': 'SLA अवधि पार',
  'overview.multiBureau': 'बहु-ब्यूरो महाविद्यालय',
  'overview.workload': 'ब्यूरो / प्रकोष्ठ के अनुसार कार्यभार',
  'overview.statusDistribution': 'स्थिति वितरण',
  'overview.ageing': 'लंबित मामलों की आयु विश्लेषण',
  'overview.monthly': 'मासिक प्राप्त बनाम निपटाए गए',
  'overview.highAttention': 'उच्च ध्यान वाले संस्थान (एक साथ बहु-ब्यूरो गतिविधि)',
};

const dictionaries: Record<Lang, Record<TKey, string>> = { en, hi };

const readStoredLang = (): Lang => {
  try {
    const v = localStorage.getItem(STORAGE_KEY);
    if (v === 'en' || v === 'hi') return v;
  } catch {
    /* storage unavailable: fall back to English */
  }
  return 'en';
};

let current: Lang = readStoredLang();
const listeners = new Set<() => void>();

const applyDocumentLang = () => {
  if (typeof document !== 'undefined') document.documentElement.lang = current;
};
applyDocumentLang();

export const getLang = (): Lang => current;

export const setLang = (lang: Lang) => {
  if (lang === current) return;
  current = lang;
  try {
    localStorage.setItem(STORAGE_KEY, lang);
  } catch {
    /* storage unavailable: language still applies for this session */
  }
  applyDocumentLang();
  listeners.forEach((l) => l());
};

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
};

/** Returns a translator bound to the current language; re-renders the caller when the language changes. */
export const useT = () => {
  const lang = useSyncExternalStore(subscribe, getLang);
  return { lang, t: (key: TKey): string => dictionaries[lang][key] ?? en[key] };
};
