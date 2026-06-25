import 'package:flutter/material.dart';

/// Native Elite N logo – drawn with CustomPainter.
/// [size] – outer box size (width & height).
/// [color] – stroke color (default: white).
class NativeLogo extends StatelessWidget {
  final double size;
  final Color color;
  const NativeLogo({super.key, this.size = 48, this.color = Colors.white});

  @override
  Widget build(BuildContext context) {
    return SizedBox(
      width: size,
      height: size,
      child: CustomPaint(painter: _NLogoPainter(color: color)),
    );
  }
}

class _NLogoPainter extends CustomPainter {
  final Color color;
  const _NLogoPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final w = size.width;
    final h = size.height;

    final stroke = Paint()
      ..color = color
      ..strokeWidth = w * 0.115
      ..strokeCap = StrokeCap.square
      ..strokeJoin = StrokeJoin.miter
      ..style = PaintingStyle.stroke;

    // Draw the "N" shape
    final path = Path()
      ..moveTo(w * 0.18, h * 0.82)
      ..lineTo(w * 0.18, h * 0.18)
      ..lineTo(w * 0.82, h * 0.82)
      ..lineTo(w * 0.82, h * 0.18);

    canvas.drawPath(path, stroke);
  }

  @override
  bool shouldRepaint(_NLogoPainter old) => old.color != color;
}

/// Rounded square logo container with gradient background.
class NativeLogoBox extends StatelessWidget {
  final double boxSize;
  final double logoSize;
  const NativeLogoBox({super.key, this.boxSize = 80, this.logoSize = 44});

  @override
  Widget build(BuildContext context) {
    return Container(
      width: boxSize,
      height: boxSize,
      decoration: BoxDecoration(
        gradient: const LinearGradient(
          begin: Alignment.topLeft,
          end: Alignment.bottomRight,
          colors: [Color(0xFF4F72FF), Color(0xFF1A1F3C)],
        ),
        borderRadius: BorderRadius.circular(boxSize * 0.26),
        boxShadow: [
          BoxShadow(
            color: const Color(0xFF4F72FF).withValues(alpha: 0.35),
            blurRadius: 24,
            spreadRadius: 0,
            offset: const Offset(0, 8),
          ),
        ],
      ),
      child: Center(child: NativeLogo(size: logoSize)),
    );
  }
}
