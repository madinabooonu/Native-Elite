import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_provider.dart';
import '../models/types.dart';
import 'booking_calendar.dart';

// ─────────────────────────────────────────────────────────
// STUDENT HOME
// ─────────────────────────────────────────────────────────
class StudentHome extends StatefulWidget {
  const StudentHome({super.key});

  @override
  State<StudentHome> createState() => _StudentHomeState();
}

class _StudentHomeState extends State<StudentHome> {
  String _activeTab = 'schedule'; // 'schedule' or 'mybookings'

  @override
  Widget build(BuildContext context) {
    final appProvider = context.watch<AppProvider>();
    final user = appProvider.currentUser;
    if (user == null) return const SizedBox();

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF050A24) : const Color(0xFFF8FAFC);
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final textMuted = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final primaryColor = const Color(0xFF0353A4);

    return Scaffold(
      backgroundColor: bgColor,
      body: Column(
        children: [
          // ── Custom Tab Bar (matches React layout.tsx / UI.tsx tabs) ──
          Container(
            margin: const EdgeInsets.fromLTRB(16, 12, 16, 4),
            padding: const EdgeInsets.all(4),
            decoration: BoxDecoration(
              color: isDark ? const Color(0xFF0E173C) : Colors.grey.shade200,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Row(
              children: [
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _activeTab = 'schedule'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: _activeTab == 'schedule'
                            ? (_isDark(context) ? const Color(0xFF0353A4) : Colors.white)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: _activeTab == 'schedule'
                            ? [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.05),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      alignment: Alignment.center,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.calendar_today_rounded,
                            size: 14,
                            color: _activeTab == 'schedule'
                                ? (_isDark(context) ? Colors.white : primaryColor)
                                : textMuted,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'Schedule',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: _activeTab == 'schedule' ? textColor : textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
                Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => _activeTab = 'mybookings'),
                    child: Container(
                      padding: const EdgeInsets.symmetric(vertical: 10),
                      decoration: BoxDecoration(
                        color: _activeTab == 'mybookings'
                            ? (_isDark(context) ? const Color(0xFF0353A4) : Colors.white)
                            : Colors.transparent,
                        borderRadius: BorderRadius.circular(12),
                        boxShadow: _activeTab == 'mybookings'
                            ? [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.05),
                                  blurRadius: 4,
                                  offset: const Offset(0, 2),
                                )
                              ]
                            : null,
                      ),
                      alignment: Alignment.center,
                      child: Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            Icons.book_rounded,
                            size: 14,
                            color: _activeTab == 'mybookings'
                                ? (_isDark(context) ? Colors.white : primaryColor)
                                : textMuted,
                          ),
                          const SizedBox(width: 8),
                          Text(
                            'My Bookings',
                            style: TextStyle(
                              fontSize: 13,
                              fontWeight: FontWeight.bold,
                              color: _activeTab == 'mybookings' ? textColor : textMuted,
                            ),
                          ),
                        ],
                      ),
                    ),
                  ),
                ),
              ],
            ),
          ),

          // ── Tab Content ──
          Expanded(
            child: SingleChildScrollView(
              physics: const BouncingScrollPhysics(),
              child: _activeTab == 'schedule'
                  ? const BookingCalendar()
                  : _buildMyBookings(context, appProvider, user, cardColor, textColor, textMuted, primaryColor),
            ),
          ),
        ],
      ),
    );
  }

  bool _isDark(BuildContext context) => Theme.of(context).brightness == Brightness.dark;

  Widget _buildMyBookings(
    BuildContext context,
    AppProvider appProvider,
    UserProfile user,
    Color cardColor,
    Color textColor,
    Color textMuted,
    Color primaryColor,
  ) {
    // Live student bookings
    final studentBookings = appProvider.bookings.where((b) => b.studentId == user.uid).toList();

    // Mock/default bookings if we want to align with MyBookingsView on web
    final List<Map<String, dynamic>> mockBookings = [
      {
        'id': 'mock_1',
        'teacherName': 'Miss Osiyo',
        'day': 'Mon',
        'dayDate': 'May 19',
        'startTime': '16:00',
        'endTime': '16:30',
        'status': 'confirmed',
        'checkedIn': false,
      },
      {
        'id': 'mock_2',
        'teacherName': 'Mr Sarvar',
        'day': 'Wed',
        'dayDate': 'May 21',
        'startTime': '17:00',
        'endTime': '17:30',
        'status': 'pending',
        'checkedIn': false,
      },
    ];

    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            'Your Active Sessions',
            style: TextStyle(
              fontSize: 14.5,
              fontWeight: FontWeight.w800,
              color: textColor,
              fontStyle: FontStyle.italic,
            ),
          ),
          const SizedBox(height: 12),

          if (studentBookings.isEmpty && mockBookings.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 40),
                child: Text(
                  'No bookings yet.',
                  style: TextStyle(color: textMuted, fontSize: 13.5),
                ),
              ),
            )
          else ...[
            // Render Live Bookings
            ...studentBookings.map((b) => _buildBookingCard(b.id, b.teacherName, b.day, b.dayDate, b.startTime, b.endTime, b.status, cardColor, textColor, textMuted, primaryColor)),
            // Render Mock Bookings
            ...mockBookings.map((mb) => _buildBookingCard(mb['id'], mb['teacherName'], mb['day'], mb['dayDate'], mb['startTime'], mb['endTime'], mb['status'], cardColor, textColor, textMuted, primaryColor)),
          ],
        ],
      ),
    );
  }

  Widget _buildBookingCard(
    String id,
    String teacherName,
    String day,
    String dayDate,
    String startTime,
    String endTime,
    String status,
    Color cardColor,
    Color textColor,
    Color textMuted,
    Color primaryColor,
  ) {
    final isConfirmed = status == 'confirmed';
    final initialLetter = teacherName.split(' ').length > 1
        ? teacherName.split(' ')[1][0]
        : 'T';

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: 0.02),
            blurRadius: 10,
            offset: const Offset(0, 3),
          ),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: primaryColor.withValues(alpha: 0.08),
              borderRadius: BorderRadius.circular(14),
            ),
            alignment: Alignment.center,
            child: Text(
              initialLetter,
              style: TextStyle(
                color: primaryColor,
                fontWeight: FontWeight.bold,
                fontSize: 18,
              ),
            ),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  teacherName,
                  style: TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 14.5,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 2),
                Text(
                  "$day, $dayDate • $startTime-$endTime",
                  style: TextStyle(
                    fontSize: 11.5,
                    color: textMuted,
                  ),
                ),
              ],
            ),
          ),
          Container(
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 5),
            decoration: BoxDecoration(
              color: isConfirmed
                  ? const Color(0xFFECFDF5)
                  : const Color(0xFFFFF7ED),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Text(
              status.toUpperCase(),
              style: TextStyle(
                fontSize: 9.5,
                fontWeight: FontWeight.w900,
                color: isConfirmed
                    ? const Color(0xFF10B981)
                    : const Color(0xFFF97316),
              ),
            ),
          ),
        ],
      ),
    );
  }
}


// ─────────────────────────────────────────────────────────
// TEACHER HOME
// ─────────────────────────────────────────────────────────
class TeacherHome extends StatelessWidget {
  const TeacherHome({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AppProvider>().currentUser;
    final allUsers = context.watch<AppProvider>().allUsers;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtitleColor =
        isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600;
    final bgColor = isDark ? const Color(0xFF060D3A) : const Color(0xFFF0F4FF);

    final students = allUsers.where((u) => u['role'] == 'student').toList();

    return Scaffold(
      backgroundColor: bgColor,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // Greeting
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0D1B6E), Color(0xFF22C55E)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Salom, ${user?.displayName ?? 'Teacher'}! 👩‍🏫',
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 20,
                        fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 4),
                  const Text("O'qituvchi paneli",
                      style: TextStyle(color: Colors.white70, fontSize: 13)),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // Stats
            Row(
              children: [
                _TeacherStat(
                  value: '${students.length}',
                  label: 'Talabalar',
                  icon: Icons.people_rounded,
                  color: const Color(0xFF4169E1),
                  cardColor: cardColor,
                  textColor: textColor,
                  subtitleColor: subtitleColor,
                ),
                const SizedBox(width: 12),
                _TeacherStat(
                  value: '8',
                  label: 'Bugungi Dars',
                  icon: Icons.class_rounded,
                  color: const Color(0xFF22C55E),
                  cardColor: cardColor,
                  textColor: textColor,
                  subtitleColor: subtitleColor,
                ),
                const SizedBox(width: 12),
                _TeacherStat(
                  value: '92%',
                  label: 'Davomat',
                  icon: Icons.fact_check_rounded,
                  color: const Color(0xFFF59E0B),
                  cardColor: cardColor,
                  textColor: textColor,
                  subtitleColor: subtitleColor,
                ),
              ],
            ),
            const SizedBox(height: 20),

            Text('Talabalar Ro\'yxati',
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: textColor)),
            const SizedBox(height: 12),
            ...students.take(5).map((s) => _StudentListTile(
                  student: s,
                  cardColor: cardColor,
                  textColor: textColor,
                  subtitleColor: subtitleColor,
                )),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}

class _TeacherStat extends StatelessWidget {
  final String value, label;
  final IconData icon;
  final Color color, cardColor, textColor, subtitleColor;
  const _TeacherStat(
      {required this.value,
      required this.label,
      required this.icon,
      required this.color,
      required this.cardColor,
      required this.textColor,
      required this.subtitleColor});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
            color: cardColor, borderRadius: BorderRadius.circular(14)),
        child: Column(
          children: [
            Icon(icon, color: color, size: 22),
            const SizedBox(height: 6),
            Text(value,
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: textColor)),
            Text(label,
                textAlign: TextAlign.center,
                style: TextStyle(fontSize: 10, color: subtitleColor)),
          ],
        ),
      ),
    );
  }
}

class _StudentListTile extends StatelessWidget {
  final Map<String, dynamic> student;
  final Color cardColor, textColor, subtitleColor;
  const _StudentListTile(
      {required this.student,
      required this.cardColor,
      required this.textColor,
      required this.subtitleColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
          color: cardColor, borderRadius: BorderRadius.circular(14)),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: const Color(0xFF4169E1).withValues(alpha: 0.15),
            child: Text(
              student['displayName'][0].toUpperCase(),
              style: const TextStyle(
                  color: Color(0xFF4169E1), fontWeight: FontWeight.w700),
            ),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(student['displayName'] ?? '',
                    style: TextStyle(
                        fontWeight: FontWeight.w600, color: textColor)),
                Text(student['stage'] ?? 'Stage 1',
                    style: TextStyle(fontSize: 12, color: subtitleColor)),
              ],
            ),
          ),
          Container(
            padding:
                const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
            decoration: BoxDecoration(
              color: const Color(0xFF22C55E).withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(20),
            ),
            child: const Text('Active',
                style: TextStyle(
                    color: Color(0xFF22C55E),
                    fontSize: 11,
                    fontWeight: FontWeight.w600)),
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// PROFILE VIEW
// ─────────────────────────────────────────────────────────
class ProfileView extends StatelessWidget {
  const ProfileView({super.key});

  @override
  Widget build(BuildContext context) {
    final appProvider = context.watch<AppProvider>();
    final user = appProvider.currentUser;
    if (user == null) return const SizedBox();

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtitleColor =
        isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600;
    final bgColor = isDark ? const Color(0xFF060D3A) : const Color(0xFFF0F4FF);

    String roleLabel(UserRole r) {
      switch (r) {
        case UserRole.superAdmin:
          return 'Super Admin';
        case UserRole.admin:
          return 'Admin';
        case UserRole.teacher:
          return "O'qituvchi";
        default:
          return 'Talaba';
      }
    }

    Color roleColor(UserRole r) {
      switch (r) {
        case UserRole.superAdmin:
          return Colors.purple;
        case UserRole.admin:
          return Colors.orange;
        case UserRole.teacher:
          return const Color(0xFF22C55E);
        default:
          return const Color(0xFF4169E1);
      }
    }

    return Scaffold(
      backgroundColor: bgColor,
      body: SingleChildScrollView(
        child: Column(
          children: [
            // Header
            Container(
              width: double.infinity,
              padding:
                  const EdgeInsets.symmetric(vertical: 40, horizontal: 20),
              decoration: const BoxDecoration(
                gradient: LinearGradient(
                  colors: [Color(0xFF0D1B6E), Color(0xFF4169E1)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
              ),
              child: Column(
                children: [
                  CircleAvatar(
                    radius: 44,
                    backgroundColor: Colors.white.withValues(alpha: 0.2),
                    child: Text(
                      user.displayName[0].toUpperCase(),
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 36,
                          fontWeight: FontWeight.w800),
                    ),
                  ),
                  const SizedBox(height: 12),
                  Text(user.displayName,
                      style: const TextStyle(
                          color: Colors.white,
                          fontSize: 22,
                          fontWeight: FontWeight.w800)),
                  const SizedBox(height: 4),
                  Text('@${user.username}',
                      style: const TextStyle(
                          color: Colors.white70, fontSize: 14)),
                  const SizedBox(height: 10),
                  Container(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 5),
                    decoration: BoxDecoration(
                      color: roleColor(user.role).withValues(alpha: 0.25),
                      borderRadius: BorderRadius.circular(20),
                      border: Border.all(
                          color: roleColor(user.role).withValues(alpha: 0.5)),
                    ),
                    child: Text(
                      roleLabel(user.role),
                      style: TextStyle(
                          color: roleColor(user.role).withValues(alpha: 0.9) ==
                                  Colors.white.withValues(alpha: 0.9)
                              ? Colors.white
                              : roleColor(user.role),
                          fontWeight: FontWeight.w700,
                          fontSize: 13),
                    ),
                  ),
                ],
              ),
            ),

            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                children: [
                  _InfoTile(
                    icon: Icons.person_rounded,
                    label: 'Ism Familiya',
                    value: user.displayName,
                    cardColor: cardColor,
                    textColor: textColor,
                    subtitleColor: subtitleColor,
                  ),
                  _InfoTile(
                    icon: Icons.alternate_email_rounded,
                    label: 'Username',
                    value: user.username,
                    cardColor: cardColor,
                    textColor: textColor,
                    subtitleColor: subtitleColor,
                  ),
                  if (user.stage != null)
                    _InfoTile(
                      icon: Icons.stairs_rounded,
                      label: 'Stage',
                      value: user.stage!,
                      cardColor: cardColor,
                      textColor: textColor,
                      subtitleColor: subtitleColor,
                    ),
                  if (user.phone != null && user.phone!.isNotEmpty)
                    _InfoTile(
                      icon: Icons.phone_rounded,
                      label: 'Telefon',
                      value: user.phone!,
                      cardColor: cardColor,
                      textColor: textColor,
                      subtitleColor: subtitleColor,
                    ),
                  if (user.bio != null && user.bio!.isNotEmpty)
                    _InfoTile(
                      icon: Icons.info_outline_rounded,
                      label: 'Bio',
                      value: user.bio!,
                      cardColor: cardColor,
                      textColor: textColor,
                      subtitleColor: subtitleColor,
                    ),
                  const SizedBox(height: 20),
                  SizedBox(
                    width: double.infinity,
                    child: ElevatedButton.icon(
                      style: ElevatedButton.styleFrom(
                        backgroundColor: Colors.red.shade600,
                        foregroundColor: Colors.white,
                        padding: const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(14)),
                      ),
                      icon: const Icon(Icons.logout_rounded),
                      label: const Text('Chiqish',
                          style: TextStyle(fontWeight: FontWeight.w700)),
                      onPressed: () async {
                        await appProvider.logout();
                        if (context.mounted) {
                          Navigator.pushNamedAndRemoveUntil(
                              context, '/', (_) => false);
                        }
                      },
                    ),
                  ),
                  const SizedBox(height: 80),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _InfoTile extends StatelessWidget {
  final IconData icon;
  final String label, value;
  final Color cardColor, textColor, subtitleColor;
  const _InfoTile(
      {required this.icon,
      required this.label,
      required this.value,
      required this.cardColor,
      required this.textColor,
      required this.subtitleColor});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      decoration: BoxDecoration(
          color: cardColor, borderRadius: BorderRadius.circular(14)),
      child: Row(
        children: [
          Icon(icon, color: const Color(0xFF4169E1), size: 20),
          const SizedBox(width: 14),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(label,
                  style: TextStyle(fontSize: 11, color: subtitleColor)),
              Text(value,
                  style: TextStyle(
                      fontWeight: FontWeight.w600,
                      fontSize: 15,
                      color: textColor)),
            ],
          ),
        ],
      ),
    );
  }
}

// ─────────────────────────────────────────────────────────
// STUDENTS VIEW (Teacher)
// ─────────────────────────────────────────────────────────
class StudentsView extends StatefulWidget {
  const StudentsView({super.key});

  @override
  State<StudentsView> createState() => _StudentsViewState();
}

class _StudentsViewState extends State<StudentsView> {
  final _searchController = TextEditingController();
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final allUsers = context.watch<AppProvider>().allUsers;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtitleColor =
        isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600;

    final students = allUsers.where((u) {
      if (u['role'] != 'student') return false;
      if (_query.isEmpty) return true;
      return u['displayName']
              .toString()
              .toLowerCase()
              .contains(_query.toLowerCase()) ||
          u['username']
              .toString()
              .toLowerCase()
              .contains(_query.toLowerCase());
    }).toList();

    return Scaffold(
      backgroundColor:
          isDark ? const Color(0xFF060D3A) : const Color(0xFFF0F4FF),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: TextField(
              controller: _searchController,
              onChanged: (v) => setState(() => _query = v),
              decoration: InputDecoration(
                hintText: 'Talaba qidirish...',
                prefixIcon: const Icon(Icons.search_rounded),
                border: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12)),
                contentPadding: const EdgeInsets.symmetric(vertical: 12),
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: students.length,
              itemBuilder: (ctx, i) {
                final s = students[i];
                return Container(
                  margin: const EdgeInsets.only(bottom: 10),
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                      color: cardColor,
                      borderRadius: BorderRadius.circular(14)),
                  child: Row(
                    children: [
                      CircleAvatar(
                        backgroundColor:
                            const Color(0xFF4169E1).withValues(alpha: 0.15),
                        child: Text(
                          s['displayName'][0].toUpperCase(),
                          style: const TextStyle(
                              color: Color(0xFF4169E1),
                              fontWeight: FontWeight.w700),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(s['displayName'] ?? '',
                                style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    color: textColor)),
                            Text('@${s['username']} • ${s['stage'] ?? 'Stage 1'}',
                                style: TextStyle(
                                    fontSize: 12, color: subtitleColor)),
                          ],
                        ),
                      ),
                      Icon(Icons.arrow_forward_ios_rounded,
                          size: 14, color: subtitleColor),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
    );
  }
}
