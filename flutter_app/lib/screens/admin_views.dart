import 'package:flutter/material.dart';

class AdminDashboard extends StatefulWidget {
  const AdminDashboard({super.key});

  @override
  State<AdminDashboard> createState() => _AdminDashboardState();
}

class _AdminDashboardState extends State<AdminDashboard> {
  String activeSubTab = 'overview';
  
  final List<Map<String, dynamic>> stats = [
    {'label': 'Total Bookings', 'value': '124', 'icon': Icons.calendar_month, 'color': const Color(0xFF0353A4)},
    {'label': 'Pending Graded', 'value': '12', 'icon': Icons.pending_actions, 'color': const Color(0xFFF97316)},
    {'label': 'Average Score', 'value': '6.5', 'icon': Icons.score, 'color': const Color(0xFF22C55E)},
    {'label': 'Attendance', 'value': '92%', 'icon': Icons.group, 'color': const Color(0xFFA855F7)},
  ];

  final List<Map<String, dynamic>> students = [
    {'name': 'Alex Johnson', 'stage': 'B2', 'status': 'Present', 'writing': 6.5, 'speaking': 7.0, 'homework': 'Done'},
    {'name': 'Maria Garcia', 'stage': 'C1', 'status': 'Absent', 'writing': 7.5, 'speaking': 7.0, 'homework': 'Pending'},
    {'name': 'Ali Karimov', 'stage': 'IELTS', 'status': 'Present', 'writing': 6.0, 'speaking': 6.5, 'homework': 'Done'},
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = Theme.of(context).scaffoldBackgroundColor;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;

    return Scaffold(
      backgroundColor: bgColor,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
        child: Column(
          children: [
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.5,
              ),
              itemCount: stats.length,
              itemBuilder: (context, index) {
                final s = stats[index];
                return Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cardColor,
                    border: Border.all(color: const Color(0xFF0353A4).withOpacity(0.1)),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Row(
                        children: [
                          Icon(s['icon'], color: s['color'], size: 24),
                          const Spacer(),
                          Text(s['value'], style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold, color: textColor)),
                        ],
                      ),
                      const Spacer(),
                      Text(s['label'], style: const TextStyle(fontSize: 11, color: Colors.grey)),
                    ],
                  ),
                );
              },
            ),

            const SizedBox(height: 16),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: ['overview', 'attendance', 'scores', 'homework'].map((tab) {
                  final isSelected = activeSubTab == tab;
                  return GestureDetector(
                    onTap: () => setState(() => activeSubTab = tab),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                      decoration: BoxDecoration(
                        color: isSelected ? const Color(0xFF0353A4) : cardColor,
                        border: Border.all(color: isSelected ? const Color(0xFF0353A4) : Colors.grey.withOpacity(0.3)),
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        tab.substring(0, 1).toUpperCase() + tab.substring(1),
                        style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : Colors.grey),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 16),
            if (activeSubTab == 'overview' || activeSubTab == 'attendance') _buildAttendanceView(cardColor, textColor),
            if (activeSubTab == 'scores') _buildScoresView(cardColor, textColor),
            if (activeSubTab == 'homework') _buildHomeworkView(cardColor, textColor),
          ],
        ),
      ),
    );
  }

  Widget _buildAttendanceView(Color cardColor, Color textColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Daily Attendance check', style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 12),
        ...students.map((student) => _buildStudentCard(
          student, 
          cardColor, 
          textColor, 
          action: Row(
            children: [
              ChoiceChip(
                label: const Text('Present', style: TextStyle(fontSize: 10)),
                selected: student['status'] == 'Present',
                onSelected: (_) => setState(() => student['status'] = 'Present'),
                selectedColor: Colors.green.withOpacity(0.2),
              ),
              const SizedBox(width: 8),
              ChoiceChip(
                label: const Text('Absent', style: TextStyle(fontSize: 10)),
                selected: student['status'] == 'Absent',
                onSelected: (_) => setState(() => student['status'] = 'Absent'),
                selectedColor: Colors.red.withOpacity(0.2),
              ),
            ],
          )
        )).toList(),
      ],
    );
  }

  Widget _buildScoresView(Color cardColor, Color textColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text('Student Scores Update', style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 16)),
        const SizedBox(height: 12),
        ...students.map((student) => _buildStudentCard(
          student, 
          cardColor, 
          textColor, 
          action: Row(
            children: [
              _scoreField('Writing', student['writing'].toString()),
              const SizedBox(width: 8),
              _scoreField('Speaking', student['speaking'].toString()),
            ],
          )
        )).toList(),
      ],
    );
  }

  Widget _scoreField(String label, String val) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: const TextStyle(fontSize: 8, color: Colors.grey)),
        Container(
          width: 40,
          padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
          decoration: BoxDecoration(border: Border.all(color: Colors.grey.withOpacity(0.3)), borderRadius: BorderRadius.circular(4)),
          child: Text(val, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold), textAlign: TextAlign.center),
        ),
      ],
    );
  }

  Widget _buildHomeworkView(Color cardColor, Color textColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('Homework Management', style: TextStyle(color: textColor, fontWeight: FontWeight.bold, fontSize: 16)),
            ElevatedButton(
              onPressed: () {},
              style: ElevatedButton.styleFrom(backgroundColor: const Color(0xFF0353A4), foregroundColor: Colors.white),
              child: const Text('Assign Target', style: TextStyle(fontSize: 12)),
            )
          ],
        ),
        const SizedBox(height: 12),
        ...students.map((student) => _buildStudentCard(
          student, 
          cardColor, 
          textColor, 
          action: Row(
            children: [
              Icon(
                student['homework'] == 'Done' ? Icons.check_circle : Icons.pending_actions,
                color: student['homework'] == 'Done' ? Colors.green : Colors.orange,
              ),
              const SizedBox(width: 4),
              Text(student['homework'], style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: student['homework'] == 'Done' ? Colors.green : Colors.orange)),
            ],
          )
        )).toList(),
      ],
    );
  }

  Widget _buildStudentCard(Map<String, dynamic> student, Color cardColor, Color textColor, {Widget? action}) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: cardColor,
        border: Border.all(color: Colors.grey.withOpacity(0.2)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            width: 36, height: 36,
            decoration: const BoxDecoration(color: Color(0xFF0353A4), shape: BoxShape.circle),
            alignment: Alignment.center,
            child: Text(student['name'].split(' ').map((e) => e[0]).join(), style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(student['name'], style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: textColor)),
                Text('Stage: ${student['stage']}', style: const TextStyle(fontSize: 11, color: Colors.grey)),
              ],
            ),
          ),
          if (action != null) action,
        ],
      ),
    );
  }
}
