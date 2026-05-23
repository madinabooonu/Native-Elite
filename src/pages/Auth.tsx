import React, { useState } from 'react';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { SUPER_ADMIN_EMAILS, ADMIN_EMAILS, ADMIN_TEACHER_MAP } from '../lib/constants';
import type { UserRole, UserProfile } from '../types';

interface AuthPageProps {
  onAuthSuccess: (profile: UserProfile) => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({ onAuthSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getProfileFromUser = (user: any): UserProfile => {
    let role: UserRole = 'student';
    let assignedTeacherId: string | undefined = undefined;

    if (user.email && SUPER_ADMIN_EMAILS.includes(user.email)) {
      role = 'super-admin';
    } else if (user.email && ADMIN_EMAILS.includes(user.email)) {
      role = 'admin';
      assignedTeacherId = ADMIN_TEACHER_MAP[user.email];
    }

    return {
      uid: user.uid,
      email: user.email || '',
      displayName: user.displayName || 'User',
      role,
      assignedTeacherId,
      avatarUrl: user.photoURL || undefined,
    };
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      onAuthSuccess(getProfileFromUser(result.user));
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/unauthorized-domain') {
        setError('This domain is not authorized for sign-in. Please contact the admin.');
      } else {
        setError(err.message || 'An error occurred during sign-in.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-navy flex flex-col items-center justify-center relative overflow-hidden px-6">
      {/* Background decorations */}
      <div className="absolute top-[-80px] right-[-80px] w-64 h-64 rounded-full bg-brand-blue/10 blur-3xl" />
      <div className="absolute bottom-[-100px] left-[-60px] w-80 h-80 rounded-full bg-purple-500/10 blur-3xl" />

      {/* Logo */}
      <div className="flex items-center gap-3 mb-10 relative z-10">
        <svg width="44" height="44" viewBox="0 0 100 100" fill="none">
          <path d="M25 75V25L75 75V25" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="square" strokeLinejoin="miter" />
        </svg>
        <span className="text-3xl font-bold text-white tracking-tight">Native Elite</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-[380px] bg-white rounded-[28px] shadow-2xl shadow-black/30 overflow-hidden relative z-10">
        {/* Header */}
        <div className="pt-10 pb-6 px-8 text-center">
          <h1 className="text-2xl font-extrabold text-brand-navy">Welcome!</h1>
          <p className="text-sm text-gray-400 mt-2">Sign in to continue learning</p>
        </div>

        {/* Content */}
        <div className="px-8 pb-10">
          {error && (
            <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-500 text-xs font-medium text-center leading-relaxed">
              {error}
            </div>
          )}

          {/* Google Button */}
          <button
            onClick={handleGoogleLogin}
            disabled={isLoading}
            className="w-full py-4 rounded-2xl bg-white border-2 border-gray-200 text-gray-700 font-semibold text-[15px] hover:bg-gray-50 hover:shadow-lg hover:border-gray-300 flex items-center justify-center gap-3 transition-all active:scale-[0.97] disabled:opacity-50 shadow-sm"
          >
            <svg viewBox="0 0 24 24" className="w-5 h-5" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
            </svg>
            {isLoading ? 'Connecting...' : 'Continue with Google'}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3 my-6">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs text-gray-300 font-medium">secure login</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <p className="text-center text-[11px] text-gray-400 px-4 leading-relaxed">
            Your data is protected by Firebase Authentication. We never store your password.
          </p>
        </div>
      </div>

      {/* Footer */}
      <p className="text-white/30 text-xs mt-8 relative z-10">© 2026 Native Elite • All rights reserved</p>
    </div>
  );
};
