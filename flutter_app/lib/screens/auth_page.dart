import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../models/app_provider.dart';
import '../theme/app_theme.dart';
import '../widgets/native_logo.dart';
import 'app_layout.dart';

class AuthPage extends StatefulWidget {
  const AuthPage({super.key});

  @override
  State<AuthPage> createState() => _AuthPageState();
}

class _AuthPageState extends State<AuthPage>
    with SingleTickerProviderStateMixin {
  final _formKey = GlobalKey<FormState>();
  final _usernameCtrl = TextEditingController();
  final _passwordCtrl = TextEditingController();
  bool _isLoading = false;
  String? _error;
  bool _obscure = true;
  late AnimationController _animCtrl;
  late Animation<double> _fadeAnim;
  late Animation<Offset> _slideAnim;

  @override
  void initState() {
    super.initState();
    _animCtrl = AnimationController(
      duration: const Duration(milliseconds: 700),
      vsync: this,
    );
    _fadeAnim = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _animCtrl, curve: Curves.easeOut),
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, 0.08),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _animCtrl, curve: Curves.easeOutCubic));
    _animCtrl.forward();
  }

  @override
  void dispose() {
    _usernameCtrl.dispose();
    _passwordCtrl.dispose();
    _animCtrl.dispose();
    super.dispose();
  }

  Future<void> _handleLogin() async {
    if (!(_formKey.currentState?.validate() ?? false)) return;
    final username = _usernameCtrl.text.trim();
    final password = _passwordCtrl.text;

    setState(() {
      _isLoading = true;
      _error = null;
    });

    final success = await context.read<AppProvider>().login(username, password);

    if (!mounted) return;
    setState(() => _isLoading = false);

    if (success) {
      Navigator.pushReplacement(
        context,
        PageRouteBuilder(
          pageBuilder: (ctx, a1, a2) => const AppLayout(),
          transitionsBuilder: (ctx, a1, a2, child) =>
              FadeTransition(opacity: a1, child: child),
          transitionDuration: const Duration(milliseconds: 400),
        ),
      );
    } else {
      setState(() => _error = "Username yoki password noto'g'ri.");
    }
  }

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final size = MediaQuery.of(context).size;
    final bgColor = isDark ? AppTheme.surfaceDark : AppTheme.offWhite;
    final cardBg = isDark ? AppTheme.cardDark : Colors.white;
    final labelColor = isDark ? AppTheme.textMutedDark : AppTheme.textMuted;
    final headingColor = isDark ? Colors.white : AppTheme.textDark;

    return Scaffold(
      backgroundColor: bgColor,
      body: FadeTransition(
        opacity: _fadeAnim,
        child: SlideTransition(
          position: _slideAnim,
          child: Center(
            child: SingleChildScrollView(
              padding: const EdgeInsets.symmetric(horizontal: 24, vertical: 40),
              child: ConstrainedBox(
                constraints: const BoxConstraints(maxWidth: 420),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.center,
                  children: [
                    SizedBox(height: size.height * 0.04),

                    // ── Logo & Brand ──
                    const NativeLogoBox(boxSize: 80, logoSize: 44),
                    const SizedBox(height: 20),
                    Text(
                      'NATIVE ELITE',
                      style: TextStyle(
                        color: headingColor,
                        fontSize: 20,
                        fontWeight: FontWeight.w800,
                        letterSpacing: 5,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      'IELTS Learning Hub',
                      style: TextStyle(
                        color: labelColor,
                        fontSize: 12,
                        letterSpacing: 2,
                        fontWeight: FontWeight.w400,
                      ),
                    ),

                    const SizedBox(height: 40),

                    // ── Login Card ──
                    Container(
                      padding: const EdgeInsets.all(28),
                      decoration: BoxDecoration(
                        color: cardBg,
                        borderRadius: BorderRadius.circular(24),
                        border: Border.all(
                          color: isDark
                              ? const Color(0xFF2A2F52)
                              : AppTheme.divider,
                        ),
                        boxShadow: isDark
                            ? []
                            : [
                                BoxShadow(
                                  color: Colors.black.withValues(alpha: 0.06),
                                  blurRadius: 32,
                                  offset: const Offset(0, 12),
                                ),
                              ],
                      ),
                      child: Form(
                        key: _formKey,
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Kirish',
                              style: TextStyle(
                                fontSize: 22,
                                fontWeight: FontWeight.w700,
                                color: headingColor,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'Tizimga kirish uchun ma\'lumotlaringizni kiriting',
                              style: TextStyle(
                                fontSize: 13,
                                color: labelColor,
                              ),
                            ),
                            const SizedBox(height: 28),

                            // Error banner
                            if (_error != null) ...[
                              _ErrorBanner(message: _error!),
                              const SizedBox(height: 20),
                            ],

                            // Username
                            _buildFieldLabel('Username', isDark),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _usernameCtrl,
                              textInputAction: TextInputAction.next,
                              style: TextStyle(
                                color: isDark ? Colors.white : AppTheme.textDark,
                                fontSize: 15,
                              ),
                              decoration: _fieldDecoration(
                                hint: 'username',
                                icon: Icons.person_outline_rounded,
                                isDark: isDark,
                              ),
                              validator: (v) =>
                                  (v == null || v.isEmpty) ? 'Username kiriting' : null,
                            ),
                            const SizedBox(height: 20),

                            // Password
                            _buildFieldLabel('Password', isDark),
                            const SizedBox(height: 8),
                            TextFormField(
                              controller: _passwordCtrl,
                              obscureText: _obscure,
                              textInputAction: TextInputAction.done,
                              onFieldSubmitted: (_) => _handleLogin(),
                              style: TextStyle(
                                color: isDark ? Colors.white : AppTheme.textDark,
                                fontSize: 15,
                              ),
                              decoration: _fieldDecoration(
                                hint: '••••••••',
                                icon: Icons.lock_outline_rounded,
                                isDark: isDark,
                                suffix: GestureDetector(
                                  onTap: () =>
                                      setState(() => _obscure = !_obscure),
                                  child: Padding(
                                    padding: const EdgeInsets.all(12),
                                    child: Icon(
                                      _obscure
                                          ? Icons.visibility_off_outlined
                                          : Icons.visibility_outlined,
                                      size: 18,
                                      color: labelColor,
                                    ),
                                  ),
                                ),
                              ),
                              validator: (v) =>
                                  (v == null || v.isEmpty) ? 'Password kiriting' : null,
                            ),
                            const SizedBox(height: 28),

                            // Login Button
                            SizedBox(
                              width: double.infinity,
                              height: 52,
                              child: ElevatedButton(
                                onPressed: _isLoading ? null : _handleLogin,
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: AppTheme.accent,
                                  foregroundColor: Colors.white,
                                  elevation: 0,
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(14),
                                  ),
                                  disabledBackgroundColor:
                                      AppTheme.accent.withValues(alpha: 0.5),
                                ),
                                child: _isLoading
                                    ? const SizedBox(
                                        width: 20,
                                        height: 20,
                                        child: CircularProgressIndicator(
                                          strokeWidth: 2.5,
                                          color: Colors.white,
                                        ),
                                      )
                                    : const Text(
                                        'Kirish',
                                        style: TextStyle(
                                          fontSize: 15,
                                          fontWeight: FontWeight.w700,
                                          letterSpacing: 0.3,
                                        ),
                                      ),
                              ),
                            ),
                          ],
                        ),
                      ),
                    ),

                    const SizedBox(height: 20),

                    // Info note
                    Row(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(
                          Icons.info_outline_rounded,
                          size: 13,
                          color: labelColor,
                        ),
                        const SizedBox(width: 6),
                        Text(
                          'Akkaunt faqat Admin tomonidan yaratiladi',
                          style: TextStyle(color: labelColor, fontSize: 12),
                        ),
                      ],
                    ),
                    const SizedBox(height: 40),

                    Text(
                      '© 2026 Native Elite',
                      style: TextStyle(
                        color: labelColor.withValues(alpha: 0.5),
                        fontSize: 11,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildFieldLabel(String label, bool isDark) {
    return Text(
      label,
      style: TextStyle(
        fontSize: 13,
        fontWeight: FontWeight.w600,
        color: isDark ? AppTheme.textMutedDark : AppTheme.textMuted,
      ),
    );
  }

  InputDecoration _fieldDecoration({
    required String hint,
    required IconData icon,
    required bool isDark,
    Widget? suffix,
  }) {
    final borderColor =
        isDark ? const Color(0xFF2A2F52) : AppTheme.divider;
    final fillColor =
        isDark ? AppTheme.surfaceDark : const Color(0xFFF9FAFB);
    return InputDecoration(
      hintText: hint,
      hintStyle: TextStyle(
        color: isDark ? const Color(0xFF4B5563) : const Color(0xFFBCC0CC),
        fontSize: 14,
      ),
      prefixIcon: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 14),
        child: Icon(icon,
            size: 18,
            color: isDark ? AppTheme.textMutedDark : AppTheme.textMuted),
      ),
      prefixIconConstraints: const BoxConstraints(minWidth: 48, minHeight: 48),
      suffixIcon: suffix,
      filled: true,
      fillColor: fillColor,
      contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
      enabledBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: BorderSide(color: borderColor),
      ),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppTheme.accent, width: 2),
      ),
      errorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppTheme.error),
      ),
      focusedErrorBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: AppTheme.error, width: 2),
      ),
    );
  }
}

class _ErrorBanner extends StatelessWidget {
  final String message;
  const _ErrorBanner({required this.message});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
      decoration: BoxDecoration(
        color: AppTheme.error.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: AppTheme.error.withValues(alpha: 0.25)),
      ),
      child: Row(
        children: [
          const Icon(Icons.error_outline_rounded,
              color: AppTheme.error, size: 16),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              message,
              style: const TextStyle(color: AppTheme.error, fontSize: 13),
            ),
          ),
        ],
      ),
    );
  }
}
