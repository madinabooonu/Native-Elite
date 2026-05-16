import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LandingPage } from './pages/Landing';
import { AuthPage } from './pages/Auth';
import { AppLayout } from './components/Layout';
import { StudentHome, TeacherList, TeacherCheckIn } from './components/DashboardViews';
import { AdminDashboard } from './components/AdminViews';
import { BookingCalendar } from './components/BookingCalendar';
import { ChatInterface } from './components/ChatInterface';
import { UserRole, UserProfile, BookingRecord, TimeSlot } from './types';

type AppState = 'landing' | 'auth' | 'app';

export default function App() {
  const [state, setState] = useState<AppState>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleStart = () => setState('auth');

  const handleAuthSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setActiveTab('home');
    setState('app');
  };

  const handleLogout = () => {
    setState('landing');
    setActiveTab('home');
  };

  const renderContent = () => {
    if (!userProfile) return null;

    // ── Admin/Super Admin views ──
    if (userProfile.role === 'admin' || userProfile.role === 'super-admin') {
      switch (activeTab) {
        case 'home':
        case 'bookings':
          return <AdminDashboard key={userProfile.assignedTeacherId} user={userProfile} />;
        case 'profile':
          return (
            <div className="px-4 pt-6 text-center">
              <div className="w-20 h-20 rounded-full bg-brand-blue mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4">
                {userProfile.displayName[0]}
              </div>
              <h3 className="text-lg font-bold text-brand-text">{userProfile.displayName}</h3>
              <p className="text-sm text-brand-text-light">{userProfile.email}</p>
              <p className="text-xs font-bold text-brand-blue mt-1 uppercase tracking-wider">
                {userProfile.role.replace('-', ' ')}
                {userProfile.assignedTeacherId && ` • Assigned to ${userProfile.assignedTeacherId === 't2' ? 'Miss Osiyo' : 'Mr Sarvar'}`}
              </p>
              <div className="mt-8">
                <button onClick={handleLogout} className="text-brand-red font-semibold text-sm bg-red-50 py-2 px-6 rounded-xl">Sign Out</button>
              </div>
            </div>
          );
        default:
          return <AdminDashboard user={userProfile} />;
      }
    }

    // ── Teacher views ──
    if (userProfile.role === 'teacher') {
      switch (activeTab) {
        case 'home':
          return <StudentHome userProfile={userProfile} activeBooking={null} onBookSlot={() => { }} />;
        case 'schedule':
          return <BookingCalendar onBookSlot={() => { }} />;
        case 'students':
          return <TeacherList />;
        case 'checkin':
          return <TeacherCheckIn />;
        case 'profile':
          return (
            <div className="px-4 pt-6 text-center">
              <div className="w-20 h-20 rounded-full bg-brand-blue mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4">
                {userProfile.displayName[0]}
              </div>
              <h3 className="text-lg font-bold text-brand-text">{userProfile.displayName}</h3>
              <p className="text-sm text-brand-text-light mb-6">Student • Stage {userProfile.stage || 'Not set'}</p>
              <button onClick={handleLogout} className="text-brand-red font-semibold text-sm">Sign Out</button>
            </div>
          );
        default:
          return <StudentHome userProfile={userProfile} activeBooking={null} onBookSlot={() => { }} />;
      }
    }

    // ── Student views ──
    switch (activeTab) {
      case 'home':
        return <StudentHome
          userProfile={userProfile}
          activeBooking={activeBooking}
          onBookSlot={(slot) => {
            setActiveBooking({
              id: Math.random().toString(36).substr(2, 9),
              slotId: slot.id,
              studentId: 'me',
              studentName: userProfile.displayName,
              studentStage: userProfile.stage || 'B2',
              teacherId: slot.teacherId,
              teacherName: slot.teacherName,
              day: slot.day,
              dayDate: slot.dayDate,
              fullDate: slot.fullDate,
              startTime: slot.startTime,
              endTime: slot.endTime,
              status: 'pending',
              checkedIn: false,
              createdAt: new Date().toISOString(),
            });
          }} />;
      case 'courses':
        return <TeacherList />;
      case 'library':
        return <ChatInterface />;
      case 'books':
        return <BookingCalendar onBookSlot={(slot) => {
          // Direct booking logic
        }} />;
      case 'profile':
        return (
          <div className="px-4 pt-6 text-center">
            <div className="w-20 h-20 rounded-full bg-brand-blue mx-auto flex items-center justify-center text-white text-2xl font-bold mb-4">
              {userProfile.displayName[0]}
            </div>
            <h3 className="text-lg font-bold text-brand-text">{userProfile.displayName}</h3>
            <p className="text-sm text-brand-text-light mb-6">Student • Stage {userProfile.stage || 'Not set'}</p>
            <button onClick={handleLogout} className="text-brand-red font-semibold text-sm">Sign Out</button>
          </div>
        );
      default:
        return <StudentHome userProfile={userProfile} activeBooking={null} onBookSlot={() => { }} />;
    }
  };

  // ── Loading screen ──
  if (isLoading) {
    return (
      <div className="h-screen w-screen bg-brand-navy flex flex-col items-center justify-center gap-4">
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center gap-3"
        >
          <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
            <path d="M25 75V25L75 75V25" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
          <span className="text-2xl font-bold text-white tracking-tight">Native Elite</span>
        </motion.div>
        <div className="w-8 h-8 border-3 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <AnimatePresence mode="wait">
      {state === 'landing' && (
        <motion.div key="landing" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
          <LandingPage onGetStarted={handleStart} />
        </motion.div>
      )}

      {state === 'auth' && (
        <motion.div key="auth" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}>
          <AuthPage onAuthSuccess={handleAuthSuccess} />
        </motion.div>
      )}

      {state === 'app' && (
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AppLayout
            role={userProfile.role}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
          >
            {renderContent()}
          </AppLayout>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
