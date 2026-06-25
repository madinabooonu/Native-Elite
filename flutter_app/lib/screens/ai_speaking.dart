import 'package:flutter/material.dart';
import 'package:url_launcher/url_launcher.dart';
import '../models/constants.dart';

// ─────────────────────────────────────────────────────────
// AI SPEAKING
// ─────────────────────────────────────────────────────────
class AISpeaking extends StatefulWidget {
  const AISpeaking({super.key});

  @override
  State<AISpeaking> createState() => _AISpeakingState();
}

class _AISpeakingState extends State<AISpeaking>
    with SingleTickerProviderStateMixin {
  late TabController _tabController;

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
  }

  @override
  void dispose() {
    _tabController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF060D3A) : const Color(0xFFF0F4FF);
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtitleColor =
        isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600;

    return Scaffold(
      backgroundColor: bgColor,
      body: Column(
        children: [
          // ── Header ──
          Container(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('AI Speaking',
                    style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: textColor)),
                Text('IELTS Speaking practice bilan tayyorlan',
                    style:
                        TextStyle(fontSize: 13, color: subtitleColor)),
                const SizedBox(height: 16),

                // ── Practice with Sesame Button ──
                GestureDetector(
                  onTap: _openSesame,
                  child: Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      gradient: const LinearGradient(
                        colors: [Color(0xFF7B2FBE), Color(0xFFEC4899)],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.circular(18),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF7B2FBE).withValues(alpha: 0.3),
                          blurRadius: 16,
                          offset: const Offset(0, 6),
                        ),
                      ],
                    ),
                    child: Row(
                      children: [
                        Container(
                          width: 50,
                          height: 50,
                          decoration: BoxDecoration(
                            color: Colors.white.withValues(alpha: 0.2),
                            borderRadius: BorderRadius.circular(14),
                          ),
                          child: const Icon(Icons.spatial_audio_rounded,
                              color: Colors.white, size: 28),
                        ),
                        const SizedBox(width: 14),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: const [
                              Text(
                                'AI bilan Amaliyot',
                                style: TextStyle(
                                    color: Colors.white,
                                    fontWeight: FontWeight.w800,
                                    fontSize: 16),
                              ),
                              SizedBox(height: 2),
                              Text(
                                'app.sesame.com – Real AI examiner!',
                                style: TextStyle(
                                    color: Colors.white70, fontSize: 12),
                              ),
                            ],
                          ),
                        ),
                        const Icon(Icons.open_in_new_rounded,
                            color: Colors.white, size: 20),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),

                // Tab Bar
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
                      color: const Color(0xFF4169E1),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    indicatorSize: TabBarIndicatorSize.tab,
                    dividerColor: Colors.transparent,
                    labelColor: Colors.white,
                    unselectedLabelColor: isDark
                        ? const Color(0xFF64748B)
                        : Colors.grey.shade600,
                    labelStyle: const TextStyle(
                        fontWeight: FontWeight.w700, fontSize: 13),
                    tabs: const [
                      Tab(text: 'Part 1'),
                      Tab(text: 'Part 2'),
                      Tab(text: 'Part 3'),
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
                _SpeakingPart(partKey: 'part1'),
                _SpeakingPart(partKey: 'part2'),
                _SpeakingPart(partKey: 'part3'),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Future<void> _openSesame() async {
    final uri = Uri.parse('https://app.sesame.com');
    if (await canLaunchUrl(uri)) {
      await launchUrl(uri, mode: LaunchMode.externalApplication);
    } else {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(
              content: Text('Sesame saytini ochib bo\'lmadi')),
        );
      }
    }
  }
}

class _SpeakingPart extends StatefulWidget {
  final String partKey;
  const _SpeakingPart({required this.partKey});

  @override
  State<_SpeakingPart> createState() => _SpeakingPartState();
}

class _SpeakingPartState extends State<_SpeakingPart> {
  int? _selectedTopicIndex;

  @override
  Widget build(BuildContext context) {
    final topics = kSpeakingQuestions[widget.partKey] ?? [];
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF060D3A) : const Color(0xFFF0F4FF);
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtitleColor =
        isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600;

    if (_selectedTopicIndex != null) {
      final topic = topics[_selectedTopicIndex!];
      final questions = (topic['questions'] as List<dynamic>);
      return _QuestionListView(
        topicName: topic['topic'],
        topicIcon: topic['icon'],
        questions: questions.cast<String>(),
        partKey: widget.partKey,
        onBack: () => setState(() => _selectedTopicIndex = null),
      );
    }

    return Scaffold(
      backgroundColor: bgColor,
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: topics.length,
        itemBuilder: (ctx, i) {
          final topic = topics[i];
          final partColor = _partColor(widget.partKey);
          return GestureDetector(
            onTap: () => setState(() => _selectedTopicIndex = i),
            child: Container(
              margin: const EdgeInsets.only(bottom: 12),
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: cardColor,
                borderRadius: BorderRadius.circular(16),
                border:
                    Border.all(color: partColor.withValues(alpha: 0.2)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 50,
                    height: 50,
                    decoration: BoxDecoration(
                      color: partColor.withValues(alpha: 0.12),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Center(
                      child: Text(topic['icon'],
                          style: const TextStyle(fontSize: 24)),
                    ),
                  ),
                  const SizedBox(width: 14),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(topic['topic'],
                            style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 15,
                                color: textColor)),
                        Text(
                            '${(topic['questions'] as List).length} ta savol',
                            style: TextStyle(
                                fontSize: 12, color: subtitleColor)),
                      ],
                    ),
                  ),
                  Icon(Icons.arrow_forward_ios_rounded,
                      size: 14, color: subtitleColor),
                ],
              ),
            ),
          );
        },
      ),
    );
  }

  Color _partColor(String key) {
    switch (key) {
      case 'part1':
        return const Color(0xFF4169E1);
      case 'part2':
        return const Color(0xFF22C55E);
      default:
        return const Color(0xFFEC4899);
    }
  }
}

class _QuestionListView extends StatelessWidget {
  final String topicName;
  final String topicIcon;
  final List<String> questions;
  final String partKey;
  final VoidCallback onBack;

  const _QuestionListView({
    required this.topicName,
    required this.topicIcon,
    required this.questions,
    required this.partKey,
    required this.onBack,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF060D3A) : const Color(0xFFF0F4FF);
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final partColor = _partColor(partKey);

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: bgColor,
        elevation: 0,
        leading: IconButton(
          icon: Icon(Icons.arrow_back_rounded, color: textColor),
          onPressed: onBack,
        ),
        title: Row(
          children: [
            Text(topicIcon, style: const TextStyle(fontSize: 20)),
            const SizedBox(width: 8),
            Text(topicName,
                style: TextStyle(
                    fontWeight: FontWeight.w700,
                    color: textColor,
                    fontSize: 16)),
          ],
        ),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.all(16),
        itemCount: questions.length,
        itemBuilder: (ctx, i) {
          return Container(
            margin: const EdgeInsets.only(bottom: 12),
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: cardColor,
              borderRadius: BorderRadius.circular(16),
              border:
                  Border.all(color: partColor.withValues(alpha: 0.15)),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Container(
                  width: 28,
                  height: 28,
                  decoration: BoxDecoration(
                    color: partColor.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Center(
                    child: Text(
                      '${i + 1}',
                      style: TextStyle(
                          color: partColor,
                          fontWeight: FontWeight.w700,
                          fontSize: 12),
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Expanded(
                  child: Text(
                    questions[i],
                    style: TextStyle(
                        color: textColor,
                        fontSize: 14,
                        height: 1.5),
                  ),
                ),
                IconButton(
                  icon: Icon(Icons.mic_rounded,
                      color: partColor, size: 22),
                  onPressed: () =>
                      _showPracticeDialog(context, questions[i]),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  void _showPracticeDialog(BuildContext context, String question) {
    showModalBottomSheet(
      context: context,
      backgroundColor: Colors.transparent,
      isScrollControlled: true,
      builder: (_) => _PracticeSheet(question: question),
    );
  }

  Color _partColor(String key) {
    switch (key) {
      case 'part1':
        return const Color(0xFF4169E1);
      case 'part2':
        return const Color(0xFF22C55E);
      default:
        return const Color(0xFFEC4899);
    }
  }
}

class _PracticeSheet extends StatefulWidget {
  final String question;
  const _PracticeSheet({required this.question});

  @override
  State<_PracticeSheet> createState() => _PracticeSheetState();
}

class _PracticeSheetState extends State<_PracticeSheet>
    with SingleTickerProviderStateMixin {
  bool _isRecording = false;
  bool _hasAnswer = false;
  String _feedback = '';
  late AnimationController _pulseController;
  late Animation<double> _pulseAnim;

  @override
  void initState() {
    super.initState();
    _pulseController = AnimationController(
      duration: const Duration(milliseconds: 900),
      vsync: this,
    );
    _pulseAnim = Tween<double>(begin: 1, end: 1.2).animate(
      CurvedAnimation(parent: _pulseController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _pulseController.dispose();
    super.dispose();
  }

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
          20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 32),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            width: 36,
            height: 4,
            decoration: BoxDecoration(
                color: Colors.grey.withValues(alpha: 0.3),
                borderRadius: BorderRadius.circular(2)),
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: const Color(0xFF4169E1).withValues(alpha: 0.1),
              borderRadius: BorderRadius.circular(14),
              border: Border.all(
                  color: const Color(0xFF4169E1).withValues(alpha: 0.2)),
            ),
            child: Row(
              children: [
                const Icon(Icons.format_quote_rounded,
                    color: Color(0xFF4169E1), size: 20),
                const SizedBox(width: 8),
                Expanded(
                  child: Text(
                    widget.question,
                    style: TextStyle(
                        color: textColor,
                        fontSize: 14,
                        height: 1.5),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 28),
          // Record button
          AnimatedBuilder(
            animation: _pulseAnim,
            builder: (ctx, child) => Transform.scale(
              scale: _isRecording ? _pulseAnim.value : 1,
              child: GestureDetector(
                onTap: () {
                  setState(() {
                    _isRecording = !_isRecording;
                    if (_isRecording) {
                      _pulseController.repeat(reverse: true);
                      _hasAnswer = false;
                      _feedback = '';
                    } else {
                      _pulseController.stop();
                      _pulseController.reset();
                      _hasAnswer = true;
                      _feedback =
                          "✅ Yaxshi javob! So'zlaringiz aniq edi. Ko'proq connector words ishlatishga harakat qiling (However, Furthermore, In addition).";
                    }
                  });
                },
                child: Container(
                  width: 80,
                  height: 80,
                  decoration: BoxDecoration(
                    shape: BoxShape.circle,
                    color: _isRecording
                        ? Colors.red
                        : const Color(0xFF4169E1),
                    boxShadow: [
                      BoxShadow(
                        color: (_isRecording ? Colors.red : const Color(0xFF4169E1))
                            .withValues(alpha: 0.4),
                        blurRadius: 20,
                        spreadRadius: 4,
                      ),
                    ],
                  ),
                  child: Icon(
                    _isRecording ? Icons.stop_rounded : Icons.mic_rounded,
                    color: Colors.white,
                    size: 36,
                  ),
                ),
              ),
            ),
          ),
          const SizedBox(height: 12),
          Text(
            _isRecording ? 'To\'xtatish uchun bosing' : 'Boshlash uchun bosing',
            style: TextStyle(
                color: isDark ? Colors.white54 : Colors.grey,
                fontSize: 13),
          ),
          if (_hasAnswer && _feedback.isNotEmpty) ...[
            const SizedBox(height: 20),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                color: const Color(0xFF22C55E).withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(14),
                border: Border.all(
                    color: const Color(0xFF22C55E).withValues(alpha: 0.3)),
              ),
              child: Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const Icon(Icons.auto_awesome_rounded,
                      color: Color(0xFF22C55E), size: 18),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(_feedback,
                        style: TextStyle(
                            color: textColor, fontSize: 13, height: 1.5)),
                  ),
                ],
              ),
            ),
          ],
          const SizedBox(height: 16),
        ],
      ),
    );
  }
}
