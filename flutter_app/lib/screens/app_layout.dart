import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_provider.dart';
import '../models/theme_provider.dart';
import '../models/types.dart';
import '../theme/app_theme.dart';
import '../widgets/native_logo.dart';
import 'dashboard_views.dart';
import 'vocab_trainer.dart';
import 'ai_speaking.dart';
import 'chat_system.dart';
import 'news_feed.dart';
import 'admin_views.dart';
import 'progress_chart.dart';

class AppLayout extends StatefulWidget {
  const AppLayout({super.key});

  @override
  State<AppLayout> createState() => _AppLayoutState();
}

class _AppLayoutState extends State<AppLayout> {
  int _currentIndex = 0;

  List<Map<String, dynamic>> _getTabsForRole(UserRole role) {
    switch (role) {
      case UserRole.superAdmin:
      case UserRole.admin:
        return [
          {'id': 'home', 'label': 'Bosh', 'icon': Icons.home_outlined, 'activeIcon': Icons.home_rounded},
          {'id': 'feed', 'label': 'Feed', 'icon': Icons.grid_view_outlined, 'activeIcon': Icons.grid_view_rounded},
          {'id': 'users', 'label': 'Users', 'icon': Icons.people_outline_rounded, 'activeIcon': Icons.people_rounded},
          {'id': 'attendance', 'label': 'Davomat', 'icon': Icons.check_circle_outline_rounded, 'activeIcon': Icons.check_circle_rounded},
          {'id': 'profile', 'label': 'Profil', 'icon': Icons.person_outline_rounded, 'activeIcon': Icons.person_rounded},
        ];
      case UserRole.teacher:
        return [
          {'id': 'home', 'label': 'Bosh', 'icon': Icons.home_outlined, 'activeIcon': Icons.home_rounded},
          {'id': 'feed', 'label': 'Feed', 'icon': Icons.grid_view_outlined, 'activeIcon': Icons.grid_view_rounded},
          {'id': 'students', 'label': 'Talabalar', 'icon': Icons.people_outline_rounded, 'activeIcon': Icons.people_rounded},
          {'id': 'attendance', 'label': 'Davomat', 'icon': Icons.check_circle_outline_rounded, 'activeIcon': Icons.check_circle_rounded},
          {'id': 'profile', 'label': 'Profil', 'icon': Icons.person_outline_rounded, 'activeIcon': Icons.person_rounded},
        ];
      default: // student
        return [
          {'id': 'home', 'label': 'Bosh', 'icon': Icons.home_outlined, 'activeIcon': Icons.home_rounded},
          {'id': 'feed', 'label': 'Feed', 'icon': Icons.grid_view_outlined, 'activeIcon': Icons.grid_view_rounded},
          {'id': 'vocab', 'label': 'Vocab', 'icon': Icons.menu_book_outlined, 'activeIcon': Icons.menu_book_rounded},
          {'id': 'speaking', 'label': 'Speaking', 'icon': Icons.mic_none_rounded, 'activeIcon': Icons.mic_rounded},
          {'id': 'chat', 'label': 'Chat', 'icon': Icons.chat_bubble_outline_rounded, 'activeIcon': Icons.chat_bubble_rounded},
          {'id': 'profile', 'label': 'Profil', 'icon': Icons.person_outline_rounded, 'activeIcon': Icons.person_rounded},
        ];
    }
  }

  Widget _buildContent(String tabId, UserRole role) {
    switch (tabId) {
      case 'home':
        if (role == UserRole.superAdmin || role == UserRole.admin) {
          return const AdminDashboard();
        } else if (role == UserRole.teacher) {
          return const TeacherHome();
        }
        return const StudentHome();
      case 'feed':
        return const NewsFeed();
      case 'vocab':
        return const VocabTrainer();
      case 'speaking':
        return const AISpeaking();
      case 'chat':
        return const ChatSystem();
      case 'progress':
        return const ProgressChart();
      case 'users':
        return const UsersManagement();
      case 'students':
        return const StudentsView();
      case 'attendance':
        return const AttendanceView();
      case 'profile':
        return const ProfileView();
      default:
        return const StudentHome();
    }
  }

  @override
  Widget build(BuildContext context) {
    final appProvider = context.watch<AppProvider>();
    final themeProvider = context.watch<ThemeProvider>();
    final user = appProvider.currentUser;
    if (user == null) return const SizedBox();

    final isDark = themeProvider.isDark;
    final tabs = _getTabsForRole(user.role);

    if (_currentIndex >= tabs.length) _currentIndex = 0;
    final activeTabId = tabs[_currentIndex]['id'] as String;

    // Colors
    final navBg = isDark ? AppTheme.cardDark : Colors.white;
    final selectedColor = AppTheme.accent;
    final unselectedColor =
        isDark ? AppTheme.textMutedDark : AppTheme.textMuted;
    final dividerColor =
        isDark ? const Color(0xFF2A2F52) : AppTheme.divider;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      appBar: _buildAppBar(user, activeTabId, isDark, themeProvider),
      body: AnimatedSwitcher(
        duration: const Duration(milliseconds: 220),
        switchInCurve: Curves.easeOut,
        switchOutCurve: Curves.easeIn,
        child: KeyedSubtree(
          key: ValueKey(activeTabId),
          child: _buildContent(activeTabId, user.role),
        ),
      ),
      bottomNavigationBar: Container(
        decoration: BoxDecoration(
          color: navBg,
          border: Border(top: BorderSide(color: dividerColor, width: 1)),
        ),
        child: SafeArea(
          child: SizedBox(
            height: 60,
            child: Row(
              children: tabs.asMap().entries.map((entry) {
                final index = entry.key;
                final tab = entry.value;
                final isActive = index == _currentIndex;
                return Expanded(
                  child: InkWell(
                    onTap: () => setState(() => _currentIndex = index),
                    splashColor: Colors.transparent,
                    highlightColor: Colors.transparent,
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Icon(
                            isActive
                                ? tab['activeIcon'] as IconData
                                : tab['icon'] as IconData,
                            color: isActive ? selectedColor : unselectedColor,
                            size: 22,
                          ),
                          const SizedBox(height: 3),
                          Text(
                            tab['label'] as String,
                            style: TextStyle(
                              fontSize: 10,
                              fontWeight: isActive
                                  ? FontWeight.w700
                                  : FontWeight.w400,
                              color: isActive ? selectedColor : unselectedColor,
                            ),
                            maxLines: 1,
                            overflow: TextOverflow.ellipsis,
                          ),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),
          ),
        ),
      ),
    );
  }

  PreferredSizeWidget _buildAppBar(
    UserProfile user,
    String activeTabId,
    bool isDark,
    ThemeProvider themeProvider,
  ) {
    final appBarBg =
        isDark ? AppTheme.surfaceDark : AppTheme.primary;
    final dividerColor =
        isDark ? const Color(0xFF2A2F52) : Colors.transparent;

    final titles = {
      'home': user.role == UserRole.admin || user.role == UserRole.superAdmin
          ? 'Dashboard'
          : user.role == UserRole.teacher
              ? 'Teacher Panel'
              : 'Bosh Sahifa',
      'feed': 'News Feed',
      'vocab': 'Vocabulary',
      'speaking': 'AI Speaking',
      'chat': 'Xabarlar',
      'progress': 'Progress',
      'profile': 'Profil',
      'users': 'Foydalanuvchilar',
      'students': 'Talabalar',
      'attendance': 'Davomat',
    };

    return AppBar(
      backgroundColor: appBarBg,
      elevation: 0,
      automaticallyImplyLeading: false,
      bottom: PreferredSize(
        preferredSize: const Size.fromHeight(1),
        child: Container(height: 1, color: dividerColor),
      ),
      title: Row(
        children: [
          // Logo box
          Container(
            width: 32,
            height: 32,
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF4F72FF), Color(0xFF1A1F3C)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(8),
            ),
            child: const Center(child: NativeLogo(size: 18)),
          ),
          const SizedBox(width: 10),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text(
                'NATIVE ELITE',
                style: TextStyle(
                  color: Colors.white,
                  fontSize: 13,
                  fontWeight: FontWeight.w800,
                  letterSpacing: 2.5,
                  height: 1,
                ),
              ),
              Text(
                titles[activeTabId] ?? 'IELTS Hub',
                style: TextStyle(
                  color: Colors.white.withValues(alpha: 0.5),
                  fontSize: 10.5,
                  fontWeight: FontWeight.w400,
                  letterSpacing: 0.3,
                ),
              ),
            ],
          ),
        ],
      ),
      actions: [
        // Theme toggle
        IconButton(
          icon: Icon(
            isDark ? Icons.light_mode_outlined : Icons.dark_mode_outlined,
            color: Colors.white.withValues(alpha: 0.8),
            size: 20,
          ),
          onPressed: () => themeProvider.toggleTheme(),
          tooltip: isDark ? 'Light mode' : 'Dark mode',
        ),
        // Notifications
        IconButton(
          icon: Icon(
            Icons.notifications_outlined,
            color: Colors.white.withValues(alpha: 0.8),
            size: 20,
          ),
          onPressed: () {},
        ),
        // Logout
        IconButton(
          icon: Icon(
            Icons.logout_rounded,
            color: Colors.white.withValues(alpha: 0.8),
            size: 20,
          ),
          onPressed: _showLogoutDialog,
        ),
        const SizedBox(width: 4),
      ],
    );
  }

  void _showLogoutDialog() {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        backgroundColor: isDark ? AppTheme.cardDark : Colors.white,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(20)),
        title: Text(
          'Chiqish',
          style: TextStyle(
            fontWeight: FontWeight.w700,
            color: isDark ? Colors.white : AppTheme.textDark,
          ),
        ),
        content: Text(
          'Hisobdan chiqishni xohlaysizmi?',
          style: TextStyle(
            color: isDark ? AppTheme.textMutedDark : AppTheme.textMuted,
          ),
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(ctx),
            child: Text(
              'Bekor qilish',
              style: TextStyle(
                color: isDark ? AppTheme.textMutedDark : AppTheme.textMuted,
              ),
            ),
          ),
          TextButton(
            onPressed: () {
              Navigator.pop(ctx);
              context.read<AppProvider>().logout();
              Navigator.pushNamedAndRemoveUntil(context, '/', (_) => false);
            },
            child: const Text(
              'Chiqish',
              style: TextStyle(
                color: AppTheme.error,
                fontWeight: FontWeight.w700,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
