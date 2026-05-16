import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, AppButton, TabBar } from './UI';
import { cn } from '../lib/utils';
import { BookingCalendar } from './BookingCalendar';
import type { BookingRecord, TimeSlot } from '../types';

/* ═══════════════════════════════════════════
   STUDENT HOME — Main booking screen
   Sub-tabs: Schedule | My Bookings | Profile
   ═══════════════════════════════════════════ */
export const StudentHome = ({
  userProfile,
  activeBooking,
  onBookSlot
}: {
  userProfile: any,
  activeBooking?: BookingRecord | null,
  onBookSlot?: (slot: TimeSlot) => void
}) => {
  const [activeSubTab, setActiveSubTab] = useState('schedule');

  const subTabs = [
    { id: 'schedule', label: 'Schedule', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" /></svg> },
    { id: 'mybookings', label: 'My Bookings', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" /><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" /></svg> },
    { id: 'profile', label: 'Profile', icon: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg> },
  ];

  return (
    <div className="flex flex-col min-h-0 h-full">
      <TabBar tabs={subTabs} activeTab={activeSubTab} setActiveTab={setActiveSubTab} />
      <div className="flex-1 overflow-y-auto min-h-0 pb-20">
        <AnimatePresence mode="wait">
          {activeSubTab === 'schedule' && (
            <motion.div key="schedule" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <BookingCalendar activeBooking={activeBooking} onBookSlot={onBookSlot} />
            </motion.div>
          )}
          {activeSubTab === 'mybookings' && (
            <motion.div key="bookings" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <MyBookingsView activeBooking={activeBooking} />
            </motion.div>
          )}
          {activeSubTab === 'profile' && (
            <motion.div key="profile" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <ProfileView userProfile={userProfile} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

/* ── My Bookings View ── */
const MyBookingsView = ({ activeBooking }: { activeBooking?: BookingRecord | null }) => {
  const defaultBookings = [
    { id: '1', teacherName: 'Miss Osiyo', day: 'Mon', dayDate: 'May 19', startTime: '16:00', endTime: '16:30', status: 'confirmed', checkedIn: false },
    { id: '2', teacherName: 'Mr Sarvar', day: 'Wed', dayDate: 'May 21', startTime: '17:00', endTime: '17:30', status: 'pending', checkedIn: false },
  ];
  const bookings = activeBooking ? [activeBooking, ...defaultBookings] : defaultBookings;

  return (
    <div className="px-4 md:px-6 pt-4 space-y-3">
      <h3 className="text-sm font-bold text-brand-text italic">Your Active Sessions</h3>
      {bookings.length === 0 ? (
        <div className="text-center py-12 text-brand-text-light text-sm bg-white rounded-2xl border-2 border-dashed border-gray-100">No bookings yet.</div>
      ) : (
        bookings.map((b) => (
          <Card key={b.id} className="p-4 flex items-center gap-4 rounded-2xl border-none shadow-sm hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-blue-50 flex items-center justify-center text-brand-blue font-bold text-lg">
              {b.teacherName.split(' ')[1]?.[0] || 'T'}
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-brand-text">{b.teacherName}</p>
              <p className="text-[11px] text-brand-text-light">{b.day}, {b.dayDate} • {b.startTime}-{b.endTime}</p>
            </div>
            <span className={cn(
              'text-[10px] font-extrabold px-2.5 py-1 rounded-full uppercase tracking-tighter',
              b.status === 'confirmed' ? 'bg-green-50 text-brand-green' : 'bg-orange-50 text-brand-orange'
            )}>
              {b.status}
            </span>
          </Card>
        ))
      )}
    </div>
  );
};

/* ── Improved Profile View ── */
const ProfileView = ({ userProfile }: { userProfile: any }) => {
  const [selectedStage, setSelectedStage] = useState('B2');
  const stages = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

  return (
    <div className="px-4 md:px-6 pt-6 space-y-6">
      {/* Header / Avatar */}
      <div className="text-center">
        <div className="relative inline-block">
          <div className="w-24 h-24 rounded-[32px] bg-brand-blue mx-auto flex items-center justify-center text-white text-3xl font-extrabold shadow-xl shadow-brand-blue/20 rotate-3">
            <span className="-rotate-3">{userProfile?.displayName?.[0] || 'A'}</span>
          </div>
          <div className="absolute -bottom-1 -right-1 w-8 h-8 bg-brand-green rounded-full border-4 border-white flex items-center justify-center">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
          </div>
        </div>
        <h3 className="text-xl font-extrabold text-brand-text mt-4">{userProfile?.displayName || 'Student'}</h3>
        <p className="text-sm text-brand-text-light">Native Student • {userProfile?.email || 'Active'}</p>
      </div>

      {/* Stage Selector */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-brand-text uppercase tracking-widest flex items-center gap-2">
          <span className="w-4 h-1 bg-brand-blue rounded-full" />
          Your Learning Stage
        </label>
        <div className="grid grid-cols-6 gap-2">
          {stages.map((s) => (
            <button
              key={s}
              onClick={() => setSelectedStage(s)}
              className={cn(
                'h-10 rounded-xl font-bold text-xs transition-all border-2',
                (selectedStage || userProfile?.stage) === s
                  ? 'bg-brand-blue border-brand-blue text-white shadow-lg'
                  : 'bg-white border-gray-100 text-brand-text-light hover:border-brand-blue/30'
              )}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="p-4 bg-blue-50 border-none shadow-none text-center rounded-2xl">
          <p className="text-[10px] font-bold text-brand-blue uppercase tracking-wider mb-1">Attendance</p>
          <p className="text-xl font-extrabold text-brand-text">95%</p>
        </Card>
        <Card className="p-4 bg-green-50 border-none shadow-none text-center rounded-2xl">
          <p className="text-[10px] font-bold text-brand-green uppercase tracking-wider mb-1">Points</p>
          <p className="text-xl font-extrabold text-brand-text">1,240</p>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <label className="text-xs font-bold text-brand-text uppercase tracking-widest flex items-center gap-2">
          <span className="w-4 h-1 bg-brand-orange rounded-full" />
          Quick Actions
        </label>
        <div className="space-y-2">
          <QuickAction icon="📞" label="Contact Support" color="text-blue-500" />
          <QuickAction icon="📄" label="Download Certificate" color="text-purple-500" />
          <QuickAction icon="⚙️" label="Account Settings" color="text-gray-500" />
        </div>
      </div>

      {/* Sign Out */}
      <AppButton fullWidth variant="ghost" className="text-brand-red font-bold text-sm h-12 rounded-2xl border-2 border-red-50">
        Log Out
      </AppButton>
    </div>
  );
};

const QuickAction = ({ icon, label, color }: { icon: string, label: string, color: string }) => (
  <button className="w-full bg-white p-4 rounded-2xl flex items-center justify-between border-2 border-transparent hover:border-gray-100 transition-all card-shadow-sm group text-left">
    <div className="flex items-center gap-3">
      <span className="text-xl">{icon}</span>
      <span className="text-sm font-bold text-brand-text">{label}</span>
    </div>
    <svg className="w-4 h-4 text-gray-300 group-hover:translate-x-1 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="9 18 15 12 9 6" /></svg>
  </button>
);

/* ═══════════════════════════════════════════
   TEACHER LIST
   ═══════════════════════════════════════════ */
export const TeacherList = () => {
  const teachers = [
    { id: 't2', name: 'Ms.Osiya', subject: 'Support', rating: 4.8, students: 38, color: 'from-purple-500 to-purple-700' },
    { id: 't3', name: 'Mr.Sarvar', subject: 'Support', rating: 4.9, students: 42, color: 'from-orange-500 to-orange-700' },
  ];

  return (
    <div className="px-6 py-4 space-y-4">
      <h3 className="font-extrabold text-brand-text text-lg">Our Teachers</h3>
      {teachers.map((t) => (
        <Card key={t.id} className="p-4 flex items-center gap-4 border-none shadow-sm rounded-2xl">
          <div className={cn('w-14 h-14 rounded-xl bg-gradient-to-br flex items-center justify-center text-white font-bold text-lg', t.color)}>
            {t.name.split('.')[1]?.[0] || 'T'}
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-extrabold text-brand-text">{t.name}</h4>
            <p className="text-[11px] text-brand-text-light">{t.subject} Teacher</p>
            <div className="flex items-center gap-3 mt-1.5">
              <span className="text-xs text-brand-orange font-bold flex items-center gap-1">★ {t.rating}</span>
            </div>
          </div>
        </Card>
      ))}
    </div>
  );
};

/* ═══════════════════════════════════════════
   TEACHER CHECK-IN
   ═══════════════════════════════════════════ */
export const TeacherCheckIn = () => {
  const [students, setStudents] = useState([
    { id: '1', name: 'Alex Johnson', stage: 'B2', time: '14:30 - 15:00', checkedIn: false },
    { id: '2', name: 'Elena Smith', stage: 'C1', time: '15:00 - 15:30', checkedIn: false },
    { id: '3', name: 'Marcus Wright', stage: 'A2', time: '15:30 - 16:00', checkedIn: true },
  ]);

  const toggleCheckIn = (id: string) => {
    setStudents((prev) => prev.map((s) => (s.id === id ? { ...s, checkedIn: !s.checkedIn } : s)));
  };

  return (
    <div className="px-6 py-4 space-y-4">
      <h3 className="font-extrabold text-brand-text text-lg italic">Today's Students</h3>
      {students.map((s) => (
        <Card key={s.id} className="p-4 flex items-center justify-between border-none shadow-sm rounded-2xl">
          <div className="flex items-center gap-3">
            <div className={cn(
              'w-11 h-11 rounded-xl flex items-center justify-center font-bold text-sm',
              s.checkedIn ? 'bg-brand-green text-white shadow-md' : 'bg-gray-100 text-brand-text'
            )}>
              {s.checkedIn ? '✓' : s.name.split(' ').map(n => n[0]).join('')}
            </div>
            <div>
              <p className="text-sm font-bold text-brand-text">{s.name}</p>
              <p className="text-[11px] text-brand-text-light">Stage: {s.stage} • {s.time}</p>
            </div>
          </div>
          <button
            onClick={() => toggleCheckIn(s.id)}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2',
              s.checkedIn ? 'bg-brand-green border-brand-green text-white' : 'border-gray-100 text-gray-300 hover:border-brand-green/50 hover:text-brand-green'
            )}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>
          </button>
        </Card>
      ))}
    </div>
  );
};
