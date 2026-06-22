import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/theme_provider.dart';
import '../models/types.dart'; // UserRole
import 'dashboard_views.dart';
import 'vocab_trainer.dart';
import 'ai_speaking.dart';
import 'booking_calendar.dart';
import 'admin_views.dart';
import 'news_feed.dart';


// AppLayout maintains the active tab and provides the Header and BottomNav.
class AppLayout extends StatefulWidget {
  const AppLayout({super.key});

  @override
  State<AppLayout> createState() => _AppLayoutState();
}

class _AppLayoutState extends State<AppLayout> {
  // Hardcode for testing, usually retrieved from a Provider
  final UserRole _role = UserRole.student;
  int _currentIndex = 0;

  final List<Map<String, dynamic>> _studentTabs = [
    {'id': 'home', 'label': 'Home', 'icon': Icons.home_rounded},
    {'id': 'feed', 'label': 'Feed', 'icon': Icons.dynamic_feed_rounded},
    {'id': 'vocab', 'label': 'Vocab', 'icon': Icons.book_rounded},
    {'id': 'speaking', 'label': 'Speaking', 'icon': Icons.mic_rounded},
    {'id': 'chat', 'label': 'Chat', 'icon': Icons.chat_bubble_rounded},
    {'id': 'profile', 'label': 'Profile', 'icon': Icons.person_rounded},
  ];

  final List<Map<String, dynamic>> _teacherTabs = [
    {'id': 'home', 'label': 'Home', 'icon': Icons.home_rounded},
    {'id': 'feed', 'label': 'Feed', 'icon': Icons.dynamic_feed_rounded},
    {'id': 'schedule', 'label': 'Schedule', 'icon': Icons.calendar_today_rounded},
    {'id': 'students', 'label': 'Students', 'icon': Icons.people_rounded},
    {'id': 'checkin', 'label': 'Check-in', 'icon': Icons.fact_check_rounded},
    {'id': 'profile', 'label': 'Profile', 'icon': Icons.person_rounded},
  ];

  final List<Map<String, dynamic>> _adminTabs = [
    {'id': 'home', 'label': 'Home', 'icon': Icons.home_rounded},
    {'id': 'feed', 'label': 'Feed', 'icon': Icons.dynamic_feed_rounded},
    {'id': 'bookings', 'label': 'Bookings', 'icon': Icons.calendar_month_rounded},
    {'id': 'teachers', 'label': 'Teachers', 'icon': Icons.people_rounded},
    {'id': 'slots', 'label': 'Slots', 'icon': Icons.event_available_rounded},
    {'id': 'profile', 'label': 'Profile', 'icon': Icons.person_rounded},
  ];

  List<Map<String, dynamic>> get _currentTabs {
    if (_role == UserRole.admin || _role == UserRole.superAdmin) return _adminTabs;
    if (_role == UserRole.teacher) return _teacherTabs;
    return _studentTabs;
  }

  void _onLogout() {
    Navigator.pushReplacementNamed(context, '/');
  }

  Widget _buildContent() {
    final activeTabId = _currentTabs[_currentIndex]['id'];

    switch (activeTabId) {
      case 'home':
        return const StudentHome();
      case 'feed':
        return const NewsFeed();
      case 'vocab':
        return const VocabTrainer();
      case 'speaking':
        return const AISpeaking();
      case 'profile':
        return const ProfileView();
      case 'admin':
        return const AdminDashboard();
      case 'calendar':
        return const BookingCalendar();
      case 'students':
      case 'teachers':
      case 'courses':
        return const TeacherList();
      case 'checkin':
        return const TeacherCheckIn();
      default:
        return Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(_currentTabs[_currentIndex]['icon'], size: 80, color: Colors.white24),
              const SizedBox(height: 16),
              Text(
                '$activeTabId Placeholder',
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
              ),
            ],
          ),
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final titleMap = {
      'home': _role == UserRole.admin ? 'Admin Dashboard' : _role == UserRole.teacher ? 'Teacher Dashboard' : 'Class Booking',
      'feed': 'News Feed',
      'vocab': 'Vocab Trainer',
      'speaking': 'AI Speaking',
      'chat': 'Messages',
      'progress': 'My Progress',
      'profile': 'Profile',
      'schedule': 'My Schedule',
      'students': 'My Students',
      'checkin': 'Attendance Check-in',
      'bookings': 'All Bookings',
      'teachers': 'Manage Teachers',
      'slots': 'Manage Slots',
    };
    final activeTabId = _currentTabs[_currentIndex]['id'];

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final primaryColor = Theme.of(context).primaryColor;
    final navColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: AppBar(
        backgroundColor: navColor,
        elevation: 0,
        centerTitle: false,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(
              titleMap[activeTabId] ?? 'Native Elite',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.w800,
                color: textColor,
                letterSpacing: -0.5,
              ),
            ),
            if (activeTabId == 'home')
              Text(
                _role == UserRole.admin ? 'Manage the platform' : 'IELTS Learning Hub',
                style: const TextStyle(fontSize: 11, color: Colors.grey, fontWeight: FontWeight.normal),
              ),
          ],
        ),
        actions: [
          IconButton(
            icon: Icon(isDark ? Icons.light_mode_rounded : Icons.dark_mode_rounded, color: textColor, size: 20),
            onPressed: () => context.read<ThemeProvider>().toggleTheme(),
          ),
          IconButton(
            icon: Icon(Icons.logout_rounded, color: textColor, size: 20),
            onPressed: () => Navigator.pushReplacementNamed(context, '/auth'),
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 600), // tablet max width
          child: _buildContent(),
        ),
      ),
      bottomNavigationBar: BottomNavigationBar(
        backgroundColor: isDark ? const Color(0xFF0F172A) : Colors.white,
        type: BottomNavigationBarType.fixed,
        selectedItemColor: const Color(0xFF3B82F6), // brand-blue
        unselectedItemColor: isDark ? Colors.white54 : Colors.black54,
        currentIndex: _currentIndex,
        onTap: (index) => setState(() => _currentIndex = index),
        selectedFontSize: 11,
        unselectedFontSize: 11,
        items: _currentTabs.map((tab) {
          return BottomNavigationBarItem(
            icon: Padding(
              padding: const EdgeInsets.only(bottom: 4),
              child: Icon(tab['icon']),
            ),
            label: tab['label'],
          );
        }).toList(),
      ),
    );
  }
}
