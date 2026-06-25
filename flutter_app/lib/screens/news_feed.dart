import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_provider.dart';
import '../models/types.dart';

// ─────────────────────────────────────────────────────────
// NEWS FEED – Instagram/Facebook-like
// ─────────────────────────────────────────────────────────
class NewsFeed extends StatefulWidget {
  const NewsFeed({super.key});

  @override
  State<NewsFeed> createState() => _NewsFeedState();
}

class _NewsFeedState extends State<NewsFeed> {
  final List<Map<String, dynamic>> _posts = [
    {
      'id': '1',
      'authorId': 'student_001',
      'authorName': 'Alibek Karimov',
      'authorRole': 'student',
      'caption':
          "Bugun speaking practice qildim! AI bilan gapirish juda qiziq ekan. Part 2 mavzusi: Describe a place you love 🏙️ #IELTS #Speaking",
      'imageUrl': null,
      'emoji': '🎤',
      'time': DateTime.now().subtract(const Duration(hours: 2)),
      'likes': ['student_002', 'teacher_001'],
      'comments': [
        {
          'authorName': 'Miss Osiyo',
          'text': 'Juda yaxshi! Davom eting! 👏',
          'time': '10 min'
        },
      ],
    },
    {
      'id': '2',
      'authorId': 'student_002',
      'authorName': 'Malika Yusupova',
      'authorRole': 'student',
      'caption':
          "Stage 2 Vocabulary tugatdim! 80 ta yangi so'z o'rgandim. Daily Life topics juda foydali ekan 📚 #Vocabulary #Progress",
      'imageUrl': null,
      'emoji': '📚',
      'time': DateTime.now().subtract(const Duration(hours: 5)),
      'likes': ['student_001', 'teacher_001', 'teacher_002'],
      'comments': [
        {
          'authorName': 'Mr Sarvar',
          'text': 'Ajoyib natija! Stage 3 ga qoching! 🚀',
          'time': '1 soat'
        },
      ],
    },
    {
      'id': '3',
      'authorId': 'teacher_001',
      'authorName': 'Miss Osiyo',
      'authorRole': 'teacher',
      'caption':
          "Bugun darsimiz juda samarali o'tdi! Barcha talabalar IELTS Part 1 savollarga javob bera oldi. Rahmat ishtirokchilar! 🌟 #Teaching #IELTS",
      'imageUrl': null,
      'emoji': '👩‍🏫',
      'time': DateTime.now().subtract(const Duration(hours: 8)),
      'likes': ['student_001', 'student_002', 'student_003', 'admin_001'],
      'comments': [
        {
          'authorName': 'Alibek Karimov',
          'text': 'Rahmat, ustoz! Sizning darslaringiz eng yaxshi!',
          'time': '3 soat'
        },
      ],
    },
  ];

  @override
  Widget build(BuildContext context) {
    final currentUser = context.watch<AppProvider>().currentUser;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF060D3A) : const Color(0xFFF0F4FF);
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);

    return Scaffold(
      backgroundColor: bgColor,
      body: Column(
        children: [
          // Header
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text('News Feed',
                    style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: textColor)),
                ElevatedButton.icon(
                  onPressed: () =>
                      _showCreatePostSheet(context, currentUser!),
                  icon: const Icon(Icons.add_rounded, size: 18),
                  label: const Text('Post', style: TextStyle(fontSize: 13)),
                  style: ElevatedButton.styleFrom(
                    padding: const EdgeInsets.symmetric(
                        horizontal: 14, vertical: 8),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20)),
                  ),
                ),
              ],
            ),
          ),

          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: _posts.length,
              itemBuilder: (ctx, i) {
                final post = _posts[i];
                return _PostCard(
                  post: post,
                  currentUserId: currentUser?.uid ?? '',
                  isDark: isDark,
                  onLike: () => _toggleLike(i, currentUser!.uid),
                  onComment: () =>
                      _showCommentSheet(context, i, currentUser!, isDark),
                );
              },
            ),
          ),
        ],
      ),
    );
  }

  void _toggleLike(int index, String userId) {
    setState(() {
      final likes = _posts[index]['likes'] as List<String>;
      if (likes.contains(userId)) {
        likes.remove(userId);
      } else {
        likes.add(userId);
      }
    });
  }

  void _showCreatePostSheet(BuildContext context, UserProfile user) {
    final captionCtrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (_) {
        final isDark = Theme.of(context).brightness == Brightness.dark;
        final bgColor =
            isDark ? const Color(0xFF0D1B6E) : Colors.white;
        final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
        return Container(
          decoration: BoxDecoration(
            color: bgColor,
            borderRadius:
                const BorderRadius.vertical(top: Radius.circular(24)),
          ),
          padding: EdgeInsets.fromLTRB(
              20,
              20,
              20,
              MediaQuery.of(context).viewInsets.bottom + 24),
          child: Column(
            mainAxisSize: MainAxisSize.min,
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Center(
                child: Container(
                  width: 36,
                  height: 4,
                  decoration: BoxDecoration(
                    color: Colors.grey.withValues(alpha: 0.3),
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),
              const SizedBox(height: 16),
              Text('Yangi Post',
                  style: TextStyle(
                      fontSize: 18,
                      fontWeight: FontWeight.w800,
                      color: textColor)),
              const SizedBox(height: 16),
              TextField(
                controller: captionCtrl,
                maxLines: 4,
                style: TextStyle(color: textColor),
                decoration: InputDecoration(
                  hintText: 'Dars jarayoni haqida yozing...',
                  hintStyle: TextStyle(
                      color:
                          isDark ? const Color(0xFF64748B) : Colors.grey),
                  border: OutlineInputBorder(
                      borderRadius: BorderRadius.circular(12)),
                  contentPadding: const EdgeInsets.all(14),
                ),
              ),
              const SizedBox(height: 12),
              Row(
                children: [
                  OutlinedButton.icon(
                    onPressed: () {},
                    icon: const Icon(Icons.image_rounded, size: 18),
                    label: const Text('Rasm', style: TextStyle(fontSize: 13)),
                    style: OutlinedButton.styleFrom(
                        shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(10))),
                  ),
                ],
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: () {
                    if (captionCtrl.text.trim().isNotEmpty) {
                      setState(() {
                        _posts.insert(0, {
                          'id': DateTime.now()
                              .millisecondsSinceEpoch
                              .toString(),
                          'authorId': user.uid,
                          'authorName': user.displayName,
                          'authorRole': user.role.name,
                          'caption': captionCtrl.text.trim(),
                          'imageUrl': null,
                          'emoji': '📝',
                          'time': DateTime.now(),
                          'likes': <String>[],
                          'comments': <Map<String, dynamic>>[],
                        });
                      });
                      Navigator.pop(context);
                    }
                  },
                  style: ElevatedButton.styleFrom(
                    padding:
                        const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(12)),
                  ),
                  child: const Text('Ulashish',
                      style: TextStyle(
                          fontSize: 16, fontWeight: FontWeight.w700)),
                ),
              ),
            ],
          ),
        );
      },
    );
  }

  void _showCommentSheet(
      BuildContext context, int postIndex, UserProfile user, bool isDark) {
    final commentCtrl = TextEditingController();
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (bCtx) {
        return StatefulBuilder(builder: (bCtx, setLocal) {
          final bgColor =
              isDark ? const Color(0xFF0D1B6E) : Colors.white;
          final textColor =
              isDark ? Colors.white : const Color(0xFF0F172A);
          final subtitleColor = isDark
              ? const Color(0xFF94A3B8)
              : Colors.grey.shade600;
          final comments = _posts[postIndex]['comments']
              as List<Map<String, dynamic>>;
          return Container(
            decoration: BoxDecoration(
              color: bgColor,
              borderRadius:
                  const BorderRadius.vertical(top: Radius.circular(24)),
            ),
            padding: EdgeInsets.fromLTRB(
                20,
                20,
                20,
                MediaQuery.of(bCtx).viewInsets.bottom + 20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Center(
                  child: Container(
                    width: 36,
                    height: 4,
                    decoration: BoxDecoration(
                      color: Colors.grey.withValues(alpha: 0.3),
                      borderRadius: BorderRadius.circular(2),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Text('Izohlar (${comments.length})',
                    style: TextStyle(
                        fontSize: 16,
                        fontWeight: FontWeight.w700,
                        color: textColor)),
                const SizedBox(height: 12),
                ...comments.map((c) => Padding(
                      padding: const EdgeInsets.only(bottom: 10),
                      child: Row(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          CircleAvatar(
                            radius: 14,
                            backgroundColor: const Color(0xFF4169E1)
                                .withValues(alpha: 0.15),
                            child: Text(
                              c['authorName'][0].toUpperCase(),
                              style: const TextStyle(
                                  color: Color(0xFF4169E1),
                                  fontWeight: FontWeight.w700,
                                  fontSize: 12),
                            ),
                          ),
                          const SizedBox(width: 10),
                          Expanded(
                            child: Column(
                              crossAxisAlignment:
                                  CrossAxisAlignment.start,
                              children: [
                                Text(c['authorName'],
                                    style: TextStyle(
                                        fontWeight: FontWeight.w600,
                                        fontSize: 13,
                                        color: textColor)),
                                Text(c['text'],
                                    style: TextStyle(
                                        fontSize: 13,
                                        color: subtitleColor)),
                              ],
                            ),
                          ),
                        ],
                      ),
                    )),
                const SizedBox(height: 12),
                Row(
                  children: [
                    Expanded(
                      child: TextField(
                        controller: commentCtrl,
                        style: TextStyle(color: textColor),
                        decoration: InputDecoration(
                          hintText: 'Izoh yozing...',
                          hintStyle: TextStyle(color: subtitleColor),
                          border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(20)),
                          contentPadding:
                              const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 10),
                        ),
                      ),
                    ),
                    const SizedBox(width: 8),
                    GestureDetector(
                      onTap: () {
                        if (commentCtrl.text.trim().isNotEmpty) {
                          setState(() {
                            (_posts[postIndex]['comments']
                                    as List<Map<String, dynamic>>)
                                .add({
                              'authorName': user.displayName,
                              'text': commentCtrl.text.trim(),
                              'time': 'Hozir',
                            });
                          });
                          setLocal(() {});
                          commentCtrl.clear();
                        }
                      },
                      child: Container(
                        width: 44,
                        height: 44,
                        decoration: const BoxDecoration(
                          color: Color(0xFF4169E1),
                          shape: BoxShape.circle,
                        ),
                        child: const Icon(Icons.send_rounded,
                            color: Colors.white, size: 20),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          );
        });
      },
    );
  }
}

class _PostCard extends StatelessWidget {
  final Map<String, dynamic> post;
  final String currentUserId;
  final bool isDark;
  final VoidCallback onLike;
  final VoidCallback onComment;

  const _PostCard({
    required this.post,
    required this.currentUserId,
    required this.isDark,
    required this.onLike,
    required this.onComment,
  });

  @override
  Widget build(BuildContext context) {
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtitleColor =
        isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600;
    final likes = post['likes'] as List<String>;
    final comments = post['comments'] as List<Map<String, dynamic>>;
    final isLiked = likes.contains(currentUserId);
    final time = post['time'] as DateTime;
    final timeAgo = _timeAgo(time);
    final roleColor = _roleColor(post['authorRole']);

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      decoration: BoxDecoration(
        color: cardColor,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: Colors.black.withValues(alpha: isDark ? 0.2 : 0.04),
            blurRadius: 12,
            offset: const Offset(0, 4),
          ),
        ],
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // ── Author header ──
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                CircleAvatar(
                  radius: 20,
                  backgroundColor: roleColor.withValues(alpha: 0.15),
                  child: Text(
                    post['authorName'][0].toUpperCase(),
                    style: TextStyle(
                        color: roleColor,
                        fontWeight: FontWeight.w800,
                        fontSize: 16),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        children: [
                          Text(post['authorName'],
                              style: TextStyle(
                                  fontWeight: FontWeight.w700,
                                  fontSize: 14,
                                  color: textColor)),
                          const SizedBox(width: 6),
                          Container(
                            padding: const EdgeInsets.symmetric(
                                horizontal: 6, vertical: 1),
                            decoration: BoxDecoration(
                              color: roleColor.withValues(alpha: 0.1),
                              borderRadius: BorderRadius.circular(6),
                            ),
                            child: Text(
                              _roleLabel(post['authorRole']),
                              style: TextStyle(
                                  fontSize: 10,
                                  color: roleColor,
                                  fontWeight: FontWeight.w600),
                            ),
                          ),
                        ],
                      ),
                      Text(timeAgo,
                          style: TextStyle(
                              fontSize: 11, color: subtitleColor)),
                    ],
                  ),
                ),
                Icon(Icons.more_horiz_rounded,
                    color: subtitleColor, size: 20),
              ],
            ),
          ),

          // ── Emoji Banner or Image ──
          if (post['imageUrl'] == null)
            Container(
              height: 160,
              margin:
                  const EdgeInsets.symmetric(horizontal: 14),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [
                    const Color(0xFF0D1B6E),
                    roleColor.withValues(alpha: 0.8),
                  ],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(14),
              ),
              child: Center(
                child: Text(post['emoji'],
                    style: const TextStyle(fontSize: 64)),
              ),
            ),

          // ── Caption ──
          Padding(
            padding: const EdgeInsets.fromLTRB(14, 12, 14, 0),
            child: Text(post['caption'],
                style: TextStyle(
                    color: textColor, fontSize: 14, height: 1.5)),
          ),

          // ── Like & Comment ──
          Padding(
            padding: const EdgeInsets.all(14),
            child: Row(
              children: [
                GestureDetector(
                  onTap: onLike,
                  child: Row(
                    children: [
                      Icon(
                        isLiked
                            ? Icons.favorite_rounded
                            : Icons.favorite_border_rounded,
                        color: isLiked ? Colors.red : subtitleColor,
                        size: 22,
                      ),
                      const SizedBox(width: 5),
                      Text('${likes.length}',
                          style: TextStyle(
                              color: isLiked ? Colors.red : subtitleColor,
                              fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                const SizedBox(width: 20),
                GestureDetector(
                  onTap: onComment,
                  child: Row(
                    children: [
                      Icon(Icons.chat_bubble_outline_rounded,
                          color: subtitleColor, size: 20),
                      const SizedBox(width: 5),
                      Text('${comments.length}',
                          style: TextStyle(
                              color: subtitleColor,
                              fontWeight: FontWeight.w600)),
                    ],
                  ),
                ),
                const Spacer(),
                Icon(Icons.share_outlined,
                    color: subtitleColor, size: 20),
              ],
            ),
          ),

          // ── Last comment ──
          if (comments.isNotEmpty)
            Padding(
              padding: const EdgeInsets.fromLTRB(14, 0, 14, 14),
              child: Row(
                children: [
                  CircleAvatar(
                    radius: 10,
                    backgroundColor:
                        const Color(0xFF4169E1).withValues(alpha: 0.15),
                    child: Text(
                      comments.last['authorName'][0].toUpperCase(),
                      style: const TextStyle(
                          fontSize: 9,
                          color: Color(0xFF4169E1),
                          fontWeight: FontWeight.w700),
                    ),
                  ),
                  const SizedBox(width: 6),
                  Expanded(
                    child: RichText(
                      text: TextSpan(
                        children: [
                          TextSpan(
                            text: '${comments.last['authorName']} ',
                            style: TextStyle(
                                fontWeight: FontWeight.w700,
                                fontSize: 12,
                                color: textColor),
                          ),
                          TextSpan(
                            text: comments.last['text'],
                            style: TextStyle(
                                fontSize: 12, color: subtitleColor),
                          ),
                        ],
                      ),
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                ],
              ),
            ),
        ],
      ),
    );
  }

  String _timeAgo(DateTime time) {
    final diff = DateTime.now().difference(time);
    if (diff.inMinutes < 60) return '${diff.inMinutes} daqiqa oldin';
    if (diff.inHours < 24) return '${diff.inHours} soat oldin';
    return '${diff.inDays} kun oldin';
  }

  Color _roleColor(String? role) {
    switch (role) {
      case 'superAdmin':
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
      case 'superAdmin':
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
