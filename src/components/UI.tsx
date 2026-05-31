import React from 'react';
import { cn } from '../lib/utils';

/* ── Reusable Button ── */
export const AppButton = ({
  children,
  variant = 'primary',
  className,
  onClick,
  disabled,
  fullWidth = false,
}: {
  children: React.ReactNode;
  variant?: 'primary' | 'outline' | 'ghost' | 'danger';
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  fullWidth?: boolean;
}) => {
  const base =
    'inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-200 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none';

  const variants: Record<string, string> = {
    primary: 'bg-brand-blue text-white shadow-md hover:bg-brand-blue-mid',
    outline: 'border-2 border-brand-blue text-brand-blue bg-transparent hover:bg-brand-blue/5',
    ghost: 'text-brand-text-light hover:bg-brand-navy',
    danger: 'bg-brand-red text-white hover:bg-red-700',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={cn(base, variants[variant], 'btn-lift', fullWidth && 'w-full', 'px-5 py-3 text-sm', className)}
    >
      {children}
    </button>
  );
};

/* ── White Card ── */
export const Card = ({
  children,
  className,
  ...props
}: {
  children: React.ReactNode;
  className?: string;
} & React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('bg-brand-navy rounded-2xl card-shadow glass overflow-hidden', className)} {...props}>
    {children}
  </div>
);

/* ── Top Header for mobile ── */
export const MobileHeader = ({
  title,
  subtitle,
  rightContent,
  onBack,
  avatarUrl,
}: {
  title: string;
  subtitle?: string;
  rightContent?: React.ReactNode;
  onBack?: () => void;
  avatarUrl?: string;
}) => (
  <div className="status-gradient text-white px-5 pt-12 pb-6 safe-top">
    <div className="flex items-center justify-between mb-4">
      <div className="flex items-center gap-3">
        {onBack && (
          <button onClick={onBack} className="p-1 -ml-1">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>
        )}
        <div className="flex items-center gap-2">
          <svg width="28" height="28" viewBox="0 0 100 100" fill="none">
            <path d="M25 75V25L75 75V25" stroke="#FFFFFF" strokeWidth="15" strokeLinecap="square" strokeLinejoin="miter" />
          </svg>
          <span className="text-lg font-bold tracking-tight">Native Elite</span>
        </div>
      </div>
      <div className="flex items-center gap-3">
        {rightContent}
        <button className="relative p-1">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
            <path d="M13.73 21a2 2 0 0 1-3.46 0" />
          </svg>
          <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-brand-red rounded-full border-2 border-brand-navy" />
        </button>
        {avatarUrl ? (
          <img src={avatarUrl} alt="" className="w-9 h-9 rounded-full object-cover border-2 border-white/30" />
        ) : (
          <div className="w-9 h-9 rounded-full bg-brand-navy/20 flex items-center justify-center">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </div>
        )}
      </div>
    </div>
    {(title || subtitle) && (
      <div>
        <h1 className="text-xl font-bold">{title}</h1>
        {subtitle && <p className="text-white/70 text-sm mt-0.5">{subtitle}</p>}
      </div>
    )}
  </div>
);

/* ── Bottom Navigation ── */
export const BottomNav = ({
  activeTab,
  setActiveTab,
  tabs,
}: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  tabs: { id: string; label: string; icon: React.ReactNode }[];
}) => (
  <nav className="fixed bottom-0 left-0 right-0 bg-brand-navy bottom-nav-shadow z-50 safe-bottom">
    <div className="flex items-center justify-around px-2 py-2 max-w-lg mx-auto">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            'flex flex-col items-center gap-1 py-1.5 px-3 rounded-xl transition-all duration-200 min-w-[56px]',
            activeTab === tab.id
              ? 'text-brand-blue'
              : 'text-brand-text-light hover:text-white'
          )}
        >
          <div className={cn(
            'transition-all duration-200',
            activeTab === tab.id && 'scale-110'
          )}>
            {tab.icon}
          </div>
          <span className={cn(
            'text-[10px] font-medium',
            activeTab === tab.id && 'font-bold'
          )}>
            {tab.label}
          </span>
        </button>
      ))}
    </div>
  </nav>
);

/* ── Tab Bar (Schedule / My Bookings / Profile) ── */
export const TabBar = ({
  tabs,
  activeTab,
  setActiveTab,
}: {
  tabs: { id: string; label: string; icon?: React.ReactNode }[];
  activeTab: string;
  setActiveTab: (tab: string) => void;
}) => (
  <div className="flex gap-2 px-5 py-3">
    {tabs.map((tab) => (
      <button
        key={tab.id}
        onClick={() => setActiveTab(tab.id)}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200',
          activeTab === tab.id
            ? 'bg-brand-blue text-white shadow-md'
            : 'bg-brand-navy text-brand-text-light hover:bg-gray-50'
        )}
      >
        {tab.icon}
        {tab.label}
      </button>
    ))}
  </div>
);

/* ── Info Banner ── */
export const InfoBanner = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('flex items-start gap-3 bg-brand-blue/10 border border-blue-100 rounded-xl p-3 mx-5 mt-3', className)}>
    <div className="w-5 h-5 rounded-full bg-brand-blue flex items-center justify-center flex-shrink-0 mt-0.5">
      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="16" x2="12" y2="12" />
        <line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    </div>
    <p className="text-xs text-brand-blue leading-relaxed font-medium">{children}</p>
  </div>
);
