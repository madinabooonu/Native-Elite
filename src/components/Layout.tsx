import React from 'react';
import { MobileHeader, BottomNav } from './UI';
import { UserRole } from '../types';
import { cn } from '../lib/utils';

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
}: {
  children: React.ReactNode;
  role: UserRole;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  headerTitle?: string;
  headerSubtitle?: string;
  hideHeader?: boolean;
}) => {
  /* ── Icons ── */
  const homeIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline points="9 22 9 12 15 12 15 22" /></svg>;
  const coursesIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="5 3 19 12 5 21 5 3" /></svg>;
  const feedbackIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" /></svg>;
  const booksIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>;
  const profileIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>;
  const checkIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /><circle cx="12" cy="12" r="10" /></svg>;
  const calendarIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg>;
  const usersIcon = <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;

  /* ── Tab configs by role ── */
  const studentTabs = [
    { id: 'home', label: 'Home', icon: homeIcon },
    { id: 'vocab', label: 'Vocab', icon: booksIcon },
    { id: 'speaking', label: 'AI Speak', icon: checkIcon },
    { id: 'chat', label: 'Chat', icon: feedbackIcon },
    { id: 'progress', label: 'Progress', icon: coursesIcon },
    { id: 'profile', label: 'Profile', icon: profileIcon },
  ];
  const teacherTabs = [
    { id: 'home', label: 'Home', icon: homeIcon },
    { id: 'schedule', label: 'Schedule', icon: calendarIcon },
    { id: 'students', label: 'Students', icon: usersIcon },
    { id: 'checkin', label: 'Check-in', icon: checkIcon },
    { id: 'profile', label: 'Profile', icon: profileIcon },
  ];
  const adminTabs = [
    { id: 'home', label: 'Home', icon: homeIcon },
    { id: 'bookings', label: 'Bookings', icon: calendarIcon },
    { id: 'teachers', label: 'Teachers', icon: usersIcon },
    { id: 'slots', label: 'Slots', icon: booksIcon },
    { id: 'profile', label: 'Profile', icon: profileIcon },
  ];
  const tabs = role === 'admin' ? adminTabs : role === 'teacher' ? teacherTabs : studentTabs;

  const titleMap: Record<string, string> = {
    home: role === 'admin' ? 'Admin Dashboard' : role === 'teacher' ? 'Teacher Dashboard' : 'Class Booking',
    courses: 'Courses', feedback: 'Lesson Feedback', books: 'Books', profile: 'Profile',
    schedule: 'My Schedule', students: 'My Students', checkin: 'Attendance Check-in',
    bookings: 'All Bookings', teachers: 'Manage Teachers', slots: 'Manage Slots',
    vocab: 'Vocab Trainer', chat: 'Messages', progress: 'My Progress', speaking: 'AI Speaking'
  };
  const subtitleMap: Record<string, string> = {
    home: role === 'admin' ? 'Manage the platform' : role === 'teacher' ? 'View your schedule' : 'Book your support lesson easily.',
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      {/* Desktop: centered with max-width, subtle card shadow */}
      <div className="max-w-[480px] md:max-w-[520px] lg:max-w-[480px] mx-auto md:my-4 lg:my-6 md:rounded-3xl md:overflow-hidden md:card-shadow-lg md:border md:border-gray-200/60 relative bg-brand-bg md:bg-white">
        <MobileHeader
          title={headerTitle || titleMap[activeTab] || 'Native Elite'}
          subtitle={headerSubtitle || subtitleMap[activeTab]}
        />
        <main className="pb-20 overflow-y-auto min-h-[60vh] md:min-h-[70vh] lg:min-h-[75vh]">
          {children}
        </main>
        <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} tabs={tabs} />
      </div>
    </div>
  );
};
