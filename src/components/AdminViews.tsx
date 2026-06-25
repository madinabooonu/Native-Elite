import React, { useState, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, AppButton } from './UI';
import { cn } from '../lib/utils';
import { db } from '../lib/firebase';
import {
  collection, getDocs, addDoc, doc, setDoc, updateDoc,
  serverTimestamp, query, where, orderBy, onSnapshot, Timestamp
} from 'firebase/firestore';
import type { BookingRecord, UserProfile, AttendanceRecord, ScoreRecord, HomeworkAssignment } from '../types';
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

  const isSuperAdmin = user.role === 'super-admin';

  const tabs = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: '📊' },
    ...(isSuperAdmin ? [{ id: 'users' as AdminTab, label: 'Foydalanuvchilar', icon: '👥' }] : []),
    { id: 'attendance' as AdminTab, label: 'Davomat', icon: '✅' },
    { id: 'scores' as AdminTab, label: 'Balllar', icon: '⭐' },
    { id: 'homework' as AdminTab, label: 'Vazifalar', icon: '📚' },
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
          {activeTab === 'users' && isSuperAdmin && <UsersTab currentUser={user} />}
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
  const stats = [
    { label: 'Jami Bookings', value: allBookings.length, color: '#3B82F6', icon: '📅' },
    { label: 'Confirmed', value: allBookings.filter(b => b.status === 'confirmed').length, color: '#10B981', icon: '✅' },
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
          <span>Dars band qilish ro'yxati</span>
          <span className="text-[11px] font-normal text-[var(--theme-text-muted)]">Jami: {allBookings.length} ta</span>
        </h3>

        {allBookings.length === 0 ? (
          <p className="text-center py-6 text-[var(--theme-text-muted)] text-xs">Hali band qilingan darslar yo'q.</p>
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
                  <p className="font-semibold text-blue-500">Ustoz: {b.teacherName}</p>
                </div>

                {/* Status action buttons */}
                {(b.status === 'pending' || b.status === 'confirmed') && (
                  <div className="flex gap-2 pt-1">
                    {b.status === 'pending' && (
                      <button
                        onClick={() => updateBookingStatus(b.id, 'confirmed')}
                        className="flex-1 py-1 px-2.5 bg-green-600 hover:bg-green-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                      >
                        Tasdiqlash ✓
                      </button>
                    )}
                    {b.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => updateBookingStatus(b.id, 'attended')}
                          className="flex-1 py-1 px-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Keldi 🎓
                        </button>
                        <button
                          onClick={() => updateBookingStatus(b.id, 'absent')}
                          className="flex-1 py-1 px-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                        >
                          Kelmadi ✗
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => updateBookingStatus(b.id, 'cancelled')}
                      className="py-1 px-2.5 border border-red-500/40 hover:bg-red-500/5 text-red-400 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                    >
                      Bekor qilish
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="bg-[var(--theme-card)] rounded-2xl p-4 border border-[var(--theme-border)]">
        <h3 className="font-bold text-[var(--theme-text)] mb-1">Xush kelibsiz, {user.displayName}!</h3>
        <p className="text-sm text-[var(--theme-text-muted)]">
          {user.role === 'super-admin' ? 'Super Admin' : user.role === 'admin' ? 'Admin' : 'Teacher'} sifatida tizimga kirdingiz.
          Yuqoridagi tablardan kerakli bo\'limni tanlang.
        </p>
      </div>
    </div>
  );
};

/* ─── Users Tab (Super Admin only) ─── */
const UsersTab = ({ currentUser }: { currentUser: UserProfile }) => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [showCreate, setShowCreate] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchUsers = async () => {
      const snap = await getDocs(collection(db, 'users'));
      setUsers(snap.docs.map(d => ({ uid: d.id, ...d.data() } as UserProfile)));
      setIsLoading(false);
    };
    fetchUsers();
  }, [showCreate]);

  const roleColor: Record<string, string> = {
    'student': 'bg-blue-500/10 text-blue-400',
    'teacher': 'bg-green-500/10 text-green-400',
    'admin': 'bg-purple-500/10 text-purple-400',
    'super-admin': 'bg-red-500/10 text-red-400',
  };

  return (
    <div className="px-4 space-y-3">
      <div className="flex items-center justify-between py-2">
        <h3 className="font-bold text-[var(--theme-text)]">Barcha foydalanuvchilar</h3>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Yangi Foydalanuvchi
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="h-16 rounded-2xl shimmer" />)}
        </div>
      ) : (
        users.map(u => (
          <div key={u.uid} className="bg-[var(--theme-card)] rounded-2xl p-3.5 flex items-center gap-3 border border-[var(--theme-border)]">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-sm flex-shrink-0">
              {(u.displayName || 'U')[0].toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-sm text-[var(--theme-text)] truncate">{u.displayName}</p>
              <p className="text-xs text-[var(--theme-text-muted)]">@{u.username}</p>
            </div>
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${roleColor[u.role] || 'bg-gray-500/10 text-gray-400'}`}>
              {u.role}
            </span>
          </div>
        ))
      )}

      <AnimatePresence>
        {showCreate && (
          <CreateUserModal
            onClose={() => setShowCreate(false)}
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
      setError('Barcha maydonlarni to\'ldiring!');
      return;
    }
    setIsLoading(true);
    setError('');
    try {
      // Check username unique
      const q = query(collection(db, 'users'), where('username', '==', form.username.toLowerCase()));
      const snap = await getDocs(q);
      if (!snap.empty) {
        setError('Bu username allaqachon mavjud!');
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
      setSuccess(`✅ Foydalanuvchi yaratildi! Username: ${form.username} | Parol: ${form.password}`);
    } catch (err) {
      setError('Xatolik yuz berdi.');
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
          <h3 className="text-lg font-bold text-[var(--theme-text)]">Yangi Foydalanuvchi</h3>
          <button onClick={onClose} className="text-[var(--theme-text-muted)]">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        {error && <div className="mb-3 p-3 bg-red-500/10 border border-red-500/30 rounded-xl text-red-400 text-sm">{error}</div>}
        {success ? (
          <div className="space-y-3">
            <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-medium">{success}</div>
            <button onClick={onClose} className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl">Yopish</button>
          </div>
        ) : (
          <div className="space-y-3">
            <FormField label="To'liq Ism" value={form.displayName} onChange={v => setForm({...form, displayName: v})} placeholder="Ism Familiya" />
            <FormField label="Username" value={form.username} onChange={v => setForm({...form, username: v})} placeholder="username" />
            <FormField label="Parol" value={form.password} onChange={v => setForm({...form, password: v})} placeholder="parol" type="password" />

            <div>
              <label className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1.5">Rol</label>
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
              Yaratish
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
          <label className="text-xs text-[var(--theme-text-muted)] font-bold uppercase tracking-wider block mb-1">Sana</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full px-3 py-2 bg-[var(--theme-card)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] text-sm outline-none"
          />
        </div>
        <div className="pt-5">
          <span className="text-xs text-[var(--theme-text-muted)]">{markedCount} / {students.length} belgilandi</span>
        </div>
      </div>

      {saved && (
        <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-medium text-center">
          ✅ Davomat saqlandi!
        </div>
      )}

      <div className="space-y-2">
        {students.length === 0 && (
          <div className="text-center py-10 text-[var(--theme-text-muted)] text-sm">Talabalar topilmadi</div>
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
          Davomatni Saqlash ({markedCount} ta)
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
        <h3 className="font-bold text-[var(--theme-text)]">Ball Berish</h3>

        {saved && (
          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-xl text-green-400 text-sm font-medium text-center">
            ✅ Ball saqlandi!
          </div>
        )}

        <div>
          <label className="text-xs text-[var(--theme-text-muted)] font-bold uppercase tracking-wider block mb-1.5">Talaba</label>
          <select
            value={selectedStudent}
            onChange={e => setSelectedStudent(e.target.value)}
            className="w-full px-3 py-2.5 bg-[var(--theme-bg)] border border-[var(--theme-border)] rounded-xl text-[var(--theme-text)] text-sm outline-none"
          >
            <option value="">Talabani tanlang</option>
            {students.map(s => (
              <option key={s.uid} value={s.uid}>{s.displayName} (@{s.username})</option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <FormField label="Ball" value={score} onChange={setScore} placeholder="0" type="number" />
          <FormField label="Maksimum" value={maxScore} onChange={setMaxScore} placeholder="10" type="number" />
        </div>

        <FormField label="Izoh (ixtiyoriy)" value={note} onChange={setNote} placeholder="Dars izohi..." />

        <button
          onClick={saveScore}
          disabled={!selectedStudent || !score || isSaving}
          className="w-full py-3 bg-blue-600 text-white font-bold rounded-xl disabled:opacity-50"
        >
          Ball Berish
        </button>
      </div>

      {recentScores.length > 0 && (
        <div className="space-y-2">
          <h4 className="font-bold text-sm text-[var(--theme-text)]">So'nggi Balllar</h4>
          {recentScores.map(s => (
            <div key={s.id} className="bg-[var(--theme-card)] rounded-xl p-3 flex items-center gap-3 border border-[var(--theme-border)]">
              <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center">
                <span className="text-green-400 font-black text-sm">{s.score}/{s.maxScore}</span>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-[var(--theme-text)]">{s.studentName}</p>
                <p className="text-xs text-[var(--theme-text-muted)]">{s.note || 'Izohsiz'} • {new Date(s.date).toLocaleDateString('uz-UZ')}</p>
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

  const createHomework = async () => {
    if (!form.title) return;
    setIsSaving(true);
    try {
      await addDoc(collection(db, 'homework'), {
        teacherId: teacher.uid,
        teacherName: teacher.displayName,
        title: form.title,
        description: form.description,
        deadline: form.deadline,
        submissions: [],
        createdAt: serverTimestamp(),
      });
      setForm({ title: '', description: '', deadline: '' });
      setShowCreate(false);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="px-4 space-y-3">
      <div className="flex items-center justify-between py-1">
        <h3 className="font-bold text-[var(--theme-text)]">Vazifalar</h3>
        <button
          onClick={() => setShowCreate(!showCreate)}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-bold rounded-xl"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
          Yangi Vazifa
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
              <FormField label="Vazifa nomi" value={form.title} onChange={(v: string) => setForm({...form, title: v})} placeholder="Masalan: IELTS Writing Task 2" />
              <div>
                <label className="text-xs font-bold text-[var(--theme-text-muted)] uppercase tracking-wider block mb-1.5">Tavsif</label>
                <textarea
                  value={form.description}
                  onChange={e => setForm({...form, description: e.target.value})}
                  placeholder="Vazifa tavsifi..."
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
                >Bekor</button>
                <button
                  onClick={createHomework}
                  disabled={!form.title || isSaving}
                  className="flex-1 py-2.5 bg-blue-600 text-white font-bold rounded-xl text-sm disabled:opacity-50"
                >Yaratish</button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {homeworks.length === 0 && !showCreate && (
        <div className="text-center py-16 text-[var(--theme-text-muted)]">
          <div className="text-4xl mb-3">📚</div>
          <p className="text-sm">Hali vazifa yo'q</p>
        </div>
      )}

      {homeworks.map(hw => (
        <div key={hw.id} className="bg-[var(--theme-card)] rounded-2xl p-4 border border-[var(--theme-border)]">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 text-xl flex-shrink-0">📝</div>
            <div className="flex-1 min-w-0">
              <h4 className="font-bold text-sm text-[var(--theme-text)]">{hw.title}</h4>
              {hw.description && <p className="text-xs text-[var(--theme-text-muted)] mt-0.5 line-clamp-2">{hw.description}</p>}
              {hw.deadline && (
                <p className="text-xs text-orange-400 mt-1 font-semibold">
                  ⏰ {new Date(hw.deadline).toLocaleString('uz-UZ')}
                </p>
              )}
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <span className="text-xs text-[var(--theme-text-muted)]">
              {(hw.submissions || []).length} ta topshirildi
            </span>
            <button
              onClick={() => setViewSubmissions(viewSubmissions === hw.id ? null : hw.id)}
              className="ml-auto text-xs text-blue-400 font-semibold"
            >
              {viewSubmissions === hw.id ? 'Yopish' : 'Ko\'rish'}
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
                  <p className="text-xs text-[var(--theme-text-muted)] text-center py-3">Hali topshirilmagan</p>
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
