import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_provider.dart';

// ─────────────────────────────────────────────────────────
// PROGRESS CHART
// ─────────────────────────────────────────────────────────
class ProgressChart extends StatelessWidget {
  const ProgressChart({super.key});

  @override
  Widget build(BuildContext context) {
    final user = context.watch<AppProvider>().currentUser;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF060D3A) : const Color(0xFFF0F4FF);
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtitleColor =
        isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600;

    final skills = [
      {'label': 'Listening', 'score': 72, 'color': const Color(0xFF4169E1)},
      {'label': 'Reading', 'score': 68, 'color': const Color(0xFF22C55E)},
      {'label': 'Writing', 'score': 58, 'color': const Color(0xFFF59E0B)},
      {'label': 'Speaking', 'score': 75, 'color': const Color(0xFFEC4899)},
    ];

    final weeklyActivity = [40, 65, 30, 80, 55, 90, 45];
    final days = ['Du', 'Se', 'Ch', 'Pa', 'Ju', 'Sh', 'Ya'];

    return Scaffold(
      backgroundColor: bgColor,
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Overall Score Card ──
            Container(
              width: double.infinity,
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF0D1B6E), Color(0xFF4169E1)],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(20),
                boxShadow: [
                  BoxShadow(
                    color: const Color(0xFF4169E1).withValues(alpha: 0.3),
                    blurRadius: 20,
                    offset: const Offset(0, 8),
                  ),
                ],
              ),
              child: Row(
                children: [
                  // Big score ring
                  Container(
                    width: 80,
                    height: 80,
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.15),
                      shape: BoxShape.circle,
                    ),
                    child: const Center(
                      child: Column(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text('6.5',
                              style: TextStyle(
                                  color: Colors.white,
                                  fontSize: 24,
                                  fontWeight: FontWeight.w900)),
                          Text('IELTS',
                              style: TextStyle(
                                  color: Colors.white70,
                                  fontSize: 10)),
                        ],
                      ),
                    ),
                  ),
                  const SizedBox(width: 20),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text('Taxminiy Ball',
                          style: TextStyle(
                              color: Colors.white70, fontSize: 13)),
                      const SizedBox(height: 4),
                      Text(user?.displayName ?? 'Student',
                          style: const TextStyle(
                              color: Colors.white,
                              fontSize: 18,
                              fontWeight: FontWeight.w800)),
                      const SizedBox(height: 4),
                      const Text('🎯 Maqsad: 7.0',
                          style: TextStyle(
                              color: Color(0xFF7BB8F5), fontSize: 13)),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // ── Skills ──
            Text("Ko'nikmalar",
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: textColor)),
            const SizedBox(height: 12),
            ...skills.map((skill) {
              final score = skill['score'] as int;
              final color = skill['color'] as Color;
              return Container(
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                    color: cardColor,
                    borderRadius: BorderRadius.circular(14)),
                child: Column(
                  children: [
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Container(
                              width: 10,
                              height: 10,
                              decoration: BoxDecoration(
                                  color: color, shape: BoxShape.circle),
                            ),
                            const SizedBox(width: 8),
                            Text(skill['label'] as String,
                                style: TextStyle(
                                    fontWeight: FontWeight.w600,
                                    color: textColor)),
                          ],
                        ),
                        Text('$score / 100',
                            style: TextStyle(
                                fontWeight: FontWeight.w700,
                                color: color)),
                      ],
                    ),
                    const SizedBox(height: 8),
                    ClipRRect(
                      borderRadius: BorderRadius.circular(4),
                      child: LinearProgressIndicator(
                        value: score / 100,
                        backgroundColor: color.withValues(alpha: 0.1),
                        valueColor: AlwaysStoppedAnimation<Color>(color),
                        minHeight: 8,
                      ),
                    ),
                  ],
                ),
              );
            }),
            const SizedBox(height: 20),

            // ── Weekly Activity ──
            Text("Haftalik Faollik",
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: textColor)),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                  color: cardColor, borderRadius: BorderRadius.circular(16)),
              child: Column(
                children: [
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.end,
                    children: weeklyActivity.asMap().entries.map((e) {
                      final idx = e.key;
                      final val = e.value;
                      final isToday = idx == 5;
                      return Expanded(
                        child: Padding(
                          padding:
                              const EdgeInsets.symmetric(horizontal: 4),
                          child: Column(
                            children: [
                              if (isToday)
                                const Text('Today',
                                    style: TextStyle(
                                        fontSize: 8,
                                        color: Color(0xFF4169E1),
                                        fontWeight: FontWeight.w700)),
                              const SizedBox(height: 4),
                              AnimatedContainer(
                                duration: const Duration(milliseconds: 500),
                                height: val.toDouble(),
                                decoration: BoxDecoration(
                                  color: isToday
                                      ? const Color(0xFF4169E1)
                                      : const Color(0xFF4169E1)
                                          .withValues(alpha: 0.3),
                                  borderRadius: BorderRadius.circular(6),
                                ),
                              ),
                              const SizedBox(height: 4),
                              Text(days[idx],
                                  style: TextStyle(
                                      fontSize: 11,
                                      color: subtitleColor,
                                      fontWeight: isToday
                                          ? FontWeight.w700
                                          : FontWeight.normal)),
                            ],
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // ── Scores ──
            Text("Baholar",
                style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w700,
                    color: textColor)),
            const SizedBox(height: 12),
            ...[ 
              {'subject': 'Speaking Practice', 'score': 85, 'date': '2026-06-20'},
              {'subject': 'Vocabulary Test', 'score': 72, 'date': '2026-06-18'},
              {'subject': 'Writing Task 2', 'score': 68, 'date': '2026-06-15'},
            ].map((s) => Container(
              margin: const EdgeInsets.only(bottom: 10),
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                  color: cardColor,
                  borderRadius: BorderRadius.circular(14)),
              child: Row(
                children: [
                  Container(
                    width: 44,
                    height: 44,
                    decoration: BoxDecoration(
                      color: _scoreColor(s['score'] as int).withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Center(
                      child: Text(
                        '${s['score']}',
                        style: TextStyle(
                            fontWeight: FontWeight.w800,
                            fontSize: 16,
                            color: _scoreColor(s['score'] as int)),
                      ),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(s['subject'] as String,
                            style: TextStyle(
                                fontWeight: FontWeight.w600, color: textColor)),
                        Text(s['date'] as String,
                            style:
                                TextStyle(fontSize: 11, color: subtitleColor)),
                      ],
                    ),
                  ),
                  Text(
                    '${s['score']}/100',
                    style: TextStyle(
                        fontWeight: FontWeight.w700,
                        color: _scoreColor(s['score'] as int)),
                  ),
                ],
              ),
            )),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }

  Color _scoreColor(int s) {
    if (s >= 80) return const Color(0xFF22C55E);
    if (s >= 60) return const Color(0xFFF59E0B);
    return Colors.red;
  }
}
