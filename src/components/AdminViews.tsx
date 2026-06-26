import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, AppButton } from './UI';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import {
  collection, getDocs, addDoc, doc, setDoc, updateDoc,
  serverTimestamp, query, where, orderBy, onSnapshot, Timestamp
} from 'firebase/firestore';
import type { BookingRecord, UserProfile, AttendanceRecord, ScoreRecord, HomeworkAssignment, PaymentRecord } from '../types';
import type { UserRole } from '../types';

/* ── Tab types ── */
type AdminTab = 'overview' | 'users' | 'attendance' | 'scores' | 'homework';

/* ═══════════════════════════════════════════
   ADMIN DASHBOARD
═══════════════════════════════════════════ */
export const AdminDashboard = ({
  user,
  allBookings = [],
  setAllBookings,
}: {
  user: UserProfile,
  allBookings?: BookingRecord[],
  setAllBookings?: (bookings: BookingRecord[]) => void,
  key?: any
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');

  const isAdminOrTeacher = ['super-admin', 'admin', 'teacher'].includes(user.role);

  const tabs = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: '📊' },
    ...(isAdminOrTeacher ? [{ id: 'users' as AdminTab, label: 'Users', icon: '👥' }] : []),
    { id: 'attendance' as AdminTab, label: 'Attendance', icon: '✅' },
    { id: 'scores' as AdminTab, label: 'Scores', icon: '⭐' },
    { id: 'homework' as AdminTab, label: 'Homework', icon: '📚' },
  ];

  return (
    <div className="min-h-screen pb-24" style={{ background: 'var(--theme-bg)' }}>
      {/* Tab nav */}
      <div className="flex gap-2 px-4 py-3 overflow-x-auto hide-scrollbar">
        {tabs.map(t => (
          <button
            key={t.id}
            onClick={() => setActiveTab(t.id)}
            className={cn(
              'flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all',
              activeTab === t.id
                ? 'bg-blue-600 text-white shadow-lg'
                : 'bg-[var(--theme-card)] text-[var(--theme-text-muted)] border border-[var(--theme-border)]'
            )}
          >
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'overview' && <OverviewTab user={user} allBookings={allBookings} />}
          {activeTab === 'users' && isAdminOrTeacher && <UsersTab currentUser={user} />}
          {activeTab === 'attendance' && <AttendanceTab teacher={user} />}
          {activeTab === 'scores' && <ScoresTab teacher={user} />}
          {activeTab === 'homework' && <HomeworkTab teacher={user} />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

/* ─── Overview Tab ─── */
const OverviewTab = ({ user, allBookings }: { user: UserProfile; allBookings: BookingRecord[] }) => {
  const [totalIncome, setTotalIncome] = useState(0);

  useEffect(() => {
    const q = query(collection(db, 'payments'));
    const unsub = onSnapshot(q, (snap) => {
      const sum = snap.docs.reduce((acc, d) => acc + (Number(d.data().amount) || 0), 0);
      setTotalIncome(sum);
    }, (err) => console.error('Error fetching payments:', err));
    return () => unsub();
  }, []);

  const stats = [
    { label: 'Total Bookings', value: allBookings.length, color: '#3B82F6', icon: '📅' },
    { label: 'Total Revenue', value: `${totalIncome.toLocaleString('en-US')} UZS`, color: '#10B981', icon: '💰' },
    { label: 'Attended', value: allBookings.filter(b => b.status === 'attended').length, color: '#8B5CF6', icon: '🎓' },
    { label: 'Pending', value: allBookings.filter(b => b.status === 'pending').length, color: '#F59E0B', icon: '⏳' },
  ];

  const updateBookingStatus = async (id: string, status: BookingRecord['status']) => {
    try {
      await updateDoc(doc(db, 'bookings', id), { status });
    } catch (err) {
      console.error('Error updating booking status:', err);
    }
  };

  return (
    <div className="px-4 space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map(s => (
          <div key={s.label} className="bg-[var(--theme-card)] rounded-2xl p-4 border border-[var(--theme-border)]">
            <div className="text-2xl mb-2">{s.icon}</div>
            <div className="text-2xl font-black" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs text-[var(--theme-text-muted)] mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Bookings List */}
      <div className="bg-[var(--theme-card)] rounded-2xl p-4 border border-[var(--theme-border)] space-y-3">
        <h3 className="font-bold text-sm text-[var(--theme-text)] flex items-center justify-between">
          <span>Class Booking List</span>
          <span className="text-[11px] font-normal text-[var(--theme-text-muted)]">Total: {allBookings.length}</span>
        </h3>

        {allBookings.length === 0 ? (
          <p className="text-center py-6 text-[var(--theme-text-muted)] text-xs">No classes booked yet.</p>
        ) : (
          <div className="space-y-3 max-h-96 overflow-y-auto pr-1 hide-scrollbar">
            {allBookings.map((b) => (
              <div key={b.id} className="p-3 bg-[var(--theme-bg)] rounded-xl border border-[var(--theme-border)] space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-xs font-bold text-[var(--theme-text)]">{b.studentName}</p>
                    <p className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">Stage: {b.studentStage || 'N/A'}</p>
                  </div>
                  <span className={cn(
                    'text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-tighter',
                    b.status === 'confirmed' && 'bg-green-500/15 text-green-500',
                    b.status === 'pending' && 'bg-orange-500/15 text-orange-500',
                    b.status === 'attended' && 'bg-blue-500/15 text-blue-500',
                    (b.status === 'cancelled' || b.status === 'absent') && 'bg-red-500/15 text-red-500'
                  )}>
                    {b.status}
                  </span>
                </div>
                
                <div className="flex justify-between items-center text-[11px] text-[var(--theme-text-muted)] pt-1 border-t border-[var(--theme-border-light)]">
                  <p>📅 {b.day}, {b.dayDate} • {b.startTime}-{b.endTime}</p>
                  <p className="font-semibold text-blue-500">Teacher: {b.teacherName}</p>
                </div>

                {/* Status action buttons */}
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <div className="flex gap-2 pt-1">
                    {b.status === 'pending' && (
                      <button
                        onClick={() => updateBookingStatus(b.id, 'confirmed')}
                        className="flex-1 py-1 px-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Confirm ✓
                      </button>
                    )}
                    {b.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(b.id, 'attended')}
                          className="flex-1 py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Attended 🎓
                        </button>
                        <button
                          onClick={() => updateBookingStatus(b.id, 'absent')}
                          className="flex-1 py-1 px-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Absent ✗
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => updateBookingStatus(b.id, 'cancelled')}
                      className="py-1 px-2.5 border border-red-500/40 hover:bg-red-500/5 text-red-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    >
                      Cancel Booking
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[var(--theme-card)] rounded-2xl p-4 border border-[var(--theme-border)]">
        <h3 className="font-bold text-[var(--theme-text)] mb-1">Welcome, {user.displayName}!</h3>
        <p className="text-sm text-[var(--theme-text-muted)]">
          You logged in as {user.role === 'super-admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Teacher'}.
          Please select a section from the tabs above.
        </p>
      </div>
    </div>
  );
};

/* ─── Student Details Modal ─── */
const StudentDetailsModal = ({
  student,
  currentUser,
  onClose
}: {
  student: UserProfile;
  currentUser: UserProfile;
  onClose: () => void;
}) => {
  const [activeTab, setActiveTab] = useState<'activity' | 'bookings' | 'payments' | 'homework'>('activity');

  // Datasets states
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [payments, setPayments] = useState<PaymentRecord[]>([]);
  const [attendance, setAttendance] = useState<AttendanceRecord[]>([]);
  const [scores, setScores] = useState<ScoreRecord[]>([]);
  const [homeworks, setHomeworks] = useState<HomeworkAssignment[]>([]);

  // Form states
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentNote, setPaymentNote] = useState('');
  const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSubmittingPayment, setIsSubmittingPayment] = useState(false);

  const [hwTitle, setHwTitle] = useState('');
  const [hwDesc, setHwDesc] = useState('');
  const [hwDeadline, setHwDeadline] = useState('');
  const [isSubmittingHw, setIsSubmittingHw] = useState(false);

  const [newScore, setNewScore] = useState('');
  const [newMaxScore, setNewMaxScore] = useState('10');
  const [newScoreNote, setNewScoreNote] = useState('');
  const [isSubmittingScore, setIsSubmittingScore] = useState(false);

  const [attStatus, setAttStatus] = useState<'present' | 'absent'>('present');
  const [attNote, setAttNote] = useState('');
  const [isSubmittingAtt, setIsSubmittingAtt] = useState(false);

  // Sync details in real-time
  useEffect(() => {
    // 1. Bookings
    const qBookings = query(
      collection(db, 'bookings'),
      where('studentId', '==', student.uid),
      orderBy('createdAt', 'desc')
    );
    const unsubBookings = onSnapshot(qBookings, snap => {
      setBookings(snap.docs.map(d => ({ id: d.id, ...d.data() } as BookingRecord)));
    });

    // 2. Payments
    const qPayments = query(
      collection(db, 'payments'),
      where('studentId', '==', student.uid),
      orderBy('date', 'desc')
    );
    const unsubPayments = onSnapshot(qPayments, snap => {
      setPayments(snap.docs.map(d => ({ id: d.id, ...d.data() } as PaymentRecord)));
    });

    // 3. Attendance
    const qAtt = query(
      collection(db, 'attendance'),
      where('studentId', '==', student.uid),
      orderBy('date', 'desc')
    );
    const unsubAtt = onSnapshot(qAtt, snap => {
      setAttendance(snap.docs.map(d => ({ id: d.id, ...d.data() } as AttendanceRecord)));
    });

    // 4. Scores
    const qScores = query(
      collection(db, 'scores'),
      where('studentId', '==', student.uid),
      orderBy('date', 'desc')
    );
    const unsubScores = onSnapshot(qScores, snap => {
      setScores(snap.docs.map(d => ({ id: d.id, ...d.data() } as ScoreRecord)));
    });

    // 5. Homework
    const qHw = query(
      collection(db, 'homework'),
      orderBy('createdAt', 'desc')
    );
    const unsubHw = onSnapshot(qHw, snap => {
      const all = snap.docs.map(d => ({ id: d.id, ...d.data() } as HomeworkAssignment));
      setHomeworks(all.filter(h => h.studentId === student.uid || !h.studentId || h.studentId === 'all'));
    });

    return () => {
      unsubBookings();
      unsubPayments();
      unsubAtt();
      unsubScores();
      unsubHw();
    };
  }, [student.uid]);

  const totalPaid = payments.reduce((acc, p) => acc + (Number(p.amount) || 0), 0);

  const handleAddPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount) return;
    setIsSubmittingPayment(true);
    try {
      const id = `pay_${Date.now()}`;
      await setDoc(doc(db, 'payments', id), {
        studentId: student.uid,
        studentName: student.displayName,
        amount: Number(paymentAmount),
        note: paymentNote.trim(),
        date: paymentDate,
        teacherId: currentUser.uid,
        teacherName: currentUser.displayName,
        createdAt: serverTimestamp()
      });
      setPaymentAmount('');
      setPaymentNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingPayment(false);
    }
  };

  const handleAssignHomework = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hwTitle) return;
    setIsSubmittingHw(true);
    try {
      await addDoc(collection(db, 'homework'), {
        teacherId: currentUser.uid,
        teacherName: currentUser.displayName,
        studentId: student.uid,
        studentName: student.displayName,
        title: hwTitle.trim(),
        description: hwDesc.trim(),
        deadline: hwDeadline,
        submissions: [],
        createdAt: serverTimestamp(),
      });
      setHwTitle('');
      setHwDesc('');
      setHwDeadline('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingHw(false);
    }
  };

  const handleGiveScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newScore) return;
    setIsSubmittingScore(true);
    try {
      await addDoc(collection(db, 'scores'), {
        studentId: student.uid,
        studentName: student.displayName,
        teacherId: currentUser.uid,
        teacherName: currentUser.displayName,
        score: Number(newScore),
        maxScore: Number(newMaxScore),
        note: newScoreNote.trim(),
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'users', student.uid), {
        score: (student.score || 0) + Number(newScore),
        totalScore: (student.totalScore || 0) + Number(newMaxScore),
      });

      setNewScore('');
      setNewScoreNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingScore(false);
    }
  };

  const handleMarkAttendance = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingAtt(true);
    try {
      await addDoc(collection(db, 'attendance'), {
        studentId: student.uid,
        studentName: student.displayName,
        teacherId: currentUser.uid,
        teacherName: currentUser.displayName,
        date: new Date().toISOString().split('T')[0],
        status: attStatus,
        note: attNote.trim(),
        createdAt: serverTimestamp(),
      });

      await updateDoc(doc(db, 'users', student.uid), {
        attendanceCount: (student.attendanceCount || 0) + (attStatus === 'present' ? 1 : 0),
      });

      setAttNote('');
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmittingAtt(false);
    }
  };

  const isToday = (dateStr: string) => {
    if (!dateStr) return false;
    const d = new Date(dateStr);
    const today = new Date();
    return d.getDate() === today.getDate() &&
           d.getMonth() === today.getMonth() &&
           d.getFullYear() === today.getFullYear();
  };

  const activityTimeline = useMemo(() => {
    const items: Array<{
      id: string;
      type: 'score' | 'attendance';
      date: string;
      title: string;
      subtitle: string;
      meta?: string;
      isToday: boolean;
    }> = [];

    scores.forEach(s => {
      items.push({
        id: s.id,
        type: 'score',
        date: s.date,
        title: `⭐ Points awarded: ${s.score}/${s.maxScore}`,
        subtitle: s.note ? `Note: "${s.note}"` : 'No note',
        meta: `Teacher: ${s.teacherName}`,
        isToday: isToday(s.date)
      });
    });

    attendance.forEach(a => {
      items.push({
        id: a.id,
        type: 'attendance',
        date: a.date,
        title: a.status === 'present' ? '✅ Attendance: Present' : '✗ Attendance: Absent',
        subtitle: a.note ? `Note: "${a.note}"` : 'No note',
        meta: `Date: ${a.date}`,
        isToday: isToday(a.date)
      });
    });

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [scores, attendance]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-end justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-[var(--theme-card)] rounded-t-3xl w-full max-w-[480px] p-6 max-h-[85vh] overflow-y-auto flex flex-col hide-scrollbar"
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4 flex-shrink-0">
          <div>
            <h3 className="text-base font-black text-[var(--theme-text)]">{student.displayName}</h3>
            <p className="text-xs text-[var(--theme-text-muted)]">@{student.username} • {student.stage || 'Stage 1'}</p>
          </div>
          <button onClick={onClose} className="text-[var(--theme-text-muted)] p-1">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {/* Short stats strip */}
        <div className="grid grid-cols-3 gap-2 bg-[var(--theme-bg)] rounded-2xl p-3 mb-4 text-center border border-[var(--theme-border)] flex-shrink-0">
          <div>
            <p className="text-[9px] text-[var(--theme-text-muted)] uppercase font-bold tracking-wider">Score</p>
            <p className="text-xs font-bold text-blue-500">{student.score || 0}/{student.totalScore || 0}</p>
          </div>
          <div>
            <p className="text-[9px] text-[var(--theme-text-muted)] uppercase font-bold tracking-wider">Classes</p>
            <p className="text-xs font-bold text-purple-500">{bookings.length}</p>
          </div>
          <div>
            <p className="text-[9px] text-[var(--theme-text-muted)] uppercase font-bold tracking-wider">Attendance</p>
            <p className="text-xs font-bold text-green-500">{student.attendanceCount || 0}</p>
          </div>
        </div>

        {/* Modal tabs */}
        <div className="flex gap-1 border-b border-[var(--theme-border)] pb-2 mb-4 overflow-x-auto hide-scrollbar flex-shrink-0">
          {[
            { id: 'activity', label: 'Activity (Today)' },
            { id: 'bookings', label: 'Classes' },
            { id: 'payments', label: 'Payments' },
            { id: 'homework', label: 'Homework' }
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as any)}
              className={cn(
                "px-2.5 py-1.5 text-xs font-bold whitespace-nowrap transition-all border-b-2",
                activeTab === t.id
                  ? "border-blue-600 text-blue-500"
                  : "border-transparent text-[var(--theme-text-muted)]"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Tabs Content */}
        <div className="flex-1 min-h-0 overflow-y-auto space-y-4 pr-1 hide-scrollbar">
          
          {/* TAB 1: ACTIVITY & LEARNING LOGS */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              
              {/* Quick Actions Grid for Quick logs */}
              <div className="grid grid-cols-2 gap-2 bg-[var(--theme-bg)]/50 p-3 rounded-2xl border border-[var(--theme-border)]">
                {/* 1. Quick Score Form */}
                <form onSubmit={handleGiveScore} className="space-y-2 border-r border-[var(--theme-border)] pr-2">
                  <p className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Add Score</p>
                  <div className="flex gap-1">
                    <input
                      type="number"
                      placeholder="Score"
                      required
                      value={newScore}
                      onChange={e => setNewScore(e.target.value)}
                      className="w-full px-1.5 py-1 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-lg text-xs outline-none text-[var(--theme-text)]"
                    />
                    <input
                      type="number"
                      placeholder="Max"
                      value={newMaxScore}
                      onChange={e => setNewMaxScore(e.target.value)}
                      className="w-full px-1.5 py-1 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-lg text-xs outline-none text-[var(--theme-text)]"
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Topic details..."
                    value={newScoreNote}
                    onChange={e => setNewScoreNote(e.target.value)}
                    className="w-full px-2 py-1 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-lg text-[11px] outline-none text-[var(--theme-text)]"
                  />
                  <button
                    disabled={isSubmittingScore || !newScore}
                    type="submit"
                    className="w-full py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold disabled:opacity-50"
                  >
                    Award Points
                  </button>
                </form>

                {/* 2. Quick Attendance Form */}
                <form onSubmit={handleMarkAttendance} className="space-y-2 pl-1">
                  <p className="text-[10px] font-bold text-[var(--theme-text-muted)] uppercase tracking-wider">Mark Attendance</p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      onClick={() => setAttStatus('present')}
                      className={cn(
                        "flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all",
                        attStatus === 'present' ? "bg-green-500/10 text-green-500 border-green-500" : "bg-[var(--theme-card)] border-[var(--theme-border)] text-[var(--theme-text-muted)]"
                      )}
                    >
                      Present
                    </button>
                    <button
                      type="button"
                      onClick={() => setAttStatus('absent')}
                      className={cn(
                        "flex-1 py-1 rounded-lg text-[10px] font-bold border transition-all",
                        attStatus === 'absent' ? "bg-red-500/10 text-red-500 border-red-500" : "bg-[var(--theme-card)] border-[var(--theme-border)] text-[var(--theme-text-muted)]"
                      )}
                    >
                      Absent
                    </button>
                  </div>
                  <input
                    type="text"
                    placeholder="Reason/note..."
                    value={attNote}
                    onChange={e => setAttNote(e.target.value)}
                    className="w-full px-2 py-1 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-lg text-[11px] outline-none text-[var(--theme-text)]"
                  />
                  <button
                    disabled={isSubmittingAtt}
                    type="submit"
                    className="w-full py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold disabled:opacity-50"
                  >
                    Save
                  </button>
                </form>
              </div>

              {/* Timeline list */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[var(--theme-text)]">Learning & Activity Log</h4>
                {activityTimeline.length === 0 ? (
                  <p className="text-center py-6 text-xs text-[var(--theme-text-muted)]">No activity recorded yet.</p>
                ) : (
                  <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 hide-scrollbar">
                    {activityTimeline.map(item => (
                      <div
                        key={item.id}
                        className={cn(
                          "p-2.5 rounded-xl border border-[var(--theme-border)] flex items-start justify-between text-xs",
                          item.isToday ? "bg-blue-600/5 border-blue-500/30" : "bg-[var(--theme-card)]"
                        )}
                      >
                        <div className="space-y-0.5">
                          <p className="font-bold text-[var(--theme-text)]">{item.title}</p>
                          <p className="text-[10px] text-[var(--theme-text-muted)]">{item.subtitle}</p>
                          <p className="text-[9px] text-[var(--theme-text-muted)] italic">{item.meta}</p>
                        </div>
                        {item.isToday && (
                          <span className="bg-green-500 text-white text-[8px] font-black uppercase px-1.5 py-0.5 rounded-full tracking-wider animate-pulse flex-shrink-0">
                            Bugun 🌟
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: BOOKINGS LIST */}
          {activeTab === 'bookings' && (
            <div className="space-y-3">
              <h4 className="text-xs font-bold text-[var(--theme-text)]">Booked Classes List</h4>
              {bookings.length === 0 ? (
                <p className="text-center py-8 text-xs text-[var(--theme-text-muted)]">No classes booked.</p>
              ) : (
                <div className="space-y-2">
                  {bookings.map(b => (
                    <div key={b.id} className="p-3 bg-[var(--theme-card)] rounded-xl border border-[var(--theme-border)] space-y-1">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-[var(--theme-text)]">Teacher: {b.teacherName}</span>
                        <span className={cn(
                          "text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-tighter",
                          b.status === 'confirmed' && 'bg-green-500/10 text-green-500',
                          b.status === 'pending' && 'bg-orange-500/10 text-orange-500',
                          b.status === 'attended' && 'bg-blue-500/10 text-blue-500',
                          (b.status === 'cancelled' || b.status === 'absent') && 'bg-red-500/10 text-red-500'
                        )}>
                          {b.status}
                        </span>
                      </div>
                      <p className="text-[10px] text-[var(--theme-text-muted)]">
                        📅 {b.day}, {b.dayDate} • {b.startTime}-{b.endTime}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: PAYMENTS / DAROMAD */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="bg-green-500/10 border border-green-500/30 rounded-2xl p-4 flex justify-between items-center">
                <div>
                  <p className="text-[10px] text-green-500 uppercase tracking-widest font-black">Total Paid</p>
                  <p className="text-xl font-black text-green-500 mt-1">{totalPaid.toLocaleString('en-US')} UZS</p>
                </div>
                <div className="text-3xl">💰</div>
              </div>

              <form onSubmit={handleAddPayment} className="bg-[var(--theme-card)] rounded-2xl p-4 border border-[var(--theme-border)] space-y-3">
                <h4 className="text-xs font-bold text-[var(--theme-text)]">Record New Payment</h4>
                
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-[var(--theme-text-muted)] font-bold block mb-1">AMOUNT (UZS)</label>
                    <input
                      type="number"
                      required
                      placeholder="Example: 500000"
                      value={paymentAmount}
                      onChange={e => setPaymentAmount(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-xs outline-none text-[var(--theme-text)]"
                    />
                  </div>
                  <div>
                    <label className="text-[10px] text-[var(--theme-text-muted)] font-bold block mb-1">DATE</label>
                    <input
                      type="date"
                      required
                      value={paymentDate}
                      onChange={e => setPaymentDate(e.target.value)}
                      className="w-full px-3 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-xs outline-none text-[var(--theme-text)]"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-[10px] text-[var(--theme-text-muted)] font-bold block mb-1">NOTE</label>
                  <input
                    type="text"
                    placeholder="Example: Payment for 8 classes"
                    value={paymentNote}
                    onChange={e => setPaymentNote(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-xs outline-none text-[var(--theme-text)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingPayment || !paymentAmount}
                  className="w-full py-2.5 bg-green-600 hover:bg-green-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Save Payment
                </button>
              </form>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[var(--theme-text)]">Payment History</h4>
                {payments.length === 0 ? (
                  <p className="text-center py-6 text-xs text-[var(--theme-text-muted)]">No payments recorded yet.</p>
                ) : (
                  <div className="space-y-2">
                    {payments.map(p => (
                      <div key={p.id} className="p-3 bg-[var(--theme-bg)] rounded-xl border border-[var(--theme-border)] text-xs flex justify-between items-center">
                        <div>
                          <p className="font-bold text-[var(--theme-text)]">+{p.amount.toLocaleString('en-US')} UZS</p>
                          {p.note && <p className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">{p.note}</p>}
                          <p className="text-[9px] text-[var(--theme-text-muted)] mt-0.5">Date: {p.date} • Received by: {p.teacherName}</p>
                        </div>
                        <span className="text-green-500 font-bold">Successful</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 4: HOMEWORK */}
          {activeTab === 'homework' && (
            <div className="space-y-4">
              <form onSubmit={handleAssignHomework} className="bg-[var(--theme-card)] rounded-2xl p-4 border border-[var(--theme-border)] space-y-3">
                <h4 className="text-xs font-bold text-[var(--theme-text)]">Assign Individual Homework</h4>

                <div>
                  <label className="text-[10px] text-[var(--theme-text-muted)] font-bold block mb-1">Assignment Title</label>
                  <input
                    type="text"
                    required
                    placeholder="Example: Essay on global warming"
                    value={hwTitle}
                    onChange={e => setHwTitle(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-xs outline-none text-[var(--theme-text)]"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[var(--theme-text-muted)] font-bold block mb-1">Assignment Description</label>
                  <textarea
                    rows={2}
                    placeholder="Enter details..."
                    value={hwDesc}
                    onChange={e => setHwDesc(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-xs outline-none text-[var(--theme-text)] resize-none"
                  />
                </div>

                <div>
                  <label className="text-[10px] text-[var(--theme-text-muted)] font-bold block mb-1">Deadline</label>
                  <input
                    type="datetime-local"
                    value={hwDeadline}
                    onChange={e => setHwDeadline(e.target.value)}
                    className="w-full px-3 py-2 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-xs outline-none text-[var(--theme-text)]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={isSubmittingHw || !hwTitle}
                  className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  Assign Homework
                </button>
              </form>

              <div className="space-y-2">
                <h4 className="text-xs font-bold text-[var(--theme-text)]">Assignments for this student</h4>
                {homeworks.length === 0 ? (
                  <p className="text-center py-6 text-xs text-[var(--theme-text-muted)]">No active assignments or deadlines passed.</p>
                ) : (
                  <div className="space-y-2">
                    {homeworks.map(hw => (
                      <div key={hw.id} className="p-3 bg-[var(--theme-bg)] rounded-xl border border-[var(--theme-border)] text-xs space-y-1.5">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-bold text-[var(--theme-text)]">{hw.title}</p>
                            {hw.description && <p className="text-[10px] text-[var(--theme-text-muted)] mt-0.5">{hw.description}</p>}
                          </div>
                          <span className={cn(
                            "text-[8px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0",
                            hw.studentId ? "bg-orange-500/10 text-orange-500" : "bg-purple-500/10 text-purple-500"
                          )}>
                            {hw.studentId ? "Individual" : "General"}
                          </span>
                        </div>
                        {hw.deadline && (
                          <p className="text-[10px] text-orange-400 font-semibold">
                            ⏰ Deadline: {new Date(hw.deadline).toLocaleString('en-US')}
                          </p>
                        )}
                        
                        {hw.submissions && hw.submissions.some(sub => sub.studentId === student.uid) ? (
                          <div className="mt-2 p-2 bg-green-500/5 border border-green-500/20 rounded-lg">
                            <p className="text-[9px] font-bold text-green-500">✓ Submitted:</p>
                            <p className="text-[10px] text-[var(--theme-text)] mt-0.5">
                              "{hw.submissions.find(sub => sub.studentId === student.uid)?.text}"
                            </p>
                          </div>
                        ) : (
                          <p className="text-[9px] text-red-400 font-bold italic mt-2">Not submitted yet</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

        </div>
      </motion.div>
    </motion.div>
  );
};

/* ─── Users Tab ─── */
const UsersTab = ({ currentUser, allBookings = [] }: { currentUser: UserProfile; allBookings?: BookingRecord[] }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStudent, setSelectedStudent] = useState<UserProfile | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'student' | 'teacher' | 'admin'>('all');

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
      setIsLoading(false);
    };
    fetchUsers();
  }, [showCreate]);

  const filteredUsers = useMemo(() => {
    return users.filter(u => {
      const matchesSearch = 
        (u.displayName || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.username || '').toLowerCase().includes(searchTerm.toLowerCase());
      const matchesRole = 
        roleFilter === 'all' || 
        (roleFilter === 'student' && u.role === 'student') ||
        (roleFilter === 'teacher' && u.role === 'teacher') ||
        (roleFilter === 'admin' && (u.role === 'admin' || u.role === 'super-admin'));
      return matchesSearch && matchesRole;
    });
  }, [users, searchTerm, roleFilter]);

  const roleColor: Record<string, string> = {
    'student': 'bg-blue-500/10 text-blue-400',
    'teacher': 'bg-green-500/10 text-green-400',
    'admin': 'bg-purple-500/10 text-purple-400',
    'super-admin': 'bg-red-500/10 text-red-400',
  };

  const isSuperAdmin = currentUser.role === 'super-admin';

  return (
    <div className="px-4 space-y-4">
      <div className="flex items-center justify-between py-1">
        <h3 className="font-bold text-[var(--theme-text)]">Users</h3>
        {isSuperAdmin && (
          <button
            onClick={() => setShowCreate(true)}
            className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
            New User
          </button>
        )}
      </div>

      <div className="space-y-3">
        <div className="relative">
          <input
            type="text"
            placeholder="Search (name or username)..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] text-xs outline-none focus:border-blue-500 transition-colors"
          />
          <span className="absolute left-3.5 top-3 text-[var(--theme-text-muted)] text-xs">🔍</span>
        </div>

        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {[
            { id: 'all', label: 'All' },
            { id: 'student', label: 'Students' },
            { id: 'teacher', label: 'Teachers' },
            { id: 'admin', label: 'Admins' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setRoleFilter(tab.id as any)}
              className={cn(
                "px-3 py-1.5 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all border",
                roleFilter === tab.id
                  ? "bg-blue-600 text-white border-blue-600"
                  : "bg-[var(--theme-card)] text-[var(--theme-text-muted)] border-[var(--theme-border)]"
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1, 2, 3].map(i => <div key={i} className="h-16 rounded-2xl shimmer animate-pulse" />)}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredUsers.length === 0 ? (
            <p className="text-center py-8 text-xs text-[var(--theme-text-muted)]">No user found.</p>
          ) : (
            filteredUsers.map(u => {
              const studentBookings = allBookings.filter(b => b.studentId === u.uid);
              const activeBooking = studentBookings.find(b => b.status === 'pending' || b.status === 'confirmed');

              return (
                <div
                  key={u.uid}
                  onClick={() => u.role === 'student' && setSelectedStudent(u)}
                  className={cn(
                    "bg-[var(--theme-card)] rounded-2xl p-3.5 flex items-center gap-3 border border-[var(--theme-border)] transition-all",
                    u.role === 'student' && "cursor-pointer hover:border-blue-500/50 hover:shadow-sm"
                  )}
                >
                  <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
                    {(u.displayName || 'U')[0].toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-sm text-[var(--theme-text)] truncate flex items-center gap-1.5">
                      {u.displayName}
                      {u.role === 'student' && (
                        <span className="text-[10px] font-normal text-[var(--theme-text-muted)]">
                          ({u.stage || 'Stage 1'})
                        </span>
                      )}
                    </p>
                    <p className="text-xs text-[var(--theme-text-muted)] truncate">@{u.username}</p>
                    {u.role === 'student' && activeBooking && (
                      <p className="text-[10px] text-orange-400 font-extrabold mt-0.5 flex items-center gap-1">
                        <span>📅 {activeBooking.status === 'confirmed' ? 'Confirmed' : 'Pending'}:</span>
                        <span>{activeBooking.dayDate} ({activeBooking.startTime})</span>
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${roleColor[u.role] || 'bg-gray-500/10 text-gray-400'}`}>
                      {u.role}
                    </span>
                    {u.role === 'student' && (
                      <span className="text-[10px] text-blue-500 font-bold hover:underline">Manage ➜</span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      <AnimatePresence>
        {showCreate && isSuperAdmin && (
          <CreateUserModal
            onClose={() => setShowCreate(false)}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {selectedStudent && (
          <StudentDetailsModal
            student={selectedStudent}
            currentUser={currentUser}
            onClose={() => setSelectedStudent(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
};

/* ─── Create User Modal ─── */
const CreateUserModal = ({ onClose }: { onClose: () => void }) => {
  const [form, setForm] = useState({
    username: '',
    password: '',
    displayName: '',
    role: 'student' as UserRole,
    stage: 'stage1',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleCreate = async () => {
    if (!form.username || !form.password || !form.displayName) {
      setError('Please fill in all fields!');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Check username unique
      const q = query(collection(db, 'users'), where('username', '==', form.username.toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setError('This username is already taken!');
        setIsLoading(false);
        return;
      }

      const uid = `user_${Date.now()}`;
      await setDoc(doc(db, 'users', uid), {
        uid,
        username: form.username.toLowerCase(),
        password: form.password,
        displayName: form.displayName,
        role: form.role,
        stage: form.stage,
        score: 0,
        totalScore: 0,
        attendanceCount: 0,
        isOnline: false,
        createdAt: serverTimestamp(),
      });
      setSuccess(`✅ User created! Username: ${form.username} | Password: ${form.password}`);
    } catch (err) {
      setError('An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-end justify-center"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-[var(--theme-card)] rounded-t-3xl w-full max-w-[480px] p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-[var(--theme-text)]">New User</h3>
          <button onClick={onClose} className="text-[var(--theme-text-muted)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {error && <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
        {success ? (
          <div className="space-y-3">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-medium">{success}</div>
            <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl">Close</button>
          </div>
        ) : (
          <div className="space-y-3">
            <FormField label="Full Name" value={form.displayName} onChange={v => setForm({...form, displayName: v})} placeholder="First and Last Name" />
            <FormField label="Username" value={form.username} onChange={v => setForm({...form, username: v})} placeholder="username" />
            <FormField label="Password" value={form.password} onChange={v => setForm({...form, password: v})} placeholder="password" type="password" />

            <div>
              <label className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1.5">Role</label>
              <select
                value={form.role}
                onChange={e => setForm({...form, role: e.target.value as UserRole})}
                className="w-full px-3 py-2.5 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] text-sm outline-none"
              >
                <option value="student">Student</option>
                <option value="teacher">Teacher</option>
                <option value="admin">Admin</option>
              </select>
            </div>

            {form.role === 'student' && (
              <div>
                <label className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1.5">Stage</label>
                <select
                  value={form.stage}
                  onChange={e => setForm({...form, stage: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] text-sm outline-none"
                >
                  {['stage1','stage2','stage3','stage4','stage5','stage6'].map((s, i) => (
                    <option key={s} value={s}>Stage {i+1}</option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleCreate}
              disabled={isLoading}
              className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {isLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : null}
              Create
            </button>
          </div>
        )}
        <div className="h-6" />
      </motion.div>
    </motion.div>
  );
};

const FormField = ({ label, value, onChange, placeholder, type = 'text' }: any) => (
  <div>
    <label className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1.5">{label}</label>
    <input
      type={type}
      value={value}
      onChange={e => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full px-3 py-2.5 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] text-sm outline-none focus:border-blue-500 transition-colors"
    />
  </div>
);

/* ─── Attendance Tab ─── */
const AttendanceTab = ({ teacher }: { teacher: UserProfile }) => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [attendance, setAttendance] = useState<Record<string, 'present' | 'absent' | null>>({});
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const fetchStudents = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      const snap = await getDocs(q);
      setStudents(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    };
    fetchStudents();
  }, []);

  const mark = (uid: string, status: 'present' | 'absent') => {
    setAttendance(prev => ({ ...prev, [uid]: prev[uid] === status ? null : status }));
    setSaved(false);
  };

  const saveAttendance = async () => {
    setIsSaving(true);
    try {
      for (const [studentId, status] of Object.entries(attendance)) {
        if (!status) continue;
        const student = students.find(s => s.uid === studentId);
        await addDoc(collection(db, 'attendance'), {
          studentId,
          studentName: student?.displayName || '',
          teacherId: teacher.uid,
          teacherName: teacher.displayName,
          date,
          status,
          createdAt: serverTimestamp(),
        });
      }
      setSaved(true);
      setAttendance({});
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  const markedCount = Object.values(attendance).filter(Boolean).length;

  return (
    <div className="px-4 space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <label className="text-xs text-[var(--theme-text-muted)] font-bold uppercase tracking-wider block mb-1">Date</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] text-sm outline-none"
          />
        </div>
        <div className="pt-5">
          <span className="text-xs text-[var(--theme-text-muted)]">{markedCount} / {students.length} marked</span>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-medium text-center">
          ✅ Attendance saved!
        </div>
      )}

      <div className="space-y-2">
        {students.length === 0 && (
          <div className="text-center py-10 text-[var(--theme-text-muted)] text-sm">Students not found</div>
        )}
        {students.map(s => (
          <div key={s.uid} className="bg-[var(--theme-card)] rounded-2xl p-3.5 flex items-center gap-3 border border-[var(--theme-border)]">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(s.displayName || 'S')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[var(--theme-text)] truncate">{s.displayName}</p>
              <p className="text-xs text-[var(--theme-text-muted)]">@{s.username} • {s.stage || 'Stage 1'}</p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => mark(s.uid, 'present')}
                className={cn(
                  'w-9 h-9 rounded-xl text-sm font-bold transition-all border-2',
                  attendance[s.uid] === 'present'
                    ? 'bg-green-500 border-green-500 text-white'
                    : 'border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-green-500/50'
                )}
              >✓</button>
              <button
                onClick={() => mark(s.uid, 'absent')}
                className={cn(
                  'w-9 h-9 rounded-xl text-sm font-bold transition-all border-2',
                  attendance[s.uid] === 'absent'
                    ? 'bg-red-500 border-red-500 text-white'
                    : 'border-[var(--theme-border)] text-[var(--theme-text-muted)] hover:border-red-500/50'
                )}
              >✗</button>
            </div>
          </div>
        ))}
      </div>

      {markedCount > 0 && (
        <button
          onClick={saveAttendance}
          disabled={isSaving}
          className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isSaving && <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
          Save Attendance ({markedCount})
        </button>
      )}
    </div>
  );
};

/* ─── Scores Tab ─── */
const ScoresTab = ({ teacher }: { teacher: UserProfile }) => {
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<string>('');
  const [score, setScore] = useState('');
  const [maxScore, setMaxScore] = useState('10');
  const [note, setNote] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [recentScores, setRecentScores] = useState<ScoreRecord[]>([]);

  useEffect(() => {
    const fetchStudents = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      const snap = await getDocs(q);
      setStudents(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    };
    fetchStudents();

    // Recent scores
    const q2 = query(collection(db, 'scores'), where('teacherId', '==', teacher.uid), orderBy('date', 'desc'));
    const unsub = onSnapshot(q2, snap => {
      setRecentScores(snap.docs.slice(0, 10).map(d => ({ id: d.id, ...d.data() } as ScoreRecord)));
    });
    return () => unsub();
  }, [teacher.uid]);

  const saveScore = async () => {
    if (!selectedStudent || !score) return;
    setIsSaving(true);
    try {
      const student = students.find(s => s.uid === selectedStudent);
      await addDoc(collection(db, 'scores'), {
        studentId: selectedStudent,
        studentName: student?.displayName || '',
        teacherId: teacher.uid,
        teacherName: teacher.displayName,
        score: Number(score),
        maxScore: Number(maxScore),
        note: note.trim(),
        date: new Date().toISOString(),
        createdAt: serverTimestamp(),
      });

      // Update student's total score
      await updateDoc(doc(db, 'users', selectedStudent), {
        score: (student?.score || 0) + Number(score),
        totalScore: (student?.totalScore || 0) + Number(maxScore),
      });

      setSaved(true);
      setScore('');
      setNote('');
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 space-y-4">
      <div className="bg-[var(--theme-card)] rounded-2xl p-4 border border-[var(--theme-border)] space-y-3">
        <h3 className="font-bold text-[var(--theme-text)]">Award Points</h3>

        {saved && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-medium text-center">
            ✅ Points saved!
          </div>
        )}

        <div>
          <label className="text-xs text-[var(--theme-text-muted)] font-bold uppercase tracking-wider block mb-1.5">Student</label>
          <select
            value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}
            className="w-full px-3 py-2.5 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] text-sm outline-none"
          >
            <option value="">Select student</option>
            {students.map(s => (
              <option key={s.uid} value={s.uid}>{s.displayName} (@{s.username})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Score" value={score} onChange={setScore} placeholder="0" type="number" />
          <FormField label="Maximum" value={maxScore} onChange={setMaxScore} placeholder="10" type="number" />
        </div>

        <FormField label="Note (optional)" value={note} onChange={setNote} placeholder="Class note..." />

        <button
          onClick={saveScore}
          disabled={!selectedStudent || !score || isSaving}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50"
        >
          Award Points
        </button>
      </div>

      {recentScores.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-[var(--theme-text)]">Recent Scores</h4>
          {recentScores.map(s => (
            <div key={s.id} className="bg-[var(--theme-card)] rounded-xl p-3 flex items-center gap-3 border border-[var(--theme-border)]">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <span className="text-green-400 font-black text-sm">{s.score}/{s.maxScore}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[var(--theme-text)]">{s.studentName}</p>
                <p className="text-xs text-[var(--theme-text-muted)]">{s.note || 'No note'} • {new Date(s.date).toLocaleDateString('en-US')}</p>
              </div>
              <span className="text-xs font-bold px-2 py-1 rounded-full bg-blue-500/10 text-blue-400">
                {Math.round((s.score / s.maxScore) * 100)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

/* ─── Homework Tab ─── */
const HomeworkTab = ({ teacher }: { teacher: UserProfile }) => {
  const [homeworks, setHomeworks] = useState<HomeworkAssignment[]>([]);
  const [students, setStudents] = useState<UserProfile[]>([]);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [showCreate, setShowCreate] = useState(false);
  const [form, setForm] = useState({ title: '', description: '', deadline: '' });
  const [isSaving, setIsSaving] = useState(false);
  const [viewSubmissions, setViewSubmissions] = useState<string | null>(null);

  useEffect(() => {
    const q = query(collection(db, 'homework'), where('teacherId', '==', teacher.uid), orderBy('createdAt', 'desc'));
    const unsub = onSnapshot(q, snap => {
      setHomeworks(snap.docs.map(d => ({ id: d.id, ...d.data() } as HomeworkAssignment)));
    });
    return () => unsub();
  }, [teacher.uid]);

  useEffect(() => {
    const fetchStudents = async () => {
      const q = query(collection(db, 'users'), where('role', '==', 'student'));
      const snap = await getDocs(q);
      setStudents(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
    };
    fetchStudents();
  }, []);

  const createHomework = async () => {
    if (!form.title) return;
    setIsSaving(true);
    try {
      const targetStudent = selectedStudentId === 'all' ? null : students.find(s => s.uid === selectedStudentId);
      await addDoc(collection(db, 'homework'), {
        teacherId: teacher.uid,
        teacherName: teacher.displayName,
        studentId: targetStudent ? targetStudent.uid : 'all',
        studentName: targetStudent ? targetStudent.displayName : 'All students',
        title: form.title,
        description: form.description,
        deadline: form.deadline,
        submissions: [],
        createdAt: serverTimestamp(),
      });
      setForm({ title: '', description: '', deadline: '' });
      setSelectedStudentId('all');
      setShowCreate(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 space-y-3">
      <div className="flex items-center justify-between py-1">
        <h3 className="font-bold text-[var(--theme-text)]">Homework</h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          New Assignment
        </button>
      </div>

      <AnimatePresence>
        {showCreate && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-[var(--theme-card)] rounded-2xl p-4 border border-[var(--theme-border)] space-y-3">
              <FormField label="Assignment name" value={form.title} onChange={(v: string) => setForm({...form, title: v})} placeholder="Example: IELTS Writing Task 2" />
              
              <div>
                <label className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1.5">Student (Select recipient)</label>
                <select
                  value={selectedStudentId}
                  onChange={e => setSelectedStudentId(e.target.value)}
                  className="w-full px-3 py-2.5 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] text-sm outline-none"
                >
                  <option value="all">All students</option>
                  {students.map(s => (
                    <option key={s.uid} value={s.uid}>{s.displayName} (@{s.username})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1.5">Description</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Assignment details..."
                  rows={3}
                  className="w-full px-3 py-2.5 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] text-sm outline-none resize-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1.5">Deadline</label>
                <input
                  type="datetime-local"
                  value={form.deadline}
                  onChange={e => setForm({...form, deadline: e.target.value})}
                  className="w-full px-3 py-2.5 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] text-sm outline-none"
                />
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => setShowCreate(false)}
                  className="flex-1 py-2.5 border border-[var(--theme-border)] text-[var(--theme-text-muted)] font-bold rounded-xl text-sm"
                >Cancel</button>
                <button
                  onClick={createHomework}
                  disabled={!form.title || isSaving}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm disabled:opacity-50"
                >Create</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {homeworks.length === 0 && !showCreate && (
        <div className="text-center py-16 text-[var(--theme-text-muted)]">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-sm">No assignments yet</p>
        </div>
      )}

      {homeworks.map(hw => (
        <div key={hw.id} className="bg-[var(--theme-card)] rounded-2xl p-4 border border-[var(--theme-border)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-xl flex-shrink-0">📝</div>
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <h4 className="font-bold text-sm text-[var(--theme-text)] truncate">{hw.title}</h4>
                <span className={cn(
                  "text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider flex-shrink-0",
                  hw.studentId && hw.studentId !== 'all' ? "bg-orange-500/10 text-orange-500" : "bg-purple-500/10 text-purple-500"
                )}>
                  {hw.studentId && hw.studentId !== 'all' ? `Indiv: ${hw.studentName}` : 'All students'}
                </span>
              </div>
              {hw.description && <p className="text-xs text-[var(--theme-text-muted)] mt-0.5 line-clamp-2">{hw.description}</p>}
              {hw.deadline && (
                <p className="text-xs text-orange-400 mt-1 font-semibold">
                  ⏰ {new Date(hw.deadline).toLocaleString('en-US')}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-[var(--theme-text-muted)]">
              {(hw.submissions || []).length} submitted
            </span>
            <button
              onClick={() => setViewSubmissions(viewSubmissions === hw.id ? null : hw.id)}
              className="ml-auto text-xs text-blue-400 font-semibold"
            >
              {viewSubmissions === hw.id ? 'Close' : 'View'}
            </button>
          </div>

          <AnimatePresence>
            {viewSubmissions === hw.id && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3 pt-3 border-t border-[var(--theme-border)]"
              >
                {(hw.submissions || []).length === 0 ? (
                  <p className="text-xs text-[var(--theme-text-muted)] text-center py-3">Not submitted yet</p>
                ) : (
                  (hw.submissions || []).map(sub => (
                    <div key={sub.id} className="py-2 border-b border-[var(--theme-border)] last:border-0">
                      <p className="text-sm font-bold text-[var(--theme-text)]">{sub.studentName}</p>
                      <p className="text-xs text-[var(--theme-text-muted)] mt-0.5">{sub.text}</p>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  );
};
