import 'package:flutter/material.dart';
import '../models/constants.dart';

// ─────────────────────────────────────────────────────────
// VOCAB TRAINER – 6 Stages
// ─────────────────────────────────────────────────────────
class VocabTrainer extends StatefulWidget {
  const VocabTrainer({super.key});

  @override
  State<VocabTrainer> createState() => _VocabTrainerState();
}

class _VocabTrainerState extends State<VocabTrainer> {
  final List<Map<String, dynamic>> stages = [
    {
      'id': '1', 'name': 'Stage 1', 'sub': 'Basic Vocabulary',
      'icon': Icons.star_border_rounded, 'color': const Color(0xFF4169E1),
      'emoji': '⭐'
    },
    {
      'id': '2', 'name': 'Stage 2', 'sub': 'Daily Life Vocabulary',
      'icon': Icons.wb_sunny_rounded, 'color': const Color(0xFFF59E0B),
      'emoji': '🌤️'
    },
    {
      'id': '3', 'name': 'Stage 3', 'sub': 'Education Vocabulary',
      'icon': Icons.school_rounded, 'color': const Color(0xFF22C55E),
      'emoji': '🎓'
    },
    {
      'id': '4', 'name': 'Stage 4', 'sub': 'Technology Vocabulary',
      'icon': Icons.computer_rounded, 'color': const Color(0xFF8B5CF6),
      'emoji': '💻'
    },
    {
      'id': '5', 'name': 'Stage 5', 'sub': 'IELTS Vocabulary',
      'icon': Icons.language_rounded, 'color': const Color(0xFFEC4899),
      'emoji': '🌍'
    },
    {
      'id': '6', 'name': 'Stage 6', 'sub': 'Advanced Vocabulary',
      'icon': Icons.psychology_rounded, 'color': const Color(0xFFEF4444),
      'emoji': '🧠'
    },
  ];

  String? _selectedStageId;
  String? _selectedTopicId;

  @override
  Widget build(BuildContext context) {
    if (_selectedTopicId != null && _selectedStageId != null) {
      return _VocabWordView(
        stageId: _selectedStageId!,
        topicId: _selectedTopicId!,
        onBack: () => setState(() => _selectedTopicId = null),
      );
    }
    if (_selectedStageId != null) {
      return _TopicListView(
        stageId: _selectedStageId!,
        stages: stages,
        onBack: () => setState(() => _selectedStageId = null),
        onTopicSelected: (topicId) =>
            setState(() => _selectedTopicId = topicId),
      );
    }
    return _StageListView(
      stages: stages,
      onStageSelected: (id) => setState(() => _selectedStageId = id),
    );
  }
}

// ── Stage List ──
class _StageListView extends StatelessWidget {
  final List<Map<String, dynamic>> stages;
  final ValueChanged<String> onStageSelected;
  const _StageListView(
      {required this.stages, required this.onStageSelected});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF060D3A) : const Color(0xFFF0F4FF);
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtitleColor =
        isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600;

    return Scaffold(
      backgroundColor: bgColor,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Vocabulary Stages',
                    style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: textColor)),
                Text('O\'rganmoqchi bo\'lgan bosqichni tanlang',
                    style:
                        TextStyle(fontSize: 13, color: subtitleColor)),
                const SizedBox(height: 16),
              ],
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: stages.length,
              itemBuilder: (ctx, i) {
                final stage = stages[i];
                final color = stage['color'] as Color;
                final topics =
                    kVocabTopics[stage['id']] ?? [];
                final totalWords = topics.fold<int>(
                    0, (sum, t) => sum + (t['count'] as int));

                return GestureDetector(
                  onTap: () => onStageSelected(stage['id']),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 14),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: cardColor,
                      borderRadius: BorderRadius.circular(18),
                      border:
                          Border.all(color: color.withValues(alpha: 0.2)),
                      boxShadow: [
                        BoxShadow(
                          color: color.withValues(alpha: 0.05),
                          blurRadius: 10,
                          offset: const Offset(0, 4),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 56,
                          height: 56,
                          decoration: BoxDecoration(
                            color: color.withValues(alpha: 0.12),
                            borderRadius: BorderRadius.circular(16),
                          ),
                          child: Center(
                            child: Text(stage['emoji'],
                                style: const TextStyle(fontSize: 26)),
                          ),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Text(stage['name'],
                                  style: TextStyle(
                                      fontWeight: FontWeight.w800,
                                      fontSize: 16,
                                      color: textColor)),
                              Text(stage['sub'],
                                  style: TextStyle(
                                      fontSize: 12,
                                      color: subtitleColor)),
                              const SizedBox(height: 8),
                              Row(
                                children: [
                                  Icon(Icons.book_outlined,
                                      size: 12, color: color),
                                  const SizedBox(width: 4),
                                  Text('$totalWords so\'z',
                                      style: TextStyle(
                                          fontSize: 11,
                                          color: color,
                                          fontWeight:
                                              FontWeight.w600)),
                                  const SizedBox(width: 12),
                                  Icon(Icons.topic_outlined,
                                      size: 12, color: subtitleColor),
                                  const SizedBox(width: 4),
                                  Text(
                                      '${topics.length} topic',
                                      style: TextStyle(
                                          fontSize: 11,
                                          color: subtitleColor)),
                                ],
                              ),
                            ],
                          ),
                        ),
                        Icon(Icons.arrow_forward_ios_rounded,
                            size: 16, color: subtitleColor),
                      ],
                    ),
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

// ── Topic List ──
class _TopicListView extends StatelessWidget {
  final String stageId;
  final List<Map<String, dynamic>> stages;
  final VoidCallback onBack;
  final ValueChanged<String> onTopicSelected;
  const _TopicListView(
      {required this.stageId,
      required this.stages,
      required this.onBack,
      required this.onTopicSelected});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF060D3A) : const Color(0xFFF0F4FF);
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtitleColor =
        isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600;
    final stageInfo = stages.firstWhere((s) => s['id'] == stageId);
    final color = stageInfo['color'] as Color;
    final topics = kVocabTopics[stageId] ?? [];

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_rounded, color: textColor),
          onPressed: onBack,
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(stageInfo['name'],
                style: TextStyle(
                    fontWeight: FontWeight.w800,
                    color: textColor,
                    fontSize: 16)),
            Text(stageInfo['sub'],
                style: TextStyle(
                    fontSize: 11, color: subtitleColor)),
          ],
        ),
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          mainAxisSpacing: 12,
          crossAxisSpacing: 12,
          childAspectRatio: 1.2,
        ),
        itemCount: topics.length,
        itemBuilder: (ctx, i) {
          final topic = topics[i];
          return GestureDetector(
            onTap: () => onTopicSelected(topic['id']),
            child: Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(16),
                border: Border.all(color: color.withValues(alpha: 0.2)),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(topic['emoji'],
                      style: const TextStyle(fontSize: 30)),
                  const Spacer(),
                  Text(topic['name'],
                      style: TextStyle(
                          fontWeight: FontWeight.w700,
                          fontSize: 13,
                          color: textColor),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis),
                  const SizedBox(height: 4),
                  Text('${topic['count']} so\'z',
                      style:
                          TextStyle(fontSize: 11, color: color)),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}

// ── Vocab Word Cards ──
class _VocabWordView extends StatefulWidget {
  final String stageId;
  final String topicId;
  final VoidCallback onBack;
  const _VocabWordView(
      {required this.stageId,
      required this.topicId,
      required this.onBack});

  @override
  State<_VocabWordView> createState() => _VocabWordViewState();
}

class _VocabWordViewState extends State<_VocabWordView> {
  int _currentIndex = 0;
  bool _showDefinition = false;

  @override
  Widget build(BuildContext context) {
    final topics = kVocabTopics[widget.stageId] ?? [];
    final topic = topics.firstWhere(
      (t) => t['id'] == widget.topicId,
      orElse: () => topics.isNotEmpty ? topics.first : {},
    );
    final words =
        (topic['words'] as List<Map<String, dynamic>>? ?? []);

    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF060D3A) : const Color(0xFFF0F4FF);
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtitleColor =
        isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600;

    if (words.isEmpty) {
      return Scaffold(
        backgroundColor: bgColor,
        appBar: AppBar(
          backgroundColor: bgColor,
          elevation: 0,
          leading: IconButton(
            icon: Icon(Icons.arrow_back_rounded, color: textColor),
            onPressed: widget.onBack,
          ),
          title: Text(topic['name'] ?? '',
              style: TextStyle(color: textColor)),
        ),
        body: Center(
          child: Text("So'zlar mavjud emas",
              style: TextStyle(color: subtitleColor)),
        ),
      );
    }

    final word = words[_currentIndex];
    final progress = (_currentIndex + 1) / words.length;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_rounded, color: textColor),
          onPressed: widget.onBack,
        ),
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(topic['name'] ?? '',
                style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: textColor,
                    fontSize: 15)),
            Text('${_currentIndex + 1} / ${words.length}',
                style: TextStyle(fontSize: 11, color: subtitleColor)),
          ],
        ),
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            // Progress bar
            ClipRRect(
              borderRadius: BorderRadius.circular(4),
              child: LinearProgressIndicator(
                value: progress,
                backgroundColor: Colors.grey.withValues(alpha: 0.2),
                valueColor: const AlwaysStoppedAnimation<Color>(
                    Color(0xFF4169E1)),
                minHeight: 6,
              ),
            ),
            const SizedBox(height: 24),

            // Word Card
            Expanded(
              child: GestureDetector(
                onTap: () =>
                    setState(() => _showDefinition = !_showDefinition),
                child: AnimatedContainer(
                  duration: const Duration(milliseconds: 300),
                  width: double.infinity,
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xFF0D1B6E), Color(0xFF4169E1)],
                      begin: Alignment.topLeft,
                      end: Alignment.bottomRight,
                    ),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color:
                            const Color(0xFF4169E1).withValues(alpha: 0.3),
                        blurRadius: 20,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Padding(
                    padding: const EdgeInsets.all(28),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        const Icon(Icons.touch_app_rounded,
                            color: Colors.white30, size: 18),
                        const SizedBox(height: 8),
                        const Text('So\'zga bosing',
                            style: TextStyle(
                                color: Colors.white30, fontSize: 11)),
                        const SizedBox(height: 24),
                        Text(
                          word['word'] ?? '',
                          textAlign: TextAlign.center,
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 32,
                            fontWeight: FontWeight.w900,
                          ),
                        ),
                        if (_showDefinition) ...[
                          const SizedBox(height: 20),
                          Container(
                            height: 1,
                            color: Colors.white24,
                          ),
                          const SizedBox(height: 20),
                          Text(
                            word['definition'] ?? '',
                            textAlign: TextAlign.center,
                            style: const TextStyle(
                                color: Colors.white,
                                fontSize: 16,
                                height: 1.5),
                          ),
                          const SizedBox(height: 16),
                          Container(
                            padding: const EdgeInsets.all(12),
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.1),
                              borderRadius:
                                  BorderRadius.circular(12),
                            ),
                            child: Text(
                              '"${word['example'] ?? ''}"',
                              textAlign: TextAlign.center,
                              style: const TextStyle(
                                color: Color(0xFFBAD4F8),
                                fontSize: 14,
                                fontStyle: FontStyle.italic,
                              ),
                            ),
                          ),
                        ],
                      ],
                    ),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 20),

            // Navigation buttons
            Row(
              children: [
                if (_currentIndex > 0)
                  Expanded(
                    child: OutlinedButton.icon(
                      onPressed: () => setState(() {
                        _currentIndex--;
                        _showDefinition = false;
                      }),
                      icon: const Icon(Icons.arrow_back_rounded),
                      label: const Text('Oldingi'),
                      style: OutlinedButton.styleFrom(
                        padding:
                            const EdgeInsets.symmetric(vertical: 14),
                        shape: RoundedRectangleBorder(
                            borderRadius:
                                BorderRadius.circular(12)),
                      ),
                    ),
                  ),
                if (_currentIndex > 0) const SizedBox(width: 12),
                Expanded(
                  flex: 2,
                  child: ElevatedButton.icon(
                    onPressed: _currentIndex < words.length - 1
                        ? () => setState(() {
                              _currentIndex++;
                              _showDefinition = false;
                            })
                        : () => widget.onBack(),
                    icon: Icon(_currentIndex < words.length - 1
                        ? Icons.arrow_forward_rounded
                        : Icons.check_circle_rounded),
                    label: Text(_currentIndex < words.length - 1
                        ? 'Keyingi'
                        : 'Tugatish'),
                    style: ElevatedButton.styleFrom(
                      padding:
                          const EdgeInsets.symmetric(vertical: 14),
                      shape: RoundedRectangleBorder(
                          borderRadius:
                              BorderRadius.circular(12)),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(height: 80),
          ],
        ),
      ),
    );
  }
}
