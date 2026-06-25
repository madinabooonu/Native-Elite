import React from 'react';
import { MobileHeader, BottomNav } from './UI';
import { UserRole } from '../types';
import { cn } from '../lib/utils';
import { useTheme } from '../lib/ThemeContext';

/* ═══════════════════════════════════════════
   RESPONSIVE APP LAYOUT
   • Mobile (<768px): Full-width, bottom nav
   • Tablet/Desktop (≥768px): Centered card, sidebar feel
═══════════════════════════════════════════ */
export const AppLayout = ({
  children,
  role,
  activeTab,
  setActiveTab,
  onLogout,
  headerTitle,
  headerSubtitle,
  hideHeader,
  userProfile,
}: {
  children: React.ReactNode;
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  headerTitle?: string;
  headerSubtitle?: string;
  hideHeader?: boolean;
  userProfile?: any;
}) => {
  const { theme, toggleTheme } = useTheme();

  /* ── Icons ── */
  const homeIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
  const booksIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
  const chatIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>;
  const profileIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
  const micIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" /><path d="M19 10v2a7 7 0 0 1-14 0v-2" /><line x1="12" y1="19" x2="12" y2="23" /><line x1="8" y1="23" x2="16" y2="23" /></svg>;
  const feedIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" /><rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" /></svg>;
  const checkIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /><circle cx="12" cy="12" r="10" /></svg>;
  const calendarIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
  const usersIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;

  /* ── Tab configs by role ── */
  const studentTabs = [
    { id: 'home', label: 'Bosh', icon: homeIcon },
    { id: 'vocab', label: 'So\'z', icon: booksIcon },
    { id: 'feed', label: 'Feed', icon: feedIcon },
    { id: 'speaking', label: 'Speaking', icon: micIcon },
    { id: 'chat', label: 'Chat', icon: chatIcon },
    { id: 'profile', label: 'Profil', icon: profileIcon },
  ];
  const teacherTabs = [
    { id: 'home', label: 'Bosh', icon: homeIcon },
    { id: 'attendance', label: 'Davomat', icon: checkIcon },
    { id: 'feed', label: 'Feed', icon: feedIcon },
    { id: 'chat', label: 'Chat', icon: chatIcon },
    { id: 'profile', label: 'Profil', icon: profileIcon },
  ];
  const adminTabs = [
    { id: 'home', label: 'Panel', icon: homeIcon },
    { id: 'feed', label: 'Feed', icon: feedIcon },
    { id: 'chat', label: 'Chat', icon: chatIcon },
    { id: 'profile', label: 'Profil', icon: profileIcon },
  ];

  const tabs =
    role === 'admin' || role === 'super-admin' ? adminTabs :
    role === 'teacher' ? teacherTabs :
    studentTabs;

  const titleMap: Record<string, string> = {
    home: role === 'admin' || role === 'super-admin' ? 'Admin Panel' : role === 'teacher' ? 'Teacher Panel' : 'Bosh Sahifa',
    vocab: 'Vocabulary Stages',
    chat: 'Xabarlar',
    feed: 'News Feed',
    speaking: 'AI Speaking',
    profile: 'Profil',
    attendance: 'Davomat',
  };

  const subtitleMap: Record<string, string> = {
    home: role === 'admin' || role === 'super-admin' ? 'Tizimni boshqaring' : role === 'teacher' ? 'Talabalarni boshqaring' : 'Native Elite ga xush kelibsiz!',
    vocab: 'Bosqichni tanlang',
    chat: 'Barcha xabarlar',
    feed: 'Dars jarayoni suratlari',
    speaking: 'IELTS Speaking amaliyoti',
  };

  return (
    <div className="min-h-screen" style={{ background: 'var(--theme-bg)' }}>
      {/* Desktop: centered with max-width */}
      <div className="max-w-[480px] md:max-w-[520px] lg:max-w-[480px] mx-auto md:my-4 lg:my-6 md:rounded-3xl md:overflow-hidden md:shadow-2xl md:border md:border-[var(--theme-border)] relative" style={{ background: 'var(--theme-bg)' }}>
        {!hideHeader && (
          <MobileHeader
            title={headerTitle || titleMap[activeTab] || 'Native Elite'}
            subtitle={headerSubtitle || subtitleMap[activeTab]}
            onThemeToggle={toggleTheme}
            isDark={theme === 'dark'}
            userProfile={userProfile}
          />
        )}
        <main className="pb-20 overflow-y-auto min-h-[60vh] md:min-h-[70vh] lg:min-h-[75vh]">
          {children}
        </main>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
      </div>
    </div>
  );
};
