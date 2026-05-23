export type UserRole = 'student' | 'teacher' | 'admin' | 'super-admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  stage?: string;
  assignedTeacherId?: string; // For restricted admin access
}

export interface Teacher {
  id: string;
  name: string;
  avatarUrl?: string;
  specialization?: string;
}

export interface TimeSlot {
  id: string;
  teacherId: string;
  teacherName: string;
  day: string;           // e.g. 'Mon', 'Tue', ...
  dayDate: string;       // e.g. 'May 5'
  fullDate: string;      // ISO date string for the day
  startTime: string;     // e.g. '14:30'
  endTime: string;       // e.g. '15:00'
  maxStudents: number;
  bookedStudents: number;
  status: 'available' | 'booked' | 'full';
}

export interface BookingRecord {
  id: string;
  slotId: string;
  studentId: string;
  studentName: string;
  studentStage?: string;
  teacherId: string;
  teacherName: string;
  day: string;
  dayDate: string;
  fullDate: string;
  startTime: string;
  endTime: string;
  status: 'pending' | 'confirmed' | 'attended' | 'cancelled' | 'absent';
  createdAt: string;
  checkedIn: boolean;
}
