import 'package:flutter/material.dart';
import 'package:flutter_animate/flutter_animate.dart';

class LandingPage extends StatelessWidget {
  const LandingPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B1121), // brand-navy-deep
      body: Center(
        child: ConstrainedBox(
          constraints: const BoxConstraints(maxWidth: 480),
          child: Container(
            margin: const EdgeInsets.symmetric(vertical: 24),
            decoration: BoxDecoration(
              color: const Color(0xFF0F172A),
              borderRadius: BorderRadius.circular(24),
              border: Border.all(color: const Color(0xFF3B82F6).withOpacity(0.3)), // brand-blue/30
            ),
            child: ClipRRect(
              borderRadius: BorderRadius.circular(24),
              child: Stack(
                children: [
                  // Background glows
                  Positioned(
                    top: -80,
                    right: -80,
                    child: Container(
                      width: 240,
                      height: 240,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: const Color(0xFF0F172A).withOpacity(0.5),
                        boxShadow: [
                          BoxShadow(color: Colors.white.withOpacity(0.05), blurRadius: 100, spreadRadius: 40)
                        ],
                      ),
                    ),
                  ),
                  ListView(
                    padding: const EdgeInsets.all(0),
                    children: [
                      // Header
                      Container(
                        padding: const EdgeInsets.fromLTRB(24, 56, 24, 64),
                        decoration: const BoxDecoration(
                          gradient: LinearGradient(
                            colors: [Color(0xFF1E3A8A), Color(0xFF172554)],
                            begin: Alignment.topLeft,
                            end: Alignment.bottomRight,
                          ),
                        ),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Row(
                              children: [
                                const Icon(Icons.check_box_outline_blank, color: Colors.white, size: 36),
                                const SizedBox(width: 8),
                                const Text(
                                  'Native Elite',
                                  style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold, color: Colors.white),
                                ),
                              ],
                            ),
                            const SizedBox(height: 40),
                            const Text(
                              'Book Your\nSupport Session\nIn Seconds',
                              style: TextStyle(fontSize: 32, fontWeight: FontWeight.bold, color: Colors.white, height: 1.2),
                            ).animate().fadeIn().moveY(begin: 20, delay: 200.ms),
                            const SizedBox(height: 12),
                            Text(
                              'Connect with expert teachers. Choose your time, confirm your slot, and start learning.',
                              style: TextStyle(color: Colors.white.withOpacity(0.7), fontSize: 14, height: 1.5),
                            ).animate().fadeIn().moveY(begin: 20, delay: 400.ms),
                          ],
                        ),
                      ),
                      
                      // Features
                      Transform.translate(
                        offset: const Offset(0, -32),
                        child: Padding(
                          padding: const EdgeInsets.symmetric(horizontal: 20),
                          child: Column(
                            children: [
                              _buildFeatureCard('📅', 'Smart Scheduling', 'Real-time availability across all teachers.', 0),
                              const SizedBox(height: 12),
                              _buildFeatureCard('👩‍🏫', 'Choose Your Teacher', 'Select Miss Osiyo or Mr Sarvar.', 1),
                              const SizedBox(height: 12),
                              _buildFeatureCard('✅', 'Attendance Tracking', 'Teachers verify your attendance each session.', 2),
                            ],
                          ),
                        ),
                      ),
                      
                      // CTA
                      Padding(
                        padding: const EdgeInsets.fromLTRB(20, 10, 20, 40),
                        child: Column(
                          children: [
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton(
                                onPressed: () => Navigator.pushReplacementNamed(context, '/auth'),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF14B8A6), // brand-teal
                                  foregroundColor: Colors.white,
                                  padding: const EdgeInsets.symmetric(vertical: 16),
                                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                                  elevation: 5,
                                ),
                                child: const Text('Get Started', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                              ),
                            ).animate().fadeIn().moveY(begin: 20, delay: 1000.ms),
                            const SizedBox(height: 16),
                            const Text(
                              '© 2026 Native Elite. All rights reserved.',
                              style: TextStyle(fontSize: 12, color: Colors.white54),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFeatureCard(String emoji, String title, String desc, int index) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF0F172A),
        borderRadius: BorderRadius.circular(16),
        boxShadow: [
          BoxShadow(color: Colors.black.withOpacity(0.2), blurRadius: 10, offset: const Offset(0, 4)),
        ],
      ),
      child: Row(
        children: [
          Container(
            width: 48,
            height: 48,
            decoration: BoxDecoration(
              color: const Color(0xFF3B82F6).withOpacity(0.1),
              borderRadius: BorderRadius.circular(12),
            ),
            alignment: Alignment.center,
            child: Text(emoji, style: const TextStyle(fontSize: 24)),
          ),
          const SizedBox(width: 16),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white)),
                const SizedBox(height: 2),
                Text(desc, style: const TextStyle(fontSize: 12, color: Colors.white70)),
              ],
            ),
          )
        ],
      ),
    ).animate().fadeIn().moveY(begin: 20, delay: Duration(milliseconds: 500 + index * 150));
  }
}
