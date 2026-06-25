export type UserRole = 'student' | 'teacher' | 'admin' | 'super-admin';

export interface UserProfile {
  uid: string;
  username: string;
  email?: string;
  displayName: string;
  role: UserRole;
  avatarUrl?: string;
  stage?: string;
  assignedTeacherId?: string;
  score?: number;
  totalScore?: number;
  attendanceCount?: number;
  isOnline?: boolean;
  lastSeen?: string;
  createdAt?: string;
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
  day: string;
  dayDate: string;
  fullDate: string;
  startTime: string;
  endTime: string;
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

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  receiverId: string;
  text: string;
  imageUrl?: string;
  timestamp: string;
  read: boolean;
}

export interface ChatConversation {
  id: string;
  participants: string[];
  participantNames: Record<string, string>;
  lastMessage?: string;
  lastMessageTime?: string;
  unreadCount?: number;
}

export interface Post {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar?: string;
  authorRole: UserRole;
  caption: string;
  imageUrl?: string;
  likes: string[];
  comments: PostComment[];
  createdAt: string;
}

export interface PostComment {
  id: string;
  authorId: string;
  authorName: string;
  text: string;
  createdAt: string;
}

export interface HomeworkAssignment {
  id: string;
  teacherId: string;
  teacherName: string;
  studentId?: string; // null = all students
  title: string;
  description: string;
  deadline: string;
  createdAt: string;
  submissions?: HomeworkSubmission[];
}

export interface HomeworkSubmission {
  id: string;
  studentId: string;
  studentName: string;
  text: string;
  submittedAt: string;
}

export interface ScoreRecord {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  teacherName: string;
  score: number;
  maxScore: number;
  note?: string;
  date: string;
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  teacherId: string;
  date: string;
  status: 'present' | 'absent';
  note?: string;
}
