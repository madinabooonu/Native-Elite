import 'package:flutter/material.dart';
import 'dart:math';

class ProgressChartView extends StatefulWidget {
  const ProgressChartView({super.key});

  @override
  State<ProgressChartView> createState() => _ProgressChartViewState();
}

class _ProgressChartViewState extends State<ProgressChartView> {
  String timeRange = 'weekly';

  final weeklyData = {
    'speaking': [5.5, 6.0, 5.5, 6.5, 6.0, 7.0, 6.5],
    'vocabulary': [12.0, 18.0, 15.0, 22.0, 20.0, 25.0, 28.0],
    'mockTest': [5.0, 5.5, 6.0, 5.5, 6.5, 6.0, 6.5],
    'attendance': [1.0, 1.0, 0.0, 1.0, 1.0, 1.0, 0.0],
  };
  final monthlyData = {
    'speaking': [5.0, 5.5, 5.5, 6.0, 6.0, 6.5, 6.5, 7.0, 6.5, 7.0, 7.0, 7.5],
    'vocabulary': [40.0, 55.0, 68.0, 82.0, 95.0, 110.0, 125.0, 140.0, 155.0, 170.0, 188.0, 205.0],
    'mockTest': [5.0, 5.0, 5.5, 5.5, 6.0, 6.0, 6.0, 6.5, 6.5, 6.5, 7.0, 7.0],
    'attendance': [8.0, 10.0, 9.0, 11.0, 10.0, 12.0, 11.0, 12.0, 10.0, 11.0, 12.0, 11.0],
  };
  final weekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  final monthLabels = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  @override
  Widget build(BuildContext context) {
    final data = timeRange == 'weekly' ? weeklyData : monthlyData;
    final labels = timeRange == 'weekly' ? weekLabels : monthLabels;

    final avgSpeaking = (data['speaking']!.reduce((a, b) => a + b) / data['speaking']!.length).toStringAsFixed(1);
    final totalVocab = data['vocabulary']!.last.toInt();
    final latestMock = data['mockTest']!.last.toStringAsFixed(1);
    final attendanceRate = timeRange == 'weekly'
        ? (data['attendance']!.where((a) => a > 0).length / data['attendance']!.length * 100).round()
        : (data['attendance']!.reduce((a, b) => a + b) / (data['attendance']!.length * 12) * 100).round();

    return Scaffold(
      backgroundColor: const Color(0xFF050A24),
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Padding(
              padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text('My Progress', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
                  SizedBox(height: 2),
                  Text('Track your learning journey', style: TextStyle(fontSize: 12, color: Colors.grey)),
                ],
              ),
            ),

            // Time toggle
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 16),
              child: Row(
                children: ['weekly', 'monthly'].map((range) {
                  final isSelected = timeRange == range;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => timeRange = range),
                      child: Container(
                        margin: const EdgeInsets.only(right: 8),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF7BB8F5).withAlpha(25) : Colors.transparent,
                          border: Border.all(color: isSelected ? const Color(0xFF7BB8F5).withAlpha(100) : Colors.white.withAlpha(20)),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text(range.toUpperCase(), style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, letterSpacing: 1, color: isSelected ? const Color(0xFF7BB8F5) : Colors.grey)),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            // Stats Grid
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: GridView.count(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                crossAxisCount: 2,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
                childAspectRatio: 1.6,
                children: [
                  _statCard('🎤', 'Speaking Avg', avgSpeaking, '↑ Band $avgSpeaking', const Color(0xFFA855F7)),
                  _statCard('📚', 'Words Learned', '$totalVocab', '+${timeRange == 'weekly' ? 28 : 205} words', const Color(0xFF7BB8F5)),
                  _statCard('📝', 'Mock Test', latestMock, 'Band $latestMock', const Color(0xFFFBBF24)),
                  _statCard('✅', 'Attendance', '$attendanceRate%', attendanceRate >= 80 ? 'Excellent' : 'Good', const Color(0xFF60A5FA)),
                ],
              ),
            ),

            const SizedBox(height: 24),
            _chartSection('Speaking Progress', 'IELTS Band Score', '🎤 Band $avgSpeaking', const Color(0xFFA855F7), data['speaking']!, labels, 9),
            const SizedBox(height: 16),
            _barChartSection('Vocabulary Growth', 'Words learned', '📚 $totalVocab', const Color(0xFF7BB8F5), data['vocabulary']!, labels),
            const SizedBox(height: 16),
            _chartSection('Mock Test Results', 'Overall band scores', '📝 Band $latestMock', const Color(0xFFFBBF24), data['mockTest']!, labels, 9),
            const SizedBox(height: 16),
            _barChartSection('Attendance', timeRange == 'weekly' ? 'Classes this week' : 'Monthly attendance', '✅ $attendanceRate%', const Color(0xFF60A5FA), data['attendance']!, labels),
          ],
        ),
      ),
    );
  }

  Widget _statCard(String icon, String label, String value, String change, Color color) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF0E173C),
        border: Border.all(color: color.withAlpha(50)),
        borderRadius: BorderRadius.circular(14),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(icon, style: const TextStyle(fontSize: 18)),
              Text(change, style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: color)),
            ],
          ),
          const Spacer(),
          Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: Colors.white)),
          Text(label, style: const TextStyle(fontSize: 10, color: Colors.grey)),
        ],
      ),
    );
  }

  Widget _chartSection(String title, String subtitle, String badge, Color color, List<double> data, List<String> labels, double maxVal) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF0E173C),
          border: Border.all(color: Colors.white.withAlpha(15)),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                  Text(subtitle, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                ]),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: color.withAlpha(25), borderRadius: BorderRadius.circular(6)),
                  child: Text(badge, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 120,
              child: CustomPaint(
                size: const Size(double.infinity, 120),
                painter: _LineChartPainter(data: data, color: color, maxVal: maxVal),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: labels.map((l) => Expanded(child: Text(l, style: const TextStyle(fontSize: 9, color: Colors.grey), textAlign: TextAlign.center))).toList(),
            ),
          ],
        ),
      ),
    );
  }

  Widget _barChartSection(String title, String subtitle, String badge, Color color, List<double> data, List<String> labels) {
    final maxVal = data.reduce(max) * 1.2;
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Container(
        padding: const EdgeInsets.all(16),
        decoration: BoxDecoration(
          color: const Color(0xFF0E173C),
          border: Border.all(color: Colors.white.withAlpha(15)),
          borderRadius: BorderRadius.circular(16),
        ),
        child: Column(
          children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                  Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                  Text(subtitle, style: const TextStyle(fontSize: 10, color: Colors.grey)),
                ]),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                  decoration: BoxDecoration(color: color.withAlpha(25), borderRadius: BorderRadius.circular(6)),
                  child: Text(badge, style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: color)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            SizedBox(
              height: 100,
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.end,
                children: data.map((val) {
                  final h = (val / maxVal) * 100;
                  return Expanded(
                    child: Padding(
                      padding: const EdgeInsets.symmetric(horizontal: 2),
                      child: Container(
                        height: h.clamp(3, 100),
                        decoration: BoxDecoration(color: color, borderRadius: const BorderRadius.vertical(top: Radius.circular(4))),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),
            const SizedBox(height: 8),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: labels.map((l) => Expanded(child: Text(l, style: const TextStyle(fontSize: 9, color: Colors.grey), textAlign: TextAlign.center))).toList(),
            ),
          ],
        ),
      ),
    );
  }
}

class _LineChartPainter extends CustomPainter {
  final List<double> data;
  final Color color;
  final double maxVal;

  _LineChartPainter({required this.data, required this.color, required this.maxVal});

  @override
  void paint(Canvas canvas, Size size) {
    if (data.isEmpty) return;
    final paint = Paint()..color = color..strokeWidth = 2.5..style = PaintingStyle.stroke..strokeCap = StrokeCap.round;
    final fillPaint = Paint()..shader = LinearGradient(
      begin: Alignment.topCenter,
      end: Alignment.bottomCenter,
      colors: [color.withAlpha(80), color.withAlpha(5)],
    ).createShader(Rect.fromLTWH(0, 0, size.width, size.height));

    final path = Path();
    final fillPath = Path();
    
    for (var i = 0; i < data.length; i++) {
      final x = (i / (data.length - 1)) * size.width;
      final y = size.height - (data[i] / maxVal) * size.height;
      if (i == 0) {
        path.moveTo(x, y);
        fillPath.moveTo(x, y);
      } else {
        path.lineTo(x, y);
        fillPath.lineTo(x, y);
      }
    }

    // Fill area
    fillPath.lineTo(size.width, size.height);
    fillPath.lineTo(0, size.height);
    fillPath.close();
    canvas.drawPath(fillPath, fillPaint);
    canvas.drawPath(path, paint);

    // Dots
    final dotPaint = Paint()..color = color..style = PaintingStyle.fill;
    final borderPaint = Paint()..color = const Color(0xFF050A24)..strokeWidth = 2..style = PaintingStyle.stroke;
    for (var i = 0; i < data.length; i++) {
      final x = (i / (data.length - 1)) * size.width;
      final y = size.height - (data[i] / maxVal) * size.height;
      canvas.drawCircle(Offset(x, y), 4, dotPaint);
      canvas.drawCircle(Offset(x, y), 4, borderPaint);
    }
  }

  @override
  bool shouldRepaint(covariant CustomPainter oldDelegate) => true;
}
