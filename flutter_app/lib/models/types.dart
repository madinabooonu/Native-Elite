enum UserRole {
  student,
  teacher,
  admin,
  superAdmin
}

class UserProfile {
  final String uid;
  final String email;
  final String displayName;
  final UserRole role;
  final String? avatarUrl;
  final String? stage;
  final String? assignedTeacherId;

  UserProfile({
    required this.uid,
    required this.email,
    required this.displayName,
    required this.role,
    this.avatarUrl,
    this.stage,
    this.assignedTeacherId,
  });
}

class Teacher {
  final String id;
  final String name;
  final String? avatarUrl;
  final String? specialization;

  Teacher({
    required this.id,
    required this.name,
    this.avatarUrl,
    this.specialization,
  });
}

class TimeSlot {
  final String id;
  final String teacherId;
  final String teacherName;
  final String day;
  final String dayDate;
  final String fullDate;
  final String startTime;
  final String endTime;
  final int maxStudents;
  final int bookedStudents;
  final String status; // 'available', 'booked', 'full'

  TimeSlot({
    required this.id,
    required this.teacherId,
    required this.teacherName,
    required this.day,
    required this.dayDate,
    required this.fullDate,
    required this.startTime,
    required this.endTime,
    required this.maxStudents,
    required this.bookedStudents,
    required this.status,
  });
}

class BookingRecord {
  final String id;
  final String slotId;
  final String studentId;
  final String studentName;
  final String? studentStage;
  final String teacherId;
  final String teacherName;
  final String day;
  final String dayDate;
  final String fullDate;
  final String startTime;
  final String endTime;
  final String status; // 'pending', 'confirmed', 'attended', 'cancelled', 'absent'
  final String createdAt;
  final bool checkedIn;

  BookingRecord({
    required this.id,
    required this.slotId,
    required this.studentId,
    required this.studentName,
    this.studentStage,
    required this.teacherId,
    required this.teacherName,
    required this.day,
    required this.dayDate,
    required this.fullDate,
    required this.startTime,
    required this.endTime,
    required this.status,
    required this.createdAt,
    required this.checkedIn,
  });
}
