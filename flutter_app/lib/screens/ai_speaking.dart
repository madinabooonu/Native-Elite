import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';

class AISpeaking extends StatefulWidget {
  const AISpeaking({super.key});

  @override
  State<AISpeaking> createState() => _AISpeakingState();
}

class _AISpeakingState extends State<AISpeaking> {
  final List<Map<String, dynamic>> topics = [
    // Part 1
    {'id': 't1', 'title': 'Hometown', 'desc': 'Talk about where you live', 'icon': '🏘️', 'part': 'part1'},
    {'id': 't2', 'title': 'Work', 'desc': 'Describe your job', 'icon': '💼', 'part': 'part1'},
    {'id': 't3', 'title': 'Study', 'desc': 'Describe your education', 'icon': '📚', 'part': 'part1'},
    {'id': 't4', 'title': 'Family', 'desc': 'Talk about your family members', 'icon': '👨‍👩‍👧‍👦', 'part': 'part1'},
    {'id': 't5', 'title': 'Friends', 'desc': 'Talk about your closest friends', 'icon': '🤝', 'part': 'part1'},
    // Part 2
    {'id': 't6', 'title': 'Describe a person', 'desc': 'A person you admire', 'icon': '👤', 'part': 'part2'},
    {'id': 't7', 'title': 'Describe a place', 'desc': 'A place you recently visited', 'icon': '🌍', 'part': 'part2'},
    {'id': 't8', 'title': 'Describe an event', 'desc': 'A memorable event in your life', 'icon': '🎉', 'part': 'part2'},
    // Part 3
    {'id': 't9', 'title': 'Advanced Discussion Questions', 'desc': 'Deep dive into abstract topics', 'icon': '💡', 'part': 'part3'},
  ];

  String selectedPart = 'part1';
  String sessionState = 'topics';

  Future<void> _launchSesame() async {
    final Uri url = Uri.parse('https://app.sesame.com');
    if (!await launchUrl(url)) {
      debugPrint('Could not launch $url');
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = Theme.of(context).scaffoldBackgroundColor;
    final cardColor = isDark ? const Color(0xFF0F172A) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final subtitleColor = isDark ? Colors.white70 : Colors.black54;

    if (sessionState != 'topics') {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('AI Call in progress... (Microphone permissions pending)', style: TextStyle(color: textColor)),
            TextButton(
              onPressed: () => setState(() => sessionState = 'topics'),
              child: const Text('Cancel Call'),
            ),
          ],
        )
      );
    }

    final filteredTopics = topics.where((t) => t['part'] == selectedPart).toList();

    return Scaffold(
      backgroundColor: bgColor,
      body: SingleChildScrollView(
        padding: const EdgeInsets.only(bottom: 100),
        child: Column(
          children: [
            const SizedBox(height: 24),
            Container(
              padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
              decoration: BoxDecoration(
                border: Border.all(color: const Color(0xFF0353A4).withOpacity(0.4)),
                borderRadius: BorderRadius.circular(20),
              ),
              child: Row(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Container(width: 6, height: 6, decoration: const BoxDecoration(color: const Color(0xFF0353A4), shape: BoxShape.circle)),
                  const SizedBox(width: 8),
                  const Text('VOICE AI', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Color(0xFF0353A4), letterSpacing: 2)),
                ],
              ),
            ),
            const SizedBox(height: 12),
            RichText(
              text: TextSpan(
                style: const TextStyle(fontSize: 24, fontWeight: FontWeight.w900),
                children: [
                  TextSpan(text: 'IELTS ', style: TextStyle(color: textColor)),
                  const TextSpan(text: 'Speaking', style: TextStyle(color: Color(0xFF0353A4))),
                ],
              ),
            ),
            const SizedBox(height: 4),
            Text('Practice with AI examiner using your voice', style: TextStyle(fontSize: 12, color: subtitleColor)),
            
            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: ElevatedButton.icon(
                onPressed: _launchSesame,
                icon: const Icon(Icons.open_in_new),
                label: const Text('Practice on Sesame Platform', style: TextStyle(fontWeight: FontWeight.bold)),
                style: ElevatedButton.styleFrom(
                  backgroundColor: const Color(0xFFEAB308), // brand-yellow
                  foregroundColor: Colors.black87,
                  minimumSize: const Size(double.infinity, 50),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                ),
              ),
            ),

            const SizedBox(height: 24),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Row(
                children: ['part1', 'part2', 'part3'].map((part) {
                  final isSelected = selectedPart == part;
                  return Expanded(
                    child: GestureDetector(
                      onTap: () => setState(() => selectedPart = part),
                      child: Container(
                        margin: const EdgeInsets.symmetric(horizontal: 4),
                        padding: const EdgeInsets.symmetric(vertical: 10),
                        alignment: Alignment.center,
                        decoration: BoxDecoration(
                          color: isSelected ? const Color(0xFF0353A4).withOpacity(0.1) : Colors.transparent,
                          border: Border.all(color: isSelected ? const Color(0xFF0353A4).withOpacity(0.4) : Colors.grey.withOpacity(0.3)),
                          borderRadius: BorderRadius.circular(12),
                        ),
                        child: Text('Part ${part.substring(4)}', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: isSelected ? const Color(0xFF0353A4) : Colors.grey)),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 16),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              child: Container(
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(
                  color: cardColor,
                  border: Border.all(color: const Color(0xFF0353A4).withOpacity(0.1)),
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  selectedPart == 'part1' ? '🎤 Part 1: Introduction & Interview — Answer short questions about familiar topics'
                  : selectedPart == 'part2' ? '📝 Part 2: Long Turn — Speak for 1-2 minutes on a given topic'
                  : '💡 Part 3: Discussion — Answer in-depth questions related to Part 2 topic',
                  style: TextStyle(fontSize: 12, color: subtitleColor, height: 1.5),
                ),
              ),
            ),

            const SizedBox(height: 16),
            ListView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: filteredTopics.length,
              itemBuilder: (context, index) {
                final t = filteredTopics[index];
                return GestureDetector(
                  onTap: () => setState(() => sessionState = 'call'),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: cardColor,
                      border: Border.all(color: Colors.grey.withOpacity(0.2)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: [
                        Text(t['icon'], style: const TextStyle(fontSize: 24)),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(t['title'], style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: textColor)),
                              const SizedBox(height: 2),
                              Text(t['desc'], style: TextStyle(fontSize: 12, color: subtitleColor)),
                            ],
                          ),
                        ),
                        Container(
                          width: 36, height: 36,
                          decoration: BoxDecoration(color: const Color(0xFF0353A4).withOpacity(0.1), shape: BoxShape.circle),
                          alignment: Alignment.center,
                          child: const Icon(Icons.call, color: Color(0xFF0353A4), size: 16),
                        )
                      ],
                    ),
                  ),
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
