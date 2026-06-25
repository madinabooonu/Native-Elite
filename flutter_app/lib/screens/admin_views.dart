import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_provider.dart';
import '../models/types.dart';
import '../services/export_service.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

// ─────────────────────────────────────────────────────────
// ADMIN DASHBOARD (Super Admin & Admin)
// ─────────────────────────────────────────────────────────
class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 5, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AppProvider>().currentUser;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final bgColor = isDark ? const Color(0xFF050A24) : const Color(0xFFF8FAFC);

    return Scaffold(
      backgroundColor: bgColor,
      body: Column(
        children: [
          // Header
          Container(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  user?.role == UserRole.superAdmin
                      ? 'Super Admin Panel'
                      : 'Admin Panel',
                  style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.w800,
                      color: textColor),
                ),
                const SizedBox(height: 4),
                Text(
                  'Platformani boshqarish',
                  style: TextStyle(
                      fontSize: 13,
                      color: isDark
                          ? const Color(0xFF94A3B8)
                          : Colors.grey.shade600),
                ),
                const SizedBox(height: 16),
                Container(
                  decoration: BoxDecoration(
                    color: isDark
                        ? const Color(0xFF0E173C)
                        : Colors.grey.shade200,
                    borderRadius: BorderRadius.circular(12),
                  ),
                  child: TabBar(
                    controller: _tabController,
                    indicator: BoxDecoration(
                      color: const Color(0xFF0353A4),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    indicatorSize: TabBarIndicatorSize.tab,
                    dividerColor: Colors.transparent,
                    labelColor: Colors.white,
                    unselectedLabelColor: isDark
                        ? const Color(0xFF64748B)
                        : Colors.grey.shade600,
                    labelStyle: const TextStyle(
                        fontWeight: FontWeight.w600, fontSize: 12),
                    tabs: const [
                      Tab(text: 'Statistika'),
                      Tab(text: 'Bandliklar'),
                      Tab(text: 'Kalendar'),
                      Tab(text: 'Vazifalar'),
                      Tab(text: 'Baholar'),
                    ],
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: TabBarView(
              controller: _tabController,
              children: const [
                _AdminStats(),
                _AdminBookingsList(),
                _AdminCalendar(),
                _AdminHomework(),
                _AdminScores(),
              ],
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        backgroundColor: const Color(0xFF4169E1),
        onPressed: () => _showCreateUserDialog(context),
        icon: const Icon(Icons.person_add_rounded, color: Colors.white),
        label: const Text('Yangi Foydalanuvchi',
            style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
      ),
    );
  }

  void _showCreateUserDialog(BuildContext context) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) => const _CreateUserSheet(),
    );
  }
}

// ── Admin Stats Tab ──
class _AdminStats extends StatelessWidget {
  const _AdminStats();

  @override
  Widget build(BuildContext context) {
    final allUsers = context.watch<AppProvider>().allUsers;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtitleColor =
        isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600;

    final students = allUsers.where((u) => u['role'] == 'student').length;
    final teachers = allUsers
        .where((u) => u['role'] == 'teacher')
        .length;
    final admins = allUsers
        .where((u) => u['role'] == 'admin' || u['role'] == 'super-admin')
        .length;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: [
              _AdminStatCard(
                icon: Icons.people_rounded,
                value: '$students',
                label: 'Talabalar',
                color: const Color(0xFF4169E1),
                cardColor: cardColor,
                textColor: textColor,
                subtitleColor: subtitleColor,
              ),
              const SizedBox(width: 12),
              _AdminStatCard(
                icon: Icons.school_rounded,
                value: '$teachers',
                label: "O'qituvchilar",
                color: const Color(0xFF22C55E),
                cardColor: cardColor,
                textColor: textColor,
                subtitleColor: subtitleColor,
              ),
              const SizedBox(width: 12),
              _AdminStatCard(
                icon: Icons.admin_panel_settings_rounded,
                value: '$admins',
                label: 'Adminlar',
                color: Colors.orange,
                cardColor: cardColor,
                textColor: textColor,
                subtitleColor: subtitleColor,
              ),
            ],
          ),
          const SizedBox(height: 16),
          // ── Export Reports Panel ──
          Container(
            width: double.infinity,
            padding: const EdgeInsets.all(18),
            decoration: BoxDecoration(
              color: cardColor,
              borderRadius: BorderRadius.circular(20),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withValues(alpha: 0.02),
                  blurRadius: 10,
                  offset: const Offset(0, 4),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Hisobotlarni Eksport Qilish',
                  style: TextStyle(
                    fontWeight: FontWeight.w800,
                    fontSize: 14.5,
                    color: textColor,
                  ),
                ),
                const SizedBox(height: 4),
                Text(
                  'Barcha dars bandliklarini turli formatlarda yuklab oling.',
                  style: TextStyle(
                    fontSize: 11.5,
                    color: subtitleColor,
                  ),
                ),
                const SizedBox(height: 16),
                Row(
                  children: [
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF10B981),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(Icons.table_view_rounded, size: 18),
                        label: const Text('Excel (.xlsx)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        onPressed: () {
                          final bookingsData = context.read<AppProvider>().bookings.map((b) => b.toMap()).toList();
                          ExportService.exportBookingsToExcel(bookingsData);
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFFEF4444),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(Icons.picture_as_pdf_rounded, size: 18),
                        label: const Text('PDF (.pdf)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        onPressed: () {
                          final bookingsData = context.read<AppProvider>().bookings.map((b) => b.toMap()).toList();
                          ExportService.exportBookingsToPDF(bookingsData);
                        },
                      ),
                    ),
                    const SizedBox(width: 8),
                    Expanded(
                      child: ElevatedButton.icon(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF3B82F6),
                          foregroundColor: Colors.white,
                          padding: const EdgeInsets.symmetric(vertical: 12),
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        icon: const Icon(Icons.description_rounded, size: 18),
                        label: const Text('CSV (.csv)', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold)),
                        onPressed: () {
                          final bookingsData = context.read<AppProvider>().bookings.map((b) => b.toMap()).toList();
                          ExportService.exportBookingsToCSV(bookingsData);
                        },
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
                color: cardColor, borderRadius: BorderRadius.circular(16)),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Barcha Foydalanuvchilar',
                    style: TextStyle(
                        fontWeight: FontWeight.w700,
                        fontSize: 15,
                        color: textColor)),
                const SizedBox(height: 12),
                ...allUsers.map((u) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        children: [
                          CircleAvatar(
                            radius: 18,
                            backgroundColor: _roleColor(u['role'])
                                .withValues(alpha: 0.15),
                            child: Text(
                              (u['displayName'] ?? 'U')[0].toUpperCase(),
                              style: TextStyle(
                                  color: _roleColor(u['role']),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 13),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment: CrossAxisAlignment.start,
                              children: [
                                Text(u['displayName'] ?? '',
                                    style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 14,
                                        color: textColor)),
                                Text(
                                    '@${u['username']} • ${_roleLabel(u['role'])}',
                                    style: TextStyle(
                                        fontSize: 11, color: subtitleColor)),
                              ],
                            ),
                          ),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 8, vertical: 3),
                            decoration: BoxDecoration(
                              color: _roleColor(u['role']).withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(20),
                            ),
                            child: Text(
                              _roleLabel(u['role']),
                              style: TextStyle(
                                  color: _roleColor(u['role']),
                                  fontSize: 10,
                                  fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                    )),
              ],
            ),
          ),
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Color _roleColor(String? role) {
    switch (role) {
      case 'super-admin':
        return Colors.purple;
      case 'admin':
        return Colors.orange;
      case 'teacher':
        return const Color(0xFF22C55E);
      default:
        return const Color(0xFF4169E1);
    }
  }

  String _roleLabel(String? role) {
    switch (role) {
      case 'super-admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'teacher':
        return "O'qituvchi";
      default:
        return 'Talaba';
    }
  }
}

class _AdminStatCard extends StatelessWidget {
  final IconData icon;
  final String value, label;
  final Color color, cardColor, textColor, subtitleColor;
  const _AdminStatCard(
      {required this.icon,
      required this.value,
      required this.label,
      required this.color,
      required this.cardColor,
      required this.textColor,
      required this.subtitleColor});

  @override
  Widget build(BuildContext context) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(14),
        decoration: BoxDecoration(
            color: cardColor, borderRadius: BorderRadius.circular(14)),
        child: Column(
          children: [
            Icon(icon, color: color, size: 24),
            const SizedBox(height: 6),
            Text(value,
                style: TextStyle(
                    fontSize: 22,
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

class _AdminBookingsList extends StatefulWidget {
  const _AdminBookingsList();

  @override
  State<_AdminBookingsList> createState() => _AdminBookingsListState();
}

class _AdminBookingsListState extends State<_AdminBookingsList> {
  String _searchQuery = '';
  final _searchController = TextEditingController();

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final appProvider = context.watch<AppProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final textMuted = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final primaryColor = const Color(0xFF0353A4);

    // Mock bookings from web to align stats & list
    final List<Map<String, dynamic>> mockBookings = [
      { 'id': 'mock_1', 'slotId': 's1', 'studentId': 'u1', 'studentName': 'Alex Johnson', 'studentStage': 'Stage 3', 'teacherId': 't2', 'teacherName': 'Miss Osiyo', 'day': 'Mon', 'dayDate': 'May 5', 'fullDate': '2026-05-05', 'startTime': '16:00', 'endTime': '16:30', 'status': 'confirmed', 'createdAt': '2026-05-20T10:00:00Z', 'checkedIn': false },
      { 'id': 'mock_2', 'slotId': 's2', 'studentId': 'u2', 'studentName': 'Elena Smith', 'studentStage': 'Stage 5', 'teacherId': 't2', 'teacherName': 'Miss Osiyo', 'day': 'Mon', 'dayDate': 'May 5', 'fullDate': '2026-05-05', 'startTime': '17:00', 'endTime': '17:30', 'status': 'pending', 'createdAt': '2026-05-20T10:30:00Z', 'checkedIn': false },
      { 'id': 'mock_3', 'slotId': 's3', 'studentId': 'u3', 'studentName': 'Marcus Wright', 'studentStage': 'Stage 2', 'teacherId': 't3', 'teacherName': 'Mr Sarvar', 'day': 'Tue', 'dayDate': 'May 6', 'fullDate': '2026-05-06', 'startTime': '15:00', 'endTime': '15:30', 'status': 'attended', 'createdAt': '2026-05-19T14:00:00Z', 'checkedIn': true },
      { 'id': 'mock_4', 'slotId': 's4', 'studentId': 'u4', 'studentName': 'Sara Ali', 'studentStage': 'Stage 4', 'teacherId': 't3', 'teacherName': 'Mr Sarvar', 'day': 'Wed', 'dayDate': 'May 7', 'fullDate': '2026-05-07', 'startTime': '18:00', 'endTime': '18:30', 'status': 'cancelled', 'createdAt': '2026-05-20T09:00:00Z', 'checkedIn': false },
    ];

    // Combine mock bookings with provider's live bookings
    final List<Map<String, dynamic>> combined = [];
    
    // Add live bookings first
    for (final b in appProvider.bookings) {
      combined.add({
        'id': b.id,
        'slotId': b.slotId,
        'studentId': b.studentId,
        'studentName': b.studentName,
        'studentStage': b.studentStage,
        'teacherId': b.teacherId,
        'teacherName': b.teacherName,
        'day': b.day,
        'dayDate': b.dayDate,
        'fullDate': b.fullDate,
        'startTime': b.startTime,
        'endTime': b.endTime,
        'status': b.status,
        'createdAt': b.createdAt,
        'checkedIn': b.checkedIn,
        'isMock': false,
      });
    }

    // Add mock bookings
    for (final mb in mockBookings) {
      combined.add({
        ...mb,
        'isMock': true,
      });
    }

    // Filter by search query
    final query = _searchQuery.trim().toLowerCase();
    final filtered = combined.where((b) {
      final sName = b['studentName'].toString().toLowerCase();
      final tName = b['teacherName'].toString().toLowerCase();
      return sName.contains(query) || tName.contains(query);
    }).toList();

    // Stats
    final totalCount = combined.length;
    final pendingCount = combined.where((b) => b['status'] == 'pending').length;
    final confirmedCount = combined.where((b) => b['status'] == 'confirmed').length;
    final attendedCount = combined.where((b) => b['status'] == 'attended').length;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Stats Row
          Row(
            children: [
              _buildMiniStatCard('Jami', '$totalCount', primaryColor.withValues(alpha: 0.08), primaryColor),
              const SizedBox(width: 6),
              _buildMiniStatCard('Kutilayotgan', '$pendingCount', const Color(0xFFFFF7ED), const Color(0xFFF97316)),
              const SizedBox(width: 6),
              _buildMiniStatCard('Tasdiqlangan', '$confirmedCount', const Color(0xFFECFDF5), const Color(0xFF10B981)),
              const SizedBox(width: 6),
              _buildMiniStatCard('Kelgan', '$attendedCount', const Color(0xFFF5F3FF), const Color(0xFF8B5CF6)),
            ],
          ),
          const SizedBox(height: 12),

          // Search Field
          TextField(
            controller: _searchController,
            onChanged: (val) => setState(() => _searchQuery = val),
            decoration: InputDecoration(
              hintText: 'Qidirish (Talaba yoki O\'qituvchi)...',
              prefixIcon: const Icon(Icons.search_rounded, size: 20),
              contentPadding: const EdgeInsets.symmetric(vertical: 12),
              fillColor: cardColor,
            ),
          ),
          const SizedBox(height: 16),

          Text(
            'Bandliklar Ro\'yxati',
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: textColor,
            ),
          ),
          const SizedBox(height: 10),

          if (filtered.isEmpty)
            Center(
              child: Padding(
                padding: const EdgeInsets.symmetric(vertical: 32),
                child: Text(
                  'Bandliklar topilmadi.',
                  style: TextStyle(color: textMuted, fontSize: 13),
                ),
              ),
            )
          else
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              itemCount: filtered.length,
              itemBuilder: (context, idx) {
                final b = filtered[idx];
                final status = b['status'] as String;
                final isMock = b['isMock'] as bool;
                final bId = b['id'] as String;

                return Container(
                  margin: const EdgeInsets.only(bottom: 12),
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cardColor,
                    borderRadius: BorderRadius.circular(20),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withValues(alpha: 0.02),
                        blurRadius: 8,
                        offset: const Offset(0, 3),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(
                                b['studentName'] as String,
                                style: TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 15,
                                  color: textColor,
                                ),
                              ),
                              const SizedBox(height: 2),
                              Text(
                                "Stage: ${b['studentStage']}",
                                style: TextStyle(
                                  fontSize: 11,
                                  color: textMuted,
                                ),
                              ),
                            ],
                          ),
                          _buildStatusBadge(status),
                        ],
                      ),
                      const Divider(height: 24, thickness: 0.5),
                      Row(
                        children: [
                          Icon(Icons.calendar_today_rounded, size: 13, color: textMuted),
                          const SizedBox(width: 6),
                          Text(
                            "${b['dayDate']} • ${b['startTime']}-${b['endTime']}",
                            style: TextStyle(fontSize: 11.5, color: textColor),
                          ),
                          const Spacer(),
                          Icon(Icons.person_rounded, size: 13, color: textMuted),
                          const SizedBox(width: 6),
                          Text(
                            b['teacherName'] as String,
                            style: TextStyle(fontSize: 11.5, color: textColor),
                          ),
                        ],
                      ),
                      if (!isMock && (status == 'pending' || status == 'confirmed')) ...[
                        const SizedBox(height: 16),
                        Row(
                          children: [
                            if (status == 'pending') ...[
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: () => appProvider.updateBookingStatus(bId, 'confirmed'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF10B981),
                                    foregroundColor: Colors.white,
                                    elevation: 0,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                    minimumSize: const Size(0, 38),
                                  ),
                                  child: const Text('Tasdiqlash', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: () => appProvider.updateBookingStatus(bId, 'cancelled'),
                                  style: OutlinedButton.styleFrom(
                                    side: const BorderSide(color: Color(0xFFEF4444)),
                                    foregroundColor: const Color(0xFFEF4444),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                    minimumSize: const Size(0, 38),
                                  ),
                                  child: const Text('Bekor qilish', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                                ),
                              ),
                            ] else if (status == 'confirmed') ...[
                              Expanded(
                                child: ElevatedButton(
                                  onPressed: () => appProvider.updateBookingStatus(bId, 'attended'),
                                  style: ElevatedButton.styleFrom(
                                    backgroundColor: const Color(0xFF8B5CF6),
                                    foregroundColor: Colors.white,
                                    elevation: 0,
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                    minimumSize: const Size(0, 38),
                                  ),
                                  child: const Text('Keldi deb belgilash', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                                ),
                              ),
                              const SizedBox(width: 8),
                              Expanded(
                                child: OutlinedButton(
                                  onPressed: () => appProvider.updateBookingStatus(bId, 'cancelled'),
                                  style: OutlinedButton.styleFrom(
                                    side: const BorderSide(color: Color(0xFFEF4444)),
                                    foregroundColor: const Color(0xFFEF4444),
                                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                                    padding: const EdgeInsets.symmetric(vertical: 8),
                                    minimumSize: const Size(0, 38),
                                  ),
                                  child: const Text('Bekor qilish', style: TextStyle(fontSize: 11.5, fontWeight: FontWeight.bold)),
                                ),
                              ),
                            ],
                          ],
                        ),
                      ],
                    ],
                  ),
                );
              },
            ),
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Widget _buildMiniStatCard(String label, String value, Color bg, Color textColor) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 8),
        decoration: BoxDecoration(
          color: bg,
          borderRadius: BorderRadius.circular(12),
        ),
        alignment: Alignment.center,
        child: Column(
          children: [
            Text(
              value,
              style: TextStyle(
                fontSize: 15,
                fontWeight: FontWeight.w800,
                color: textColor,
              ),
            ),
            const SizedBox(height: 1),
            Text(
              label,
              style: TextStyle(fontSize: 9, color: textColor.withValues(alpha: 0.8), fontWeight: FontWeight.w600),
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildStatusBadge(String status) {
    Color bg;
    Color fg;
    switch (status) {
      case 'confirmed':
        bg = const Color(0xFFECFDF5);
        fg = const Color(0xFF10B981);
        break;
      case 'attended':
        bg = const Color(0xFFF5F3FF);
        fg = const Color(0xFF8B5CF6);
        break;
      case 'cancelled':
        bg = const Color(0xFFFEF2F2);
        fg = const Color(0xFFEF4444);
        break;
      default: // pending
        bg = const Color(0xFFFFF7ED);
        fg = const Color(0xFFF97316);
    }
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(12),
      ),
      child: Text(
        status.toUpperCase(),
        style: TextStyle(
          color: fg,
          fontSize: 9,
          fontWeight: FontWeight.bold,
        ),
      ),
    );
  }
}

// ── Admin Homework Tab ──
class _AdminHomework extends StatefulWidget {
  const _AdminHomework();

  @override
  State<_AdminHomework> createState() => _AdminHomeworkState();
}

class _AdminHomeworkState extends State<_AdminHomework> {
  final List<Map<String, dynamic>> _homeworks = [
    {
      'title': 'Part 1 Speaking Practice',
      'desc': 'Hometown haqida 2 daqiqa gapiring',
      'deadline': '2026-07-01',
      'stage': 'Stage 3',
    },
    {
      'title': 'Vocabulary Test',
      'desc': 'Stage 3 barcha so\'zlarini yodlang',
      'deadline': '2026-07-05',
      'stage': 'Stage 3',
    },
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtitleColor =
        isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600;

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          ElevatedButton.icon(
            onPressed: () => _showAddHomeworkDialog(context),
            icon: const Icon(Icons.add_rounded),
            label: const Text("Vazifa qo'shish"),
            style: ElevatedButton.styleFrom(
              minimumSize: const Size(double.infinity, 48),
              shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12)),
            ),
          ),
          const SizedBox(height: 16),
          ..._homeworks.map((hw) => Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(16),
                decoration: BoxDecoration(
                    color: cardColor,
                    borderRadius: BorderRadius.circular(14)),
                child: Row(
                  children: [
                    Container(
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: const Color(0xFFF59E0B).withValues(alpha: 0.12),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: const Icon(Icons.assignment_rounded,
                          color: Color(0xFFF59E0B)),
                    ),
                    const SizedBox(width: 12),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(hw['title'],
                              style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  color: textColor)),
                          Text(hw['desc'],
                              style: TextStyle(
                                  fontSize: 12, color: subtitleColor)),
                          const SizedBox(height: 4),
                          Row(
                            children: [
                              Icon(Icons.calendar_today_rounded,
                                  size: 11, color: subtitleColor),
                              const SizedBox(width: 4),
                              Text(hw['deadline'],
                                  style: TextStyle(
                                      fontSize: 11, color: subtitleColor)),
                              const SizedBox(width: 12),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                    horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: const Color(0xFF4169E1)
                                      .withValues(alpha: 0.1),
                                  borderRadius: BorderRadius.circular(8),
                                ),
                                child: Text(hw['stage'],
                                    style: const TextStyle(
                                        fontSize: 10,
                                        color: Color(0xFF4169E1),
                                        fontWeight: FontWeight.w600)),
                              ),
                            ],
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              )),
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  void _showAddHomeworkDialog(BuildContext context) {
    final titleCtrl = TextEditingController();
    final descCtrl = TextEditingController();
    showDialog(
      context: context,
      builder: (ctx) => AlertDialog(
        title: const Text("Vazifa qo'shish"),
        content: Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            TextField(
                controller: titleCtrl,
                decoration: const InputDecoration(labelText: 'Sarlavha')),
            const SizedBox(height: 8),
            TextField(
                controller: descCtrl,
                maxLines: 2,
                decoration: const InputDecoration(labelText: 'Tavsif')),
          ],
        ),
        actions: [
          TextButton(
              onPressed: () => Navigator.pop(ctx),
              child: const Text('Bekor')),
          ElevatedButton(
            onPressed: () {
              if (titleCtrl.text.isNotEmpty) {
                setState(() {
                  _homeworks.add({
                    'title': titleCtrl.text,
                    'desc': descCtrl.text,
                    'deadline': '2026-07-15',
                    'stage': 'Stage 1',
                  });
                });
              }
              Navigator.pop(ctx);
            },
            child: const Text("Qo'shish"),
          ),
        ],
      ),
    );
  }
}

// ── Admin Scores Tab ──
class _AdminScores extends StatelessWidget {
  const _AdminScores();

  @override
  Widget build(BuildContext context) {
    final allUsers = context.watch<AppProvider>().allUsers;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    // subtitleColor unused here - scores use scoreColor instead

    final students = allUsers.where((u) => u['role'] == 'student').toList();

    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          ...students.map((s) {
            final score = (s['score'] ?? 75) as int;
            return Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                  color: cardColor, borderRadius: BorderRadius.circular(14)),
              child: Column(
                children: [
                  Row(
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
                      const SizedBox(width: 10),
                      Expanded(
                        child: Text(s['displayName'] ?? '',
                            style: TextStyle(
                                fontWeight: FontWeight.w600, color: textColor)),
                      ),
                      Text('$score / 100',
                          style: TextStyle(
                              fontWeight: FontWeight.w800,
                              color: _scoreColor(score),
                              fontSize: 16)),
                    ],
                  ),
                  const SizedBox(height: 8),
                  ClipRRect(
                    borderRadius: BorderRadius.circular(4),
                    child: LinearProgressIndicator(
                      value: score / 100,
                      backgroundColor: Colors.grey.withValues(alpha: 0.2),
                      valueColor: AlwaysStoppedAnimation<Color>(
                          _scoreColor(score)),
                      minHeight: 6,
                    ),
                  ),
                ],
              ),
            );
          }),
          const SizedBox(height: 80),
        ],
      ),
    );
  }

  Color _scoreColor(int s) {
    if (s >= 80) return const Color(0xFF22C55E);
    if (s >= 60) return const Color(0xFFF59E0B);
    return Colors.red;
  }
}

// ─────────────────────────────────────────────────────────
// USERS MANAGEMENT (Super Admin)
// ─────────────────────────────────────────────────────────
class UsersManagement extends StatefulWidget {
  const UsersManagement({super.key});

  @override
  State<UsersManagement> createState() => _UsersManagementState();
}

class _UsersManagementState extends State<UsersManagement> {
  final _searchCtrl = TextEditingController();
  String _query = '';
  String _filterRole = 'all';

  @override
  Widget build(BuildContext context) {
    final allUsers = context.watch<AppProvider>().allUsers;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtitleColor =
        isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600;
    final bgColor = isDark ? const Color(0xFF060D3A) : const Color(0xFFF0F4FF);

    final filtered = allUsers.where((u) {
      if (_filterRole != 'all' && u['role'] != _filterRole) return false;
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
      backgroundColor: bgColor,
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                TextField(
                  controller: _searchCtrl,
                  onChanged: (v) => setState(() => _query = v),
                  decoration: InputDecoration(
                    hintText: 'Foydalanuvchi qidirish...',
                    prefixIcon: const Icon(Icons.search_rounded),
                    border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12)),
                    contentPadding:
                        const EdgeInsets.symmetric(vertical: 12),
                  ),
                ),
                const SizedBox(height: 10),
                SingleChildScrollView(
                  scrollDirection: Axis.horizontal,
                  child: Row(
                    children: ['all', 'student', 'teacher', 'admin', 'super-admin']
                        .map((r) {
                      final isActive = _filterRole == r;
                      return Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: FilterChip(
                          label: Text(_roleLabel(r)),
                          selected: isActive,
                          onSelected: (_) =>
                              setState(() => _filterRole = r),
                          selectedColor:
                              const Color(0xFF4169E1).withValues(alpha: 0.2),
                          checkmarkColor: const Color(0xFF4169E1),
                        ),
                      );
                    }).toList(),
                  ),
                ),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: filtered.length,
              itemBuilder: (ctx, i) {
                final u = filtered[i];
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
                            _roleColor(u['role']).withValues(alpha: 0.15),
                        child: Text(
                          (u['displayName'] ?? 'U')[0].toUpperCase(),
                          style: TextStyle(
                              color: _roleColor(u['role']),
                              fontWeight: FontWeight.w700),
                        ),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(u['displayName'] ?? '',
                                style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    color: textColor)),
                            Text(
                                '@${u['username']} • ${_roleLabel(u['role'])}',
                                style: TextStyle(
                                    fontSize: 11, color: subtitleColor)),
                          ],
                        ),
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 8, vertical: 3),
                        decoration: BoxDecoration(
                          color: _roleColor(u['role']).withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _roleLabel(u['role']),
                          style: TextStyle(
                              color: _roleColor(u['role']),
                              fontSize: 10,
                              fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        backgroundColor: const Color(0xFF4169E1),
        onPressed: () => showModalBottomSheet(
          context: context,
          isScrollControlled: true,
          backgroundColor: Colors.transparent,
          builder: (_) => const _CreateUserSheet(),
        ),
        child: const Icon(Icons.person_add_rounded, color: Colors.white),
      ),
    );
  }

  Color _roleColor(String? role) {
    switch (role) {
      case 'super-admin':
        return Colors.purple;
      case 'admin':
        return Colors.orange;
      case 'teacher':
        return const Color(0xFF22C55E);
      default:
        return const Color(0xFF4169E1);
    }
  }

  String _roleLabel(String? role) {
    switch (role) {
      case 'all':
        return 'Barchasi';
      case 'super-admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      case 'teacher':
        return "O'qituvchi";
      default:
        return 'Talaba';
    }
  }
}

// ─────────────────────────────────────────────────────────
// ATTENDANCE VIEW
// ─────────────────────────────────────────────────────────
class AttendanceView extends StatefulWidget {
  const AttendanceView({super.key});

  @override
  State<AttendanceView> createState() => _AttendanceViewState();
}

class _AttendanceViewState extends State<AttendanceView> {
  final Map<String, bool> _attendanceMap = {};

  @override
  Widget build(BuildContext context) {
    final allUsers = context.watch<AppProvider>().allUsers;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtitleColor =
        isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600;
    final bgColor = isDark ? const Color(0xFF060D3A) : const Color(0xFFF0F4FF);

    final students = allUsers.where((u) => u['role'] == 'student').toList();

    final today = DateTime.now();
    final dateStr =
        '${today.day} ${_month(today.month)} ${today.year}';

    return Scaffold(
      backgroundColor: bgColor,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0D1B6E), Color(0xFF22C55E)],
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Row(
                children: [
                  const Icon(Icons.calendar_today_rounded,
                      color: Colors.white, size: 28),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Bugungi Davomat',
                          style: TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.w700,
                              fontSize: 16)),
                      Text(dateStr,
                          style: const TextStyle(
                              color: Colors.white70, fontSize: 12)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 16),
            Text('Talabalar (${students.length})',
                style: TextStyle(
                    fontWeight: FontWeight.w700,
                    fontSize: 15,
                    color: textColor)),
            const SizedBox(height: 12),
            ...students.map((s) {
              final uid = s['uid'] as String;
              final attended = _attendanceMap[uid] ?? false;
              return Container(
                margin: const EdgeInsets.only(bottom: 10),
                padding: const EdgeInsets.symmetric(
                    horizontal: 14, vertical: 12),
                decoration: BoxDecoration(
                  color: cardColor,
                  borderRadius: BorderRadius.circular(14),
                  border: Border.all(
                    color: attended
                        ? const Color(0xFF22C55E).withValues(alpha: 0.3)
                        : Colors.transparent,
                  ),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      radius: 20,
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
                          Text(s['stage'] ?? 'Stage 1',
                              style: TextStyle(
                                  fontSize: 11, color: subtitleColor)),
                        ],
                      ),
                    ),
                    // Buttons
                    Row(
                      children: [
                        GestureDetector(
                          onTap: () =>
                              setState(() => _attendanceMap[uid] = true),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: attended
                                  ? const Color(0xFF22C55E)
                                  : const Color(0xFF22C55E).withValues(alpha: 0.1),
                              borderRadius: const BorderRadius.horizontal(
                                  left: Radius.circular(8)),
                            ),
                            child: Icon(Icons.check_rounded,
                                color: attended
                                    ? Colors.white
                                    : const Color(0xFF22C55E),
                                size: 18),
                          ),
                        ),
                        GestureDetector(
                          onTap: () =>
                              setState(() => _attendanceMap[uid] = false),
                          child: Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 12, vertical: 6),
                            decoration: BoxDecoration(
                              color: !attended &&
                                      _attendanceMap.containsKey(uid)
                                  ? Colors.red
                                  : Colors.red.withValues(alpha: 0.1),
                              borderRadius: const BorderRadius.horizontal(
                                  right: Radius.circular(8)),
                            ),
                            child: Icon(Icons.close_rounded,
                                color: !attended &&
                                        _attendanceMap.containsKey(uid)
                                    ? Colors.white
                                    : Colors.red,
                                size: 18),
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              );
            }),
            const SizedBox(height: 16),
            ElevatedButton.icon(
              onPressed: _saveAttendance,
              icon: const Icon(Icons.save_rounded),
              label: const Text('Davomatni Saqlash'),
              style: ElevatedButton.styleFrom(
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14)),
              ),
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  void _saveAttendance() async {
    final appProvider = context.read<AppProvider>();
    final students = appProvider.allUsers.where((u) => u['role'] == 'student').toList();

    for (final s in students) {
      final uid = s['uid'] as String;
      final studentName = s['displayName'] ?? '';
      final attended = _attendanceMap[uid] ?? false;
      final status = attended ? 'present' : 'absent';
      
      await appProvider.markAttendance(
        studentId: uid,
        studentName: studentName,
        teacherId: appProvider.currentUser?.uid ?? 'admin',
        status: status,
        note: 'Marked from Admin Panel',
      );
    }

    if (!mounted) return;
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(
        content: Text('Davomat muvaffaqiyatli saqlandi!'),
        backgroundColor: Color(0xFF22C55E),
      ),
    );
  }

  String _month(int m) {
    const months = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];
    return months[m - 1];
  }
}

// ─────────────────────────────────────────────────────────
// CREATE USER SHEET
// ─────────────────────────────────────────────────────────
class _CreateUserSheet extends StatefulWidget {
  const _CreateUserSheet();

  @override
  State<_CreateUserSheet> createState() => _CreateUserSheetState();
}

class _CreateUserSheetState extends State<_CreateUserSheet> {
  final _nameCtrl = TextEditingController();
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  String _role = 'student';
  String _stage = 'Stage 1';
  bool _isLoading = false;
  String? _error;

  final _stages = [
    'Stage 1', 'Stage 2', 'Stage 3', 'Stage 4', 'Stage 5', 'Stage 6'
  ];
  final _roles = ['student', 'teacher', 'admin', 'super-admin'];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF0D1B6E) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);

    return Container(
      decoration: BoxDecoration(
        color: bgColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
      ),
      padding: EdgeInsets.fromLTRB(
          20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      child: SingleChildScrollView(
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Center(
              child: Container(
                width: 36,
                height: 4,
                decoration: BoxDecoration(
                    color: Colors.grey.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(2)),
              ),
            ),
            const SizedBox(height: 16),
            Text("Yangi Foydalanuvchi Yaratish",
                style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.w800,
                    color: textColor)),
            const SizedBox(height: 20),
            if (_error != null)
              Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: Colors.red.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Text(_error!,
                    style: const TextStyle(color: Colors.redAccent)),
              ),
            _buildField("Ism Familiya", _nameCtrl, Icons.person_rounded),
            const SizedBox(height: 12),
            _buildField("Username", _usernameCtrl, Icons.alternate_email_rounded),
            const SizedBox(height: 12),
            _buildField("Password", _passwordCtrl, Icons.lock_rounded,
                obscure: true),
            const SizedBox(height: 12),
            _buildField("Telefon (ixtiyoriy)", _phoneCtrl, Icons.phone_rounded),
            const SizedBox(height: 12),
            // Role selector
            Text("Rol",
                style: TextStyle(
                    fontSize: 13,
                    color: isDark ? Colors.white70 : Colors.grey.shade600)),
            const SizedBox(height: 6),
            Wrap(
              spacing: 8,
              children: _roles.map((r) {
                final isSelected = _role == r;
                return ChoiceChip(
                  label: Text(_roleLabel(r)),
                  selected: isSelected,
                  onSelected: (_) => setState(() => _role = r),
                  selectedColor: const Color(0xFF4169E1),
                  labelStyle: TextStyle(
                      color: isSelected ? Colors.white : textColor,
                      fontSize: 12),
                );
              }).toList(),
            ),
            if (_role == 'student') ...[
              const SizedBox(height: 12),
              Text("Stage",
                  style: TextStyle(
                      fontSize: 13,
                      color:
                          isDark ? Colors.white70 : Colors.grey.shade600)),
              const SizedBox(height: 6),
              Wrap(
                spacing: 8,
                children: _stages.map((s) {
                  final isSelected = _stage == s;
                  return ChoiceChip(
                    label: Text(s, style: const TextStyle(fontSize: 12)),
                    selected: isSelected,
                    onSelected: (_) => setState(() => _stage = s),
                    selectedColor: const Color(0xFF22C55E),
                    labelStyle: TextStyle(
                        color: isSelected ? Colors.white : textColor),
                  );
                }).toList(),
              ),
            ],
            const SizedBox(height: 20),
            SizedBox(
              width: double.infinity,
              height: 50,
              child: ElevatedButton(
                onPressed: _isLoading ? null : _submit,
                child: _isLoading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text("Yaratish",
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w700)),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildField(String label, TextEditingController ctrl, IconData icon,
      {bool obscure = false}) {
    return TextField(
      controller: ctrl,
      obscureText: obscure,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, size: 20),
        contentPadding:
            const EdgeInsets.symmetric(horizontal: 12, vertical: 14),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      ),
    );
  }

  Future<void> _submit() async {
    if (_nameCtrl.text.trim().isEmpty ||
        _usernameCtrl.text.trim().isEmpty ||
        _passwordCtrl.text.trim().isEmpty) {
      setState(() => _error = "Iltimos barcha maydonlarni to'ldiring");
      return;
    }
    setState(() {
      _isLoading = true;
      _error = null;
    });
    final success = await context.read<AppProvider>().createUser(
          username: _usernameCtrl.text.trim(),
          password: _passwordCtrl.text.trim(),
          displayName: _nameCtrl.text.trim(),
          role: _role,
          stage: _role == 'student' ? _stage : null,
          phone: _phoneCtrl.text.trim(),
        );
    if (!mounted) return;
    setState(() => _isLoading = false);
    if (success) {
      Navigator.pop(context);
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Foydalanuvchi muvaffaqiyatli yaratildi!'),
          backgroundColor: Color(0xFF22C55E),
        ),
      );
    } else {
      setState(() => _error = "Bu username allaqachon mavjud.");
    }
  }

  String _roleLabel(String r) {
    switch (r) {
      case 'super-admin': return 'Super Admin';
      case 'admin': return 'Admin';
      case 'teacher': return "O'qituvchi";
      default: return 'Talaba';
    }
  }
}

// ─────────────────────────────────────────────────────────
// ADMIN CALENDAR VIEW
// ─────────────────────────────────────────────────────────
class _AdminCalendar extends StatefulWidget {
  const _AdminCalendar();

  @override
  State<_AdminCalendar> createState() => _AdminCalendarState();
}

class _AdminCalendarState extends State<_AdminCalendar> {
  String _viewMode = 'daily'; // 'daily' | 'weekly' | 'monthly'
  DateTime _selectedDate = DateTime.now();

  String _formatDate(DateTime dt) {
    return "${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}";
  }

  DateTime _startOfWeek(DateTime dt) {
    return dt.subtract(Duration(days: dt.weekday - 1));
  }

  String _monthName(int m) {
    const months = [
      'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
      'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
    ];
    return months[m - 1];
  }

  String _dayNameUz(int weekday) {
    const days = [
      'Dushanba', 'Seshanba', 'Chorshanba', 'Payshanba', 'Juma', 'Shanba', 'Yakshanba'
    ];
    return days[weekday - 1];
  }

  @override
  Widget build(BuildContext context) {
    final appProvider = context.watch<AppProvider>();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final textMuted = isDark ? const Color(0xFF94A3B8) : const Color(0xFF64748B);
    final primaryColor = const Color(0xFF0353A4);

    return Scaffold(
      backgroundColor: isDark ? const Color(0xFF050A24) : const Color(0xFFF8FAFC),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: Row(
              children: [
                _buildSegmentButton('Kunlik', 'daily'),
                const SizedBox(width: 8),
                _buildSegmentButton('Haftalik', 'weekly'),
                const SizedBox(width: 8),
                _buildSegmentButton('Oylik', 'monthly'),
              ],
            ),
          ),
          Expanded(
            child: _buildCalendarView(appProvider, cardColor, textColor, textMuted, primaryColor),
          ),
        ],
      ),
    );
  }

  Widget _buildSegmentButton(String text, String mode) {
    final isSelected = _viewMode == mode;
    final primaryColor = const Color(0xFF0353A4);
    return Expanded(
      child: GestureDetector(
        onTap: () => setState(() => _viewMode = mode),
        child: Container(
          padding: const EdgeInsets.symmetric(vertical: 10),
          decoration: BoxDecoration(
            color: isSelected ? primaryColor : (Theme.of(context).brightness == Brightness.dark ? const Color(0xFF0E173C) : Colors.grey.shade200),
            borderRadius: BorderRadius.circular(10),
          ),
          alignment: Alignment.center,
          child: Text(
            text,
            style: TextStyle(
              fontSize: 12.5,
              fontWeight: FontWeight.bold,
              color: isSelected ? Colors.white : (Theme.of(context).brightness == Brightness.dark ? Colors.white70 : Colors.black87),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildCalendarView(AppProvider appProvider, Color cardColor, Color textColor, Color textMuted, Color primaryColor) {
    switch (_viewMode) {
      case 'daily':
        return _buildDailyView(appProvider, cardColor, textColor, textMuted, primaryColor);
      case 'weekly':
        return _buildWeeklyView(appProvider, cardColor, textColor, textMuted, primaryColor);
      case 'monthly':
      default:
        return _buildMonthlyView(appProvider, cardColor, textColor, textMuted, primaryColor);
    }
  }

  Widget _buildDailyView(AppProvider appProvider, Color cardColor, Color textColor, Color textMuted, Color primaryColor) {
    final dateStr = _formatDate(_selectedDate);
    final daySlots = appProvider.schedules.where((s) => s.fullDate == dateStr).toList();

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left_rounded),
                onPressed: () => setState(() => _selectedDate = _selectedDate.subtract(const Duration(days: 1))),
              ),
              Text(
                "${_selectedDate.day} - ${_monthName(_selectedDate.month)}, ${_selectedDate.year}",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: textColor),
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right_rounded),
                onPressed: () => setState(() => _selectedDate = _selectedDate.add(const Duration(days: 1))),
              ),
            ],
          ),
        ),
        Expanded(
          child: daySlots.isEmpty
              ? Center(
                  child: Text(
                    "Bu kunda darslar yaratilmagan.",
                    style: TextStyle(color: textMuted),
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  itemCount: daySlots.length,
                  itemBuilder: (context, index) {
                    final slot = daySlots[index];
                    BookingRecord? bRecord;
                    try {
                      bRecord = appProvider.bookings.firstWhere(
                        (b) => b.slotId == slot.id && b.fullDate == slot.fullDate && b.status != 'cancelled',
                      );
                    } catch (_) {}

                    String statusText = 'Bo\'sh';
                    Color statusColor = const Color(0xFF10B981);
                    IconData statusIcon = Icons.check_circle_outline_rounded;
                    
                    if (bRecord != null) {
                      if (bRecord.status == 'pending') {
                        statusText = 'Kutilmoqda';
                        statusColor = const Color(0xFFF97316);
                        statusIcon = Icons.hourglass_empty_rounded;
                      } else {
                        statusText = 'Band';
                        statusColor = const Color(0xFFEF4444);
                        statusIcon = Icons.cancel_outlined;
                      }
                    }

                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: cardColor,
                        borderRadius: BorderRadius.circular(16),
                        border: Border.all(color: statusColor.withValues(alpha: 0.3), width: 1),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Row(
                                children: [
                                  Icon(statusIcon, color: statusColor, size: 18),
                                  const SizedBox(width: 6),
                                  Text(
                                    statusText.toUpperCase(),
                                    style: TextStyle(color: statusColor, fontWeight: FontWeight.bold, fontSize: 11),
                                  ),
                                ],
                              ),
                              Text(
                                "${slot.startTime} - ${slot.endTime}",
                                style: TextStyle(fontWeight: FontWeight.bold, color: textColor),
                              ),
                            ],
                          ),
                          const Divider(height: 20),
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Column(
                                crossAxisAlignment: CrossAxisAlignment.start,
                                children: [
                                  Text(
                                    slot.teacherName,
                                    style: TextStyle(fontWeight: FontWeight.w600, color: textColor),
                                  ),
                                  Text(
                                    bRecord != null ? "O'quvchi: ${bRecord.studentName}" : "Dars bo'sh",
                                    style: TextStyle(fontSize: 12, color: textMuted),
                                  ),
                                  if (bRecord != null)
                                    Text(
                                      "Yaratilgan vaqt: ${bRecord.createdAt.split('T').first}",
                                      style: TextStyle(fontSize: 10, color: textMuted),
                                    ),
                                ],
                              ),
                              if (bRecord != null)
                                Row(
                                  children: [
                                    if (bRecord.status == 'pending')
                                      IconButton(
                                        icon: const Icon(Icons.check_circle_rounded, color: Color(0xFF10B981)),
                                        onPressed: () => appProvider.updateBookingStatus(bRecord!.id, 'confirmed'),
                                        tooltip: 'Tasdiqlash',
                                      ),
                                    IconButton(
                                      icon: const Icon(Icons.cancel_rounded, color: Color(0xFFEF4444)),
                                      onPressed: () => appProvider.updateBookingStatus(bRecord!.id, 'cancelled'),
                                      tooltip: 'Bekor qilish',
                                    ),
                                    IconButton(
                                      icon: const Icon(Icons.edit_calendar_rounded, color: Color(0xFF3B82F6)),
                                      onPressed: () => _showRescheduleDialog(context, appProvider, bRecord!),
                                      tooltip: 'Ko\'chirish',
                                    ),
                                  ],
                                ),
                            ],
                          ),
                        ],
                      ),
                    );
                  },
                ),
        ),
      ],
    );
  }

  Widget _buildWeeklyView(AppProvider appProvider, Color cardColor, Color textColor, Color textMuted, Color primaryColor) {
    final start = _startOfWeek(_selectedDate);
    final days = List.generate(7, (i) => start.add(Duration(days: i)));

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left_rounded),
                onPressed: () => setState(() => _selectedDate = _selectedDate.subtract(const Duration(days: 7))),
              ),
              Text(
                "Haftalik: ${_formatDate(start)} - ${_formatDate(days[6])}",
                style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: textColor),
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right_rounded),
                onPressed: () => setState(() => _selectedDate = _selectedDate.add(const Duration(days: 7))),
              ),
            ],
          ),
        ),
        Expanded(
          child: ListView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            itemCount: 7,
            itemBuilder: (context, i) {
              final day = days[i];
              final dayStr = _formatDate(day);
              final slots = appProvider.schedules.where((s) => s.fullDate == dayStr).toList();

              int freeCount = 0;
              int pendingCount = 0;
              int bookedCount = 0;

              for (final s in slots) {
                final b = appProvider.bookings.firstWhere(
                  (bk) => bk.slotId == s.id && bk.fullDate == s.fullDate && bk.status != 'cancelled',
                  orElse: () => BookingRecord(id: '', slotId: '', studentId: '', studentName: '', studentStage: '', teacherId: '', teacherName: '', day: '', dayDate: '', fullDate: '', startTime: '', endTime: '', status: '', checkedIn: false, createdAt: ''),
                );
                if (b.id.isEmpty) {
                  freeCount++;
                } else if (b.status == 'pending') {
                  pendingCount++;
                } else {
                  bookedCount++;
                }
              }

              final dayNameUz = _dayNameUz(day.weekday);

              return Card(
                color: cardColor,
                margin: const EdgeInsets.only(bottom: 10),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                child: ListTile(
                  title: Text(
                    "$dayNameUz (${day.day} - ${_monthName(day.month)})",
                    style: TextStyle(fontWeight: FontWeight.bold, color: textColor),
                  ),
                  subtitle: Row(
                    children: [
                      Text("🟢 Bo'sh: $freeCount", style: const TextStyle(fontSize: 11, color: Color(0xFF10B981))),
                      const SizedBox(width: 10),
                      Text("🟡 Kutilmoqda: $pendingCount", style: const TextStyle(fontSize: 11, color: Color(0xFFF97316))),
                      const SizedBox(width: 10),
                      Text("🔴 Band: $bookedCount", style: const TextStyle(fontSize: 11, color: Color(0xFFEF4444))),
                    ],
                  ),
                  trailing: const Icon(Icons.chevron_right_rounded),
                  onTap: () {
                    setState(() {
                      _selectedDate = day;
                      _viewMode = 'daily';
                    });
                  },
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  Widget _buildMonthlyView(AppProvider appProvider, Color cardColor, Color textColor, Color textMuted, Color primaryColor) {
    final year = _selectedDate.year;
    final month = _selectedDate.month;

    final firstDayOfMonth = DateTime(year, month, 1);
    final daysInMonth = DateTime(year, month + 1, 0).day;
    final weekdayOfFirst = firstDayOfMonth.weekday;

    final totalCells = weekdayOfFirst - 1 + daysInMonth;

    return Column(
      children: [
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0, vertical: 8.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              IconButton(
                icon: const Icon(Icons.chevron_left_rounded),
                onPressed: () => setState(() => _selectedDate = DateTime(year, month - 1, 1)),
              ),
              Text(
                "${_monthName(month)} $year",
                style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: textColor),
              ),
              IconButton(
                icon: const Icon(Icons.chevron_right_rounded),
                onPressed: () => setState(() => _selectedDate = DateTime(year, month + 1, 1)),
              ),
            ],
          ),
        ),
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16.0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: const ['Dsh', 'Ssh', 'Chr', 'Pay', 'Jum', 'Sha', 'Yak'].map((d) {
              return Expanded(
                child: Center(
                  child: Text(
                    d,
                    style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: Color(0xFF64748B)),
                  ),
                ),
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 8),
        Expanded(
          child: GridView.builder(
            padding: const EdgeInsets.symmetric(horizontal: 12),
            gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
              crossAxisCount: 7,
              childAspectRatio: 0.9,
              mainAxisSpacing: 6,
              crossAxisSpacing: 6,
            ),
            itemCount: totalCells,
            itemBuilder: (context, index) {
              final offset = weekdayOfFirst - 1;
              if (index < offset) {
                return const SizedBox();
              }
              final dayNum = index - offset + 1;
              final dayDate = DateTime(year, month, dayNum);
              final dayStr = _formatDate(dayDate);

              final daySlots = appProvider.schedules.where((s) => s.fullDate == dayStr).toList();
              
              int freeCount = 0;
              int pendingCount = 0;
              int bookedCount = 0;

              for (final s in daySlots) {
                final b = appProvider.bookings.firstWhere(
                  (bk) => bk.slotId == s.id && bk.fullDate == s.fullDate && bk.status != 'cancelled',
                  orElse: () => BookingRecord(id: '', slotId: '', studentId: '', studentName: '', studentStage: '', teacherId: '', teacherName: '', day: '', dayDate: '', fullDate: '', startTime: '', endTime: '', status: '', checkedIn: false, createdAt: ''),
                );
                if (b.id.isEmpty) {
                  freeCount++;
                } else if (b.status == 'pending') {
                  pendingCount++;
                } else {
                  bookedCount++;
                }
              }

              final isToday = dayDate.day == DateTime.now().day && dayDate.month == DateTime.now().month && dayDate.year == DateTime.now().year;

              return GestureDetector(
                onTap: () {
                  setState(() {
                    _selectedDate = dayDate;
                    _viewMode = 'daily';
                  });
                },
                child: Container(
                  decoration: BoxDecoration(
                    color: isToday ? primaryColor.withValues(alpha: 0.15) : cardColor,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(
                      color: isToday ? primaryColor : Colors.transparent,
                      width: 1.5,
                    ),
                  ),
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        "$dayNum",
                        style: TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 12.5,
                          color: isToday ? primaryColor : textColor,
                        ),
                      ),
                      const SizedBox(height: 4),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          if (freeCount > 0)
                            Container(width: 5, height: 5, decoration: const BoxDecoration(color: Color(0xFF10B981), shape: BoxShape.circle)),
                          if (freeCount > 0 && (pendingCount > 0 || bookedCount > 0)) const SizedBox(width: 2),
                          if (pendingCount > 0)
                            Container(width: 5, height: 5, decoration: const BoxDecoration(color: Color(0xFFF97316), shape: BoxShape.circle)),
                          if (pendingCount > 0 && bookedCount > 0) const SizedBox(width: 2),
                          if (bookedCount > 0)
                            Container(width: 5, height: 5, decoration: const BoxDecoration(color: Color(0xFFEF4444), shape: BoxShape.circle)),
                        ],
                      ),
                    ],
                  ),
                ),
              );
            },
          ),
        ),
      ],
    );
  }

  void _showRescheduleDialog(BuildContext context, AppProvider appProvider, BookingRecord booking) {
    final freeSlots = appProvider.schedules.where((s) => s.bookedStudents == 0).toList();

    showDialog(
      context: context,
      builder: (context) {
        return AlertDialog(
          title: const Text("Darsni boshqa vaqtga ko'chirish"),
          content: freeSlots.isEmpty
              ? const Text("Bo'sh vaqtlar topilmadi.")
              : SizedBox(
                  width: double.maxFinite,
                  child: ListView.builder(
                    shrinkWrap: true,
                    itemCount: freeSlots.length,
                    itemBuilder: (context, i) {
                      final fs = freeSlots[i];
                      return ListTile(
                        title: Text("${fs.teacherName} - ${fs.dayDate}"),
                        subtitle: Text("${fs.startTime} - ${fs.endTime}"),
                        trailing: const Icon(Icons.chevron_right_rounded),
                        onTap: () async {
                          await FirebaseFirestore.instance.collection('schedules').doc(booking.slotId).update({
                            'bookedStudents': 0,
                            'status': 'available',
                          });

                          await FirebaseFirestore.instance.collection('bookings').doc(booking.id).update({
                            'slotId': fs.id,
                            'day': fs.day,
                            'dayDate': fs.dayDate,
                            'fullDate': fs.fullDate,
                            'startTime': fs.startTime,
                            'endTime': fs.endTime,
                          });

                          await FirebaseFirestore.instance.collection('schedules').doc(fs.id).update({
                            'bookedStudents': 1,
                            'status': 'full',
                          });

                          if (context.mounted) {
                            Navigator.pop(context);
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text("Dars muvaffaqiyatli ko'chirildi!"),
                                backgroundColor: Color(0xFF22C55E),
                              ),
                            );
                          }
                        },
                      );
                    },
                  ),
                ),
          actions: [
            TextButton(
              onPressed: () => Navigator.pop(context),
              child: const Text("Bekor qilish"),
            ),
          ],
        );
      },
    );
  }
}
