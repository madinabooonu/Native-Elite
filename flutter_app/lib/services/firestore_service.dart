import 'package:cloud_firestore/cloud_firestore.dart';
import 'package:flutter/material.dart';
import '../models/types.dart';

class FirestoreService {
  final FirebaseFirestore _db = FirebaseFirestore.instance;

  // ─────────────────────────────────────────────────────────
  // USERS
  // ─────────────────────────────────────────────────────────
  Stream<List<Map<String, dynamic>>> streamUsers() {
    return _db.collection('users').snapshots().map((snap) =>
        snap.docs.map((doc) => doc.data()).toList());
  }

  Future<void> updateUser(String uid, Map<String, dynamic> data) async {
    await _db.collection('users').doc(uid).update(data);
  }

  // ─────────────────────────────────────────────────────────
  // SCHEDULES (Lesson Slots)
  // ─────────────────────────────────────────────────────────
  Stream<List<TimeSlot>> streamSchedules() {
    return _db.collection('schedules').snapshots().map((snap) =>
        snap.docs.map((doc) => TimeSlot.fromMap(doc.data())).toList());
  }

  Future<void> addSchedule(TimeSlot slot) async {
    await _db.collection('schedules').doc(slot.id).set(slot.toMap());
  }

  Future<void> deleteSchedule(String slotId) async {
    await _db.collection('schedules').doc(slotId).delete();
  }

  // ─────────────────────────────────────────────────────────
  // BOOKINGS (Real-Time Booking Transaction)
  // ─────────────────────────────────────────────────────────
  Stream<List<BookingRecord>> streamBookings() {
    return _db.collection('bookings').snapshots().map((snap) =>
        snap.docs.map((doc) => BookingRecord.fromMap(doc.data())).toList());
  }

  // Double booking prevention using Firestore Transactions
  Future<bool> bookSlotTransaction({
    required TimeSlot slot,
    required String studentId,
    required String studentName,
    required String studentStage,
    required String teacherName,
    String? notes,
  }) async {
    final scheduleRef = _db.collection('schedules').doc(slot.id);
    final bookingId = 'booking_${DateTime.now().millisecondsSinceEpoch}';
    final bookingRef = _db.collection('bookings').doc(bookingId);
    final notificationRef = _db.collection('notifications').doc('notif_${DateTime.now().millisecondsSinceEpoch}');

    try {
      final success = await _db.runTransaction<bool>((transaction) async {
        final scheduleSnap = await transaction.get(scheduleRef);
        if (!scheduleSnap.exists) {
          debugPrint("Schedule slot does not exist");
          return false;
        }

        final scheduleData = scheduleSnap.data() as Map<String, dynamic>;
        final bookedStudents = scheduleData['bookedStudents'] ?? 0;
        final maxStudents = 1;

        if (bookedStudents >= maxStudents) {
          debugPrint("Schedule slot is already full");
          return false;
        }

        final newBookedCount = bookedStudents + 1;
        final newStatus = newBookedCount >= maxStudents ? 'full' : 'available';

        // 1. Update schedule slot
        transaction.update(scheduleRef, {
          'bookedStudents': newBookedCount,
          'status': newStatus,
        });

        // 2. Create BookingRecord
        final newBooking = BookingRecord(
          id: bookingId,
          slotId: slot.id,
          studentId: studentId,
          studentName: studentName,
          studentStage: studentStage,
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
        transaction.set(bookingRef, newBooking.toMap());

        // 3. Create Notification for Admin & Teacher
        transaction.set(notificationRef, {
          'id': notificationRef.id,
          'userId': 'admin',
          'title': 'Yangi dars band qilindi',
          'body': '$studentName o\'qituvchi $teacherName bilan soat ${slot.startTime} ga dars band qildi.',
          'type': 'booking',
          'isRead': false,
          'createdAt': DateTime.now().toIso8601String(),
        });

        return true;
      });

      return success;
    } catch (e) {
      debugPrint("Booking Transaction Error: $e");
      return false;
    }
  }

  Future<void> updateBookingStatus(String bookingId, String status) async {
    await _db.collection('bookings').doc(bookingId).update({'status': status});
    
    if (status == 'cancelled') {
      try {
        final snap = await _db.collection('bookings').doc(bookingId).get();
        if (snap.exists) {
          final data = snap.data() as Map<String, dynamic>;
          final slotId = data['slotId'];
          if (slotId != null) {
            await _db.collection('schedules').doc(slotId).update({
              'bookedStudents': 0,
              'status': 'available',
            });
          }
        }
      } catch (e) {
        debugPrint("Error freeing slot on cancel: $e");
      }
    }
  }

  Future<void> toggleBookingCheckIn(String bookingId, bool currentVal) async {
    await _db.collection('bookings').doc(bookingId).update({'checkedIn': !currentVal});
  }

  // ─────────────────────────────────────────────────────────
  // LESSONS
  // ─────────────────────────────────────────────────────────
  Stream<List<Map<String, dynamic>>> streamLessons() {
    return _db.collection('lessons').snapshots().map((snap) =>
        snap.docs.map((doc) => doc.data()).toList());
  }

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
    final lessonId = 'lesson_${DateTime.now().millisecondsSinceEpoch}';
    await _db.collection('lessons').doc(lessonId).set({
      'id': lessonId,
      'bookingId': bookingId,
      'studentId': studentId,
      'studentName': studentName,
      'teacherId': teacherId,
      'teacherName': teacherName,
      'fullDate': fullDate,
      'topic': topic,
      'notes': notes,
      'createdAt': FieldValue.serverTimestamp(),
    });
  }

  // ─────────────────────────────────────────────────────────
  // HOMEWORKS
  // ─────────────────────────────────────────────────────────
  Stream<List<Map<String, dynamic>>> streamHomeworks() {
    return _db.collection('homeworks').snapshots().map((snap) =>
        snap.docs.map((doc) => doc.data()).toList());
  }

  Future<void> addHomework({
    required String title,
    required String description,
    required String teacherId,
    required String teacherName,
    String? targetStage,
    required DateTime deadline,
    String? fileUrl,
  }) async {
    final id = 'hw_${DateTime.now().millisecondsSinceEpoch}';
    await _db.collection('homeworks').doc(id).set({
      'id': id,
      'title': title,
      'description': description,
      'teacherId': teacherId,
      'teacherName': teacherName,
      'targetStage': targetStage,
      'deadline': deadline.toIso8601String(),
      'fileUrl': fileUrl,
      'createdAt': FieldValue.serverTimestamp(),
      'submittedBy': [],
    });
  }

  // ─────────────────────────────────────────────────────────
  // HOMEWORK SUBMISSIONS
  // ─────────────────────────────────────────────────────────
  Stream<List<Map<String, dynamic>>> streamHomeworkSubmissions() {
    return _db.collection('homework_submissions').snapshots().map((snap) =>
        snap.docs.map((doc) => doc.data()).toList());
  }

  Future<void> submitHomework({
    required String homeworkId,
    required String studentId,
    required String studentName,
    required String submissionText,
    String? fileUrl,
  }) async {
    final id = '${homeworkId}_$studentId';
    await _db.collection('homework_submissions').doc(id).set({
      'id': id,
      'homeworkId': homeworkId,
      'studentId': studentId,
      'studentName': studentName,
      'submissionText': submissionText,
      'fileUrl': fileUrl,
      'submittedAt': FieldValue.serverTimestamp(),
      'status': 'submitted',
    });

    // Add studentId to homework document's submittedBy list
    await _db.collection('homeworks').doc(homeworkId).update({
      'submittedBy': FieldValue.arrayUnion([studentId]),
    });
  }

  // ─────────────────────────────────────────────────────────
  // GRADES
  // ─────────────────────────────────────────────────────────
  Stream<List<Map<String, dynamic>>> streamGrades() {
    return _db.collection('grades').snapshots().map((snap) =>
        snap.docs.map((doc) => doc.data()).toList());
  }

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
    final id = 'grade_${DateTime.now().millisecondsSinceEpoch}';
    final percentage = (score / maxScore) * 100;
    await _db.collection('grades').doc(id).set({
      'id': id,
      'studentId': studentId,
      'studentName': studentName,
      'teacherId': teacherId,
      'teacherName': teacherName,
      'subject': subject,
      'score': score,
      'maxScore': maxScore,
      'percentage': percentage,
      'comments': comments,
      'date': FieldValue.serverTimestamp(),
    });
  }

  // ─────────────────────────────────────────────────────────
  // ATTENDANCE
  // ─────────────────────────────────────────────────────────
  Stream<List<Map<String, dynamic>>> streamAttendance() {
    return _db.collection('attendance').snapshots().map((snap) =>
        snap.docs.map((doc) => doc.data()).toList());
  }

  Future<void> markAttendance({
    required String studentId,
    required String studentName,
    required String teacherId,
    required String status, // 'present' | 'absent' | 'late'
    required String note,
  }) async {
    final todayStr = DateTime.now().toIso8601String().split('T').first;
    final id = '${studentId}_$todayStr';
    await _db.collection('attendance').doc(id).set({
      'id': id,
      'studentId': studentId,
      'studentName': studentName,
      'teacherId': teacherId,
      'status': status,
      'note': note,
      'date': FieldValue.serverTimestamp(),
    });
  }

  // ─────────────────────────────────────────────────────────
  // NOTIFICATIONS
  // ─────────────────────────────────────────────────────────
  Stream<List<Map<String, dynamic>>> streamNotifications() {
    return _db.collection('notifications').snapshots().map((snap) =>
        snap.docs.map((doc) => doc.data()).toList());
  }

  Future<void> markNotificationRead(String notificationId) async {
    await _db.collection('notifications').doc(notificationId).update({'isRead': true});
  }

  // ─────────────────────────────────────────────────────────
  // CHAT SYSTEM
  // ─────────────────────────────────────────────────────────
  Stream<List<ChatMessage>> streamChatMessages(String userA, String userB) {
    // Generate deterministic chatId
    final list = [userA, userB]..sort();
    final chatId = '${list[0]}_${list[1]}';
    return _db
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .orderBy('timestamp', descending: false)
        .snapshots()
        .map((snap) =>
            snap.docs.map((doc) => ChatMessage.fromMap(doc.data())).toList());
  }

  Future<void> sendChatMessage(ChatMessage msg) async {
    final list = [msg.senderId, msg.receiverId]..sort();
    final chatId = '${list[0]}_${list[1]}';

    await _db
        .collection('chats')
        .doc(chatId)
        .collection('messages')
        .doc(msg.id)
        .set(msg.toMap());
  }
}
