import React from 'react';
import { motion } from 'motion/react';
import { AppButton } from '../components/UI';

export const LandingPage = ({ onGetStarted }: { onGetStarted: () => void }) => {
  return (
    <div className="min-h-screen bg-brand-navy-deep">
      <div className="max-w-[480px] md:max-w-[520px] lg:max-w-[480px] mx-auto md:my-6 md:rounded-3xl md:overflow-hidden md:card-shadow-lg md:border md:border-brand-blue/30 relative">
        {/* Header */}
        <div className="status-gradient text-white px-6 pt-14 md:pt-12 pb-16 relative overflow-hidden md:rounded-t-3xl">
          <div className="absolute top-0 right-0 w-60 h-60 bg-brand-navy/5 rounded-full -mr-20 -mt-20 blur-3xl" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-brand-navy/5 rounded-full -ml-10 -mb-10 blur-3xl" />

          <div className="flex items-center gap-2 mb-10 relative z-10">
            <svg width="36" height="36" viewBox="0 0 100 100" fill="none">
              <path d="M25 75V25L75 75V25" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="square" strokeLinejoin="miter" />
            </svg>
            <span className="text-2xl font-bold tracking-tight">Native Elite</span>
          </div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-3xl md:text-4xl font-bold mb-3 leading-tight relative z-10"
          >
            Book Your<br />Support Session<br />In Seconds
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="text-white/70 text-sm leading-relaxed relative z-10"
          >
            Connect with expert teachers. Choose your time, confirm your slot, and start learning.
          </motion.p>
        </div>

        {/* Features */}
        <div className="px-5 -mt-8 space-y-3 relative z-10">
          {[
            { icon: '📅', title: 'Smart Scheduling', desc: 'Real-time availability across all teachers.' },
            { icon: '👩‍🏫', title: 'Choose Your Teacher', desc: 'Select Miss Osiyo or Mr Sarvar.' },
            { icon: '✅', title: 'Attendance Tracking', desc: 'Teachers verify your attendance each session.' },
          ].map((feat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="bg-brand-navy rounded-2xl card-shadow p-4 flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-xl bg-brand-blue/10 flex items-center justify-center text-xl flex-shrink-0">
                {feat.icon}
              </div>
              <div>
                <h3 className="text-sm font-bold text-white">{feat.title}</h3>
                <p className="text-xs text-brand-text-light mt-0.5">{feat.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
          className="px-5 py-10"
        >
          <AppButton fullWidth onClick={onGetStarted} className="py-4 text-base rounded-2xl shadow-lg">
            Get Started
          </AppButton>
          <p className="text-center text-xs text-brand-text-light mt-4">
            © 2026 Native Elite. All rights reserved.
          </p>
        </motion.div>
      </div>
    </div>
  );
};
