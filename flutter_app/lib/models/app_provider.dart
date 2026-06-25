import 'dart:async';
import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:shared_preferences/shared_preferences.dart';
import 'types.dart';
import 'constants.dart';
import '../services/auth_service.dart';
import '../services/firestore_service.dart';

class AppProvider extends ChangeNotifier {
  final AuthService _authService = AuthService();
  final FirestoreService _firestoreService = FirestoreService();

  UserProfile? _currentUser;
  List<Map<String, dynamic>> _allUsers = [];
  List<BookingRecord> _bookings = [];
  List<TimeSlot> _schedules = [];
  List<Map<String, dynamic>> _homeworks = [];
  List<Map<String, dynamic>> _submissions = [];
  List<Map<String, dynamic>> _grades = [];
  List<Map<String, dynamic>> _attendance = [];
  List<Map<String, dynamic>> _notifications = [];
  List<Map<String, dynamic>> _lessons = [];

  // Active Firestore subscriptions
  final List<StreamSubscription> _subscriptions = [];
  StreamSubscription? _authSubscription;

  bool _isLocalLogin = false;
  bool _useMockDb = false;
  final List<ChatMessage> _mockChatMessages = [];
  Timer? _mockSyncTimer;
  int _lastMockModifiedTime = 0;

  // Getters
  UserProfile? get currentUser => _currentUser;
  List<Map<String, dynamic>> get allUsers => _allUsers;
  List<BookingRecord> get bookings => _bookings;
  List<TimeSlot> get schedules => _schedules;
  List<Map<String, dynamic>> get homeworks => _homeworks;
  List<Map<String, dynamic>> get submissions => _submissions;
  List<Map<String, dynamic>> get grades => _grades;
  List<Map<String, dynamic>> get attendance => _attendance;
  List<Map<String, dynamic>> get notifications => _notifications;
  List<Map<String, dynamic>> get lessons => _lessons;

  AppProvider() {
    _listenToAuth();
  }

  @override
  void dispose() {
    _cancelSubscriptions();
    _authSubscription?.cancel();
    _mockSyncTimer?.cancel();
    super.dispose();
  }

  void _cancelSubscriptions() {
    for (final sub in _subscriptions) {
      sub.cancel();
    }
    _subscriptions.clear();
  }

  // Monitor Firebase Auth changes
  void _listenToAuth() {
    _authSubscription = _authService.userStream.listen((firebaseUser) {
      if (firebaseUser != null) {
        _isLocalLogin = false;
        _startFirestoreSubscriptions(firebaseUser.uid);
      } else {
        if (!_isLocalLogin) {
          _currentUser = null;
          _cancelSubscriptions();
          notifyListeners();
        }
      }
    });
  }

  void _startFirestoreSubscriptions(String? uid) {
    _cancelSubscriptions();

    if (_useMockDb) {
      _initMockData(uid);
      return;
    }

    // 1. Listen to Users
    final userSub = _firestoreService.streamUsers().listen((usersList) {
      _allUsers = usersList;
      if (uid != null) {
        try {
          final currentUserMap = usersList.firstWhere(
            (u) => u['uid'] == uid,
            orElse: () => {},
          );
          if (currentUserMap.isNotEmpty) {
            _currentUser = UserProfile.fromMap(currentUserMap);
          }
        } catch (_) {}
      }
      if (_currentUser == null && _isLocalLogin && uid != null) {
        final defaultUser = kDefaultUsers.firstWhere(
          (u) => u['uid'] == uid,
          orElse: () => {},
        );
        if (defaultUser.isNotEmpty) {
          _currentUser = UserProfile.fromMap(defaultUser);
        }
      }
      notifyListeners();
    }, onError: (err) {
      debugPrint("Firestore Users stream error: $err. Switching to mock database.");
      _switchToMockDb(uid);
    });
    _subscriptions.add(userSub);

    // 2. Listen to Bookings
    final bookingsSub = _firestoreService.streamBookings().listen((list) {
      _bookings = list;
      notifyListeners();
    }, onError: (err) {
      debugPrint("Firestore Bookings stream error: $err.");
      _switchToMockDb(uid);
    });
    _subscriptions.add(bookingsSub);

    // 3. Listen to Schedules
    final schedulesSub = _firestoreService.streamSchedules().listen((list) {
      _schedules = list;
      notifyListeners();
    }, onError: (err) {
      debugPrint("Firestore Schedules stream error: $err.");
      _switchToMockDb(uid);
    });
    _subscriptions.add(schedulesSub);

    // 4. Listen to Homeworks
    final homeworksSub = _firestoreService.streamHomeworks().listen((list) {
      _homeworks = list;
      notifyListeners();
    }, onError: (err) {
      _switchToMockDb(uid);
    });
    _subscriptions.add(homeworksSub);

    // 5. Listen to Homework Submissions
    final submissionsSub = _firestoreService.streamHomeworkSubmissions().listen((list) {
      _submissions = list;
      notifyListeners();
    }, onError: (err) {
      _switchToMockDb(uid);
    });
    _subscriptions.add(submissionsSub);

    // 6. Listen to Grades
    final gradesSub = _firestoreService.streamGrades().listen((list) {
      _grades = list;
      notifyListeners();
    }, onError: (err) {
      _switchToMockDb(uid);
    });
    _subscriptions.add(gradesSub);

    // 7. Listen to Attendance
    final attendanceSub = _firestoreService.streamAttendance().listen((list) {
      _attendance = list;
      notifyListeners();
    }, onError: (err) {
      _switchToMockDb(uid);
    });
    _subscriptions.add(attendanceSub);

    // 8. Listen to Notifications
    final notificationsSub = _firestoreService.streamNotifications().listen((list) {
      _notifications = list;
      notifyListeners();
    }, onError: (err) {
      _switchToMockDb(uid);
    });
    _subscriptions.add(notificationsSub);

    // 9. Listen to Lessons
    final lessonsSub = _firestoreService.streamLessons().listen((list) {
      _lessons = list;
      notifyListeners();
    }, onError: (err) {
      _switchToMockDb(uid);
    });
    _subscriptions.add(lessonsSub);
  }

  void _switchToMockDb(String? uid) {
    if (_useMockDb) return;
    _useMockDb = true;
    _cancelSubscriptions();
    _initMockData(uid);
  }

  void _initMockData(String? uid) {
    _allUsers = List.from(kDefaultUsers);
    if (uid != null && _currentUser == null) {
      try {
        final map = kDefaultUsers.firstWhere((u) => u['uid'] == uid);
        _currentUser = UserProfile.fromMap(map);
      } catch (_) {}
    }
    
    // Load persisted mock data from SharedPreferences
    _loadMockDataFromPrefs();

    // Setup periodic sync timer for multi-tab testing
    _mockSyncTimer?.cancel();
    _mockSyncTimer = Timer.periodic(const Duration(seconds: 1), (timer) {
      if (_useMockDb) {
        _loadMockDataFromPrefs(onlyIfChanged: true);
      }
    });

    notifyListeners();
  }

  List<TimeSlot> _generateDefaultSchedules() {
    final list = <TimeSlot>[];
    final teachers = kDefaultUsers.where((u) => u['role'] == 'teacher').toList();
    final timeSlots = [
      '09:00-09:45',
      '10:00-10:45',
      '11:00-11:45',
      '12:00-12:45',
      '12:50-13:35',
      '13:40-14:25',
      '14:30-15:15',
      '16:00-16:45',
      '16:50-17:35',
      '17:40-18:25',
      '18:30-19:15',
      '19:20-20:00'
    ];

    int idCounter = 1;
    final now = DateTime.now();
    for (int i = 0; i < 7; i++) {
      final date = now.add(Duration(days: i));
      final dayName = _getDayNameUz(date.weekday);
      if (dayName == 'Yakshanba') continue;

      final dateStr = '${date.day.toString().padLeft(2, '0')}.${date.month.toString().padLeft(2, '0')}';
      final fullDateStr = '${date.year}-${date.month.toString().padLeft(2, '0')}-${date.day.toString().padLeft(2, '0')}';

      for (final teacher in teachers) {
        for (final time in timeSlots) {
          final parts = time.split('-');
          list.add(TimeSlot(
            id: 'slot_mock_${idCounter++}',
            teacherId: teacher['uid'],
            teacherName: teacher['displayName'] ?? '',
            day: dayName,
            dayDate: dateStr,
            fullDate: fullDateStr,
            startTime: parts[0],
            endTime: parts[1],
            maxStudents: 1,
            bookedStudents: 0,
            status: 'available',
          ));
        }
      }
    }
    return list;
  }

  String _getDayNameUz(int weekday) {
    switch (weekday) {
      case 1: return 'Dushanba';
      case 2: return 'Seshanba';
      case 3: return 'Chorshanba';
      case 4: return 'Payshanba';
      case 5: return 'Juma';
      case 6: return 'Shanba';
      default: return 'Yakshanba';
    }
  }

  Future<bool> login(String username, String password) async {
    try {
      final cred = await _authService.login(username, password);
      if (cred != null) {
        _isLocalLogin = false;
        return true;
      }
      return false;
    } catch (e, stack) {
      debugPrint("AuthService.login first attempt failed for $username: $e\n$stack");
      final defaultUser = kDefaultUsers.firstWhere(
        (u) => u['username'].toString().toLowerCase() == username.toLowerCase() && u['password'] == password,
        orElse: () => {},
      );
      if (defaultUser.isNotEmpty) {
        debugPrint("Default user found in constants, trying to auto-register in Firebase Auth...");
        try {
          await _authService.createUser(
            username: defaultUser['username'],
            password: defaultUser['password'],
            displayName: defaultUser['displayName'],
            role: defaultUser['role'],
            stage: defaultUser['stage'],
            phone: defaultUser['phone'],
            bio: defaultUser['bio'],
          );
          final cred = await _authService.login(username, password);
          if (cred != null) {
            _isLocalLogin = false;
            return true;
          }
        } catch (err, errStack) {
          debugPrint("Auto-registration error: $err\n$errStack");
        }
        
        // Fallback to local authentication
        debugPrint("Fallback to Local Authentication for ${defaultUser['username']}");
        _isLocalLogin = true;
        _currentUser = UserProfile.fromMap(defaultUser);
        _startFirestoreSubscriptions(defaultUser['uid']);
        notifyListeners();
        return true;
      }
      return false;
    }
  }

  Future<void> logout() async {
    await _authService.logout();
    _currentUser = null;
    _isLocalLogin = false;
    _cancelSubscriptions();
    notifyListeners();
  }

  // Create new user (Super Admin or Admin)
  Future<bool> createUser({
    required String username,
    required String password,
    required String displayName,
    required String role,
    String? stage,
    String? phone,
    String? bio,
    String? assignedTeacherId,
  }) async {
    if (_useMockDb) {
      final newUid = 'uid_mock_${DateTime.now().millisecondsSinceEpoch}';
      _allUsers.add({
        'uid': newUid,
        'username': username,
        'password': password,
        'displayName': displayName,
        'role': role,
        'stage': stage,
        'avatarUrl': null,
        'phone': phone ?? '',
        'bio': bio ?? '',
        'assignedTeacherId': assignedTeacherId,
      });
      notifyListeners();
      return true;
    }
    try {
      await _authService.createUser(
        username: username,
        password: password,
        displayName: displayName,
        role: role,
        stage: stage,
        phone: phone,
        bio: bio,
        assignedTeacherId: assignedTeacherId,
      );
      return true;
    } catch (_) {
      return false;
    }
  }

  // Delete user
  Future<void> deleteUser(String uid) async {
    if (_useMockDb) {
      _allUsers.removeWhere((u) => u['uid'] == uid);
      notifyListeners();
      return;
    }
    await _authService.deleteUser(uid);
  }

  // Update user
  Future<bool> updateUser(String uid, Map<String, dynamic> updates) async {
    if (_useMockDb) {
      final idx = _allUsers.indexWhere((u) => u['uid'] == uid);
      if (idx >= 0) {
        _allUsers[idx].addAll(updates);
        if (_currentUser?.uid == uid) {
          _currentUser = UserProfile.fromMap(_allUsers[idx]);
        }
        notifyListeners();
        return true;
      }
      return false;
    }
    try {
      await _firestoreService.updateUser(uid, updates);
      return true;
    } catch (_) {
      return false;
    }
  }

  List<Map<String, dynamic>> getUsersByRole(String role) {
    return _allUsers.where((u) => u['role'] == role).toList();
  }

  List<Map<String, dynamic>> searchUsers(String query) {
    if (query.isEmpty) return _allUsers;
    return _allUsers.where((u) {
      final name = u['displayName']?.toString().toLowerCase() ?? '';
      final uname = u['username']?.toString().toLowerCase() ?? '';
      return name.contains(query.toLowerCase()) ||
          uname.contains(query.toLowerCase());
    }).toList();
  }

  Map<String, dynamic>? getUserById(String uid) {
    try {
      return _allUsers.firstWhere((u) => u['uid'] == uid);
    } catch (_) {
      return null;
    }
  }

  BookingRecord? getActiveBookingForUser(String studentId) {
    try {
      return _bookings.firstWhere(
        (b) => b.studentId == studentId && (b.status == 'pending' || b.status == 'confirmed'),
      );
    } catch (_) {
      return null;
    }
  }

  // Secure real-time book slot logic
  Future<bool> bookSlot(TimeSlot slot, String fullName, String stage, String teacherName) async {
    if (_currentUser == null) return false;

    // Check if the student already has a booking on this calendar day
    final hasBookingOnDay = _bookings.any((b) =>
        b.studentId == _currentUser!.uid &&
        b.fullDate == slot.fullDate &&
        b.status != 'cancelled');
    if (hasBookingOnDay) {
      debugPrint("Student ${_currentUser!.uid} already has a booking on ${slot.fullDate}");
      return false;
    }

    if (_useMockDb) {
      final idx = _schedules.indexWhere((s) => s.id == slot.id);
      if (idx >= 0) {
        final s = _schedules[idx];
        if (s.bookedStudents >= 1) return false;

        final bookingId = 'booking_mock_${DateTime.now().millisecondsSinceEpoch}';
        final newBooking = BookingRecord(
          id: bookingId,
          slotId: slot.id,
          studentId: _currentUser!.uid,
          studentName: fullName,
          studentStage: stage,
          teacherId: slot.teacherId,
          teacherName: teacherName,
          day: slot.day,
          dayDate: slot.dayDate,
          fullDate: slot.fullDate,
          startTime: slot.startTime,
          endTime: slot.endTime,
          status: 'pending',
          checkedIn: false,
          createdAt: DateTime.now().toIso8601String(),
        );

        _bookings.add(newBooking);
        _schedules[idx] = TimeSlot(
          id: s.id,
          teacherId: s.teacherId,
          teacherName: s.teacherName,
          day: s.day,
          dayDate: s.dayDate,
          fullDate: s.fullDate,
          startTime: s.startTime,
          endTime: s.endTime,
          maxStudents: s.maxStudents,
          bookedStudents: 1,
          status: 'full',
        );

        _notifications.add({
          'id': 'notif_mock_${DateTime.now().millisecondsSinceEpoch}',
          'userId': 'admin',
          'title': 'Yangi dars band qilindi',
          'body': '$fullName o\'qituvchi $teacherName bilan soat ${slot.startTime} ga dars band qildi.',
          'type': 'booking',
          'isRead': false,
          'createdAt': DateTime.now().toIso8601String(),
        });

        await _saveMockDataToPrefs();
        notifyListeners();
        return true;
      }
      return false;
    }
    return await _firestoreService.bookSlotTransaction(
      slot: slot,
      studentId: _currentUser!.uid,
      studentName: fullName,
      studentStage: stage,
      teacherName: teacherName,
    );
  }

  Future<void> updateBookingStatus(String bookingId, String status) async {
    if (_useMockDb) {
      final idx = _bookings.indexWhere((b) => b.id == bookingId);
      if (idx >= 0) {
        final b = _bookings[idx];
        _bookings[idx] = BookingRecord(
          id: b.id,
          slotId: b.slotId,
          studentId: b.studentId,
          studentName: b.studentName,
          studentStage: b.studentStage,
          teacherId: b.teacherId,
          teacherName: b.teacherName,
          day: b.day,
          dayDate: b.dayDate,
          fullDate: b.fullDate,
          startTime: b.startTime,
          endTime: b.endTime,
          status: status,
          checkedIn: b.checkedIn,
          createdAt: b.createdAt,
        );

        if (status == 'cancelled') {
          final sIdx = _schedules.indexWhere((s) => s.id == b.slotId);
          if (sIdx >= 0) {
            final s = _schedules[sIdx];
            _schedules[sIdx] = TimeSlot(
              id: s.id,
              teacherId: s.teacherId,
              teacherName: s.teacherName,
              day: s.day,
              dayDate: s.dayDate,
              fullDate: s.fullDate,
              startTime: s.startTime,
              endTime: s.endTime,
              maxStudents: s.maxStudents,
              bookedStudents: 0,
              status: 'available',
            );
          }
        }
        await _saveMockDataToPrefs();
        notifyListeners();
      }
      return;
    }
    await _firestoreService.updateBookingStatus(bookingId, status);
  }

  Future<void> toggleBookingCheckIn(String bookingId) async {
    if (_useMockDb) {
      final idx = _bookings.indexWhere((b) => b.id == bookingId);
      if (idx >= 0) {
        final b = _bookings[idx];
        _bookings[idx] = BookingRecord(
          id: b.id,
          slotId: b.slotId,
          studentId: b.studentId,
          studentName: b.studentName,
          studentStage: b.studentStage,
          teacherId: b.teacherId,
          teacherName: b.teacherName,
          day: b.day,
          dayDate: b.dayDate,
          fullDate: b.fullDate,
          startTime: b.startTime,
          endTime: b.endTime,
          status: b.status,
          checkedIn: !b.checkedIn,
          createdAt: b.createdAt,
        );
        await _saveMockDataToPrefs();
        notifyListeners();
      }
      return;
    }
    final idx = _bookings.indexWhere((b) => b.id == bookingId);
    if (idx >= 0) {
      final currentVal = _bookings[idx].checkedIn;
      await _firestoreService.toggleBookingCheckIn(bookingId, currentVal);
    }
  }

  // Homework
  Future<void> addHomework({
    required String title,
    required String description,
    required String teacherId,
    required String teacherName,
    String? targetStage,
    required DateTime deadline,
    String? fileUrl,
  }) async {
    if (_useMockDb) {
      _homeworks.add({
        'id': 'hw_mock_${DateTime.now().millisecondsSinceEpoch}',
        'title': title,
        'description': description,
        'teacherId': teacherId,
        'teacherName': teacherName,
        'targetStage': targetStage,
        'deadline': deadline.toIso8601String(),
        'fileUrl': fileUrl,
        'createdAt': DateTime.now().toIso8601String(),
        'submittedBy': [],
      });
      await _saveMockDataToPrefs();
      notifyListeners();
      return;
    }
    await _firestoreService.addHomework(
      title: title,
      description: description,
      teacherId: teacherId,
      teacherName: teacherName,
      targetStage: targetStage,
      deadline: deadline,
      fileUrl: fileUrl,
    );
  }

  Future<void> submitHomework({
    required String homeworkId,
    required String submissionText,
    String? fileUrl,
  }) async {
    if (_currentUser == null) return;
    if (_useMockDb) {
      final subId = '${homeworkId}_${_currentUser!.uid}';
      _submissions.add({
        'id': subId,
        'homeworkId': homeworkId,
        'studentId': _currentUser!.uid,
        'studentName': _currentUser!.displayName,
        'submissionText': submissionText,
        'fileUrl': fileUrl,
        'submittedAt': DateTime.now().toIso8601String(),
        'status': 'submitted',
      });
      final hwIdx = _homeworks.indexWhere((h) => h['id'] == homeworkId);
        if (hwIdx >= 0) {
          final list = List<String>.from(_homeworks[hwIdx]['submittedBy'] ?? []);
          if (!list.contains(_currentUser!.uid)) {
            list.add(_currentUser!.uid);
            _homeworks[hwIdx]['submittedBy'] = list;
          }
        }
        await _saveMockDataToPrefs();
        notifyListeners();
        return;
      }
    await _firestoreService.submitHomework(
      homeworkId: homeworkId,
      studentId: _currentUser!.uid,
      studentName: _currentUser!.displayName,
      submissionText: submissionText,
      fileUrl: fileUrl,
    );
  }

  // Grades
  Future<void> addGrade({
    required String studentId,
    required String studentName,
    required String teacherId,
    required String teacherName,
    required String subject,
    required double score,
    required double maxScore,
    required String comments,
  }) async {
    if (_useMockDb) {
      final percentage = (score / maxScore) * 100;
      _grades.add({
        'id': 'grade_mock_${DateTime.now().millisecondsSinceEpoch}',
        'studentId': studentId,
        'studentName': studentName,
        'teacherId': teacherId,
        'teacherName': teacherName,
        'subject': subject,
        'score': score,
        'maxScore': maxScore,
        'percentage': percentage,
        'comments': comments,
        'date': DateTime.now().toIso8601String(),
      });
      await _saveMockDataToPrefs();
      notifyListeners();
      return;
    }
    await _firestoreService.addGrade(
      studentId: studentId,
      studentName: studentName,
      teacherId: teacherId,
      teacherName: teacherName,
      subject: subject,
      score: score,
      maxScore: maxScore,
      comments: comments,
    );
  }

  // Attendance
  Future<void> markAttendance({
    required String studentId,
    required String studentName,
    required String teacherId,
    required String status,
    required String note,
  }) async {
    if (_useMockDb) {
      final todayStr = DateTime.now().toIso8601String().split('T').first;
      _attendance.add({
        'id': '${studentId}_${todayStr}_mock',
        'studentId': studentId,
        'studentName': studentName,
        'teacherId': teacherId,
        'status': status,
        'note': note,
        'date': DateTime.now().toIso8601String(),
      });
      await _saveMockDataToPrefs();
      notifyListeners();
      return;
    }
    await _firestoreService.markAttendance(
      studentId: studentId,
      studentName: studentName,
      teacherId: teacherId,
      status: status,
      note: note,
    );
  }

  // Save lesson report
  Future<void> saveLessonReport({
    required String bookingId,
    required String studentId,
    required String studentName,
    required String teacherId,
    required String teacherName,
    required String fullDate,
    required String topic,
    required String notes,
  }) async {
    if (_useMockDb) {
      _lessons.add({
        'id': 'lesson_mock_${DateTime.now().millisecondsSinceEpoch}',
        'bookingId': bookingId,
        'studentId': studentId,
        'studentName': studentName,
        'teacherId': teacherId,
        'teacherName': teacherName,
        'fullDate': fullDate,
        'topic': topic,
        'notes': notes,
        'createdAt': DateTime.now().toIso8601String(),
      });
      await _saveMockDataToPrefs();
      notifyListeners();
      return;
    }
    await _firestoreService.saveLessonReport(
      bookingId: bookingId,
      studentId: studentId,
      studentName: studentName,
      teacherId: teacherId,
      teacherName: teacherName,
      fullDate: fullDate,
      topic: topic,
      notes: notes,
    );
  }

  // Notifications
  Future<void> markNotificationRead(String notificationId) async {
    if (_useMockDb) {
      final idx = _notifications.indexWhere((n) => n['id'] == notificationId);
      if (idx >= 0) {
        _notifications[idx]['isRead'] = true;
        await _saveMockDataToPrefs();
        notifyListeners();
      }
      return;
    }
    await _firestoreService.markNotificationRead(notificationId);
  }

  // Dynamic schedules management
  Future<void> addSchedule(TimeSlot slot) async {
    if (_useMockDb) {
      _schedules.add(slot);
      await _saveMockDataToPrefs();
      notifyListeners();
      return;
    }
    await _firestoreService.addSchedule(slot);
  }

  Future<void> deleteSchedule(String slotId) async {
    if (_useMockDb) {
      _schedules.removeWhere((s) => s.id == slotId);
      await _saveMockDataToPrefs();
      notifyListeners();
      return;
    }
    await _firestoreService.deleteSchedule(slotId);
  }

  // Chat messaging
  Stream<List<ChatMessage>> streamChatMessages(String userA, String userB) {
    if (_useMockDb) {
      final controller = StreamController<List<ChatMessage>>();
      
      if (_mockChatMessages.isEmpty) {
        _mockChatMessages.addAll([
          ChatMessage(
            id: 'msg_seed_1',
            senderId: 'teacher_001',
            senderName: 'Miss Osiyo',
            receiverId: 'student_001',
            content: 'Hello, welcome to Native Elite! Let me know if you have any questions.',
            timestamp: DateTime.now().subtract(const Duration(hours: 2)),
            isRead: true,
          ),
          ChatMessage(
            id: 'msg_seed_2',
            senderId: 'student_001',
            senderName: 'Alibek Karimov',
            receiverId: 'teacher_001',
            content: 'Thank you teacher! I am ready for the booking session.',
            timestamp: DateTime.now().subtract(const Duration(hours: 1)),
            isRead: true,
          ),
        ]);
      }

      void emitFiltered() {
        final list = _mockChatMessages.where((m) =>
            (m.senderId == userA && m.receiverId == userB) ||
            (m.senderId == userB && m.receiverId == userA)).toList();
        list.sort((a, b) => a.timestamp.compareTo(b.timestamp));
        if (!controller.isClosed) {
          controller.add(list);
        }
      }

      emitFiltered();

      final listener = () {
        emitFiltered();
      };
      addListener(listener);

      controller.onCancel = () {
        removeListener(listener);
        controller.close();
      };

      return controller.stream;
    }

    return _firestoreService.streamChatMessages(userA, userB);
  }

  Future<void> sendChatMessage(ChatMessage msg) async {
    if (_useMockDb) {
      _mockChatMessages.add(msg);
      await _saveMockDataToPrefs();
      notifyListeners();
      return;
    }
    await _firestoreService.sendChatMessage(msg);
  }

  Future<void> _saveMockDataToPrefs() async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      final bookingsJson = json.encode(_bookings.map((b) => b.toMap()).toList());
      final schedulesJson = json.encode(_schedules.map((s) => s.toMap()).toList());
      final notificationsJson = json.encode(_notifications);
      final homeworksJson = json.encode(_homeworks);
      final submissionsJson = json.encode(_submissions);
      final gradesJson = json.encode(_grades);
      final attendanceJson = json.encode(_attendance);
      final lessonsJson = json.encode(_lessons);
      final messagesJson = json.encode(_mockChatMessages.map((m) => m.toMap()).toList());
      
      await prefs.setString('mock_bookings', bookingsJson);
      await prefs.setString('mock_schedules', schedulesJson);
      await prefs.setString('mock_notifications', notificationsJson);
      await prefs.setString('mock_homeworks', homeworksJson);
      await prefs.setString('mock_submissions', submissionsJson);
      await prefs.setString('mock_grades', gradesJson);
      await prefs.setString('mock_attendance', attendanceJson);
      await prefs.setString('mock_lessons', lessonsJson);
      await prefs.setString('mock_messages', messagesJson);
      
      final nextTime = DateTime.now().millisecondsSinceEpoch;
      _lastMockModifiedTime = nextTime;
      await prefs.setInt('mock_last_modified', nextTime);
    } catch (e) {
      debugPrint("Error saving mock data to SharedPreferences: $e");
    }
  }

  Future<void> _loadMockDataFromPrefs({bool onlyIfChanged = false}) async {
    try {
      final prefs = await SharedPreferences.getInstance();
      
      if (onlyIfChanged) {
        final lastMod = prefs.getInt('mock_last_modified') ?? 0;
        if (lastMod <= _lastMockModifiedTime) {
          return; // No changes
        }
        _lastMockModifiedTime = lastMod;
      } else {
        _lastMockModifiedTime = prefs.getInt('mock_last_modified') ?? 0;
      }
      
      final bookingsStr = prefs.getString('mock_bookings');
      final schedulesStr = prefs.getString('mock_schedules');
      final notificationsStr = prefs.getString('mock_notifications');
      final homeworksStr = prefs.getString('mock_homeworks');
      final submissionsStr = prefs.getString('mock_submissions');
      final gradesStr = prefs.getString('mock_grades');
      final attendanceStr = prefs.getString('mock_attendance');
      final lessonsStr = prefs.getString('mock_lessons');
      final messagesStr = prefs.getString('mock_messages');
      
      bool changed = false;
      
      if (bookingsStr != null) {
        final List decoded = json.decode(bookingsStr);
        _bookings = decoded.map((item) => BookingRecord.fromMap(item as Map<String, dynamic>)).toList();
        changed = true;
      }
      
      if (schedulesStr != null) {
        final List decoded = json.decode(schedulesStr);
        _schedules = decoded.map((item) => TimeSlot.fromMap(item as Map<String, dynamic>)).toList();
        changed = true;
      } else {
        if (_schedules.isEmpty) {
          _schedules = _generateDefaultSchedules();
          changed = true;
        }
      }
      
      if (notificationsStr != null) {
        final List decoded = json.decode(notificationsStr);
        _notifications = decoded.cast<Map<String, dynamic>>();
        changed = true;
      }
      
      if (homeworksStr != null) {
        final List decoded = json.decode(homeworksStr);
        _homeworks = decoded.cast<Map<String, dynamic>>();
        changed = true;
      }

      if (submissionsStr != null) {
        final List decoded = json.decode(submissionsStr);
        _submissions = decoded.cast<Map<String, dynamic>>();
        changed = true;
      }

      if (gradesStr != null) {
        final List decoded = json.decode(gradesStr);
        _grades = decoded.cast<Map<String, dynamic>>();
        changed = true;
      }

      if (attendanceStr != null) {
        final List decoded = json.decode(attendanceStr);
        _attendance = decoded.cast<Map<String, dynamic>>();
        changed = true;
      }

      if (lessonsStr != null) {
        final List decoded = json.decode(lessonsStr);
        _lessons = decoded.cast<Map<String, dynamic>>();
        changed = true;
      }

      if (messagesStr != null) {
        final List decoded = json.decode(messagesStr);
        _mockChatMessages.clear();
        _mockChatMessages.addAll(decoded.map((item) => ChatMessage.fromMap(item as Map<String, dynamic>)));
        changed = true;
      }
      
      if (changed) {
        notifyListeners();
      }
    } catch (e) {
      debugPrint("Error loading mock data from SharedPreferences: $e");
    }
  }
}
