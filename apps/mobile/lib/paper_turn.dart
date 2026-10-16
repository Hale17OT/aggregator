import 'dart:math' as math;
import 'package:flutter/material.dart';

/// One bounded sheet transition. The real current spread owns semantics.
class PaperTurn extends StatefulWidget {
  final Widget child;
  final Object spreadKey;
  final int direction;
  final bool reduceMotion;
  const PaperTurn({
    super.key,
    required this.child,
    required this.spreadKey,
    this.direction = 1,
    this.reduceMotion = false,
  });
  @override
  State<PaperTurn> createState() => _PaperTurnState();
}

class _PaperTurnState extends State<PaperTurn>
    with SingleTickerProviderStateMixin {
  late final AnimationController clock =
      AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 820),
      )..addStatusListener((status) {
        if (status == AnimationStatus.completed && mounted) {
          setState(() => previous = null);
        }
      });
  Widget? previous;
  @override
  void didUpdateWidget(PaperTurn old) {
    super.didUpdateWidget(old);
    if (widget.reduceMotion || MediaQuery.disableAnimationsOf(context)) {
      clock.stop();
      previous = null;
      return;
    }
    if (old.spreadKey != widget.spreadKey) {
      if (widget.reduceMotion || MediaQuery.disableAnimationsOf(context)) {
        clock.stop();
        previous = null;
      } else {
        previous = old.child;
        clock.forward(from: 0);
      }
    }
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    if (MediaQuery.disableAnimationsOf(context)) {
      clock.stop();
      previous = null;
    }
  }

  @override
  void dispose() {
    clock.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => AnimatedBuilder(
    animation: clock,
    builder: (c, _) {
      final t = Curves.easeInOutCubic.transform(clock.value);
      return ClipRect(
        child: Stack(
          children: [
            widget.child,
            if (previous != null)
              Positioned.fill(
                child: IgnorePointer(
                  child: ExcludeSemantics(
                    child: ClipPath(
                      clipper: _SheetClip(t, widget.direction),
                      child: ColoredBox(
                        color: Theme.of(context).colorScheme.surface,
                        child: OverflowBox(
                          alignment: Alignment.topLeft,
                          maxHeight: double.infinity,
                          child: previous,
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            if (previous != null)
              Positioned.fill(
                child: IgnorePointer(
                  child: CustomPaint(
                    painter: _Fold(
                      t,
                      widget.direction,
                      Theme.of(context).colorScheme.surface,
                    ),
                  ),
                ),
              ),
          ],
        ),
      );
    },
  );
}

class _SheetClip extends CustomClipper<Path> {
  final double t;
  final int direction;
  _SheetClip(this.t, this.direction);
  @override
  Path getClip(Size s) {
    final x = s.width * t, curl = math.sin(t * math.pi) * s.width * .055;
    final p = Path()
      ..moveTo(x, 0)
      ..quadraticBezierTo(x - curl, s.height * .48, x + curl, s.height)
      ..lineTo(s.width, s.height)
      ..lineTo(s.width, 0)
      ..close();
    return direction > 0
        ? p
        : p
              .transform(Matrix4.diagonal3Values(-1.0, 1.0, 1.0).storage)
              .shift(Offset(s.width, 0));
  }

  @override
  bool shouldReclip(_SheetClip old) => old.t != t || old.direction != direction;
}

class _Fold extends CustomPainter {
  final double t;
  final int direction;
  final Color paper;
  _Fold(this.t, this.direction, this.paper);
  @override
  void paint(Canvas canvas, Size s) {
    if (direction < 0) {
      canvas.translate(s.width, 0);
      canvas.scale(-1, 1);
    }
    final lift = math.sin(t * math.pi), x = s.width * t;
    final curl = lift * s.width * .055, width = lift * s.width * .14;
    final fold = Path()
      ..moveTo(x, 0)
      ..quadraticBezierTo(x - curl, s.height * .48, x + curl, s.height)
      ..quadraticBezierTo(x - width, s.height * .96, x - width, s.height * .5)
      ..quadraticBezierTo(x - width, 8 * lift, x, 0)
      ..close();
    canvas.drawShadow(
      fold,
      Colors.black.withValues(alpha: .4 * lift),
      14 * lift,
      true,
    );
    canvas.drawPath(
      fold,
      Paint()
        ..shader = LinearGradient(
          colors: [
            paper.withValues(alpha: .97),
            Color.lerp(paper, Colors.white, .3)!,
            Color.lerp(paper, Colors.black, .18)!,
            paper,
          ],
          stops: const [0, .35, .88, 1],
        ).createShader(Rect.fromLTWH(x - width, 0, width + curl + 1, s.height)),
    );
    canvas.drawPath(
      Path()
        ..moveTo(x, 0)
        ..quadraticBezierTo(x - curl, s.height * .48, x + curl, s.height),
      Paint()
        ..style = PaintingStyle.stroke
        ..strokeWidth = 1
        ..color = Colors.white.withValues(alpha: .55 * lift),
    );
  }

  @override
  bool shouldRepaint(_Fold old) =>
      old.t != t || old.direction != direction || old.paper != paper;
}
