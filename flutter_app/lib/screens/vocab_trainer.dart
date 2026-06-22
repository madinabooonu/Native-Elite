import 'package:flutter/material.dart';

class VocabTrainer extends StatefulWidget {
  const VocabTrainer({super.key});

  @override
  State<VocabTrainer> createState() => _VocabTrainerState();
}

class _VocabTrainerState extends State<VocabTrainer> {
  // Define 6 stages
  final List<Map<String, dynamic>> stages = [
    {'id': '1', 'name': 'Stage 1', 'sub': 'Basic Vocabulary', 'icon': Icons.star_border, 'count': 50},
    {'id': '2', 'name': 'Stage 2', 'sub': 'Daily Life Vocabulary', 'icon': Icons.wb_sunny_outlined, 'count': 80},
    {'id': '3', 'name': 'Stage 3', 'sub': 'Education Vocabulary', 'icon': Icons.school_outlined, 'count': 100},
    {'id': '4', 'name': 'Stage 4', 'sub': 'Technology Vocabulary', 'icon': Icons.computer_outlined, 'count': 120},
    {'id': '5', 'name': 'Stage 5', 'sub': 'IELTS Vocabulary', 'icon': Icons.language_outlined, 'count': 200},
    {'id': '6', 'name': 'Stage 6', 'sub': 'Advanced Vocabulary', 'icon': Icons.psychology_outlined, 'count': 250},
  ];

  final Map<String, List<Map<String, dynamic>>> topicsByStage = {
    '1': [
      {'id': 'all-about-me', 'name': 'All About Me', 'emoji': '🤩', 'count': 9},
      {'id': 'small-talk', 'name': 'Small Talk', 'emoji': '💬', 'count': 6},
    ],
    '2': [
      {'id': 'daily-routine', 'name': 'Daily Routine', 'emoji': '📅', 'count': 9},
      {'id': 'people-in-my-life', 'name': 'People in My Life', 'emoji': '👫', 'count': 8},
    ],
    '3': [
      {'id': 'job-studies', 'name': 'Job & Studies', 'emoji': '📮', 'count': 9},
      {'id': 'school-life', 'name': 'School Life', 'emoji': '🏫', 'count': 12},
    ],
    '4': [
      {'id': 'internet', 'name': 'The Internet', 'emoji': '🌐', 'count': 15},
      {'id': 'gadgets', 'name': 'Gadgets', 'emoji': '📱', 'count': 10},
    ],
    '5': [
      {'id': 'environment', 'name': 'Environment', 'emoji': '🌍', 'count': 20},
      {'id': 'society', 'name': 'Society', 'emoji': '🏢', 'count': 25},
    ],
    '6': [
      {'id': 'abstract', 'name': 'Abstract Concepts', 'emoji': '🌌', 'count': 30},
      {'id': 'idioms', 'name': 'Advanced Idioms', 'emoji': '🗣', 'count': 20},
    ],
  };

  String? selectedStageId;
  List<String> selectedTopics = [];
  int wordsPerSession = 10;
  String trainerSession = 'setup';

  void toggleTopic(String id) {
    setState(() {
      if (selectedTopics.contains(id)) {
        selectedTopics.remove(id);
      } else {
        selectedTopics.add(id);
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = Theme.of(context).scaffoldBackgroundColor;
    final textColor = isDark ? Colors.white : Colors.black87;
    final subtitleColor = isDark ? Colors.white70 : Colors.black54;
    final cardColor = isDark ? const Color(0xFF0F172A) : Colors.white;

    if (trainerSession != 'setup') {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Text('Trainer Stage: $trainerSession (In development)', style: TextStyle(color: textColor)),
            TextButton(
              onPressed: () => setState(() => trainerSession = 'setup'),
              child: const Text('Back'),
            )
          ],
        )
      );
    }

    // Showing Stage List
    if (selectedStageId == null) {
      return Scaffold(
        backgroundColor: bgColor,
        body: ListView.builder(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 24),
          itemCount: stages.length,
          itemBuilder: (context, index) {
            final stage = stages[index];
            return Card(
              color: cardColor,
              margin: const EdgeInsets.only(bottom: 12),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              child: ListTile(
                contentPadding: const EdgeInsets.all(16),
                leading: CircleAvatar(
                  backgroundColor: const Color(0xFF0353A4).withOpacity(0.1),
                  child: Icon(stage['icon'], color: const Color(0xFF0353A4)),
                ),
                title: Text(stage['name'], style: TextStyle(fontWeight: FontWeight.bold, fontSize: 18, color: textColor)),
                subtitle: Text(stage['sub'], style: TextStyle(color: subtitleColor)),
                trailing: const Icon(Icons.arrow_forward_ios, size: 16, color: Colors.grey),
                onTap: () {
                  setState(() {
                    selectedStageId = stage['id'];
                    selectedTopics = topicsByStage[stage['id']]!.map((t) => t['id'] as String).toList();
                  });
                },
              ),
            );
          },
        ),
      );
    }

    // Showing Topics for selected Stage
    final stageInfo = stages.firstWhere((s) => s['id'] == selectedStageId);
    final topics = topicsByStage[selectedStageId] ?? [];
    int totalSelected = topics.where((t) => selectedTopics.contains(t['id'])).fold(0, (sum, t) => sum + (t['count'] as int));

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back, color: textColor),
          onPressed: () => setState(() => selectedStageId = null),
        ),
        title: Text('${stageInfo['name']}: ${stageInfo['sub']}', style: TextStyle(color: textColor, fontSize: 16)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.fromLTRB(16, 8, 16, 100),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('SELECT TOPICS', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: subtitleColor, letterSpacing: 1.5)),
            const SizedBox(height: 12),
            Row(
              children: [
                OutlinedButton(
                  onPressed: () => setState(() => selectedTopics = topics.map((e) => e['id'] as String).toList()),
                  style: OutlinedButton.styleFrom(foregroundColor: const Color(0xFF0353A4), side: BorderSide(color: const Color(0xFF0353A4).withOpacity(0.4))),
                  child: const Text('Select All', style: TextStyle(fontSize: 12)),
                ),
                const SizedBox(width: 8),
                OutlinedButton(
                  onPressed: () => setState(() => selectedTopics.clear()),
                  style: OutlinedButton.styleFrom(foregroundColor: Colors.grey, side: const BorderSide(color: Colors.grey)),
                  child: const Text('Clear', style: TextStyle(fontSize: 12)),
                ),
              ],
            ),
            const SizedBox(height: 16),
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                crossAxisSpacing: 8,
                mainAxisSpacing: 8,
                childAspectRatio: 2.5,
              ),
              itemCount: topics.length,
              itemBuilder: (context, index) {
                final t = topics[index];
                final isSelected = selectedTopics.contains(t['id']);
                return GestureDetector(
                  onTap: () => toggleTopic(t['id']),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF0353A4).withOpacity(0.1) : cardColor,
                      border: Border.all(color: isSelected ? const Color(0xFF0353A4) : Colors.grey.withOpacity(0.2)),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            mainAxisAlignment: MainAxisAlignment.center,
                            children: [
                              Text(t['name'], style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold, color: Color(0xFF0353A4)), maxLines: 1, overflow: TextOverflow.ellipsis),
                              Text('${t['count']} words', style: TextStyle(fontSize: 10, color: subtitleColor)),
                            ],
                          ),
                        ),
                        Text(t['emoji'], style: const TextStyle(fontSize: 18)),
                      ],
                    ),
                  ),
                );
              },
            ),
            const SizedBox(height: 12),
            Center(
              child: Text(
                '$totalSelected words from ${selectedTopics.length} topics',
                style: TextStyle(fontSize: 12, color: subtitleColor),
              ),
            ),

            const SizedBox(height: 24),
            Text('WORDS PER SESSION', style: TextStyle(fontSize: 11, fontWeight: FontWeight.bold, color: subtitleColor, letterSpacing: 1.5)),
            const SizedBox(height: 12),
            Wrap(
              spacing: 8,
              runSpacing: 8,
              children: [5, 8, 10, 15, 20, 999].map((n) {
                final isSelected = wordsPerSession == n;
                return GestureDetector(
                  onTap: () => setState(() => wordsPerSession = n),
                  child: Container(
                    width: n == 999 ? 60 : 44,
                    height: 44,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: isSelected ? const Color(0xFF0353A4) : Colors.transparent,
                      border: Border.all(color: isSelected ? const Color(0xFF0353A4) : Colors.grey),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(n == 999 ? 'All' : '$n', style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : subtitleColor)),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 32),
            ElevatedButton(
              onPressed: selectedTopics.isEmpty ? null : () => setState(() => trainerSession = 'stage-intro'),
              style: ElevatedButton.styleFrom(
                backgroundColor: const Color(0xFF0353A4),
                foregroundColor: Colors.white,
                minimumSize: const Size(double.infinity, 56),
                shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
              ),
              child: const Text('Start Training', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
            ),
          ],
        ),
      ),
    );
  }
}
