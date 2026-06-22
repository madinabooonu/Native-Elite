import 'package:flutter/material.dart';

class BookingCalendar extends StatefulWidget {
  const BookingCalendar({super.key});

  @override
  State<BookingCalendar> createState() => _BookingCalendarState();
}

class _BookingCalendarState extends State<BookingCalendar> {
  String? selectedTeacher;
  String selectedDay = 'Mon';
  
  final List<Map<String, dynamic>> teachers = [
    {'id': 't2', 'name': 'Miss Osiyo', 'role': 'Support Teacher', 'avatar': '👩‍🏫', 'color': Colors.purple},
    {'id': 't3', 'name': 'Mr Sarvar', 'role': 'Support Teacher', 'avatar': '👨‍🎓', 'color': Colors.orange},
  ];

  final List<String> days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  final List<String> slots = [
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30'
  ];

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final primaryColor = const Color(0xFF0353A4);

    return Scaffold(
      backgroundColor: Theme.of(context).scaffoldBackgroundColor,
      body: SingleChildScrollView(
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            _buildSectionHeader('1', 'Select Teacher', primaryColor, textColor),
            const SizedBox(height: 12),
            Row(
              children: teachers.map((t) {
                final isSelected = selectedTeacher == t['id'];
                return Expanded(
                  child: GestureDetector(
                    onTap: () => setState(() => selectedTeacher = t['id']),
                    child: Container(
                      margin: const EdgeInsets.symmetric(horizontal: 4),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: cardColor,
                        border: Border.all(color: isSelected ? primaryColor : Colors.grey.withOpacity(0.2), width: 2),
                        borderRadius: BorderRadius.circular(20),
                        boxShadow: isSelected ? [BoxShadow(color: primaryColor.withOpacity(0.2), blurRadius: 10)] : null,
                      ),
                      child: Column(
                        children: [
                          Text(t['avatar'], style: const TextStyle(fontSize: 24)),
                          const SizedBox(height: 8),
                          Text(t['name'], style: TextStyle(fontWeight: FontWeight.bold, fontSize: 13, color: textColor)),
                          Text(t['role'], style: const TextStyle(fontSize: 10, color: Colors.grey)),
                        ],
                      ),
                    ),
                  ),
                );
              }).toList(),
            ),

            const SizedBox(height: 24),
            _buildSectionHeader('2', 'Select Day', primaryColor, textColor),
            const SizedBox(height: 12),
            SingleChildScrollView(
              scrollDirection: Axis.horizontal,
              child: Row(
                children: days.map((day) {
                  final isSelected = selectedDay == day;
                  return GestureDetector(
                    onTap: () => setState(() => selectedDay = day),
                    child: Container(
                      margin: const EdgeInsets.only(right: 8),
                      width: 60,
                      padding: const EdgeInsets.symmetric(vertical: 12),
                      decoration: BoxDecoration(
                        color: isSelected ? primaryColor : cardColor,
                        border: Border.all(color: isSelected ? primaryColor : Colors.grey.withOpacity(0.2), width: 1.5),
                        borderRadius: BorderRadius.circular(16),
                      ),
                      child: Column(
                        children: [
                          Text(day.toUpperCase(), style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : Colors.grey)),
                          const SizedBox(height: 4),
                          Text('19', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: isSelected ? Colors.white : textColor)),
                        ],
                      ),
                    ),
                  );
                }).toList(),
              ),
            ),

            const SizedBox(height: 24),
            _buildSectionHeader('3', 'Available Slots', primaryColor, textColor),
            const SizedBox(height: 12),
            if (selectedTeacher == null)
              const Center(child: Padding(padding: EdgeInsets.all(20), child: Text('Please select a teacher first', style: TextStyle(color: Colors.grey))))
            else
              ListView.builder(
                shrinkWrap: true,
                physics: const NeverScrollableScrollPhysics(),
                itemCount: slots.length,
                itemBuilder: (context, i) {
                  return Container(
                    margin: const EdgeInsets.only(bottom: 10),
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: cardColor,
                      borderRadius: BorderRadius.circular(16),
                      border: Border.all(color: Colors.grey.withOpacity(0.1)),
                    ),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Row(
                          children: [
                            Icon(Icons.access_time_rounded, size: 18, color: primaryColor),
                            const SizedBox(width: 12),
                            Text('${slots[i]} - ${slots[i].startsWith('19') ? '20:00' : slots[i]}', style: TextStyle(fontWeight: FontWeight.bold, color: textColor)),
                          ],
                        ),
                        ElevatedButton(
                          onPressed: () => _showBookingForm(context, slots[i]),
                          style: ElevatedButton.styleFrom(
                            backgroundColor: primaryColor,
                            foregroundColor: Colors.white,
                            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(10)),
                            padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                            minimumSize: const Size(80, 36),
                          ),
                          child: const Text('Book', style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold)),
                        ),
                      ],
                    ),
                  );
                },
              ),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(String index, String title, Color primary, Color textColor) {
    return Row(
      children: [
        Container(
          width: 24, height: 24,
          decoration: BoxDecoration(color: primary, shape: BoxShape.circle),
          alignment: Alignment.center,
          child: Text(index, style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.bold)),
        ),
        const SizedBox(width: 8),
        Text(title, style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold, color: textColor)),
      ],
    );
  }

  void _showBookingForm(BuildContext context, String slotTime) {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => _BookingForm(slotTime: slotTime, teacherName: selectedTeacher == 't2' ? 'Miss Osiyo' : 'Mr Sarvar'),
    );
  }
}

class _BookingForm extends StatelessWidget {
  final String slotTime;
  final String teacherName;

  const _BookingForm({required this.slotTime, required this.teacherName});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final cardColor = isDark ? const Color(0xFF0E173C) : Colors.white;
    final textColor = isDark ? Colors.white : Colors.black87;
    final primaryColor = const Color(0xFF0353A4);

    return Container(
      padding: EdgeInsets.fromLTRB(20, 20, 20, MediaQuery.of(context).viewInsets.bottom + 20),
      decoration: BoxDecoration(
        color: Theme.of(context).scaffoldBackgroundColor,
        borderRadius: const BorderRadius.vertical(top: Radius.circular(32)),
      ),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Center(child: Container(width: 40, height: 4, decoration: BoxDecoration(color: Colors.grey, borderRadius: BorderRadius.all(Radius.circular(2))))),
          const SizedBox(height: 24),
          const Text('Book Your Lesson', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const Text('Fill in your details to confirm your booking.', style: TextStyle(fontSize: 13, color: Colors.grey)),
          const SizedBox(height: 24),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(color: cardColor, borderRadius: BorderRadius.circular(20), border: Border.all(color: primaryColor.withOpacity(0.1))),
            child: Row(
              children: [
                CircleAvatar(backgroundColor: primaryColor.withOpacity(0.1), child: Icon(Icons.calendar_today_rounded, color: primaryColor, size: 18)),
                const SizedBox(width: 16),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('Monday, $slotTime', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: textColor)),
                    Text('Teacher: $teacherName', style: TextStyle(fontSize: 12, color: primaryColor, fontWeight: FontWeight.bold)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),
          _buildTextField('Full Name', Icons.person_outline, textColor),
          const SizedBox(height: 16),
          _buildTextField('Stage', Icons.school_outlined, textColor),
          const SizedBox(height: 24),
          ElevatedButton(
            onPressed: () => Navigator.pop(context),
            style: ElevatedButton.styleFrom(
              backgroundColor: primaryColor,
              foregroundColor: Colors.white,
              minimumSize: const Size(double.infinity, 56),
              shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
            ),
            child: const Text('Confirm Booking', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
          ),
        ],
      ),
    );
  }

  Widget _buildTextField(String label, IconData icon, Color textColor) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(label, style: TextStyle(fontSize: 13, fontWeight: FontWeight.bold, color: textColor)),
        const SizedBox(height: 8),
        TextField(
          decoration: InputDecoration(
            prefixIcon: Icon(icon, size: 20),
            hintText: 'Enter your $label',
            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Colors.grey)),
            enabledBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: BorderSide(color: Colors.grey.withOpacity(0.2))),
            focusedBorder: OutlineInputBorder(borderRadius: BorderRadius.circular(12), borderSide: const BorderSide(color: Color(0xFF0353A4))),
          ),
        ),
      ],
    );
  }
}
