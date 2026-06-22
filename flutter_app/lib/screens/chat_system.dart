import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:flutter/foundation.dart';
import 'dart:io';

class ChatSystem extends StatefulWidget {
  const ChatSystem({super.key});

  @override
  State<ChatSystem> createState() => _ChatSystemState();
}

class _ChatSystemState extends State<ChatSystem> {
  String? activeChat;
  String inputText = '';
  String searchQuery = '';
  final TextEditingController _textController = TextEditingController();

  final List<Map<String, dynamic>> contacts = [
    {'id': 'c1', 'name': 'Ms. Osiyo', 'role': 'teacher', 'color': const Color(0xFF8B5CF6), 'lastMsg': 'Great job on your essay! 👏', 'time': '2 min', 'unread': 2, 'online': true},
    {'id': 'c2', 'name': 'Mr. Sarvar', 'role': 'teacher', 'color': const Color(0xFFF97316), 'lastMsg': "Don't forget tomorrow's class", 'time': '15 min', 'unread': 0, 'online': true},
    {'id': 'c3', 'name': 'Admin Support', 'role': 'admin', 'color': const Color(0xFF0353A4), 'lastMsg': 'Your payment has been confirmed', 'time': '1h', 'unread': 1, 'online': false},
    {'id': 'c4', 'name': 'Ali Karimov', 'role': 'student', 'color': const Color(0xFF0353A4), 'lastMsg': 'Can you share your notes?', 'time': '3h', 'unread': 0, 'online': false},
  ];

  final Map<String, List<Map<String, dynamic>>> messages = {
    'c1': [
      {'sender': 'other', 'name': 'Ms. Osiyo', 'text': 'Hello! How was your speaking practice today?', 'time': '10:30'},
      {'sender': 'me', 'name': 'Me', 'text': 'It was great! I practiced Part 2 about describing a person.', 'time': '10:32'},
      {'sender': 'other', 'name': 'Ms. Osiyo', 'text': 'Excellent! Remember to use varied vocabulary.', 'time': '10:33'},
      {'sender': 'me', 'name': 'Me', 'text': "Thank you! I'll complete it by Friday.", 'time': '10:35'},
      {'sender': 'other', 'name': 'Ms. Osiyo', 'text': 'Great job on your essay! 👏', 'time': '10:40'},
    ],
    'c2': [
      {'sender': 'other', 'name': 'Mr. Sarvar', 'text': 'Hi! Class starts at 16:00 tomorrow.', 'time': '14:00'},
      {'sender': 'me', 'name': 'Me', 'text': 'Got it! Should I prepare anything?', 'time': '14:05'},
    ],
    'c3': [
      {'sender': 'other', 'name': 'Admin', 'text': 'Your account has been activated.', 'time': '09:00'},
    ],
    'c4': [
      {'sender': 'other', 'name': 'Ali', 'text': 'Hey! Can you share your notes?', 'time': '16:00'},
    ],
  };

  String _getInitials(String name) {
    return name.split(' ').map((w) => w.isNotEmpty ? w[0] : '').take(2).join('').toUpperCase();
  }

  void _sendMessage() {
    if (inputText.trim().isEmpty || activeChat == null) return;
    setState(() {
      messages[activeChat!] ??= [];
      messages[activeChat!]!.add({
        'sender': 'me',
        'name': 'Me',
        'text': inputText.trim(),
        'time': TimeOfDay.now().format(context),
      });
      inputText = '';
      _textController.clear();
    });
  }

  Future<void> _pickImage() async {
    if (activeChat == null) return;
    final ImagePicker picker = ImagePicker();
    final XFile? image = await picker.pickImage(source: ImageSource.gallery);
    if (image != null) {
      setState(() {
        messages[activeChat!] ??= [];
        messages[activeChat!]!.add({
          'sender': 'me',
          'name': 'Me',
          'image': image.path,
          'time': TimeOfDay.now().format(context),
        });
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (activeChat != null) return _buildChatView();
    return _buildContactList();
  }

  Widget _buildContactList() {
    final filtered = contacts.where((c) => c['name'].toString().toLowerCase().contains(searchQuery.toLowerCase())).toList();
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = Theme.of(context).scaffoldBackgroundColor;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;

    return Scaffold(
      backgroundColor: bgColor,
      body: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 16, 16, 4),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text('Messages', style: TextStyle(fontSize: 20, fontWeight: FontWeight.w900, color: textColor)),
                const SizedBox(height: 2),
                Text('Chat with teachers and students', style: TextStyle(fontSize: 12, color: Colors.grey)),
              ],
            ),
          ),
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 12),
              decoration: BoxDecoration(
                color: cardColor,
                border: Border.all(color: const Color(0xFF0353A4).withOpacity(0.3)),
                borderRadius: BorderRadius.circular(12),
              ),
              child: TextField(
                style: TextStyle(color: textColor, fontSize: 14),
                decoration: const InputDecoration(
                  hintText: 'Search all users...',
                  hintStyle: TextStyle(color: Colors.grey, fontSize: 13),
                  border: InputBorder.none,
                  icon: Icon(Icons.search, color: Colors.grey, size: 18),
                ),
                onChanged: (v) => setState(() => searchQuery = v),
              ),
            ),
          ),
          Expanded(
            child: ListView.builder(
              padding: const EdgeInsets.symmetric(horizontal: 16),
              itemCount: filtered.length,
              itemBuilder: (context, i) {
                final c = filtered[i];
                return GestureDetector(
                  onTap: () => setState(() => activeChat = c['id']),
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: cardColor,
                      border: Border.all(color: Colors.grey.withOpacity(0.2)),
                      borderRadius: BorderRadius.circular(14),
                    ),
                    child: Row(
                      children: [
                        Stack(
                          children: [
                            CircleAvatar(radius: 24, backgroundColor: c['color'], child: Text(_getInitials(c['name']), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13))),
                            if (c['online'] == true)
                              Positioned(bottom: 0, right: 0, child: Container(width: 14, height: 14, decoration: BoxDecoration(color: const Color(0xFF0353A4), shape: BoxShape.circle, border: Border.all(color: cardColor, width: 2)))),
                          ],
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              Row(
                                children: [
                                  Expanded(child: Text(c['name'], style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: textColor), overflow: TextOverflow.ellipsis)),
                                  Text(c['time'], style: const TextStyle(fontSize: 10, color: Colors.grey)),
                                ],
                              ),
                              const SizedBox(height: 3),
                              Row(
                                children: [
                                  Expanded(child: Text(c['lastMsg'], style: const TextStyle(fontSize: 12, color: Colors.grey), maxLines: 1, overflow: TextOverflow.ellipsis)),
                                  if ((c['unread'] as int) > 0)
                                    Container(
                                      margin: const EdgeInsets.only(left: 8),
                                      width: 20, height: 20,
                                      decoration: const BoxDecoration(color: Color(0xFF0353A4), shape: BoxShape.circle),
                                      alignment: Alignment.center,
                                      child: Text('${c['unread']}', style: const TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.white)),
                                    ),
                                ],
                              ),
                              const SizedBox(height: 4),
                              Container(
                                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                                decoration: BoxDecoration(
                                  color: c['role'] == 'teacher' ? const Color(0xFFA855F7).withOpacity(0.2) : c['role'] == 'admin' ? const Color(0xFF0353A4).withOpacity(0.2) : const Color(0xFF0353A4).withOpacity(0.2),
                                  borderRadius: BorderRadius.circular(4),
                                ),
                                child: Text(c['role'].toString().toUpperCase(), style: TextStyle(fontSize: 9, fontWeight: FontWeight.bold, letterSpacing: 0.8, color: c['role'] == 'teacher' ? const Color(0xFFA855F7) : (c['role'] == 'admin' ? const Color(0xFF0353A4) : const Color(0xFF0353A4)))),
                              ),
                            ],
                          ),
                        ),
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

  Widget _buildChatView() {
    final contact = contacts.firstWhere((c) => c['id'] == activeChat);
    final chatMsgs = messages[activeChat] ?? [];
    
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final bgColor = Theme.of(context).scaffoldBackgroundColor;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;

    return Scaffold(
      backgroundColor: bgColor,
      appBar: AppBar(
        backgroundColor: cardColor,
        elevation: 1,
        leading: IconButton(icon: Icon(Icons.arrow_back_ios, color: textColor, size: 20), onPressed: () => setState(() => activeChat = null)),
        title: Row(
          children: [
            CircleAvatar(radius: 18, backgroundColor: contact['color'], child: Text(_getInitials(contact['name']), style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 11))),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(contact['name'], style: TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: textColor)),
                Text(contact['online'] == true ? '● Online' : '○ Offline', style: TextStyle(fontSize: 10, color: contact['online'] == true ? const Color(0xFF0353A4) : Colors.grey)),
              ],
            ),
          ],
        ),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView.builder(
              reverse: false,
              padding: const EdgeInsets.all(16),
              itemCount: chatMsgs.length,
              itemBuilder: (context, i) {
                final m = chatMsgs[i];
                final isMe = m['sender'] == 'me';
                final hasImage = m.containsKey('image');
                
                return Align(
                  alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
                  child: Container(
                    margin: const EdgeInsets.only(bottom: 8),
                    padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    constraints: BoxConstraints(maxWidth: MediaQuery.of(context).size.width * 0.75),
                    decoration: BoxDecoration(
                      color: isMe ? const Color(0xFF0353A4) : cardColor,
                      border: isMe ? null : Border.all(color: Colors.grey.withOpacity(0.2)),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        if (hasImage) 
                          Padding(
                            padding: const EdgeInsets.only(bottom: 8.0),
                            child: kIsWeb ? Image.network(m['image']) : Image.file(File(m['image']), height: 150, fit: BoxFit.cover),
                          )
                        else
                          Text(m['text'], style: TextStyle(fontSize: 14, color: isMe ? Colors.white : textColor, height: 1.4)),
                        const SizedBox(height: 4),
                        Text(m['time'], style: TextStyle(fontSize: 10, color: isMe ? Colors.white70 : Colors.grey)),
                      ],
                    ),
                  ),
                );
              },
            ),
          ),
          Container(
            padding: const EdgeInsets.fromLTRB(12, 8, 12, 16),
            decoration: BoxDecoration(color: cardColor, border: Border(top: BorderSide(color: Colors.grey.withOpacity(0.2)))),
            child: Row(
              children: [
                GestureDetector(
                  onTap: _pickImage,
                  child: Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(color: bgColor, border: Border.all(color: Colors.grey.withOpacity(0.2)), borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.attach_file, color: Colors.grey, size: 18),
                  ),
                ),
                const SizedBox(width: 8),
                Expanded(
                  child: TextField(
                    controller: _textController,
                    style: TextStyle(color: textColor, fontSize: 14),
                    decoration: InputDecoration(
                      hintText: 'Type a message...',
                      hintStyle: const TextStyle(color: Colors.grey, fontSize: 13),
                      filled: true,
                      fillColor: bgColor,
                      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide.none),
                      contentPadding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
                    ),
                    onChanged: (v) => inputText = v,
                    onSubmitted: (_) => _sendMessage(),
                  ),
                ),
                const SizedBox(width: 8),
                GestureDetector(
                  onTap: _sendMessage,
                  child: Container(
                    width: 40, height: 40,
                    decoration: BoxDecoration(color: const Color(0xFF0353A4), borderRadius: BorderRadius.circular(12)),
                    child: const Icon(Icons.send, color: Colors.white, size: 18),
                  ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
