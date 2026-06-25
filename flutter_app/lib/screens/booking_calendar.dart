import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_provider.dart';
import '../models/types.dart';

class BookingCalendar extends StatefulWidget {
  const BookingCalendar({super.key});

  @override
  State<BookingCalendar> createState() => _BookingCalendarState();
}

class _BookingCalendarState extends State<BookingCalendar> {
  String? selectedTeacher;
  String? selectedDay;
  String? selectedDayFullDate;

  final List<Map<String, dynamic>> teachers = [
    {
      'id': 't2',
      'name': 'Miss Osiyo',
      'role': 'Support Teacher',
      'avatar': '👩‍🏫',
      'colorStart': Color(0xFFA855F7),
      'colorEnd': Color(0xFF7E22CE),
      'bgLight': Color(0xFFFAF5FF),
      'textColor': Color(0xFF7E22CE),
      'borderColor': Color(0xFFA855F7),
    },
    {
      'id': 't3',
      'name': 'Mr Sarvar',
      'role': 'Support Teacher',
      'avatar': '👨‍🎓',
      'colorStart': Color(0xFFF97316),
      'colorEnd': Color(0xFFC2410C),
      'bgLight': Color(0xFFFFF7ED),
      'textColor': Color(0xFFC2410C),
      'borderColor': Color(0xFFF97316),
    },
  ];

  List<Map<String, dynamic>> getCurrentWeekDays() {
    final now = DateTime.now();
    // Start of the week is Monday. weekday = 1 (Mon) to 7 (Sun)
    final monday = now.subtract(Duration(days: now.weekday - 1));
    final dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    final monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    return List.generate(7, (i) {
      final d = monday.add(Duration(days: i));
      return {
        'day': dayNames[i],
        'date': d.day,
        'month': monthNames[d.month - 1],
        'fullDate': "${d.year}-${d.month.toString().padLeft(2, '0')}-${d.day.toString().padLeft(2, '0')}",
        'dayOfWeek': i,
      };
    });
  }

  List<TimeSlot> generateSlotsForTeacher(String teacherId, List<Map<String, dynamic>> weekDays) {
    final List<Map<String, String>> customSlots = [
      {'start': '12:00', 'end': '12:45'},
      {'start': '12:50', 'end': '13:35'},
      {'start': '13:40', 'end': '14:25'},
      {'start': '14:30', 'end': '15:15'},
      {'start': '16:00', 'end': '16:45'},
      {'start': '16:50', 'end': '17:35'},
      {'start': '17:40', 'end': '18:25'},
      {'start': '18:30', 'end': '19:15'},
      {'start': '19:20', 'end': '20:00'},
    ];
    final teacherName = teacherId == 't2' ? 'Miss Osiyo' : 'Mr Sarvar';
    final List<TimeSlot> slots = [];

    final appProvider = context.read<AppProvider>();
    final dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    for (final dayName in dayNames) {
      final dayObj = weekDays.firstWhere((d) => d['day'] == dayName, orElse: () => {});
      if (dayObj.isEmpty) continue;

      for (final slotInfo in customSlots) {
        final startTime = slotInfo['start']!;
        final endTime = slotInfo['end']!;
        final slotId = '$teacherId-$dayName-$startTime';
        final fullDate = dayObj['fullDate'];

        final bookedCount = appProvider.bookings.where((b) =>
            b.slotId == slotId && b.fullDate == fullDate && b.status != 'cancelled').length;

        slots.add(TimeSlot(
          id: slotId,
          teacherId: teacherId,
          teacherName: teacherName,
          day: dayName,
          dayDate: "${dayObj['month']} ${dayObj['date']}",
          fullDate: fullDate,
          startTime: startTime,
          endTime: endTime,
          bookedStudents: bookedCount,
          maxStudents: 1,
          status: bookedCount >= 1 ? 'full' : 'available',
        ));
      }
    }
    return slots;
  }

  bool isDayDisabled(String fullDate) {
    final todayStr = DateTime.now().toIso8601String().split('T').first;
    return fullDate.compareTo(todayStr) < 0;
  }

  @override
  void initState() {
    super.initState();
    final weekDays = getCurrentWeekDays();
    final todayIndex = DateTime.now().weekday == 7 ? 6 : DateTime.now().weekday - 1;
    selectedDay = weekDays[todayIndex]['day'];
    selectedDayFullDate = weekDays[todayIndex]['fullDate'];
  }

  @override
  Widget build(BuildContext context) {
    final appProvider = context.watch<AppProvider>();
    final user = appProvider.currentUser;
    if (user == null) return const SizedBox();

    BookingRecord? bookingOnSelectedDay;
    try {
      bookingOnSelectedDay = appProvider.bookings.firstWhere(
        (b) => b.studentId == user.uid && b.fullDate == selectedDayFullDate && b.status != 'cancelled',
      );
    } catch (_) {
      bookingOnSelectedDay = null;
    }
    final hasBookingOnSelectedDay = bookingOnSelectedDay != null;

    final weekDays = getCurrentWeekDays();

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final textMuted = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final primaryColor = const Color(0xFF0353A4);
    final borderColor = isDark ? Colors.white.withValues(alpha: 0.1) : Colors.grey.shade200;

    // Read slots from database
    final dbSlots = appProvider.schedules.where((s) => s.teacherId == selectedTeacher).toList();

    // Auto-populate default slots to Firestore if none exist yet for this teacher
    if (selectedTeacher != null && dbSlots.isEmpty) {
      final defaultSlots = generateSlotsForTeacher(selectedTeacher!, weekDays);
      WidgetsBinding.instance.addPostFrameCallback((_) {
        for (final s in defaultSlots) {
          appProvider.addSchedule(s);
        }
      });
    }

    final List<TimeSlot> allSlots = dbSlots.isNotEmpty
        ? dbSlots
        : (selectedTeacher != null ? generateSlotsForTeacher(selectedTeacher!, weekDays) : []);
    final filteredSlots = allSlots.where((s) => s.day == selectedDay).toList();

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Active Booking Warning Banner for selected day
        if (hasBookingOnSelectedDay)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
              decoration: BoxDecoration(
                color: const Color(0xFFECFDF5),
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: const Color(0xFFA7F3D0)),
              ),
              child: Row(
                children: [
                  const Icon(Icons.info_outline, color: Color(0xFF059669), size: 20),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Text(
                      "Siz ushbu kun (${bookingOnSelectedDay.dayDate}) uchun dars band qilgansiz: ${bookingOnSelectedDay.teacherName} bilan (${bookingOnSelectedDay.startTime} - ${bookingOnSelectedDay.endTime})",
                      style: const TextStyle(
                        color: Color(0xFF065F46),
                        fontSize: 12.5,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

        // Step 1: Select Teacher
        Padding(
          padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSectionHeader('1', 'Select Teacher', primaryColor, textColor),
                  const SizedBox(height: 12),
                  Row(
                    children: teachers.map((t) {
                      final isSelected = selectedTeacher == t['id'];
                      return Expanded(
                        child: GestureDetector(
                          onTap: () => setState(() {
                            selectedTeacher = t['id'];
                          }),
                          child: Container(
                            margin: const EdgeInsets.symmetric(horizontal: 4),
                            padding: const EdgeInsets.all(16),
                            decoration: BoxDecoration(
                              color: cardColor,
                              border: Border.all(
                                color: isSelected
                                    ? t['borderColor']
                                    : Colors.transparent,
                                width: 2,
                              ),
                              borderRadius: BorderRadius.circular(20),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.04),
                                  blurRadius: 10,
                                  offset: const Offset(0, 4),
                                ),
                                if (isSelected)
                                  BoxShadow(
                                    color: (t['borderColor'] as Color).withValues(alpha: 0.15),
                                    blurRadius: 12,
                                    offset: const Offset(0, 6),
                                  ),
                              ],
                            ),
                            child: Column(
                              children: [
                                Container(
                                  width: 44,
                                  height: 44,
                                  decoration: BoxDecoration(
                                    gradient: isSelected
                                        ? LinearGradient(
                                            colors: [t['colorStart'], t['colorEnd']],
                                            begin: Alignment.topLeft,
                                            end: Alignment.bottomRight,
                                          )
                                        : null,
                                    color: isSelected ? null : (isDark ? const Color(0xFF1E293B) : t['bgLight']),
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  alignment: Alignment.center,
                                  child: Text(
                                    t['avatar'],
                                    style: const TextStyle(fontSize: 22),
                                  ),
                                ),
                                const SizedBox(height: 10),
                                Text(
                                  t['name'],
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 13.5,
                                    color: isSelected && !isDark ? t['textColor'] : textColor,
                                  ),
                                ),
                                const SizedBox(height: 2),
                                Text(
                                  t['role'],
                                  style: TextStyle(fontSize: 10.5, color: textMuted),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),

        // Step 2: Select Day
        if (selectedTeacher != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 24, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSectionHeader('2', 'Select Day', primaryColor, textColor),
                const SizedBox(height: 12),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  clipBehavior: Clip.none,
                  child: Row(
                    children: weekDays.map((wd) {
                      final isSelected = selectedDay == wd['day'];
                      final disabled = isDayDisabled(wd['fullDate']);
                      return GestureDetector(
                        onTap: disabled
                            ? null
                            : () => setState(() {
                                  selectedDay = wd['day'];
                                  selectedDayFullDate = wd['fullDate'];
                                }),
                        child: Opacity(
                          opacity: disabled ? 0.4 : 1.0,
                          child: Container(
                            margin: const EdgeInsets.only(right: 8),
                            width: 62,
                            padding: const EdgeInsets.symmetric(vertical: 12),
                            decoration: BoxDecoration(
                              color: isSelected ? primaryColor : cardColor,
                              border: Border.all(
                                color: isSelected ? primaryColor : borderColor,
                                width: 1.5,
                              ),
                              borderRadius: BorderRadius.circular(16),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.03),
                                  blurRadius: 8,
                                  offset: const Offset(0, 2),
                                ),
                              ],
                            ),
                            child: Column(
                              children: [
                                Text(
                                  (wd['day'] as String).toUpperCase(),
                                  style: TextStyle(
                                    fontSize: 9.5,
                                    fontWeight: FontWeight.bold,
                                    color: isSelected ? Colors.white70 : textMuted,
                                  ),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  "${wd['date']}",
                                  style: TextStyle(
                                    fontSize: 17,
                                    fontWeight: FontWeight.bold,
                                    color: isSelected ? Colors.white : textColor,
                                  ),
                                ),
                              ],
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),

        // Step 3: Slots List
        if (selectedTeacher != null)
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 24, 16, 20),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                _buildSectionHeader('3', 'Available Slots', primaryColor, textColor),
                const SizedBox(height: 12),
                if (filteredSlots.isEmpty)
                  Center(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(vertical: 24),
                      child: Text(
                        "Ushbu kunda darslar mavjud emas.",
                        style: TextStyle(color: textMuted, fontSize: 13),
                      ),
                    ),
                  )
                else
                  ListView.builder(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    itemCount: filteredSlots.length,
                    itemBuilder: (context, i) {
                      final slot = filteredSlots[i];
                      final isBooked = appProvider.bookings.any((b) =>
                          b.slotId == slot.id && b.fullDate == slot.fullDate && b.status != 'cancelled');
                      final isFull = isBooked || slot.status == 'full';
                      final disabled = isFull || hasBookingOnSelectedDay;

                      BookingRecord? myBooking;
                      try {
                        myBooking = appProvider.bookings.firstWhere(
                          (b) => b.slotId == slot.id && b.fullDate == slot.fullDate && b.studentId == user.uid && b.status != 'cancelled',
                        );
                      } catch (_) {
                        myBooking = null;
                      }

                      return Opacity(
                        opacity: disabled ? 0.5 : 1.0,
                        child: Container(
                          margin: const EdgeInsets.only(bottom: 10),
                          padding: const EdgeInsets.all(14),
                          decoration: BoxDecoration(
                            color: cardColor,
                            borderRadius: BorderRadius.circular(18),
                            border: Border.all(
                              color: isDark ? Colors.transparent : Colors.grey.shade100,
                            ),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withValues(alpha: 0.02),
                                blurRadius: 10,
                                offset: const Offset(0, 3),
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Container(
                                    width: 38,
                                    height: 38,
                                    decoration: BoxDecoration(
                                      color: primaryColor.withValues(alpha: 0.08),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Icon(
                                      Icons.access_time_rounded,
                                      size: 18,
                                      color: primaryColor,
                                    ),
                                  ),
                                  const SizedBox(width: 12),
                                  Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        "${slot.startTime} - ${slot.endTime}",
                                        style: TextStyle(
                                          fontWeight: FontWeight.bold,
                                          fontSize: 14,
                                          color: textColor,
                                        ),
                                      ),
                                      const SizedBox(height: 1),
                                      Text(
                                        slot.teacherName,
                                        style: TextStyle(
                                          fontSize: 11,
                                          color: textMuted,
                                        ),
                                      ),
                                    ],
                                  ),
                                ],
                              ),
                              Row(
                                children: [
                                  Container(
                                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                    decoration: BoxDecoration(
                                      color: isFull
                                          ? const Color(0xFFFEF2F2)
                                          : const Color(0xFFECFDF5),
                                      borderRadius: BorderRadius.circular(12),
                                    ),
                                    child: Text(
                                      isFull
                                          ? (myBooking != null ? '🔴 Siz band qilgansiz' : '🔴 Band')
                                          : '🟢 Bo‘sh',
                                      style: TextStyle(
                                        fontSize: 10.5,
                                        fontWeight: FontWeight.bold,
                                        color: isFull
                                            ? const Color(0xFFEF4444)
                                            : const Color(0xFF10B981),
                                      ),
                                    ),
                                  ),
                                  const SizedBox(width: 10),
                                  ElevatedButton(
                                    onPressed: disabled
                                        ? null
                                        : () => _showBookingSheet(context, slot),
                                    style: ElevatedButton.styleFrom(
                                      backgroundColor: primaryColor,
                                      foregroundColor: Colors.white,
                                      elevation: 0,
                                      shape: RoundedRectangleBorder(
                                        borderRadius: BorderRadius.circular(10),
                                      ),
                                      padding: const EdgeInsets.symmetric(horizontal: 16),
                                      minimumSize: const Size(64, 34),
                                    ),
                                    child: const Text(
                                      'Band qilish',
                                      style: TextStyle(
                                        fontSize: 11.5,
                                        fontWeight: FontWeight.bold,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
              ],
            ),
          ),
      ],
    );
  }

  Widget _buildSectionHeader(String index, String title, Color primary, Color textColor) {
    return Row(
      children: [
        Container(
          width: 22,
          height: 22,
          decoration: BoxDecoration(color: primary, shape: BoxShape.circle),
          alignment: Alignment.center,
          child: Text(
            index,
            style: const TextStyle(
              color: Colors.white,
              fontSize: 11,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        const SizedBox(width: 8),
        Text(
          title,
          style: TextStyle(
            fontSize: 14.5,
            fontWeight: FontWeight.bold,
            color: textColor,
          ),
        ),
      ],
    );
  }

  void _showBookingSheet(BuildContext context, TimeSlot slot) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (ctx) => _BookingFormSheet(slot: slot),
    );
  }
}

class _BookingFormSheet extends StatefulWidget {
  final TimeSlot slot;
  const _BookingFormSheet({required this.slot});

  @override
  State<_BookingFormSheet> createState() => _BookingFormSheetState();
}

class _BookingFormSheetState extends State<_BookingFormSheet> {
  final _formKey = GlobalKey<FormState>();
  final _nameController = TextEditingController();
  final _stageController = TextEditingController();
  final _teacherController = TextEditingController();
  bool _isSubmitting = false;
  bool _success = false;

  @override
  void initState() {
    super.initState();
    final appProvider = context.read<AppProvider>();
    final user = appProvider.currentUser;
    if (user != null) {
      _nameController.text = user.displayName;
      _stageController.text = user.stage ?? 'Stage 1';
      _teacherController.text = user.assignedTeacherId != null
          ? (user.assignedTeacherId == 'teacher_001' ? 'Osiyo' : 'Sarvar')
          : '';
    }
  }

  @override
  void dispose() {
    _nameController.dispose();
    _stageController.dispose();
    _teacherController.dispose();
    super.dispose();
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;

    setState(() {
      _isSubmitting = true;
    });

    // Simulate networking delay
    await Future.delayed(const Duration(milliseconds: 1200));

    if (!mounted) return;
    await context.read<AppProvider>().bookSlot(
          widget.slot,
          _nameController.text.trim(),
          _stageController.text.trim(),
          widget.slot.teacherName,
        );

    setState(() {
      _isSubmitting = false;
      _success = true;
    });

    // Close after delay
    await Future.delayed(const Duration(milliseconds: 1500));
    if (mounted) {
      Navigator.pop(context);
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final textMuted = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final primaryColor = const Color(0xFF0353A4);

    return Container(
      padding: EdgeInsets.fromLTRB(
        20,
        20,
        20,
        MediaQuery.of(context).viewInsets.bottom + 24,
      ),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF050A24) : const Color(0xFFF8FAFC),
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.15),
            blurRadius: 30,
            offset: const Offset(0, -10),
          ),
        ],
      ),
      child: Form(
        key: _formKey,
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Drag handle
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                  color: Colors.grey.shade400,
                  borderRadius: BorderRadius.circular(2),
                ),
              ),
            ),
            const SizedBox(height: 20),

            if (_success)
              Center(
                child: Padding(
                  padding: const EdgeInsets.symmetric(vertical: 40),
                  child: Column(
                    children: [
                      Container(
                        width: 64,
                        height: 64,
                        decoration: const BoxDecoration(
                          color: Color(0xFFD1FAE5),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(
                          Icons.check,
                          color: Color(0xFF10B981),
                          size: 36,
                        ),
                      ),
                      const SizedBox(height: 16),
                      const Text(
                        'Dars band qilindi!',
                        style: TextStyle(
                          fontSize: 20,
                          fontWeight: FontWeight.bold,
                          color: Color(0xFF10B981),
                        ),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        'Sizning arizangiz kutilmoqda...',
                        style: TextStyle(color: textMuted, fontSize: 13),
                      ),
                    ],
                  ),
                ),
              )
            else ...[
              const Text(
                'Darsni band qilish',
                style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
              ),
              Text(
                'Darsni tasdiqlash uchun ma\'lumotlarni kiriting.',
                style: TextStyle(fontSize: 12.5, color: textMuted),
              ),
              const SizedBox(height: 20),

              // Summary Info Box
              Container(
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                  color: cardColor,
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(
                    color: primaryColor.withValues(alpha: 0.1),
                  ),
                ),
                child: Row(
                  children: [
                    Container(
                      width: 48,
                      height: 48,
                      decoration: BoxDecoration(
                        color: primaryColor.withValues(alpha: 0.08),
                        shape: BoxShape.circle,
                      ),
                      child: Icon(
                        Icons.calendar_today_rounded,
                        color: primaryColor,
                        size: 20,
                      ),
                    ),
                    const SizedBox(width: 16),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            "${widget.slot.day == 'Mon' ? 'Monday' : widget.slot.day == 'Tue' ? 'Tuesday' : widget.slot.day == 'Wed' ? 'Wednesday' : widget.slot.day == 'Thu' ? 'Thursday' : widget.slot.day == 'Fri' ? 'Friday' : widget.slot.day == 'Sat' ? 'Saturday' : 'Sunday'}, ${widget.slot.startTime} - ${widget.slot.endTime}",
                            style: TextStyle(
                              fontWeight: FontWeight.bold,
                              fontSize: 15,
                              color: textColor,
                            ),
                          ),
                          const SizedBox(height: 2),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                "Teacher: ${widget.slot.teacherName}",
                                style: TextStyle(
                                  fontSize: 12,
                                  color: primaryColor,
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                              const Text(
                                '🟢 Bo‘sh',
                                style: TextStyle(
                                  fontSize: 11,
                                  color: Color(0xFF10B981),
                                  fontWeight: FontWeight.bold,
                                ),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 20),

              _buildField(
                label: 'To\'liq ismingiz',
                controller: _nameController,
                icon: Icons.person_outline_rounded,
                hint: 'Ismingizni kiriting',
                validator: (v) => v == null || v.isEmpty ? 'Ismni kiriting' : null,
              ),
              const SizedBox(height: 14),
              _buildField(
                label: 'Stage',
                controller: _stageController,
                icon: Icons.school_outlined,
                hint: 'Stage 1-6 kiriting',
                validator: (v) => v == null || v.isEmpty ? 'Stageni kiriting' : null,
              ),
              const SizedBox(height: 14),
              _buildField(
                label: 'Asosiy o\'qituvchingiz (ixtiyoriy)',
                controller: _teacherController,
                icon: Icons.assignment_ind_outlined,
                hint: 'O\'qituvchingiz ismini kiriting',
                validator: null,
              ),
              const SizedBox(height: 24),

              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isSubmitting ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF0051C4),
                    foregroundColor: Colors.white,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                    elevation: 0,
                  ),
                  child: _isSubmitting
                      ? const SizedBox(
                          width: 20,
                          height: 20,
                          child: CircularProgressIndicator(
                            color: Colors.white,
                            strokeWidth: 2,
                          ),
                        )
                      : const Text(
                          'Band qilishni tasdiqlash',
                          style: TextStyle(
                            fontSize: 14.5,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                ),
              ),
              const SizedBox(height: 10),
              SizedBox(
                width: double.infinity,
                height: 52,
                child: OutlinedButton(
                  onPressed: _isSubmitting ? null : () => Navigator.pop(context),
                  style: OutlinedButton.styleFrom(
                    side: BorderSide(
                      color: isDark ? Colors.white.withValues(alpha: 0.15) : Colors.grey.shade300,
                    ),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(16),
                    ),
                  ),
                  child: Text(
                    'Bekor qilish',
                    style: TextStyle(
                      fontSize: 14.5,
                      fontWeight: FontWeight.bold,
                      color: textColor,
                    ),
                  ),
                ),
              ),
            ],
          ],
        ),
      ),
    );
  }

  Widget _buildField({
    required String label,
    required TextEditingController controller,
    required IconData icon,
    required String hint,
    required String? Function(String?)? validator,
  }) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final fieldFillColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final labelColor = isDark ? Colors.white70 : Colors.black87;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: 12.5,
            fontWeight: FontWeight.bold,
            color: labelColor,
          ),
        ),
        const SizedBox(height: 6),
        TextFormField(
          controller: controller,
          validator: validator,
          decoration: InputDecoration(
            fillColor: fieldFillColor,
            prefixIcon: Icon(icon, size: 20),
            hintText: hint,
            contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
          ),
        ),
      ],
    );
  }
}
