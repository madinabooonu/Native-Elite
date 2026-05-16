import React, { useState } from 'react';
import { AppButton } from '../components/UI';
import { UserRole } from '../types';

export const AuthPage = ({
  onAuthSuccess,
}: {
  initialMode?: 'login' | 'register';
  onAuthSuccess: (profile: any) => void;
}) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [role, setRole] = useState<UserRole>('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

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
            {mode === 'login' ? 'Welcome Back!' : 'Create Account'}
          </h1>
          <p className="text-white/70 text-sm relative z-10">
            {mode === 'login' ? 'Sign in to access your lessons.' : 'Register to start booking.'}
          </p>
        </div>

        <div className="flex-1 bg-brand-bg md:bg-white px-5 pt-6 pb-8">
          {/* Role Selector */}
          {mode === 'register' && (
            <div className="mb-6">
              <p className="text-sm font-bold text-brand-text mb-3">Select your role:</p>
              <div className="grid grid-cols-3 gap-3">
                {([
                  { id: 'student' as UserRole, label: 'Student', icon: '🎓' },
                  { id: 'teacher' as UserRole, label: 'Teacher', icon: '👩‍🏫' },
                  { id: 'admin' as UserRole, label: 'Admin', icon: '👑' },
                ]).map((r) => (
                  <button
                    key={r.id}
                    onClick={() => setRole(r.id)}
                    className={`p-4 rounded-xl border-2 text-center transition-all ${role === r.id
                      ? 'border-brand-blue bg-blue-50 text-brand-blue'
                      : 'border-gray-200 bg-white text-brand-text-light hover:border-brand-blue/30'
                      }`}
                  >
                    <div className="text-2xl mb-1">{r.icon}</div>
                    <div className="text-xs font-bold">{r.label}</div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Form */}
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onAuthSuccess(role); }}>
            {mode === 'register' && (
              <div>
                <label className="block text-sm font-bold text-brand-text mb-1.5">Full Name</label>
                <input type="text" placeholder="Enter your full name" className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 text-sm text-brand-text placeholder:text-gray-300 focus:outline-none focus:border-brand-blue transition-colors" required />
              </div>
            )}
            <div>
              <label className="block text-sm font-bold text-brand-text mb-1.5">Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 text-sm text-brand-text placeholder:text-gray-300 focus:outline-none focus:border-brand-blue transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-brand-text mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-white border-2 border-gray-200 rounded-xl py-3 px-4 text-sm text-brand-text placeholder:text-gray-300 focus:outline-none focus:border-brand-blue transition-colors"
                required
              />
            </div>
            <AppButton fullWidth className="py-3.5 text-base rounded-2xl mt-2">
              {mode === 'login' ? 'Sign In' : 'Create Account'}
            </AppButton>
          </form>

          {/* Google Login */}
          <div className="mt-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex-1 h-px bg-gray-200" />
              <span className="text-xs text-brand-text-light">or continue with</span>
              <div className="flex-1 h-px bg-gray-200" />
            </div>
            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => onAuthSuccess({ uid: 'sa1', email: 'admin@native.edu', displayName: 'Super Admin', role: 'super-admin' })}
                className="w-full flex items-center justify-center gap-3 bg-brand-navy text-white rounded-xl py-3 px-4 text-sm font-semibold hover:bg-brand-navy/90 transition-colors"
                type="button"
              >
                Sign in as Super Admin
              </button>
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => onAuthSuccess({ uid: 'a1', email: 'osiyo@native.edu', displayName: 'Admin Osiyo', role: 'admin', assignedTeacherId: 't2' })}
                  className="flex flex-col items-center gap-1 bg-white border-2 border-gray-200 rounded-xl py-2 px-3 text-xs font-bold text-brand-text hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  <span>Ms Osiyo</span>
                  <span className="text-[10px] font-medium text-brand-text-light opacity-60 italic">Admin Login</span>
                </button>
                <button
                  onClick={() => onAuthSuccess({ uid: 'a2', email: 'sarvar@native.edu', displayName: 'Admin Sarvar', role: 'admin', assignedTeacherId: 't3' })}
                  className="flex flex-col items-center gap-1 bg-white border-2 border-gray-200 rounded-xl py-2 px-3 text-xs font-bold text-brand-text hover:bg-gray-50 transition-colors"
                  type="button"
                >
                  <span>Mr Sarvar</span>
                  <span className="text-[10px] font-medium text-brand-text-light opacity-60 italic">Admin Login</span>
                </button>
              </div>
            </div>
          </div>

          {/* Toggle */}
          <div className="mt-8 text-center">
            <button
              onClick={() => setMode(mode === 'login' ? 'register' : 'login')}
              className="text-brand-blue text-sm font-semibold"
            >
              {mode === 'login' ? "Don't have an account? Register" : 'Already have an account? Sign In'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
