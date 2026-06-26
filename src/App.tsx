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
      <div className="h-screen w-screen flex flex-col items-center justify-center gap-6" style={{ background: 'var(--theme-bg)' }}>
        <motion.div
          animate={{ scale: [0.95, 1.02, 0.95] }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-56 h-auto flex flex-col items-center justify-center"
        >
          <img src={logoImg} alt="Native Elite" className="w-full h-auto object-contain rounded-2xl shadow-2xl border border-blue-500/10 mb-2" />
          <p className="text-[var(--theme-text-muted)] text-[10px] uppercase tracking-widest font-black animate-pulse mt-2">Yuklanmoqda...</p>
        </motion.div>
        <div className="w-6 h-6 border-2 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
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
