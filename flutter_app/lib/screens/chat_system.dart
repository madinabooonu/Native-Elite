import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_provider.dart';
import '../models/types.dart';
import '../services/firestore_service.dart';

// ─────────────────────────────────────────────────────────
// CHAT SYSTEM – Telegram-like
// ─────────────────────────────────────────────────────────
class ChatSystem extends StatefulWidget {
  const ChatSystem({super.key});

  @override
  State<ChatSystem> createState() => _ChatSystemState();
}

class _ChatSystemState extends State<ChatSystem> {
  final _searchCtrl = TextEditingController();
  String _query = '';

  @override
  Widget build(BuildContext context) {
    final appProvider = context.watch<AppProvider>();
    final currentUser = appProvider.currentUser;
    final allUsers = appProvider.allUsers;
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF060D3A) : const Color(0xFFF0F4FF);
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final subtitleColor =
        isDark ? const Color(0xFF94A3B8) : Colors.grey.shade600;

    // Filter users (exclude current user)
    final otherUsers = allUsers.where((u) {
      if (u['uid'] == currentUser?.uid) return false;
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
          // Header
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Xabarlar',
                    style: TextStyle(
                        fontSize: 22,
                        fontWeight: FontWeight.w800,
                        color: textColor)),
                const SizedBox(height: 12),
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
              ],
            ),
          ),

          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: otherUsers.length,
              itemBuilder: (ctx, i) {
                final u = otherUsers[i];
                return _ChatListTile(
                  user: u,
                  cardColor: cardColor,
                  textColor: textColor,
                  subtitleColor: subtitleColor,
                  onTap: () => Navigator.push(
                    context,
                    MaterialPageRoute(
                      builder: (_) => ChatConversation(
                        currentUser: currentUser!,
                        otherUser: u,
                      ),
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

class _ChatListTile extends StatelessWidget {
  final Map<String, dynamic> user;
  final Color cardColor, textColor, subtitleColor;
  final VoidCallback onTap;

  const _ChatListTile({
    required this.user,
    required this.cardColor,
    required this.textColor,
    required this.subtitleColor,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final roleColor = _roleColor(user['role']);
    final isOnline = _isOnlineByRole(user['role']);

    return GestureDetector(
      onTap: onTap,
      child: Container(
        margin: const EdgeInsets.only(bottom: 10),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: cardColor,
          borderRadius: BorderRadius.circular(16),
        ),
        child: Row(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 24,
                  backgroundColor: roleColor.withValues(alpha: 0.15),
                  child: Text(
                    user['displayName'][0].toUpperCase(),
                    style: TextStyle(
                        color: roleColor,
                        fontWeight: FontWeight.w800,
                        fontSize: 18),
                  ),
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width: 12,
                    height: 12,
                    decoration: BoxDecoration(
                      color: isOnline ? const Color(0xFF22C55E) : Colors.grey,
                      shape: BoxShape.circle,
                      border: Border.all(color: cardColor, width: 2),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(user['displayName'] ?? '',
                          style: TextStyle(
                              fontWeight: FontWeight.w700,
                              fontSize: 15,
                              color: textColor)),
                      Text(
                        isOnline ? 'Online' : 'Offline',
                        style: TextStyle(
                            fontSize: 10,
                            color: isOnline
                                ? const Color(0xFF22C55E)
                                : Colors.grey),
                      ),
                    ],
                  ),
                  Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.symmetric(
                            horizontal: 6, vertical: 1),
                        decoration: BoxDecoration(
                          color: roleColor.withValues(alpha: 0.1),
                          borderRadius: BorderRadius.circular(6),
                        ),
                        child: Text(
                          _roleLabel(user['role']),
                          style: TextStyle(
                              fontSize: 10,
                              color: roleColor,
                              fontWeight: FontWeight.w600),
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text('@${user['username']}',
                          style:
                              TextStyle(fontSize: 11, color: subtitleColor)),
                    ],
                  ),
                ],
              ),
            ),
            Icon(Icons.chevron_right_rounded, color: subtitleColor, size: 20),
          ],
        ),
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

  bool _isOnlineByRole(String? role) {
    return role == 'teacher' || role == 'admin' || role == 'super-admin';
  }
}

// ─────────────────────────────────────────────────────────
// CHAT CONVERSATION SCREEN
// ─────────────────────────────────────────────────────────
class ChatConversation extends StatefulWidget {
  final UserProfile currentUser;
  final Map<String, dynamic> otherUser;

  const ChatConversation({
    super.key,
    required this.currentUser,
    required this.otherUser,
  });

  @override
  State<ChatConversation> createState() => _ChatConversationState();
}

class _ChatConversationState extends State<ChatConversation> {
  final _msgCtrl = TextEditingController();
  final _scrollCtrl = ScrollController();
  late Stream<List<ChatMessage>> _chatStream;

  @override
  void initState() {
    super.initState();
    _chatStream = context.read<AppProvider>().streamChatMessages(
      widget.currentUser.uid,
      widget.otherUser['uid'] ?? '',
    );
  }

  @override
  void dispose() {
    _msgCtrl.dispose();
    _scrollCtrl.dispose();
    super.dispose();
  }

  void _sendMessage() async {
    final text = _msgCtrl.text.trim();
    if (text.isEmpty) return;

    final newMessage = ChatMessage(
      id: 'msg_${DateTime.now().millisecondsSinceEpoch}',
      senderId: widget.currentUser.uid,
      senderName: widget.currentUser.displayName,
      receiverId: widget.otherUser['uid'] ?? '',
      content: text,
      timestamp: DateTime.now(),
      isRead: false,
    );

    _msgCtrl.clear();
    await context.read<AppProvider>().sendChatMessage(newMessage);

    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollCtrl.hasClients) {
        _scrollCtrl.animateTo(
          _scrollCtrl.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = isDark ? const Color(0xFF060D3A) : const Color(0xFFF0F4FF);
    final textColor = isDark ? Colors.white : const Color(0xFF0F172A);
    final otherName = widget.otherUser['displayName'] ?? '';
    final isOnline = widget.otherUser['role'] == 'teacher' ||
        widget.otherUser['role'] == 'admin' ||
        widget.otherUser['role'] == 'super-admin';

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: isDark ? const Color(0xFF0D1B6E) : const Color(0xFF0D1B6E),
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_rounded, color: Colors.white),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: Colors.white.withValues(alpha: 0.2),
                  child: Text(
                    otherName[0].toUpperCase(),
                    style: const TextStyle(
                        color: Colors.white, fontWeight: FontWeight.w700),
                  ),
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: isOnline
                          ? const Color(0xFF22C55E)
                          : Colors.grey,
                      shape: BoxShape.circle,
                      border: Border.all(
                          color: const Color(0xFF0D1B6E), width: 2),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(otherName,
                    style: const TextStyle(
                        color: Colors.white,
                        fontSize: 15,
                        fontWeight: FontWeight.w700)),
                Text(
                  isOnline ? '🟢 Online' : '⚫ Offline',
                  style: const TextStyle(
                      color: Colors.white70, fontSize: 11),
                ),
              ],
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          // Messages
          Expanded(
            child: StreamBuilder<List<ChatMessage>>(
              stream: _chatStream,
              builder: (context, snapshot) {
                if (snapshot.connectionState == ConnectionState.waiting) {
                  return const Center(child: CircularProgressIndicator());
                }
                final msgs = snapshot.data ?? [];
                
                // Auto scroll to bottom
                WidgetsBinding.instance.addPostFrameCallback((_) {
                  if (_scrollCtrl.hasClients) {
                    _scrollCtrl.jumpTo(_scrollCtrl.position.maxScrollExtent);
                  }
                });

                return ListView.builder(
                  controller: _scrollCtrl,
                  padding: const EdgeInsets.symmetric(
                      horizontal: 16, vertical: 12),
                  itemCount: msgs.length,
                  itemBuilder: (ctx, i) {
                    final msg = msgs[i];
                    final isMe = msg.senderId == widget.currentUser.uid;
                    final time = msg.timestamp;
                    return _MessageBubble(
                      text: msg.content,
                      isMe: isMe,
                      time: '${time.hour.toString().padLeft(2, '0')}:${time.minute.toString().padLeft(2, '0')}',
                      isDark: isDark,
                    );
                  },
                );
              },
            ),
          ),

          // Input
          Container(
            padding: const EdgeInsets.symmetric(
                horizontal: 12, vertical: 10),
            color: isDark ? const Color(0xFF0D1B6E) : Colors.white,
            child: SafeArea(
              child: Row(
                children: [
                  IconButton(
                    icon: Icon(Icons.image_rounded,
                        color: isDark
                            ? const Color(0xFF94A3B8)
                            : Colors.grey,
                        size: 24),
                    onPressed: () {},
                  ),
                  Expanded(
                    child: TextField(
                      controller: _msgCtrl,
                      style: TextStyle(color: textColor),
                      decoration: InputDecoration(
                        hintText: 'Xabar yozing...',
                        hintStyle: TextStyle(
                            color: isDark
                                ? const Color(0xFF64748B)
                                : Colors.grey),
                        border: OutlineInputBorder(
                          borderRadius: BorderRadius.circular(24),
                          borderSide: BorderSide.none,
                        ),
                        filled: true,
                        fillColor: isDark
                            ? const Color(0xFF0E173C)
                            : Colors.grey.shade100,
                        contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16, vertical: 10),
                      ),
                      onSubmitted: (_) => _sendMessage(),
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: _sendMessage,
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
            ),
          ),
        ],
      ),
    );
  }
}

class _MessageBubble extends StatelessWidget {
  final String text;
  final String time;
  final bool isMe;
  final bool isDark;

  const _MessageBubble({
    required this.text,
    required this.time,
    required this.isMe,
    required this.isDark,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment:
            isMe ? MainAxisAlignment.end : MainAxisAlignment.start,
        crossAxisAlignment: CrossAxisAlignment.end,
        children: [
          if (!isMe)
            CircleAvatar(
              radius: 14,
              backgroundColor:
                  const Color(0xFF4169E1).withValues(alpha: 0.2),
              child: const Icon(Icons.person_rounded,
                  size: 14, color: Color(0xFF4169E1)),
            ),
          if (!isMe) const SizedBox(width: 6),
          Flexible(
            child: Container(
              padding: const EdgeInsets.symmetric(
                  horizontal: 14, vertical: 10),
              decoration: BoxDecoration(
                color: isMe
                    ? const Color(0xFF4169E1)
                    : (isDark
                        ? const Color(0xFF0E173C)
                        : Colors.white),
                borderRadius: BorderRadius.only(
                  topLeft: const Radius.circular(18),
                  topRight: const Radius.circular(18),
                  bottomLeft: isMe
                      ? const Radius.circular(18)
                      : const Radius.circular(4),
                  bottomRight: isMe
                      ? const Radius.circular(4)
                      : const Radius.circular(18),
                ),
                boxShadow: [
                  BoxShadow(
                    color: Colors.black.withValues(alpha: 0.05),
                    blurRadius: 4,
                    offset: const Offset(0, 2),
                  ),
                ],
              ),
              child: Column(
                crossAxisAlignment: isMe
                    ? CrossAxisAlignment.end
                    : CrossAxisAlignment.start,
                children: [
                  Text(
                    text,
                    style: TextStyle(
                      color: isMe
                          ? Colors.white
                          : (isDark ? Colors.white : const Color(0xFF0F172A)),
                      fontSize: 14,
                      height: 1.4,
                    ),
                  ),
                  const SizedBox(height: 4),
                  Text(
                    time,
                    style: TextStyle(
                      fontSize: 10,
                      color: isMe
                          ? Colors.white60
                          : (isDark
                              ? const Color(0xFF64748B)
                              : Colors.grey),
                    ),
                  ),
                ],
              ),
            ),
          ),
          if (isMe) const SizedBox(width: 6),
          if (isMe)
            CircleAvatar(
              radius: 14,
              backgroundColor:
                  const Color(0xFF4169E1).withValues(alpha: 0.2),
              child: const Icon(Icons.person_rounded,
                  size: 14, color: Color(0xFF4169E1)),
            ),
        ],
      ),
    );
  }
}
