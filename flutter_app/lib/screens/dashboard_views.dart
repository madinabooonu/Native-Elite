import 'package:flutter/material.dart';
import 'booking_calendar.dart';

// ── StudentHome ──
class StudentHome extends StatefulWidget {
  const StudentHome({super.key});

  @override
  State<StudentHome> createState() => _StudentHomeState();
}

class _StudentHomeState extends State<StudentHome> with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 2, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final tabBgColor = isDark ? const Color(0xFF0E173C) : Colors.grey.withOpacity(0.1);
    final primaryColor = const Color(0xFF0353A4);

    return Column(
      children: [
        Container(
          margin: const EdgeInsets.all(16),
          padding: const EdgeInsets.all(4),
          decoration: BoxDecoration(
            color: tabBgColor,
            borderRadius: BorderRadius.circular(16),
          ),
          child: TabBar(
            controller: _tabController,
            indicator: BoxDecoration(
              color: primaryColor,
              borderRadius: BorderRadius.circular(12),
            ),
            labelColor: Colors.white,
            unselectedLabelColor: isDark ? Colors.white54 : Colors.black54,
            labelStyle: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
            tabs: const [
              Tab(text: 'Schedule'),
              Tab(text: 'My Bookings'),
            ],
          ),
        ),
        Expanded(
          child: TabBarView(
            controller: _tabController,
            children: const [
              BookingCalendar(),
              MyBookingsView(),
            ],
          ),
        ),
      ],
    );
  }
}

// ── MyBookingsView ──
class MyBookingsView extends StatelessWidget {
  const MyBookingsView({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final primaryColor = const Color(0xFF0353A4);

    final defaultBookings = [
      {'id': '1', 'teacherName': 'Miss Osiyo', 'day': 'Mon', 'dayDate': 'May 19', 'startTime': '16:00', 'endTime': '16:30', 'status': 'confirmed'},
      {'id': '2', 'teacherName': 'Mr Sarvar', 'day': 'Wed', 'dayDate': 'May 21', 'startTime': '17:00', 'endTime': '17:30', 'status': 'pending'},
    ];

    return ListView.builder(
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      itemCount: defaultBookings.length,
      itemBuilder: (context, index) {
        final b = defaultBookings[index];
        final isConfirmed = b['status'] == 'confirmed';
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(
            color: cardColor,
            borderRadius: BorderRadius.circular(20),
            border: Border.all(color: Colors.grey.withOpacity(0.1)),
          ),
          child: Row(
            children: [
              Container(
                width: 48,
                height: 48,
                decoration: BoxDecoration(
                  color: primaryColor.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(14),
                ),
                alignment: Alignment.center,
                child: Text(
                  b['teacherName']!.split(' ')[1][0],
                  style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: primaryColor),
                ),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(b['teacherName']!, style: TextStyle(fontWeight: FontWeight.bold, color: textColor, fontSize: 15)),
                    const SizedBox(height: 4),
                    Text(
                      '${b['day']}, ${b['dayDate']} • ${b['startTime']}-${b['endTime']}',
                      style: const TextStyle(fontSize: 12, color: Colors.grey),
                    ),
                  ],
                ),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 6),
                decoration: BoxDecoration(
                  color: isConfirmed ? Colors.green.withOpacity(0.1) : Colors.orange.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  b['status']!.toUpperCase(),
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.w900,
                    color: isConfirmed ? Colors.green : Colors.orange,
                  ),
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}

// ── ProfileView ──
class ProfileView extends StatefulWidget {
  const ProfileView({super.key});

  @override
  State<ProfileView> createState() => _ProfileViewState();
}

class _ProfileViewState extends State<ProfileView> {
  String _selectedStage = 'Stage 1';
  final List<String> _stages = ['Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5', 'Stage 6'];

  void _handleLogout() {
    Navigator.pushReplacementNamed(context, '/');
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final primaryColor = const Color(0xFF0353A4);

    return ListView(
      padding: const EdgeInsets.all(24),
      children: [
        Center(
          child: Stack(
            children: [
              Container(
                width: 96,
                height: 96,
                decoration: BoxDecoration(
                  color: primaryColor,
                  borderRadius: BorderRadius.circular(32),
                  boxShadow: [BoxShadow(color: primaryColor.withOpacity(0.3), blurRadius: 20, offset: const Offset(0, 10))],
                ),
                alignment: Alignment.center,
                child: const Text('S', style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white)),
              ),
              Positioned(
                bottom: 0, right: 0,
                child: Container(
                  width: 28, height: 28,
                  decoration: BoxDecoration(color: Colors.green, shape: BoxShape.circle, border: Border.all(color: Colors.white, width: 3)),
                  child: const Icon(Icons.check, color: Colors.white, size: 14),
                ),
              )
            ],
          ),
        ),
        const SizedBox(height: 16),
        Center(child: Text('Student', style: TextStyle(fontSize: 22, fontWeight: FontWeight.w900, color: textColor))),
        const Center(child: Text('Native Student • Active', style: TextStyle(color: Colors.grey, fontSize: 13))),
        
        const SizedBox(height: 40),
        Text('YOUR LEARNING STAGE', style: TextStyle(fontSize: 11, fontWeight: FontWeight.w900, color: textColor, letterSpacing: 1.2)),
        const SizedBox(height: 16),
        GridView.builder(
          shrinkWrap: true,
          physics: const NeverScrollableScrollPhysics(),
          gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
            crossAxisCount: 3,
            crossAxisSpacing: 10,
            mainAxisSpacing: 10,
            childAspectRatio: 2.2,
          ),
          itemCount: _stages.length,
          itemBuilder: (context, i) {
            final s = _stages[i];
            final isSelected = _selectedStage == s;
            return GestureDetector(
              onTap: () => setState(() => _selectedStage = s),
              child: Container(
                alignment: Alignment.center,
                decoration: BoxDecoration(
                  color: isSelected ? primaryColor : cardColor,
                  border: Border.all(color: isSelected ? primaryColor : primaryColor.withOpacity(0.1), width: 1.5),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(s, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : Colors.grey)),
              ),
            );
          },
        ),

        const SizedBox(height: 32),
        _buildActionTile(Icons.headset_mic_outlined, 'Contact Support', Colors.blue),
        const SizedBox(height: 12),
        _buildActionTile(Icons.settings_outlined, 'Account Settings', Colors.grey),
        
        const SizedBox(height: 40),
        ElevatedButton(
          onPressed: _handleLogout,
          style: ElevatedButton.styleFrom(
            backgroundColor: Colors.transparent,
            foregroundColor: Colors.redAccent,
            side: const BorderSide(color: Colors.redAccent, width: 1.5),
            elevation: 0,
            minimumSize: const Size(double.infinity, 56),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
          ),
          child: const Text('Log Out', style: TextStyle(fontWeight: FontWeight.w900, fontSize: 15)),
        )
      ],
    );
  }

  Widget _buildActionTile(IconData icon, String label, Color color) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF0E173C) : Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.withOpacity(0.1)),
      ),
      child: Row(
        children: [
          Icon(icon, color: color, size: 22),
          const SizedBox(width: 16),
          Text(label, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
          const Spacer(),
          const Icon(Icons.chevron_right, color: Colors.grey, size: 20),
        ],
      ),
    );
  }
}

class TeacherList extends StatelessWidget {
  const TeacherList({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;

    final teachers = [
      {'id': 't2', 'name': 'Ms. Osiya', 'subject': 'Support', 'rating': 4.8, 'color': Colors.purple},
      {'id': 't3', 'name': 'Mr. Sarvar', 'subject': 'Support', 'rating': 4.9, 'color': Colors.orange},
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: teachers.length,
      itemBuilder: (context, i) {
        final t = teachers[i];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: cardColor, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey.withOpacity(0.1))),
          child: Row(
            children: [
              Container(
                width: 56, height: 56,
                decoration: BoxDecoration(color: t['color'] as Color, borderRadius: BorderRadius.circular(16)),
                alignment: Alignment.center,
                child: Text(t['name'].toString().split('. ')[1][0], style: const TextStyle(color: Colors.white, fontSize: 24, fontWeight: FontWeight.bold)),
              ),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(t['name'].toString(), style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor)),
                    Text('${t['subject']} Teacher', style: const TextStyle(color: Colors.grey, fontSize: 12)),
                    const SizedBox(height: 4),
                    Text('★ ${t['rating']}', style: const TextStyle(color: Colors.orange, fontWeight: FontWeight.bold, fontSize: 12)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right, color: Colors.grey),
            ],
          ),
        );
      },
    );
  }
}

class TeacherCheckIn extends StatelessWidget {
  const TeacherCheckIn({super.key});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;

    final students = [
      {'name': 'Alex Johnson', 'stage': 'B2', 'time': '14:30 - 15:00', 'checkedIn': false},
      {'name': 'Elena Smith', 'stage': 'C1', 'time': '15:00 - 15:30', 'checkedIn': false},
    ];

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: students.length,
      itemBuilder: (context, i) {
        final s = students[i];
        return Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(16),
          decoration: BoxDecoration(color: cardColor, borderRadius: BorderRadius.circular(20), border: Border.all(color: Colors.grey.withOpacity(0.1))),
          child: Row(
            children: [
              CircleAvatar(backgroundColor: const Color(0xFF0353A4).withOpacity(0.1), child: Text(s['name'].toString()[0], style: const TextStyle(color: Color(0xFF0353A4), fontWeight: FontWeight.bold))),
              const SizedBox(width: 16),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(s['name'].toString(), style: TextStyle(fontWeight: FontWeight.bold, color: textColor)),
                    Text('Stage: ${s['stage']} • ${s['time']}', style: const TextStyle(color: Colors.grey, fontSize: 11)),
                  ],
                ),
              ),
              IconButton(icon: const Icon(Icons.check_circle_outline, color: Colors.grey), onPressed: () {}),
            ],
          ),
        );
      },
    );
  }
}
