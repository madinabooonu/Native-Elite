import React, { useState, useEffect } from 'react';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from './lib/firebase';
import { SUPER_ADMIN_EMAILS, ADMIN_EMAILS, ADMIN_TEACHER_MAP } from './lib/constants';
import { motion, AnimatePresence } from 'motion/react';
import { LandingPage } from './pages/Landing';
import { AuthPage } from './pages/Auth';
import { AppLayout } from './components/Layout';
import { StudentHome, TeacherList, TeacherCheckIn, ProfileView } from './components/DashboardViews';
import { AdminDashboard } from './components/AdminViews';
import { BookingCalendar } from './components/BookingCalendar';
import { FeedbackInterface } from './components/ChatInterface';
import { VocabTrainer } from './components/VocabTrainer';
import { ChatSystem } from './components/ChatSystem';
import { ProgressChart } from './components/ProgressChart';
import { AISpeaking } from './components/AISpeaking';
import { UserRole, UserProfile, BookingRecord, TimeSlot } from './types';

type AppState = 'landing' | 'auth' | 'app';

export default function App() {
  const [state, setState] = useState<AppState>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [activeBooking, setActiveBooking] = useState<BookingRecord | null>(null);
  const [allBookings, setAllBookings] = useState<BookingRecord[]>([]);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        // Determine role based on email if we have persistent auth
        let role: UserRole = 'student';
        let assignedTeacherId: string | undefined = undefined;

        if (SUPER_ADMIN_EMAILS.includes(user.email)) {
          role = 'super-admin';
        } else if (ADMIN_EMAILS.includes(user.email)) {
          role = 'admin';
          assignedTeacherId = ADMIN_TEACHER_MAP[user.email];
        }

        setUserProfile({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName || 'User',
          role: role,
          assignedTeacherId: assignedTeacherId,
          avatarUrl: user.photoURL || undefined,
        });
        setState('app');
      } else {
        setUserProfile(null);
        if (state === 'app') setState('landing');
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleStart = () => setState('auth');

  const handleAuthSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setActiveTab('home');
    setState('app');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserProfile(null);
      setState('landing');
      setActiveTab('home');
      setActiveBooking(null);
      setAllBookings([]);
    } catch (err) {
      console.error('Logout error:', err);
    }
  };

  const handleBookSlot = (slot: TimeSlot) => {
    if (!userProfile) return;

    const newBooking: BookingRecord = {
      id: Math.random().toString(36).substr(2, 9),
      slotId: slot.id,
      studentId: userProfile.uid,
      studentName: userProfile.displayName,
      studentStage: userProfile.stage || 'Stage 1',
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
    };

    // Add to all bookings and set as active
    setAllBookings(prev => [newBooking, ...prev]);
    setActiveBooking(newBooking);
  };

  const renderContent = () => {
    if (!userProfile) return null;

    // ── Admin/Super Admin views ──
    if (userProfile.role === 'admin' || userProfile.role === 'super-admin') {
      switch (activeTab) {
        case 'home':
        case 'bookings':
          return <AdminDashboard key={userProfile.assignedTeacherId} user={userProfile} allBookings={allBookings} setAllBookings={setAllBookings} />;
        case 'profile':
          return <ProfileView userProfile={userProfile} handleLogout={handleLogout} />;
        default:
          return <AdminDashboard user={userProfile} allBookings={allBookings} setAllBookings={setAllBookings} />;
      }
    }

    // ── Teacher views ──
    if (userProfile.role === 'teacher') {
      switch (activeTab) {
        case 'home':
          return <StudentHome userProfile={userProfile} activeBooking={null} onBookSlot={() => { }} />;
        case 'schedule':
          return <BookingCalendar onBookSlot={handleBookSlot} activeBooking={activeBooking} />;
        case 'students':
          return <TeacherList />;
        case 'checkin':
          return <TeacherCheckIn />;
        case 'profile':
          return <ProfileView userProfile={userProfile} handleLogout={handleLogout} />;
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
          onBookSlot={handleBookSlot}
        />;
      case 'vocab':
        return <VocabTrainer />;
      case 'chat':
        return <ChatSystem />;
      case 'progress':
        return <ProgressChart />;
      case 'speaking':
        return <AISpeaking />;
      case 'courses':
        return <TeacherList />;
      case 'feedback':
        return <FeedbackInterface />;
      case 'profile':
        return <ProfileView userProfile={userProfile} handleLogout={handleLogout} />;
      default:
        return <StudentHome userProfile={userProfile} activeBooking={activeBooking} onBookSlot={handleBookSlot} />;
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
