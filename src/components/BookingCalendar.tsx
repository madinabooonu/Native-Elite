import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, AppButton, InfoBanner } from './UI';
import { cn } from '../lib/utils';
import type { TimeSlot, BookingRecord } from '../types';

/* ── Teachers Data ── */
const TEACHERS = [
  {
    id: 't2',
    name: 'Miss Osiyo',
    role: 'Support Teacher',
    avatar: '👩‍🏫',
    color: 'from-purple-500 to-purple-700',
    bgLight: 'bg-purple-50',
    textColor: 'text-purple-700',
    borderColor: 'border-purple-500',
  },
  {
    id: 't3',
    name: 'Mr Sarvar',
    role: 'Support Teacher',
    avatar: '👨‍🎓',
    color: 'from-orange-500 to-orange-700',
    bgLight: 'bg-orange-50',
    textColor: 'text-orange-700',
    borderColor: 'border-orange-500',
  },
];

/* ── Helper: generate current week days ── */
function getCurrentWeekDays() {
  const now = new Date();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));

  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return {
      day: dayNames[i],
      date: d.getDate(),
      month: monthNames[d.getMonth()],
      fullDate: d.toISOString().split('T')[0],
      dayOfWeek: i,
    };
  });
}

/* ── Helper: Generate slots with proper fullDate ── */
function generateSlotsForTeacher(teacherId: string, weekDays: any[]) {
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const times = ['14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'];
  
  const slots: TimeSlot[] = [];
  
  if (teacherId === 't2') {
    // Miss Osiyo: Mon, Wed, Fri (14:00-19:30), Tue, Thu, Sat (12:00-19:30)
    ['Mon', 'Wed', 'Fri'].forEach(dayName => {
      const dayObj = weekDays.find(d => d.day === dayName);
      times.forEach((time, i) => {
        slots.push({
          id: `t2-${dayName}-${time}`,
          teacherId: 't2',
          teacherName: 'Miss Osiyo',
          day: dayName,
          dayDate: `${dayObj?.month} ${dayObj?.date}`,
          fullDate: dayObj?.fullDate || '',
          startTime: time,
          endTime: times[i + 1] || '20:00',
          maxStudents: 2,
          bookedStudents: 0,
          status: 'available' as const
        });
      });
    });
    
    // Tue, Thu, Sat with extended hours
    ['Tue', 'Thu', 'Sat'].forEach(dayName => {
      const dayObj = weekDays.find(d => d.day === dayName);
      const extendedTimes = ['12:00', '12:30', '13:00', '13:30', ...times];
      extendedTimes.forEach((time, i) => {
        slots.push({
          id: `t2-${dayName}-${time}`,
          teacherId: 't2',
          teacherName: 'Miss Osiyo',
          day: dayName,
          dayDate: `${dayObj?.month} ${dayObj?.date}`,
          fullDate: dayObj?.fullDate || '',
          startTime: time,
          endTime: extendedTimes[i + 1] || '20:00',
          maxStudents: 2,
          bookedStudents: 0,
          status: 'available' as const
        });
      });
    });
  } else if (teacherId === 't3') {
    // Mr Sarvar: All days 14:00-19:30
    dayNames.forEach(dayName => {
      const dayObj = weekDays.find(d => d.day === dayName);
      times.forEach((time, i) => {
        slots.push({
          id: `t3-${dayName}-${time}`,
          teacherId: 't3',
          teacherName: 'Mr Sarvar',
          day: dayName,
          dayDate: `${dayObj?.month} ${dayObj?.date}`,
          fullDate: dayObj?.fullDate || '',
          startTime: time,
          endTime: times[i + 1] || '20:00',
          maxStudents: 2,
          bookedStudents: 0,
          status: 'available' as const
        });
      });
    });
  }
  
  return slots;
}

export const BookingCalendar = ({
  onBookSlot,
  activeBooking,
  allBookings = [],
  userProfile,
}: {
  onBookSlot?: (slot: TimeSlot) => void;
  activeBooking?: BookingRecord | null;
  allBookings?: BookingRecord[];
  userProfile?: any;
}) => {
  const weekDays = useMemo(() => getCurrentWeekDays(), []);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = new Date().getDay() === 0 ? 6 : new Date().getDay() - 1;

  const [selectedTeacher, setSelectedTeacher] = useState<string | null>(null);
  const [selectedDay, setSelectedDay] = useState(dayNames[todayIndex]);
  const [selectedSlot, setSelectedSlot] = useState<TimeSlot | null>(null);
  const [showBookingForm, setShowBookingForm] = useState(false);

  const hasActiveBooking = !!activeBooking && (activeBooking.status === 'pending' || activeBooking.status === 'confirmed');

  // Generate slots dynamically with proper dates
  const allTeacherSlots = useMemo(() => {
    const t2Slots = generateSlotsForTeacher('t2', weekDays);
    const t3Slots = generateSlotsForTeacher('t3', weekDays);
    
    const updateSlotsWithBookings = (slots: TimeSlot[]) => {
      return slots.map(slot => {
        const activeBookingsForSlot = allBookings.filter(
          b => b.slotId === slot.id && 
               b.fullDate === slot.fullDate && 
               (b.status === 'confirmed' || b.status === 'pending')
        );
        const bookedCount = activeBookingsForSlot.length;
        const isFull = bookedCount >= slot.maxStudents;
        return {
          ...slot,
          bookedStudents: bookedCount,
          status: isFull ? 'full' as const : 'available' as const
        };
      });
    };

    return { 
      t2: updateSlotsWithBookings(t2Slots), 
      t3: updateSlotsWithBookings(t3Slots) 
    };
  }, [weekDays, allBookings]);

  const teacherSlots = selectedTeacher ? allTeacherSlots[selectedTeacher as 't2' | 't3'] || [] : [];
  const filteredSlots = teacherSlots.filter((s) => s.day === selectedDay);
  const currentTeacher = TEACHERS.find((t) => t.id === selectedTeacher);

  const isDayDisabled = (fullDate: string): boolean => {
    if (hasActiveBooking) return true;
    const today = new Date().toISOString().split('T')[0];
    return fullDate < today;
  };

  const handleSelectDay = (day: string, fullDate: string) => {
    if (isDayDisabled(fullDate)) return;
    setSelectedDay(day);
    setSelectedSlot(null);
  };

  const handleSelectSlot = (slot: TimeSlot) => {
    if (slot.status === 'full' || hasActiveBooking) return;
    setSelectedSlot(slot);
    setShowBookingForm(true);
  };

  return (
    <div className="flex flex-col min-h-0">
      {hasActiveBooking && (
        <div className="px-4 md:px-6 pt-4 text-center">
          <InfoBanner>
            You have an active booking with {activeBooking?.teacherName}.
          </InfoBanner>
        </div>
      )}

      {/* ── Step 1: Teacher Selection ── */}
      <div className={cn("px-4 md:px-6 pt-4 md:pt-6", hasActiveBooking && "opacity-50 pointer-events-none")}>
        <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
          <span className="w-6 h-6 rounded-full bg-brand-blue text-white text-xs flex items-center justify-center font-bold">1</span>
          Select Teacher
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {TEACHERS.map((teacher) => {
            const isSelected = selectedTeacher === teacher.id;
            return (
              <motion.button
                key={teacher.id}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  setSelectedTeacher(teacher.id);
                  setSelectedSlot(null);
                }}
                className={cn(
                  'teacher-card relative p-4 md:p-5 rounded-2xl border-2 text-left',
                  isSelected
                    ? `${teacher.borderColor} bg-brand-navy shadow-lg`
                    : 'border-brand-blue/30 bg-brand-navy hover:border-gray-300'
                )}
              >
                <div className={cn(
                  'w-10 h-10 rounded-xl flex items-center justify-center text-xl mb-3',
                  isSelected ? `bg-gradient-to-br ${teacher.color} text-white` : teacher.bgLight
                )}>
                  {teacher.avatar}
                </div>
                <h4 className={cn('text-sm font-bold', isSelected ? teacher.textColor : 'text-white')}>{teacher.name}</h4>
                <p className="text-[10px] text-brand-text-light">{teacher.role}</p>
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* ── Step 2: Day Selection ── */}
      {selectedTeacher && (
        <div className="px-4 md:px-6 mt-6">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-blue text-white text-xs flex items-center justify-center font-bold">2</span>
            Select Day
          </h3>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {weekDays.map((wd) => {
              const isSelected = selectedDay === wd.day;
              const disabled = isDayDisabled(wd.fullDate);
              return (
                <button
                  key={wd.day}
                  disabled={disabled}
                  onClick={() => handleSelectDay(wd.day, wd.fullDate)}
                  className={cn(
                    'flex flex-col items-center min-w-[60px] py-3 rounded-xl border-2 transition-all',
                    disabled ? 'opacity-40 cursor-not-allowed bg-gray-50 border-transparent text-brand-text-light hover:text-white' :
                      isSelected
                        ? 'bg-brand-blue border-brand-blue text-white shadow-md'
                        : 'border-brand-blue/30 bg-brand-navy text-white hover:border-gray-300'
                  )}
                >
                  <span className="text-[10px] font-bold uppercase">{wd.day}</span>
                  <span className="text-lg font-bold">{wd.date}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Step 3: Slots ── */}
      {selectedTeacher && (
        <div className="flex-1 overflow-y-auto px-4 md:px-6 mt-4 pb-12">
          <h3 className="text-sm font-bold text-white mb-3 flex items-center gap-2">
            <span className="w-6 h-6 rounded-full bg-brand-blue text-white text-xs flex items-center justify-center font-bold">3</span>
            Available Slots
          </h3>
          <div className="space-y-3">
            {filteredSlots.length === 0 ? (
              <p className="text-center py-6 text-brand-text-light text-sm">No slots available for this day.</p>
            ) : (
              filteredSlots.map((slot) => {
                const isFull = slot.status === 'full';
                const disabled = isFull || hasActiveBooking;
                return (
                  <div
                    key={slot.id}
                    className={cn(
                      'bg-brand-navy rounded-2xl p-4 flex items-center justify-between border-2 cursor-pointer transition-all',
                      disabled ? 'opacity-50 cursor-not-allowed border-brand-blue/30' : 'border-transparent hover:border-brand-blue/20 card-shadow'
                    )}
                    onClick={() => !disabled && handleSelectSlot(slot)}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-brand-blue/10 flex items-center justify-center text-brand-blue">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{slot.startTime} - {slot.endTime}</p>
                        <p className="text-[11px] text-brand-text-light">{slot.teacherName}</p>
                      </div>
                    </div>
                    <span className={cn('text-[11px] font-bold px-2 py-1 rounded-full', isFull ? 'bg-red-50 text-red-600' : 'bg-green-50 text-green-600')}>
                      {isFull ? 'Full' : 'Available'}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Booking Modal */}
      <AnimatePresence>
        {showBookingForm && selectedSlot && (
          <BookingFormModal
            slot={selectedSlot}
            teacher={currentTeacher}
            userProfile={userProfile}
            onClose={() => {
              setShowBookingForm(false);
              setSelectedSlot(null);
            }}
            onConfirm={() => {
              if (onBookSlot) onBookSlot(selectedSlot);
              setShowBookingForm(false);
              setSelectedSlot(null);
            }}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

const BookingFormModal = ({ slot, teacher, userProfile, onClose, onConfirm }: any) => {
  const [fullName, setFullName] = useState(userProfile?.displayName || '');
  const [stage, setStage] = useState(userProfile?.stage ? (userProfile.stage.startsWith('stage') ? 'Stage ' + userProfile.stage.slice(-1) : userProfile.stage) : '');
  const [mainTeacher, setMainTeacher] = useState(slot.teacherName || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (!fullName.trim()) return;
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1200));
    setSuccess(true);
    setTimeout(() => onConfirm(), 1500);
  };

  return (
    <motion.div className="fixed inset-0 z-[100] flex items-end md:items-center md:justify-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <div className="absolute inset-0 bg-navy-900/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div
        className="relative w-full md:w-[460px] bg-brand-navy rounded-t-[32px] md:rounded-[40px] overflow-hidden flex flex-col shadow-2xl"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
      >
        {/* Navy Header Section */}
        <div className="bg-[#031A3D] px-8 pt-10 pb-20 text-center relative">
          <h2 className="text-2xl font-bold text-white mb-2">Book Your Lesson</h2>
          <p className="text-white/70 text-sm">Fill in your details to confirm your booking.</p>
        </div>

        {/* Form Body - Overlapping the header slightly */}
        <div className="px-6 pb-8 -mt-12 relative z-10 space-y-6">
          {/* Summary Card */}
          <div className="bg-brand-navy rounded-[24px] p-5 shadow-xl shadow-blue-900/5 border border-blue-50 flex items-center gap-5">
            <div className="w-16 h-16 rounded-full bg-brand-blue/10 border-4 border-white flex items-center justify-center text-brand-blue shadow-inner">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" /></svg>
            </div>
            <div className="flex-1">
              <h4 className="text-base font-bold text-white mb-0.5">{slot.day === 'Mon' ? 'Monday' : slot.day === 'Tue' ? 'Tuesday' : slot.day === 'Wed' ? 'Wednesday' : slot.day === 'Thu' ? 'Thursday' : slot.day === 'Fri' ? 'Friday' : slot.day === 'Sat' ? 'Saturday' : 'Sunday'}</h4>
              <p className="text-sm font-bold text-white mb-1">{slot.startTime} - {slot.endTime}</p>
              <div className="flex items-center justify-between">
                <p className="text-xs text-brand-blue font-semibold">Teacher: {slot.teacherName}</p>
                <span className="text-[10px] bg-green-50 text-green-600 px-2 py-0.5 rounded-full font-bold">Available</span>
              </div>
            </div>
          </div>

          {success ? (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-4 text-green-500 scale-125">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3"><polyline points="20 6 9 17 4 12" /></svg>
              </div>
              <p className="text-brand-green font-extrabold text-xl">Booking Confirmed!</p>
              <p className="text-sm text-gray-500 mt-2">Redirecting to your schedule...</p>
            </div>
          ) : (
            <div className="space-y-4 pt-2">
              <FormField
                label="Full Name"
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                value={fullName}
                onChange={setFullName}
                placeholder="Enter your full name"
              />
              <FormField
                label="Stage"
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 10v6M2 10l10-5 10 5-10 5z" /><path d="M6 12v5c3 3 9 3 12 0v-5" /></svg>}
                value={stage}
                onChange={setStage}
                placeholder="Enter your stage"
              />
              <FormField
                label="Teacher Name"
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>}
                value={mainTeacher}
                onChange={setMainTeacher}
                placeholder="Enter teacher name"
              />

              <div className="space-y-3 pt-6">
                <button
                  onClick={handleSubmit}
                  disabled={!fullName.trim() || isSubmitting}
                  className={cn(
                    "w-full h-14 rounded-2xl bg-[#0051C4] text-white font-bold flex items-center justify-center gap-3 shadow-lg shadow-blue-500/20 active:scale-[0.98] transition-all",
                    (!fullName.trim() || isSubmitting) && "opacity-60 pointer-events-none"
                  )}
                >
                  <div className="w-6 h-6 rounded-full border-2 border-white/30 flex items-center justify-center">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><polyline points="20 6 9 17 4 12" /></svg>
                  </div>
                  {isSubmitting ? 'Confirming...' : 'Confirm Booking'}
                </button>

                <button
                  onClick={onClose}
                  className="w-full h-14 rounded-2xl bg-brand-navy border-2 border-blue-100 text-blue-900 font-bold flex items-center justify-center gap-3 active:bg-gray-50 transition-all"
                >
                  <div className="w-6 h-6 rounded-full border-2 border-blue-200 flex items-center justify-center text-blue-400">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="4"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>
                  </div>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

const FormField = ({ label, icon, value, onChange, placeholder }: any) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-bold text-white">{label}</label>
    <div className="relative group">
      <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-text-light hover:text-white group-focus-within:text-brand-blue transition-colors">
        {icon}
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full border-2 border-brand-blue/30 rounded-2xl py-3.5 pl-12 pr-4 bg-gray-50/30 focus:outline-none focus:border-brand-blue focus:bg-brand-navy transition-all text-sm font-medium"
      />
    </div>
  </div>
);
