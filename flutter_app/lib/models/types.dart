enum UserRole { student, teacher, admin, superAdmin }

class UserProfile {
  final String uid;
  final String username;
  final String displayName;
  final UserRole role;
  final String? avatarUrl;
  final String? stage;
  final String? assignedTeacherId;
  final String? phone;
  final String? bio;

  UserProfile({
    required this.uid,
    required this.username,
    required this.displayName,
    required this.role,
    this.avatarUrl,
    this.stage,
    this.assignedTeacherId,
    this.phone,
    this.bio,
  });

  factory UserProfile.fromMap(Map<String, dynamic> map) {
    UserRole role;
    switch (map['role']) {
      case 'super-admin':
        role = UserRole.superAdmin;
        break;
      case 'admin':
        role = UserRole.admin;
        break;
      case 'teacher':
        role = UserRole.teacher;
        break;
      default:
        role = UserRole.student;
    }
    return UserProfile(
      uid: map['uid'] ?? '',
      username: map['username'] ?? '',
      displayName: map['displayName'] ?? map['username'] ?? '',
      role: role,
      avatarUrl: map['avatarUrl'],
      stage: map['stage'],
      assignedTeacherId: map['assignedTeacherId'],
      phone: map['phone'],
      bio: map['bio'],
    );
  }

  Map<String, dynamic> toMap() {
    String roleStr;
    switch (role) {
      case UserRole.superAdmin:
        roleStr = 'super-admin';
        break;
      case UserRole.admin:
        roleStr = 'admin';
        break;
      case UserRole.teacher:
        roleStr = 'teacher';
        break;
      default:
        roleStr = 'student';
    }
    return {
      'uid': uid,
      'username': username,
      'displayName': displayName,
      'role': roleStr,
      'avatarUrl': avatarUrl,
      'stage': stage,
      'assignedTeacherId': assignedTeacherId,
      'phone': phone,
      'bio': bio,
    };
  }
}

class ChatMessage {
  final String id;
  final String senderId;
  final String senderName;
  final String receiverId;
  final String content;
  final String? imageUrl;
  final DateTime timestamp;
  final bool isRead;

  ChatMessage({
    required this.id,
    required this.senderId,
    required this.senderName,
    required this.receiverId,
    required this.content,
    this.imageUrl,
    required this.timestamp,
    this.isRead = false,
  });

  factory ChatMessage.fromMap(Map<String, dynamic> map) {
    return ChatMessage(
      id: map['id'] ?? '',
      senderId: map['senderId'] ?? '',
      senderName: map['senderName'] ?? '',
      receiverId: map['receiverId'] ?? '',
      content: map['content'] ?? '',
      imageUrl: map['imageUrl'],
      timestamp: map['timestamp'] != null
          ? DateTime.parse(map['timestamp'])
          : DateTime.now(),
      isRead: map['isRead'] ?? false,
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'senderId': senderId,
      'senderName': senderName,
      'receiverId': receiverId,
      'content': content,
      'imageUrl': imageUrl,
      'timestamp': timestamp.toIso8601String(),
      'isRead': isRead,
    };
  }
}

class Post {
  final String id;
  final String authorId;
  final String authorName;
  final String? authorAvatar;
  final String? caption;
  final String? imageUrl;
  final DateTime createdAt;
  final List<String> likes;
  final List<PostComment> comments;

  Post({
    required this.id,
    required this.authorId,
    required this.authorName,
    this.authorAvatar,
    this.caption,
    this.imageUrl,
    required this.createdAt,
    this.likes = const [],
    this.comments = const [],
  });

  factory Post.fromMap(Map<String, dynamic> map) {
    return Post(
      id: map['id'] ?? '',
      authorId: map['authorId'] ?? '',
      authorName: map['authorName'] ?? '',
      authorAvatar: map['authorAvatar'],
      caption: map['caption'],
      imageUrl: map['imageUrl'],
      createdAt: map['createdAt'] != null
          ? DateTime.parse(map['createdAt'])
          : DateTime.now(),
      likes: List<String>.from(map['likes'] ?? []),
      comments: (map['comments'] as List<dynamic>? ?? [])
          .map((c) => PostComment.fromMap(c))
          .toList(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'authorId': authorId,
      'authorName': authorName,
      'authorAvatar': authorAvatar,
      'caption': caption,
      'imageUrl': imageUrl,
      'createdAt': createdAt.toIso8601String(),
      'likes': likes,
      'comments': comments.map((c) => c.toMap()).toList(),
    };
  }
}

class PostComment {
  final String id;
  final String authorId;
  final String authorName;
  final String text;
  final DateTime createdAt;

  PostComment({
    required this.id,
    required this.authorId,
    required this.authorName,
    required this.text,
    required this.createdAt,
  });

  factory PostComment.fromMap(Map<String, dynamic> map) {
    return PostComment(
      id: map['id'] ?? '',
      authorId: map['authorId'] ?? '',
      authorName: map['authorName'] ?? '',
      text: map['text'] ?? '',
      createdAt: map['createdAt'] != null
          ? DateTime.parse(map['createdAt'])
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'authorId': authorId,
      'authorName': authorName,
      'text': text,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}

class Homework {
  final String id;
  final String title;
  final String description;
  final String teacherId;
  final String teacherName;
  final String? targetStage;
  final DateTime deadline;
  final DateTime createdAt;
  final List<String> submittedBy;

  Homework({
    required this.id,
    required this.title,
    required this.description,
    required this.teacherId,
    required this.teacherName,
    this.targetStage,
    required this.deadline,
    required this.createdAt,
    this.submittedBy = const [],
  });
}

class StudentScore {
  final String id;
  final String studentId;
  final String studentName;
  final String subject;
  final int score;
  final int maxScore;
  final String teacherId;
  final String teacherName;
  final DateTime date;
  final String? note;

  StudentScore({
    required this.id,
    required this.studentId,
    required this.studentName,
    required this.subject,
    required this.score,
    required this.maxScore,
    required this.teacherId,
    required this.teacherName,
    required this.date,
    this.note,
  });
}

class AttendanceRecord {
  final String id;
  final String studentId;
  final String studentName;
  final String teacherId;
  final DateTime date;
  final bool attended;
  final String? note;

  AttendanceRecord({
    required this.id,
    required this.studentId,
    required this.studentName,
    required this.teacherId,
    required this.date,
    required this.attended,
    this.note,
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
  int bookedStudents;
  String status; // 'available', 'full'

  TimeSlot({
    required this.id,
    required this.teacherId,
    required this.teacherName,
    required this.day,
    required this.dayDate,
    required this.fullDate,
    required this.startTime,
    required this.endTime,
    this.maxStudents = 2,
    this.bookedStudents = 0,
    this.status = 'available',
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'teacherId': teacherId,
      'teacherName': teacherName,
      'day': day,
      'dayDate': dayDate,
      'fullDate': fullDate,
      'startTime': startTime,
      'endTime': endTime,
      'maxStudents': maxStudents,
      'bookedStudents': bookedStudents,
      'status': status,
    };
  }

  factory TimeSlot.fromMap(Map<String, dynamic> map) {
    return TimeSlot(
      id: map['id'] ?? '',
      teacherId: map['teacherId'] ?? '',
      teacherName: map['teacherName'] ?? '',
      day: map['day'] ?? '',
      dayDate: map['dayDate'] ?? '',
      fullDate: map['fullDate'] ?? '',
      startTime: map['startTime'] ?? '',
      endTime: map['endTime'] ?? '',
      maxStudents: map['maxStudents'] ?? 2,
      bookedStudents: map['bookedStudents'] ?? 0,
      status: map['status'] ?? 'available',
    );
  }
}

class BookingRecord {
  final String id;
  final String slotId;
  final String studentId;
  final String studentName;
  final String studentStage;
  final String teacherId;
  final String teacherName;
  final String day;
  final String dayDate;
  final String fullDate;
  final String startTime;
  final String endTime;
  final String status; // 'pending', 'confirmed', 'cancelled'
  final bool checkedIn;
  final String createdAt;

  BookingRecord({
    required this.id,
    required this.slotId,
    required this.studentId,
    required this.studentName,
    required this.studentStage,
    required this.teacherId,
    required this.teacherName,
    required this.day,
    required this.dayDate,
    required this.fullDate,
    required this.startTime,
    required this.endTime,
    this.status = 'pending',
    this.checkedIn = false,
    required this.createdAt,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'slotId': slotId,
      'studentId': studentId,
      'studentName': studentName,
      'studentStage': studentStage,
      'teacherId': teacherId,
      'teacherName': teacherName,
      'day': day,
      'dayDate': dayDate,
      'fullDate': fullDate,
      'startTime': startTime,
      'endTime': endTime,
      'status': status,
      'checkedIn': checkedIn,
      'createdAt': createdAt,
    };
  }

  factory BookingRecord.fromMap(Map<String, dynamic> map) {
    return BookingRecord(
      id: map['id'] ?? '',
      slotId: map['slotId'] ?? '',
      studentId: map['studentId'] ?? '',
      studentName: map['studentName'] ?? '',
      studentStage: map['studentStage'] ?? '',
      teacherId: map['teacherId'] ?? '',
      teacherName: map['teacherName'] ?? '',
      day: map['day'] ?? '',
      dayDate: map['dayDate'] ?? '',
      fullDate: map['fullDate'] ?? '',
      startTime: map['startTime'] ?? '',
      endTime: map['endTime'] ?? '',
      status: map['status'] ?? 'pending',
      checkedIn: map['checkedIn'] ?? false,
      createdAt: map['createdAt'] ?? '',
    );
  }
}
