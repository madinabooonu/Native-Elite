import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/foundation.dart';
import 'dart:io';

class NewsFeed extends StatefulWidget {
  const NewsFeed({super.key});

  @override
  State<NewsFeed> createState() => _NewsFeedState();
}

class _NewsFeedState extends State<NewsFeed> {
  final List<Map<String, dynamic>> posts = [
    {
      'id': 'p1',
      'user': 'Ali Karimov',
      'role': 'Student',
      'avatarColor': Colors.blue,
      'time': '2 hours ago',
      'caption': 'Just finished my IELTS mock test! Feeling confident 💯',
      'image': null,
      'likes': 12,
      'comments': 3,
      'isLiked': false,
    },
    {
      'id': 'p2',
      'user': 'Ms. Osiyo',
      'role': 'Teacher',
      'avatarColor': Colors.purple,
      'time': '5 hours ago',
      'caption': 'Great speaking class today everyone. Practice makes perfect!',
      'image': 'https://images.unsplash.com/photo-1522202176988-66273c2fd55f?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80',
      'likes': 45,
      'comments': 8,
      'isLiked': true,
    }
  ];

  Future<void> _createPost() async {
    final TextEditingController captionController = TextEditingController();
    XFile? selectedImage;

    await showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
      builder: (ctx) {
        return StatefulBuilder(
          builder: (context, setStateModal) {
            return Padding(
              padding: EdgeInsets.fromLTRB(16, 16, 16, MediaQuery.of(context).viewInsets.bottom + 16),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      const Text('Create Post', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                      IconButton(icon: const Icon(Icons.close), onPressed: () => Navigator.pop(context)),
                    ],
                  ),
                  const SizedBox(height: 16),
                  TextField(
                    controller: captionController,
                    maxLines: 4,
                    decoration: InputDecoration(
                      hintText: "What's on your mind?",
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                    ),
                  ),
                  const SizedBox(height: 16),
                  if (selectedImage != null)
                    Stack(
                      children: [
                        ClipRRect(
                          borderRadius: BorderRadius.circular(12),
                          child: kIsWeb 
                              ? Image.network(selectedImage!.path, height: 150, width: double.infinity, fit: BoxFit.cover)
                              : Image.file(File(selectedImage!.path), height: 150, width: double.infinity, fit: BoxFit.cover),
                        ),
                        Positioned(
                          right: 8, top: 8,
                          child: GestureDetector(
                            onTap: () => setStateModal(() => selectedImage = null),
                            child: const CircleAvatar(backgroundColor: Colors.black54, radius: 14, child: Icon(Icons.close, size: 16, color: Colors.white)),
                          ),
                        )
                      ],
                    ),
                  Row(
                    children: [
                      IconButton(
                        icon: const Icon(Icons.image, color: Color(0xFF0353A4)),
                        onPressed: () async {
                          final ImagePicker picker = ImagePicker();
                          final XFile? image = await picker.pickImage(source: ImageSource.gallery);
                          if (image != null) {
                            setStateModal(() => selectedImage = image);
                          }
                        },
                      ),
                      const Text('Add Photo', style: TextStyle(color: Colors.grey)),
                      const Spacer(),
                      ElevatedButton(
                        style: ElevatedButton.styleFrom(
                          backgroundColor: const Color(0xFF0353A4),
                          foregroundColor: Colors.white,
                          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
                        ),
                        onPressed: () {
                          if (captionController.text.isNotEmpty || selectedImage != null) {
                            setState(() {
                              posts.insert(0, {
                                'id': 'p_\${DateTime.now().millisecondsSinceEpoch}',
                                'user': 'Me',
                                'role': 'Student',
                                'avatarColor': Colors.teal,
                                'time': 'Just now',
                                'caption': captionController.text,
                                'image': selectedImage?.path,
                                'likes': 0,
                                'comments': 0,
                                'isLiked': false,
                                'isLocalFile': true,
                              });
                            });
                            Navigator.pop(context);
                          }
                        },
                        child: const Text('Post'),
                      ),
                    ],
                  ),
                ],
              ),
            );
          }
        );
      }
    );
  }

  void _toggleLike(int index) {
    setState(() {
      final isLiked = posts[index]['isLiked'] as bool;
      posts[index]['isLiked'] = !isLiked;
      posts[index]['likes'] += isLiked ? -1 : 1;
    });
  }

  String _getInitials(String name) {
    return name.split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join('').toUpperCase();
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0F172A) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      floatingActionButton: FloatingActionButton(
        onPressed: _createPost,
        backgroundColor: const Color(0xFF0353A4),
        child: const Icon(Icons.add, color: Colors.white),
      ),
      body: ListView.builder(
        padding: const EdgeInsets.only(top: 16, bottom: 80),
        itemCount: posts.length,
        itemBuilder: (context, index) {
          final p = posts[index];
          final hasImage = p['image'] != null;
          final isLocal = p['isLocalFile'] == true;

          return Card(
            margin: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
            color: cardColor,
            elevation: 1,
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // User info header
                  Row(
                    children: [
                      CircleAvatar(
                        backgroundColor: p['avatarColor'],
                        child: Text(_getInitials(p['user']), style: const TextStyle(color: Colors.white, fontSize: 14, fontWeight: FontWeight.bold)),
                      ),
                      const SizedBox(width: 12),
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(p['user'], style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor)),
                            Text('${p['role']} • ${p['time']}', style: const TextStyle(fontSize: 12, color: Colors.grey)),
                          ],
                        ),
                      ),
                      IconButton(icon: const Icon(Icons.more_horiz, color: Colors.grey), onPressed: () {}),
                    ],
                  ),
                  const SizedBox(height: 12),
                  
                  // Caption
                  if (p['caption'].isNotEmpty)
                    Text(p['caption'], style: TextStyle(fontSize: 15, color: textColor, height: 1.4)),
                  if (p['caption'].isNotEmpty && hasImage)
                    const SizedBox(height: 12),
                    
                  // Image
                  if (hasImage)
                    ClipRRect(
                      borderRadius: BorderRadius.circular(12),
                      child: isLocal
                          ? (kIsWeb ? Image.network(p['image'], width: double.infinity, fit: BoxFit.cover)
                                    : Image.file(File(p['image']), width: double.infinity, fit: BoxFit.cover))
                          : Image.network(p['image'], width: double.infinity, fit: BoxFit.cover, errorBuilder: (c,e,s) => Container(height: 150, color: Colors.grey[800], alignment: Alignment.center, child: const Icon(Icons.error))),
                    ),
                  
                  const SizedBox(height: 12),
                  const Divider(color: Colors.grey, height: 1),
                  const SizedBox(height: 8),
                  
                  // Actions
                  Row(
                    children: [
                      GestureDetector(
                        onTap: () => _toggleLike(index),
                        child: Row(
                          children: [
                            Icon(p['isLiked'] ? Icons.favorite : Icons.favorite_border, color: p['isLiked'] ? Colors.pink : Colors.grey, size: 22),
                            const SizedBox(width: 6),
                            Text('${p['likes']}', style: TextStyle(color: p['isLiked'] ? Colors.pink : Colors.grey, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      const SizedBox(width: 24),
                      GestureDetector(
                        onTap: () {},
                        child: Row(
                          children: [
                            const Icon(Icons.chat_bubble_outline, color: Colors.grey, size: 20),
                            const SizedBox(width: 6),
                            Text('${p['comments']}', style: const TextStyle(color: Colors.grey, fontWeight: FontWeight.bold)),
                          ],
                        ),
                      ),
                      const Spacer(),
                      const Icon(Icons.share_outlined, color: Colors.grey, size: 20),
                    ],
                  ),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}
