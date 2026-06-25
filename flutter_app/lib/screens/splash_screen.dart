import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import '../models/app_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/native_logo.dart';
import 'auth_page.dart';
import 'app_layout.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;
  late Animation<double> _logoFade;
  late Animation<double> _logoScale;
  late Animation<double> _textFade;
  late Animation<double> _dotFade;

  @override
  void initState() {
    super.initState();
    SystemChrome.setSystemUIOverlayStyle(const SystemUiOverlayStyle(
      statusBarColor: Colors.transparent,
      statusBarIconBrightness: Brightness.light,
    ));

    _ctrl = AnimationController(
      duration: const Duration(milliseconds: 1600),
      vsync: this,
    );

    _logoFade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _ctrl, curve: const Interval(0.0, 0.45, curve: Curves.easeOut)),
    );
    _logoScale = Tween<double>(begin: 0.6, end: 1).animate(
      CurvedAnimation(parent: _ctrl, curve: const Interval(0.0, 0.5, curve: Curves.easeOutBack)),
    );
    _textFade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _ctrl, curve: const Interval(0.4, 0.75, curve: Curves.easeOut)),
    );
    _dotFade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _ctrl, curve: const Interval(0.7, 1.0, curve: Curves.easeOut)),
    );

    _ctrl.forward();
    _navigate();
  }

  Future<void> _navigate() async {
    await Future.delayed(const Duration(milliseconds: 2600));
    if (!mounted) return;
    final appProvider = context.read<AppProvider>();
    Navigator.pushReplacement(
      context,
      PageRouteBuilder(
        pageBuilder: (ctx, a1, a2) => appProvider.currentUser != null
            ? const AppLayout()
            : const AuthPage(),
        transitionsBuilder: (ctx, a1, a2, child) =>
            FadeTransition(opacity: a1, child: child),
        transitionDuration: const Duration(milliseconds: 500),
      ),
    );
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.primary,
      body: Container(
        width: double.infinity,
        height: double.infinity,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            begin: Alignment.topCenter,
            end: Alignment.bottomCenter,
            colors: [
              Color(0xFF1A1F3C),
              Color(0xFF0D1226),
            ],
          ),
        ),
        child: Stack(
          children: [
            // Subtle background circles
            Positioned(
              top: -80,
              right: -80,
              child: Container(
                width: 280,
                height: 280,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.accent.withValues(alpha: 0.06),
                ),
              ),
            ),
            Positioned(
              bottom: -60,
              left: -60,
              child: Container(
                width: 220,
                height: 220,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: AppTheme.accent.withValues(alpha: 0.04),
                ),
              ),
            ),
            // Center content
            Center(
              child: AnimatedBuilder(
                animation: _ctrl,
                builder: (context, _) => Column(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    // Logo
                    FadeTransition(
                      opacity: _logoFade,
                      child: ScaleTransition(
                        scale: _logoScale,
                        child: const NativeLogoBox(boxSize: 96, logoSize: 52),
                      ),
                    ),
                    const SizedBox(height: 28),

                    // Brand Name
                    FadeTransition(
                      opacity: _textFade,
                      child: Column(
                        children: [
                          const Text(
                            'NATIVE ELITE',
                            style: TextStyle(
                              color: Colors.white,
                              fontSize: 26,
                              fontWeight: FontWeight.w800,
                              letterSpacing: 7,
                              height: 1,
                            ),
                          ),
                          const SizedBox(height: 8),
                          Text(
                            'IELTS Learning Hub',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.45),
                              fontSize: 12,
                              fontWeight: FontWeight.w400,
                              letterSpacing: 3,
                            ),
                          ),
                        ],
                      ),
                    ),
                    const SizedBox(height: 56),

                    // Loading dots
                    FadeTransition(
                      opacity: _dotFade,
                      child: _LoadingDots(),
                    ),
                  ],
                ),
              ),
            ),

            // Bottom copyright
            Positioned(
              bottom: 32,
              left: 0,
              right: 0,
              child: AnimatedBuilder(
                animation: _dotFade,
                builder: (context2, child2) => Opacity(
                  opacity: _dotFade.value,
                  child: Text(
                    '© 2026 Native Elite',
                    textAlign: TextAlign.center,
                    style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.2),
                      fontSize: 11,
                      letterSpacing: 1.5,
                    ),
                  ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

class _LoadingDots extends StatefulWidget {
  @override
  State<_LoadingDots> createState() => _LoadingDotsState();
}

class _LoadingDotsState extends State<_LoadingDots>
    with SingleTickerProviderStateMixin {
  late AnimationController _ctrl;

  @override
  void initState() {
    super.initState();
    _ctrl = AnimationController(
      duration: const Duration(milliseconds: 1200),
      vsync: this,
    )..repeat();
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _ctrl,
      builder: (context2, child2) {
        return Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (i) {
            final delay = i * 0.28;
            final t = ((_ctrl.value - delay) % 1.0).clamp(0.0, 1.0);
            final opacity = (t < 0.5 ? t * 2 : (1 - t) * 2).clamp(0.2, 1.0);
            return Container(
              margin: const EdgeInsets.symmetric(horizontal: 4),
              width: 6,
              height: 6,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                color: AppTheme.accent.withValues(alpha: opacity),
              ),
            );
          }),
        );
      },
    );
  }
}
