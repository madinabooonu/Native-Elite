import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, AppButton } from './UI';
import { cn } from '../lib/utils';
import type { BookingRecord, UserProfile } from '../types';

/* ── Admin Dashboard ── */
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
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'bookings' | 'reports' | 'slots' | 'feedbacks'>('overview');
  const [searchQuery, setSearchQuery] = useState('');

  // Combine mock data with real bookings
  const [mockBookings] = useState<BookingRecord[]>([
    { id: '1', slotId: 's1', studentId: 'u1', studentName: 'Alex Johnson', studentStage: 'B2', teacherId: 't2', teacherName: 'Miss Osiyo', day: 'Mon', dayDate: 'May 5', fullDate: '2026-05-05', startTime: '16:00', endTime: '16:30', status: 'confirmed', createdAt: '2026-05-20T10:00:00Z', checkedIn: false },
    { id: '2', slotId: 's2', studentId: 'u2', studentName: 'Elena Smith', studentStage: 'C1', teacherId: 't2', teacherName: 'Miss Osiyo', day: 'Mon', dayDate: 'May 5', fullDate: '2026-05-05', startTime: '17:00', endTime: '17:30', status: 'pending', createdAt: '2026-05-20T10:30:00Z', checkedIn: false },
    { id: '3', slotId: 's3', studentId: 'u3', studentName: 'Marcus Wright', studentStage: 'A2', teacherId: 't3', teacherName: 'Mr Sarvar', day: 'Tue', dayDate: 'May 6', fullDate: '2026-05-06', startTime: '15:00', endTime: '15:30', status: 'attended', createdAt: '2026-05-19T14:00:00Z', checkedIn: true },
    { id: '4', slotId: 's4', studentId: 'u4', studentName: 'Sara Ali', studentStage: 'B1', teacherId: 't3', teacherName: 'Mr Sarvar', day: 'Wed', dayDate: 'May 7', fullDate: '2026-05-07', startTime: '18:00', endTime: '18:30', status: 'cancelled', createdAt: '2026-05-20T09:00:00Z', checkedIn: false },
  ]);

  // Merge bookings
  const combinedBookings = useMemo(() => {
    const allBs = [...mockBookings, ...allBookings];
    // Remove duplicates by ID
    const seen = new Set<string>();
    return allBs.filter(b => {
      if (seen.has(b.id)) return false;
      seen.add(b.id);
      return true;
    });
  }, [mockBookings, allBookings]);

  const bookings = user.role === 'super-admin'
    ? combinedBookings
    : combinedBookings.filter(b => b.teacherId === user.assignedTeacherId);

  const updateStatus = (id: string, status: BookingRecord['status']) => {
    if (setAllBookings) {
      const updatedBookings = allBookings.map(b => 
        b.id === id ? { ...b, status, checkedIn: status === 'attended' } : b
      );
      setAllBookings(updatedBookings);
    }
  };

  const deleteBooking = (id: string) => {
    if (setAllBookings) {
      setAllBookings(allBookings.filter((b) => b.id !== id));
    }
  };

  const filtered = bookings.filter(
    (b) => b.studentName.toLowerCase().includes(searchQuery.toLowerCase()) || b.teacherName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const stats = [
    { label: 'Total Bookings', value: bookings.length, color: 'bg-blue-100 text-brand-blue' },
    { label: 'Pending', value: bookings.filter((b) => b.status === 'pending').length, color: 'bg-orange-100 text-brand-orange' },
    { label: 'Confirmed', value: bookings.filter((b) => b.status === 'confirmed').length, color: 'bg-green-100 text-brand-green' },
    { label: 'Attended', value: bookings.filter((b) => b.status === 'attended').length, color: 'bg-purple-100 text-purple-600' },
  ];

  return (
    <div className="px-4 pt-4 pb-4 space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        {stats.map((s, i) => (
          <Card key={i} className="p-4">
            <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center mb-3', s.color)}>
              <span className="text-lg font-bold">{s.value}</span>
            </div>
            <p className="text-xs text-brand-text-light font-medium">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* Sub-tabs Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {[
          { id: 'overview', label: 'Overview' },
          { id: 'bookings', label: 'Bookings' },
          { id: 'slots', label: 'Status Board' },
          { id: 'reports', label: 'Reports' },
          { id: 'feedbacks', label: 'Feedbacks' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveSubTab(tab.id as any)}
            className={cn(
              'px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap',
              activeSubTab === tab.id ? 'bg-brand-blue text-white shadow-md' : 'bg-white text-brand-text-light border border-gray-200'
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {activeSubTab === 'overview' && (
        <>
          {/* Search */}
          <div className="relative">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search bookings..."
              className="w-full bg-white border-2 border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm text-brand-text placeholder:text-gray-300 focus:outline-none focus:border-brand-blue transition-all"
            />
          </div>
        </>
      )}

      {activeSubTab === 'slots' && <SlotStatusBoard user={user} />}
      {activeSubTab === 'reports' && <ReportsView bookings={bookings} user={user} />}
      {activeSubTab === 'feedbacks' && <FeedbacksView />}
      {activeSubTab === 'bookings' && (
        <div className="relative">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search bookings..."
            className="w-full bg-white border-2 border-gray-200 rounded-xl py-2.5 pl-9 pr-4 text-sm text-brand-text placeholder:text-gray-300 focus:outline-none focus:border-brand-blue transition-all"
          />
        </div>
      )}

      {/* Bookings List */}
      {(activeSubTab === 'overview' || activeSubTab === 'bookings') && (
        <div className="space-y-3">
          <h3 className="text-sm font-bold text-brand-text italic">
            {activeSubTab === 'overview' ? 'Recent Bookings' : 'All Bookings'}
          </h3>
          <AnimatePresence>
            {filtered.length === 0 ? (
              <div className="text-center py-8 text-brand-text-light">No bookings found</div>
            ) : (
              filtered.map((booking) => (
                <motion.div
                  key={booking.id}
                  layout
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, x: -100 }}
                >
                  <Card className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-brand-blue flex items-center justify-center text-white font-bold text-sm">
                          {booking.studentName.split(' ').map((n) => n[0]).join('')}
                        </div>
                        <div>
                          <p className="text-sm font-bold text-brand-text">{booking.studentName}</p>
                          <p className="text-xs text-brand-text-light">Stage: {booking.studentStage} • {booking.teacherName}</p>
                        </div>
                      </div>
                      <span className={cn(
                        'text-[10px] font-bold px-2 py-1 rounded-full',
                        booking.status === 'attended' ? 'bg-green-100 text-brand-green' :
                          booking.status === 'confirmed' ? 'bg-blue-100 text-brand-blue' :
                            booking.status === 'cancelled' ? 'bg-red-100 text-brand-red' :
                              booking.status === 'absent' ? 'bg-red-100 text-brand-red' :
                                'bg-orange-100 text-brand-orange'
                      )}>
                        {booking.status === 'attended' ? 'Keldi' :
                          booking.status === 'absent' ? 'Kemadi' :
                            booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-brand-text-light mb-3">
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
                      </svg>
                      {booking.day}, {booking.dayDate} • {booking.startTime} - {booking.endTime}
                    </div>
                    <div className="flex gap-2">
                      {booking.status === 'pending' && (
                        <AppButton variant="primary" className="text-xs py-1.5 px-3" onClick={() => updateStatus(booking.id, 'confirmed')}>
                          Approve
                        </AppButton>
                      )}
                      {booking.status === 'confirmed' && (
                        <>
                          <AppButton variant="primary" className="text-xs py-1.5 px-3 bg-brand-green hover:bg-green-600" onClick={() => updateStatus(booking.id, 'attended')}>
                            ✓ Attended
                          </AppButton>
                          <AppButton variant="danger" className="text-xs py-1.5 px-3 border border-red-200" onClick={() => updateStatus(booking.id, 'absent')}>
                            ✗ Absent
                          </AppButton>
                        </>
                      )}
                      {booking.status !== 'cancelled' && booking.status !== 'attended' && booking.status !== 'absent' && (
                        <AppButton variant="danger" className="text-xs py-1.5 px-3 ml-2" onClick={() => updateStatus(booking.id, 'cancelled')}>
                          Cancel
                        </AppButton>
                      )}
                      <AppButton variant="ghost" className="text-xs py-1.5 px-3 ml-auto" onClick={() => deleteBooking(booking.id)}>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                      </AppButton>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
};

/* ── Status Board View ── */
const SlotStatusBoard = ({ user }: { user: UserProfile }) => {
  const [selectedTeacher, setSelectedTeacher] = useState(user.assignedTeacherId || 't2');
  const allTeachers = [
    { id: 't2', name: 'Miss Osiyo' },
    { id: 't3', name: 'Mr Sarvar' },
  ];

  const teachers = user.role === 'super-admin'
    ? allTeachers
    : allTeachers.filter(t => t.id === user.assignedTeacherId);

  const hours = ['12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'];
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return (
    <div className="space-y-4">
      <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {teachers.map(t => (
          <button
            key={t.id}
            onClick={() => setSelectedTeacher(t.id)}
            className={cn(
              'px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all',
              selectedTeacher === t.id ? 'bg-brand-blue text-white shadow-sm' : 'bg-gray-100 text-brand-text-light'
            )}
          >
            {t.name}
          </button>
        ))}
      </div>

      <Card className="p-4 overflow-x-auto hide-scrollbar">
        <div className="min-w-[500px]">
          <div className="grid grid-cols-[80px_1fr] border-b border-gray-100 pb-2">
            <div className="text-[10px] font-bold text-gray-400 uppercase">Time</div>
            <div className="grid grid-cols-7 gap-1">
              {days.map(d => <div key={d} className="text-[10px] font-bold text-brand-text text-center">{d}</div>)}
            </div>
          </div>
          <div className="space-y-1 mt-2">
            {hours.map(h => (
              <div key={h} className="grid grid-cols-[80px_1fr] items-center gap-1">
                <div className="text-[10px] font-bold text-brand-text-light">{h}</div>
                <div className="grid grid-cols-7 gap-1">
                  {days.map(d => {
                    const isBooked = Math.random() > 0.7;
                    return (
                      <div
                        key={d}
                        className={cn(
                          'h-6 rounded-md border-2 transition-colors',
                          isBooked ? 'bg-brand-blue/10 border-brand-blue/30' : 'bg-gray-50 border-gray-100'
                        )}
                      />
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Card>
      <div className="flex items-center gap-4 px-2">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-gray-50 border border-gray-200" />
          <span className="text-[10px] text-brand-text-light">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded-sm bg-brand-blue/10 border border-brand-blue/30" />
          <span className="text-[10px] text-brand-text-light">Booked</span>
        </div>
      </div>
    </div>
  );
};

/* ── Reports View ── */
const ReportsView = ({ bookings, user }: { bookings: BookingRecord[], user: UserProfile }) => {
  const [reportType, setReportType] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

  const exportToExcel = () => {
    const headers = "ID,Student,Stage,Teacher,Day,Date,Time,Status,Attendance\n";
    const rows = bookings.map(b => {
      let statusCz: string = b.status;
      if (b.status === 'attended') statusCz = 'Attended';
      else if (b.status === 'absent') statusCz = 'Absent';
      else if (b.status === 'confirmed') statusCz = 'Confirmed';
      else if (b.status === 'pending') statusCz = 'Pending';
      else if (b.status === 'cancelled') statusCz = 'Cancelled';
      return `${b.id},${b.studentName},${b.studentStage},${b.teacherName},${b.day},${b.dayDate},${b.startTime},${statusCz},${b.checkedIn ? 'Yes' : 'No'}`;
    }).join('\n');
    const csvContent = headers + rows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `attendance_report_${reportType}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {['daily', 'weekly', 'monthly'].map(type => (
            <button
              key={type}
              onClick={() => setReportType(type as any)}
              className={cn(
                'px-3 py-1.5 rounded-lg text-[10px] font-bold capitalize transition-all',
                reportType === type ? 'bg-brand-navy text-white shadow-sm' : 'bg-white text-brand-text-light border border-gray-100'
              )}
            >
              {type}
            </button>
          ))}
        </div>
        <AppButton
          variant="outline"
          className="py-2 px-3 text-[10px] border-gray-200 text-brand-text h-auto gap-1"
          onClick={exportToExcel}
        >
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export Excel
        </AppButton>
      </div>

      <Card className="p-5 space-y-4">
        <h4 className="text-xs font-bold text-brand-text flex items-center gap-2">
          <span className="w-1.5 h-4 bg-brand-blue rounded-full" />
          {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Attendance Summary
        </h4>

        <div className="space-y-4">
          {[
            { id: 't2', name: 'Miss Osiyo', count: 52, color: 'bg-purple-500' },
            { id: 't3', name: 'Mr Sarvar', count: 48, color: 'bg-orange-500' },
          ].filter(t => user.role === 'super-admin' || t.id === user.assignedTeacherId).map(teacher => (
            <div key={teacher.name} className="space-y-1.5">
              <div className="flex justify-between items-center text-[10px]">
                <span className="font-bold text-brand-text">{teacher.name}</span>
                <span className="text-brand-text-light">{teacher.count} Students</span>
              </div>
              <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${(teacher.count / 50) * 100}%` }}
                  className={cn('h-full rounded-full', teacher.color)}
                />
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 border-t border-gray-100 grid grid-cols-2 gap-4">
          <div>
            <p className="text-[10px] text-brand-text-light mb-1">Top Student</p>
            <p className="text-xs font-bold text-brand-navy">Dilshod K. (12 visits)</p>
          </div>
          <div>
            <p className="text-[10px] text-brand-text-light mb-1">Peak Time</p>
            <p className="text-xs font-bold text-brand-navy">16:30 - 17:30</p>
          </div>
        </div>
      </Card>
    </div>
  );
};

/* ── Feedbacks View ── */
const MOCK_FEEDBACKS = [
  { id: '1', date: '2026-05-20', studentName: 'Alex Johnson', stage: 'Stage 4', text: 'The lesson was very interactive and helpful.' },
  { id: '2', date: '2026-05-21', studentName: 'Elena Smith', stage: 'Stage 6', text: 'Great explanations of the grammar rules.' },
  { id: '3', date: '2026-05-22', studentName: 'Marcus Wright', stage: 'Stage 2', text: 'Could we have more speaking exercises?' },
];

const FeedbacksView = () => {
  const exportFeedbacks = () => {
    const headers = "ID,Date,Student,Stage,Feedback\n";
    const rows = MOCK_FEEDBACKS.map(f => `${f.id},${f.date},${f.studentName},${f.stage},"${f.text}"`).join('\n');
    const csvContent = headers + rows;

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `feedbacks_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-4 pt-4">
      <div className="flex justify-end">
        <AppButton variant="outline" className="py-2 px-3 text-[10px] border-gray-200 text-brand-text h-auto gap-1" onClick={exportFeedbacks}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Export Excel
        </AppButton>
      </div>
      <div className="space-y-3">
        {MOCK_FEEDBACKS.map(f => (
          <Card key={f.id} className="p-4 shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-2">
              <p className="text-sm font-bold text-brand-text">{f.studentName}</p>
              <span className="text-[10px] text-gray-400 font-medium">{f.date}</span>
            </div>
            <p className="text-xs text-brand-text-light mb-2">Stage: {f.stage}</p>
            <p className="text-sm text-brand-navy p-3 bg-blue-50/50 rounded-lg italic">"{f.text}"</p>
          </Card>
        ))}
      </div>
    </div>
  );
};
