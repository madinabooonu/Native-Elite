import React, { useState, useEffect } from 'react';
import { db } from '../lib/firebase';
import { collection, getDocs, query, where, doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import type { UserRole, UserProfile } from '../types';
import { motion } from 'motion/react';

interface AuthPageProps {
  onAuthSuccess: (profile: UserProfile) => void;
}

const LOCAL_USERS = [
  {
    uid: 'superadmin',
    username: 'superadmin',
    displayName: 'Super Admin',
    role: 'super-admin',
    password: 'Admin@123',
    stage: 'stage1',
  },
  {
    uid: 'admin1',
    username: 'admin1',
    displayName: 'John Admin',
    role: 'admin',
    password: 'Admin@123',
    stage: 'stage1',
  },
  {
    uid: 'teacher1',
    username: 'teacher1',
    displayName: 'Sarah Teacher',
    role: 'teacher',
    password: 'Teacher@123',
    stage: 'stage1',
  },
  {
    uid: 'teacher2',
    username: 'teacher2',
    displayName: 'Michael Teacher',
    role: 'teacher',
    password: 'Teacher@123',
    stage: 'stage1',
  },
  {
    uid: 'student1',
    username: 'student1',
    displayName: 'Alex Student',
    role: 'student',
    password: 'Student@123',
    stage: 'stage2',
    score: 85,
    totalScore: 100,
    attendanceCount: 12,
  },
  {
    uid: 'student2',
    username: 'student2',
    displayName: 'Emily Student',
    role: 'student',
    password: 'Student@123',
    stage: 'stage3',
    score: 92,
    totalScore: 100,
    attendanceCount: 15,
  }
];

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [seedingError, setSeedingError] = useState<string | null>(null);

  // Seed super admin and test users in the background on mount
  useEffect(() => {
    const seedTestUsers = async () => {
      try {
        const usersToSeed = [
          {
            uid: 'superadmin',
            username: 'superadmin',
            displayName: 'Super Admin',
            role: 'super-admin',
            password: 'Admin@123',
          },
          {
            uid: 'admin1',
            username: 'admin1',
            displayName: 'John Admin',
            role: 'admin',
            password: 'Admin@123',
          },
          {
            uid: 'teacher1',
            username: 'teacher1',
            displayName: 'Sarah Teacher',
            role: 'teacher',
            password: 'Teacher@123',
          },
          {
            uid: 'teacher2',
            username: 'teacher2',
            displayName: 'Michael Teacher',
            role: 'teacher',
            password: 'Teacher@123',
          },
          {
            uid: 'student1',
            username: 'student1',
            displayName: 'Alex Student',
            role: 'student',
            password: 'Student@123',
            stage: 'stage2',
            score: 85,
            totalScore: 100,
            attendanceCount: 12,
          },
          {
            uid: 'student2',
            username: 'student2',
            displayName: 'Emily Student',
            role: 'student',
            password: 'Student@123',
            stage: 'stage3',
            score: 92,
            totalScore: 100,
            attendanceCount: 15,
          }
        ];

        for (const u of usersToSeed) {
          const ref = doc(db, 'users', u.uid);
          await setDoc(ref, {
            ...u,
            createdAt: serverTimestamp(),
            isOnline: false,
          }, { merge: true });
        }
      } catch (e: any) {
        console.error('Seeding error:', e);
        setSeedingError(`Seeding error: ${e.code || ''} - ${e.message || e}`);
      }
    };

    seedTestUsers();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    const inputUsername = username.trim().toLowerCase();
    const inputPassword = password;

    if (!inputUsername || !inputPassword) {
      setError('Username va password kiritng!');
      return;
    }
    setIsLoading(true);
    setError(null);

    // ── Local Bypass Check ──
    const matchedLocal = LOCAL_USERS.find(
      u => u.username === inputUsername && u.password === inputPassword
    );

    if (matchedLocal) {
      const profile: UserProfile = {
        uid: matchedLocal.uid,
        username: matchedLocal.username,
        displayName: matchedLocal.displayName,
        role: matchedLocal.role as UserRole,
        stage: matchedLocal.stage || 'stage1',
        score: matchedLocal.score || 0,
        totalScore: matchedLocal.totalScore || 0,
        attendanceCount: matchedLocal.attendanceCount || 0,
      };

      // Try to seed to Firestore in background (fails silently if permissions or offline block it)
      setDoc(doc(db, 'users', matchedLocal.uid), {
        ...matchedLocal,
        isOnline: true,
        lastSeen: new Date().toISOString(),
      }, { merge: true }).catch(err => console.error('Failed to sync bypass user:', err));

      onAuthSuccess(profile);
      setIsLoading(false);
      return;
    }

    try {
      // Query Firestore users collection by username
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', inputUsername));
      const snap = await getDocs(q);

      if (snap.empty) {
        setError('Foydalanuvchi topilmadi. Username noto\'g\'ri.');
        return;
      }

      const userDoc = snap.docs[0];
      const userData = userDoc.data();

      if (userData.password !== inputPassword) {
        setError('Password noto\'g\'ri. Iltimos qayta urinib ko\'ring.');
        return;
      }

      const profile: UserProfile = {
        uid: userData.uid || userDoc.id,
        username: userData.username,
        displayName: userData.displayName || userData.username,
        role: userData.role as UserRole,
        email: userData.email,
        avatarUrl: userData.avatarUrl,
        stage: userData.stage || 'stage1',
        assignedTeacherId: userData.assignedTeacherId,
        score: userData.score || 0,
        totalScore: userData.totalScore || 0,
        attendanceCount: userData.attendanceCount || 0,
      };

      // Update online status in the background (no await to login instantly)
      setDoc(doc(db, 'users', userDoc.id), {
        isOnline: true,
        lastSeen: new Date().toISOString(),
      }, { merge: true }).catch(err => console.error('Failed to set online:', err));

      onAuthSuccess(profile);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(`Xatolik yuz berdi: ${err.code || ''} - ${err.message || err}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = (usr: string, pass: string) => {
    setUsername(usr);
    setPassword(pass);
    setIsLoading(true);
    setError(null);
    setTimeout(() => {
      const matchedLocal = LOCAL_USERS.find(u => u.username === usr && u.password === pass);
      if (matchedLocal) {
        const profile: UserProfile = {
          uid: matchedLocal.uid,
          username: matchedLocal.username,
          displayName: matchedLocal.displayName,
          role: matchedLocal.role as UserRole,
          stage: matchedLocal.stage || 'stage1',
          score: matchedLocal.score || 0,
          totalScore: matchedLocal.totalScore || 0,
          attendanceCount: matchedLocal.attendanceCount || 0,
        };
        setDoc(doc(db, 'users', matchedLocal.uid), {
          ...matchedLocal,
          isOnline: true,
          lastSeen: new Date().toISOString(),
        }, { merge: true }).catch(err => console.error(err));
        
        onAuthSuccess(profile);
      } else {
        setError('Xatolik: Matched local user not found');
      }
      setIsLoading(false);
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[var(--theme-bg)] flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Animated background blobs */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[-100px] right-[-80px] w-72 h-72 rounded-full bg-blue-600/20 blur-3xl animate-pulse" />
        <div className="absolute bottom-[-80px] left-[-60px] w-80 h-80 rounded-full bg-purple-600/15 blur-3xl animate-pulse" style={{ animationDelay: '1s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full bg-cyan-500/5 blur-3xl" />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="w-full max-w-[400px] relative z-10"
      >
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <motion.div
            initial={{ scale: 0.8 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
            className="w-20 h-20 rounded-[28px] bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-2xl shadow-blue-500/30 mb-4"
          >
            <svg width="40" height="40" viewBox="0 0 100 100" fill="none">
              <path d="M25 75V25L75 75V25" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
          </motion.div>
          <h1 className="text-3xl font-extrabold text-[var(--theme-text)] tracking-tight">Native Elite</h1>
          <p className="text-[var(--theme-text-muted)] text-sm mt-1">IELTS Learning Platform</p>
        </div>

        {/* Card */}
        <div className="bg-[var(--theme-card)] rounded-3xl shadow-2xl overflow-hidden border border-[var(--theme-border)]">
          <div className="px-8 pt-8 pb-2">
            <h2 className="text-xl font-bold text-[var(--theme-text)]">Kirish</h2>
            <p className="text-sm text-[var(--theme-text-muted)] mt-1">Username va parolingizni kiriting</p>
          </div>

          <form onSubmit={handleLogin} className="px-8 pb-8 pt-4 space-y-4">
            {/* Error */}
            {error && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3.5 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-sm font-medium flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </motion.div>
            )}

            {seedingError && (
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="p-3.5 bg-yellow-500/10 border border-yellow-500/30 rounded-2xl text-yellow-500 text-sm font-medium flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {seedingError}
              </motion.div>
            )}

            {/* Username */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Username</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                </div>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="username kiriting"
                  autoCapitalize="none"
                  autoComplete="username"
                  className="w-full pl-11 pr-4 py-3.5 bg-[var(--theme-bg)] border-2 border-[var(--theme-border)] rounded-2xl text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Parol</label>
              <div className="relative">
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)]">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="parol kiriting"
                  autoComplete="current-password"
                  className="w-full pl-11 pr-12 py-3.5 bg-[var(--theme-bg)] border-2 border-[var(--theme-border)] rounded-2xl text-[var(--theme-text)] placeholder-[var(--theme-text-muted)] text-sm font-medium focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] transition-colors"
                >
                  {showPassword ? (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                  ) : (
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                  )}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-gradient-to-r from-blue-600 to-blue-500 text-white font-bold text-base rounded-2xl shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40 transition-all active:scale-[0.97] disabled:opacity-60 disabled:pointer-events-none flex items-center justify-center gap-3 mt-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Kirilmoqda...
                </>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                  Kirish
                </>
              )}
            </button>

            <p className="text-center text-xs text-[var(--theme-text-muted)] pt-2">
              Ro'yxatdan o'tish faqat Admin orqali amalga oshiriladi
            </p>
          </form>

          {/* Quick Login Section */}
          <div className="px-8 pb-6 border-t border-[var(--theme-border)] pt-4 bg-[var(--theme-card-alt)]">
            <p className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider mb-2.5 text-center">Tezkor kirish (Quick Login)</p>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('student1', 'Student@123')}
                className="py-2 px-1 bg-blue-500/10 hover:bg-blue-500/25 text-blue-500 hover:text-blue-600 text-xs font-bold rounded-xl border border-blue-500/20 transition-all text-center cursor-pointer"
              >
                Student 1
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('teacher1', 'Teacher@123')}
                className="py-2 px-1 bg-green-500/10 hover:bg-green-500/25 text-green-500 hover:text-green-600 text-xs font-bold rounded-xl border border-green-500/20 transition-all text-center cursor-pointer"
              >
                Teacher 1
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('superadmin', 'Admin@123')}
                className="py-2 px-1 bg-purple-500/10 hover:bg-purple-500/25 text-purple-500 hover:text-purple-600 text-xs font-bold rounded-xl border border-purple-500/20 transition-all text-center cursor-pointer"
              >
                Super Admin
              </button>
            </div>
          </div>
        </div>

        <p className="text-center text-[var(--theme-text-muted)] text-xs mt-6">© 2026 Native Elite • Barcha huquqlar himoyalangan</p>
      </motion.div>
    </div>
  );
};
