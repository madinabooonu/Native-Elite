import React, { useState } from 'react';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile
} from 'firebase/auth';
import { auth } from '../lib/firebase';
import { SUPER_ADMIN_EMAILS, ADMIN_EMAILS, ADMIN_TEACHER_MAP } from '../lib/constants';
import { AppButton } from '../components/UI';
import { UserRole, UserProfile } from '../types';

export const AuthPage = ({
  onAuthSuccess,
}: {
  initialMode?: 'login' | 'register';
  onAuthSuccess: (profile: UserProfile) => void;
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [phoneNumber, setPhoneNumber] = useState(localStorage.getItem('savedPhone') || '');
  const [fullName, setFullName] = useState('');
  const [needsRegistration, setNeedsRegistration] = useState(false);

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
      displayName: user.displayName || fullName || 'User',
      role: role,
      assignedTeacherId: assignedTeacherId,
      avatarUrl: user.photoURL || undefined,
    };
  };



  const handleEmailAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const cleanPhone = phoneNumber.replace(/[^0-9]/g, '');
    if (cleanPhone.length < 9) {
      setError("Iltimos, to'g'ri telefon raqam kiriting (kamida 9 ta raqam).");
      setIsLoading(false);
      return;
    }

    const pseudoEmail = `${cleanPhone}@native.edu`;
    const defaultPassword = 'NativeAuth2026!';

    if (needsRegistration) {
      if (!fullName) {
        setError("Please enter your full name!");
        setIsLoading(false);
        return;
      }
      try {
        const result = await createUserWithEmailAndPassword(auth, pseudoEmail, defaultPassword);
        await updateProfile(result.user, { displayName: fullName });
        localStorage.setItem('savedPhone', phoneNumber);
        onAuthSuccess(getProfileFromUser(result.user));
      } catch (err: any) {
        setError(err.message || 'Error occurred during registration.');
      } finally {
        setIsLoading(false);
      }
      return;
    }

    try {
      const result = await signInWithEmailAndPassword(auth, pseudoEmail, defaultPassword);
      localStorage.setItem('savedPhone', phoneNumber);
      onAuthSuccess(getProfileFromUser(result.user));
    } catch (err: any) {
      console.error('Auth error:', err);
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password' || err.code === 'auth/invalid-credential') {
        setNeedsRegistration(true);
        setError("Phone number not found. Please enter your name to sign up.");
      } else {
        setError(err.message || 'An error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-brand-bg">
      <div className="max-w-[480px] md:max-w-[520px] lg:max-w-[480px] mx-auto md:my-6 md:rounded-3xl md:overflow-hidden md:card-shadow-lg md:border md:border-gray-200/60 flex flex-col min-h-screen md:min-h-0">
        {/* Header */}
        <div className="status-gradient text-white px-6 pt-14 md:pt-10 pb-8 md:rounded-t-3xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/5 rounded-full -mr-10 -mt-10 blur-3xl" />
          <div className="flex items-center gap-2 mb-6 relative z-10">
            <svg width="32" height="32" viewBox="0 0 100 100" fill="none">
              <path d="M25 75V25L75 75V25" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
            <span className="text-xl font-bold tracking-tight">Native Elite</span>
          </div>
          <h1 className="text-2xl font-bold mb-1 relative z-10">
            {needsRegistration ? "Sign Up" : "Sign In"}
          </h1>
          <p className="text-white/70 text-sm relative z-10">
            {needsRegistration ? "Enter your name to join the platform." : "Enter your phone number to access your profile."}
          </p>
        </div>

        <div className="flex-1 bg-brand-bg md:bg-white px-6 md:px-8 py-8">
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleEmailAuth} className="space-y-4 mb-8">
            {needsRegistration && (
              <div>
                <label className="block text-sm font-bold text-brand-text mb-1.5">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your full name"
                  className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 text-sm text-brand-text placeholder:text-gray-300 focus:outline-none focus:border-brand-blue transition-colors"
                  required
                />
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-brand-text mb-1.5">Phone Number</label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => { setPhoneNumber(e.target.value); setNeedsRegistration(false); setError(null); }}
                placeholder="+998 90 123 45 67"
                className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 text-sm text-brand-text placeholder:text-gray-300 focus:outline-none focus:border-brand-blue transition-colors"
                required
              />
            </div>

            <AppButton fullWidth disabled={isLoading} className="py-3.5 text-base rounded-2xl mt-2">
              {isLoading ? 'Processing...' : (needsRegistration ? "Sign Up" : "Sign In")}
            </AppButton>
          </form>

          {/* Optional fallback, but dynamic logic helps */}
          {needsRegistration && (
            <div className="mt-8 text-center">
              <button
                type="button"
                onClick={() => { setNeedsRegistration(false); setError(null); }}
                className="text-brand-blue text-sm font-semibold hover:underline"
              >
                Go back (enter a different number)
              </button>
            </div>
          )}

          {(import.meta as any).env?.DEV && (
            <div className="mt-10 pt-6 border-t border-gray-200">
              <p className="text-xs font-bold text-gray-400 mb-3 text-center uppercase tracking-wider">Test Mode (Dev Only)</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => onAuthSuccess({ uid: 'test-student', email: 'student@test.com', displayName: 'Test Student', role: 'student' })}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                >
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => onAuthSuccess({ uid: 'test-admin', email: ADMIN_EMAILS[0], displayName: 'Test Admin', role: 'admin', assignedTeacherId: 't2' })}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg transition-colors"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => onAuthSuccess({ uid: 'test-super', email: SUPER_ADMIN_EMAILS[0], displayName: 'Test Super Admin', role: 'super-admin' })}
                  className="bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-semibold py-2 px-3 rounded-lg col-span-2 transition-colors"
                >
                  Super Admin
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
