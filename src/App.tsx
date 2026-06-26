import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LandingPage } from './pages/Landing';
import { AuthPage } from './pages/Auth';
import { AppLayout } from './components/Layout';
import { StudentHome, ProfileView } from './components/DashboardViews';
import { AdminDashboard } from './components/AdminViews';
import { VocabTrainer } from './components/VocabTrainer';
import { ChatSystem } from './components/ChatSystem';
import { AISpeaking } from './components/AISpeaking';
import { NewsFeed } from './components/NewsFeed';
import { UserRole, UserProfile, BookingRecord, TimeSlot } from './types';
import logoImg from './assets/logo.png';
import { db } from './lib/firebase';
import { doc, setDoc, collection, query, orderBy, onSnapshot } from 'firebase/firestore';

type AppState = 'landing' | 'auth' | 'app';

export default function App() {
  const [state, setState] = useState<AppState>('landing');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [activeTab, setActiveTab] = useState('home');
  const [isLoading, setIsLoading] = useState(true);
  const [allBookings, setAllBookings] = useState<BookingRecord[]>([]);

  // Load bookings from Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, 'bookings'), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, (snap) => {
      const bookingsData = snap.docs.map(d => {
        const raw = d.data();
        return {
          id: d.id,
          ...raw,
          createdAt: raw.createdAt && typeof raw.createdAt.toDate === 'function'
            ? raw.createdAt.toDate().toISOString()
            : raw.createdAt || new Date().toISOString(),
        } as BookingRecord;
      });
      setAllBookings(bookingsData);
    });
    return () => unsub();
  }, []);

  const activeBooking = userProfile
    ? allBookings.find(b => b.studentId === userProfile.uid && (b.status === 'pending' || b.status === 'confirmed'))
    : null;

  const handleBookSlot = async (slot: TimeSlot, fullName?: string, stage?: string, teacherName?: string) => {
    if (!userProfile) return;
    try {
      const bookingId = `book_${Date.now()}`;
      const newBooking = {
        slotId: slot.id,
        studentId: userProfile.uid,
        studentName: fullName || userProfile.displayName,
        studentStage: stage || userProfile.stage || 'stage1',
        teacherId: slot.teacherId,
        teacherName: teacherName || slot.teacherName,
        day: slot.day,
        dayDate: slot.dayDate,
        fullDate: slot.fullDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: 'pending',
        createdAt: new Date().toISOString(),
        checkedIn: false
      };
      await setDoc(doc(db, 'bookings', bookingId), newBooking);
    } catch (err) {
      console.error('Error booking slot:', err);
    }
  };

  // Restore session from sessionStorage
  useEffect(() => {
    const stored = sessionStorage.getItem('userProfile');
    if (stored) {
      try {
        const profile = JSON.parse(stored) as UserProfile;
        setUserProfile(profile);
        setState('app');
      } catch {
        // ignore
      }
    }
    setIsLoading(false);
  }, []);

  const handleStart = () => setState('auth');

  const handleAuthSuccess = (profile: UserProfile) => {
    setUserProfile(profile);
    setActiveTab('home');
    setState('app');
    // Persist session
    sessionStorage.setItem('userProfile', JSON.stringify(profile));
  };

  const handleLogout = async () => {
    if (userProfile) {
      try {
        // Set offline status
        await setDoc(doc(db, 'users', userProfile.uid), { isOnline: false }, { merge: true });
      } catch {/* ignore */}
    }
    setUserProfile(null);
    setState('landing');
    setActiveTab('home');
    setAllBookings([]);
    sessionStorage.removeItem('userProfile');
  };

  const renderContent = () => {
    if (!userProfile) return null;

    const isAdmin = userProfile.role === 'admin' || userProfile.role === 'super-admin';
    const isTeacher = userProfile.role === 'teacher';

    // ── Admin/Super Admin views ──
    if (isAdmin) {
      switch (activeTab) {
        case 'home':
          return <AdminDashboard key={userProfile.uid} user={userProfile} allBookings={allBookings} setAllBookings={setAllBookings} />;
        case 'feed':
          return <NewsFeed userProfile={userProfile} />;
        case 'chat':
          return <ChatSystem userProfile={userProfile} />;
        case 'profile':
          return <ProfileView userProfile={userProfile} handleLogout={handleLogout} />;
        default:
          return <AdminDashboard user={userProfile} allBookings={allBookings} setAllBookings={setAllBookings} />;
      }
    }

    // ── Teacher views ──
    if (isTeacher) {
      switch (activeTab) {
        case 'home':
          return <AdminDashboard key={userProfile.uid} user={userProfile} allBookings={allBookings} setAllBookings={setAllBookings} />;
        case 'attendance':
          return <AdminDashboard key="attendance" user={userProfile} allBookings={allBookings} setAllBookings={setAllBookings} />;
        case 'feed':
          return <NewsFeed userProfile={userProfile} />;
        case 'chat':
          return <ChatSystem userProfile={userProfile} />;
        case 'profile':
          return <ProfileView userProfile={userProfile} handleLogout={handleLogout} />;
        default:
          return <AdminDashboard user={userProfile} allBookings={allBookings} setAllBookings={setAllBookings} />;
      }
    }

    // ── Student views ──
    switch (activeTab) {
      case 'home':
        return <StudentHome userProfile={userProfile} activeBooking={activeBooking} allBookings={allBookings} onBookSlot={handleBookSlot} />;
      case 'vocab':
        return <VocabTrainer />;
      case 'feed':
        return <NewsFeed userProfile={userProfile} />;
      case 'speaking':
        return <AISpeaking />;
      case 'chat':
        return <ChatSystem userProfile={userProfile} />;
      case 'profile':
        return <ProfileView userProfile={userProfile} handleLogout={handleLogout} />;
      default:
        return <StudentHome userProfile={userProfile} activeBooking={activeBooking} allBookings={allBookings} onBookSlot={handleBookSlot} />;
    }
  };

  // ── Loading screen ──
  if (isLoading) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-4" style={{ background: 'var(--theme-bg)' }}>
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          className="flex items-center gap-3"
        >
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#001040] via-[#002060] to-[#003080] flex items-center justify-center shadow-lg border border-blue-500/25">
            <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
              <path d="M30 70V30L42 42" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M70 30V70L58 58" stroke="#FFFFFF" strokeWidth="16" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </div>
          <span className="text-2xl font-bold text-[var(--theme-text)] tracking-tight">Native Elite</span>
        </motion.div>
        <div className="w-8 h-8 border-3 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
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

      {state === 'app' && userProfile && (
        <motion.div key="app" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <AppLayout
            role={userProfile.role}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            onLogout={handleLogout}
            userProfile={userProfile}
          >
            {renderContent()}
          </AppLayout>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
