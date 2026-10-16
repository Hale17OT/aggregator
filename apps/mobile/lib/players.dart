import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:flutter/gestures.dart';
import 'package:go_router/go_router.dart';
import 'package:video_player/video_player.dart';
import 'main.dart';
import 'data.dart';
import 'reader.dart';
import 'shortform.dart';
import 'video_load_trace.dart';

String time(Duration d) =>
    '${d.inMinutes}:${(d.inSeconds % 60).toString().padLeft(2, '0')}';

class MiniRadio extends StatelessWidget {
  const MiniRadio({super.key});
  @override
  Widget build(BuildContext context) => StreamBuilder<bool>(
    stream: media.radio.player.playingStream,
    initialData: media.radio.player.playing,
    builder: (c, s) => Material(
      color: Theme.of(c).colorScheme.surfaceContainerHighest,
      child: ListTile(
        dense: true,
        onTap: () => c.go('/radio'),
        leading: IconButton(
          tooltip: s.data == true ? 'Pause Radio' : 'Play Radio',
          onPressed: () =>
              s.data == true ? media.radio.pause() : media.radio.play(),
          icon: Icon(s.data == true ? Icons.pause : Icons.play_arrow),
        ),
        title: Text(
          media.programme!.title,
          maxLines: 1,
          overflow: TextOverflow.ellipsis,
        ),
        subtitle: const Text('Radio • open player'),
        trailing: IconButton(
          tooltip: 'Next story',
          onPressed: () => media.chapter(1),
          icon: const Icon(Icons.skip_next),
        ),
      ),
    ),
  );
}

class RadioPage extends StatefulWidget {
  const RadioPage({super.key});
  @override
  State<RadioPage> createState() => _RadioState();
}

class _RadioState extends State<RadioPage> {
  late Future<List<Programme>> programmes;
  Programme? selected;
  double preview = 0;
  String sleep = 'off';
  bool turningStory = false;
  StreamSubscription<Duration>? positionSubscription;
  void syncProgramme() {
    if (!mounted || media.programme == null) return;
    if (sleep != media.sleepChoice) setState(() => sleep = media.sleepChoice);
    if (selected?.id != media.programme!.id) {
      setState(() {
        selected = media.programme;
        preview = 0;
      });
    }
  }

  @override
  void initState() {
    super.initState();
    sleep = media.sleepChoice;
    media.addListener(syncProgramme);
    positionSubscription = media.radio.player.positionStream.listen((position) {
      final p = selected;
      if (!mounted ||
          turningStory ||
          p == null ||
          media.programme?.id != p.id ||
          p.chapters.isEmpty) {
        return;
      }
      final chapter = p.chapters
          .lastIndexWhere((c) => c['startMs'] <= position.inMilliseconds)
          .clamp(0, p.chapters.length - 1);
      final value = p.chapters.length < 2
          ? 0.0
          : chapter / (p.chapters.length - 1);
      if (preview != value) setState(() => preview = value);
    });
    load();
  }

  @override
  void dispose() {
    media.removeListener(syncProgramme);
    unawaited(positionSubscription?.cancel());
    super.dispose();
  }

  void load() {
    programmes = api
        .request('/api/v1/programmes')
        .then(
          (v) => (v as List)
              .map((j) => Programme(j))
              .where((p) => p.kind == 'radio')
              .toList(),
        );
  }

  @override
  Widget build(BuildContext context) => FutureBuilder<List<Programme>>(
    future: programmes,
    builder: (c, s) {
      if (s.hasError) return FailureView(s.error!, () => setState(load));
      if (s.connectionState != ConnectionState.done || !s.hasData) {
        return const Center(child: CircularProgressIndicator());
      }
      final list = s.data!;
      if (list.isEmpty) {
        return const Center(child: Text('No eligible recordings.'));
      }
      selected ??= media.programme ?? list.first;
      final p = selected!;
      return ListView(
        padding: const EdgeInsets.all(20),
        children: [
          Text(
            'The listening edition',
            style: Theme.of(c).textTheme.headlineMedium,
          ),
          const SizedBox(height: 12),
          DropdownButtonFormField<String>(
            key: ValueKey(p.id),
            icon: const Icon(Icons.expand_more),
            initialValue: p.id,
            isExpanded: true,
            decoration: const InputDecoration(labelText: 'Edition'),
            items: list
                .map(
                  (p) => DropdownMenuItem(
                    value: p.id,
                    child: Text(
                      p.title,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ),
                )
                .toList(),
            onChanged: (id) {
              setState(() => selected = list.firstWhere((p) => p.id == id));
              unawaited(media.loadRadio(selected!));
            },
          ),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xff533d2b),
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: const Color(0xff947b56), width: 5),
              boxShadow: const [
                BoxShadow(
                  color: Colors.black38,
                  blurRadius: 8,
                  offset: Offset(0, 5),
                ),
              ],
            ),
            child: Column(
              children: [
                Container(
                  height: 75,
                  decoration: BoxDecoration(
                    color: const Color(0xff242720),
                    borderRadius: BorderRadius.circular(5),
                    border: Border.all(
                      color: const Color(0xffb9a782),
                      width: 3,
                    ),
                  ),
                  child: CustomPaint(
                    painter: _Grille(),
                    child: const Center(
                      child: Text(
                        'THE AGGREGATOR',
                        style: TextStyle(
                          color: Color(0xffebd9ad),
                          letterSpacing: 3,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                Container(
                  width: double.infinity,
                  padding: const EdgeInsets.all(14),
                  decoration: BoxDecoration(
                    gradient: const LinearGradient(
                      colors: [Color(0xff354c40), Color(0xff15271f)],
                    ),
                    border: Border.all(
                      color: const Color(0xffb3aa8d),
                      width: 2,
                    ),
                    borderRadius: BorderRadius.circular(4),
                  ),
                  child: Column(
                    children: [
                      Text(
                        p.title,
                        style: const TextStyle(
                          color: Color(0xffe9e2bd),
                          fontFamily: 'Newsreader',
                          fontSize: 20,
                        ),
                      ),
                      StreamBuilder<Duration>(
                        stream: media.radio.player.positionStream,
                        builder: (c, s) => Text(
                          '${time(s.data ?? Duration.zero)} / ${time(p.duration)}',
                          style: const TextStyle(color: Color(0xffc7d7b1)),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 18),
                StreamBuilder<bool>(
                  stream: media.radio.player.playingStream,
                  builder: (c, s) => Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      _key(
                        'Previous story',
                        Icons.skip_previous,
                        () => media.chapter(-1),
                      ),
                      _key(
                        s.data == true ? 'Pause Radio' : 'Play Radio',
                        s.data == true ? Icons.pause : Icons.play_arrow,
                        () async {
                          if (media.programme?.id != p.id) {
                            await media.loadRadio(p, play: true);
                          } else {
                            s.data == true
                                ? await media.radio.pause()
                                : await media.radio.play();
                          }
                        },
                      ),
                      _key(
                        'Next story',
                        Icons.skip_next,
                        () => media.chapter(1),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 16),
                Wrap(
                  alignment: WrapAlignment.spaceAround,
                  spacing: 20,
                  children: [
                    StreamBuilder<double>(
                      stream: media.radio.player.volumeStream,
                      initialData: media.radio.player.volume,
                      builder: (c, s) => HardwareDial(
                        label: 'Volume',
                        value: s.data ?? 1,
                        onPreview: (v) => media.radio.player.setVolume(v),
                        onCommit: (v) => media.radio.player.setVolume(v),
                      ),
                    ),
                    HardwareDial(
                      label:
                          'Story ${1 + (preview * (p.chapters.length - 1)).round()}',
                      stepSize: p.chapters.length < 2
                          ? 1
                          : 1 / (p.chapters.length - 1),
                      onDragging: (value) => turningStory = value,
                      value: preview,
                      onPreview: (v) => setState(() => preview = v),
                      onCommit: (v) async {
                        if (media.programme?.id != p.id) {
                          await media.loadRadio(p);
                        }
                        if (!mounted ||
                            media.programme?.id != p.id ||
                            media.error.value != null ||
                            p.chapters.isEmpty) {
                          return;
                        }
                        await media.radio.seek(
                          Duration(
                            milliseconds:
                                p.chapters[(v * (p.chapters.length - 1))
                                    .round()]['startMs'],
                          ),
                        );
                      },
                    ),
                  ],
                ),
              ],
            ),
          ),
          ValueListenableBuilder<String?>(
            valueListenable: media.error,
            builder: (c, e, _) => e == null
                ? const SizedBox.shrink()
                : Text(
                    e,
                    style: TextStyle(color: Theme.of(c).colorScheme.error),
                  ),
          ),
          StreamBuilder<Duration>(
            stream: media.radio.player.positionStream,
            builder: (c, s) => Slider(
              label: time(s.data ?? Duration.zero),
              value: (s.data?.inMilliseconds ?? 0)
                  .clamp(0, p.duration.inMilliseconds)
                  .toDouble(),
              max: p.duration.inMilliseconds.toDouble(),
              onChanged: (v) =>
                  media.radio.seek(Duration(milliseconds: v.round())),
            ),
          ),
          Wrap(
            spacing: 12,
            children: [
              DropdownButton<double>(
                icon: const Icon(Icons.expand_more),
                value: media.radio.player.speed,
                items: [.75, 1.0, 1.25, 1.5]
                    .map(
                      (r) =>
                          DropdownMenuItem(value: r, child: Text('$r× speed')),
                    )
                    .toList(),
                onChanged: (r) async {
                  await media.radio.player.setSpeed(r!);
                  setState(() {});
                },
              ),
              DropdownButton<String>(
                icon: const Icon(Icons.expand_more),
                value: sleep,
                items: ['off', '15', '30', '60', 'story']
                    .map(
                      (v) => DropdownMenuItem(
                        value: v,
                        child: Text(
                          v == 'off'
                              ? 'Sleep off'
                              : v == 'story'
                              ? 'End of story'
                              : 'Sleep $v min',
                        ),
                      ),
                    )
                    .toList(),
                onChanged: (v) {
                  setState(() => sleep = v!);
                  media.sleep(v!);
                },
              ),
              TextButton.icon(
                onPressed: () => showSources(c, p.sources),
                icon: const Icon(Icons.source_outlined),
                label: const Text('Sources'),
              ),
            ],
          ),
          ExpansionTile(
            title: const Text('Transcript and chapters'),
            children: [
              for (final segment in p.segments)
                ListTile(
                  title: Text(segment['text']),
                  subtitle: Text(
                    time(Duration(milliseconds: segment['startMs'])),
                  ),
                  onTap: () async {
                    if (media.programme?.id != p.id) await media.loadRadio(p);
                    await media.radio.seek(
                      Duration(milliseconds: segment['startMs']),
                    );
                  },
                ),
            ],
          ),
          Text(
            p.raw['syntheticDisclosure'],
            style: Theme.of(c).textTheme.labelSmall,
          ),
        ],
      );
    },
  );
  Widget _key(String label, IconData icon, VoidCallback action) => Padding(
    padding: const EdgeInsets.all(4),
    child: IconButton.filledTonal(
      tooltip: label,
      onPressed: action,
      icon: Icon(icon, size: 30),
      style: IconButton.styleFrom(
        backgroundColor: const Color(0xffd1c6ad),
        foregroundColor: const Color(0xff183b2c),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(4)),
      ),
    ),
  );
}

class _Grille extends CustomPainter {
  @override
  void paint(Canvas c, Size s) {
    final p = Paint()
      ..color = const Color(0xff7a7c68)
      ..strokeWidth = 1;
    for (double x = 4; x < s.width; x += 5) {
      c.drawLine(Offset(x, 0), Offset(x, s.height), p);
    }
  }

  @override
  bool shouldRepaint(_Grille old) => false;
}

class HardwareDial extends StatefulWidget {
  final String label;
  final double value;
  final ValueChanged<double> onPreview, onCommit;
  final ValueChanged<bool>? onDragging;
  final double stepSize;
  const HardwareDial({
    super.key,
    required this.label,
    required this.value,
    required this.onPreview,
    required this.onCommit,
    this.onDragging,
    this.stepSize = .05,
  });
  @override
  State<HardwareDial> createState() => _DialState();
}

class _DialState extends State<HardwareDial> {
  double? origin, last, previousAngle;
  final focus = FocusNode();
  bool focused = false, cancelled = false;
  int? activePointer;
  @override
  void dispose() {
    focus.dispose();
    super.dispose();
  }

  void cancel() {
    cancelled = true;
    activePointer = null;
    if (origin != null) widget.onPreview(origin!);
    origin = null;
    widget.onDragging?.call(false);
  }

  void point(Offset p) {
    final angle = math.atan2(p.dx - 50, 50 - p.dy);
    var delta = angle - (previousAngle ?? angle);
    if (delta > math.pi) delta -= 2 * math.pi;
    if (delta < -math.pi) delta += 2 * math.pi;
    previousAngle = angle;
    final v = ((last ?? widget.value) + delta / 4.7).clamp(0.0, 1.0);
    last = v;
    widget.onPreview(v);
  }

  void step(double d) {
    final v = (widget.value + d).clamp(0.0, 1.0);
    widget.onPreview(v);
    widget.onCommit(v);
  }

  @override
  Widget build(BuildContext context) => Column(
    children: [
      Text(widget.label, style: const TextStyle(color: Color(0xfff4e7c7))),
      Semantics(
        label: widget.label,
        value: '${(widget.value * 100).round()} percent',
        increasedValue: 'Increase',
        decreasedValue: 'Decrease',
        onIncrease: () => step(widget.stepSize),
        onDecrease: () => step(-widget.stepSize),
        child: Focus(
          focusNode: focus,
          onFocusChange: (v) => setState(() => focused = v),
          onKeyEvent: (node, event) {
            if (event is! KeyDownEvent && event is! KeyRepeatEvent) {
              return KeyEventResult.ignored;
            }
            final key = event.logicalKey;
            if (key == LogicalKeyboardKey.arrowRight ||
                key == LogicalKeyboardKey.arrowUp) {
              step(widget.stepSize);
            } else if (key == LogicalKeyboardKey.arrowLeft ||
                key == LogicalKeyboardKey.arrowDown) {
              step(-widget.stepSize);
            } else if (key == LogicalKeyboardKey.home) {
              step(-widget.value);
            } else if (key == LogicalKeyboardKey.end) {
              step(1 - widget.value);
            } else if (key == LogicalKeyboardKey.escape) {
              cancel();
            } else {
              return KeyEventResult.ignored;
            }
            return KeyEventResult.handled;
          },
          child: RawGestureDetector(
            gestures: {
              EagerGestureRecognizer:
                  GestureRecognizerFactoryWithHandlers<EagerGestureRecognizer>(
                    EagerGestureRecognizer.new,
                    (_) {},
                  ),
            },
            child: Listener(
              key: const ValueKey('radio-dial-face'),
              behavior: HitTestBehavior.opaque,
              onPointerDown: (d) {
                if (activePointer != null) return;
                activePointer = d.pointer;
                cancelled = false;
                widget.onDragging?.call(true);
                focus.requestFocus();
                origin = widget.value;
                last = widget.value;
                previousAngle = null;
                point(d.localPosition);
              },
              onPointerMove: (d) {
                if (activePointer == d.pointer) point(d.localPosition);
              },
              onPointerUp: (d) {
                if (activePointer != d.pointer) return;
                activePointer = null;
                scheduleMicrotask(() {
                  if (!cancelled && origin != null && mounted) {
                    widget.onCommit(last ?? widget.value);
                  }
                  origin = null;
                  widget.onDragging?.call(false);
                });
              },
              onPointerCancel: (d) {
                if (activePointer == d.pointer) cancel();
              },
              child: Container(
                width: 84,
                height: 84,
                margin: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  gradient: const RadialGradient(
                    colors: [Color(0xffeee4cd), Color(0xff9c9179)],
                  ),
                  border: Border.all(
                    width: 6,
                    color: focused ? Colors.white : const Color(0xff262b25),
                  ),
                  boxShadow: const [
                    BoxShadow(
                      color: Colors.black54,
                      blurRadius: 5,
                      offset: Offset(0, 3),
                    ),
                  ],
                ),
                child: Transform.rotate(
                  angle: widget.value * 4.7 - 2.35,
                  child: const Align(
                    alignment: Alignment.topCenter,
                    child: SizedBox(
                      height: 18,
                      child: VerticalDivider(
                        color: Color(0xff163f2d),
                        thickness: 4,
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
      Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          IconButton(
            tooltip: 'Decrease ${widget.label}',
            onPressed: () => step(-widget.stepSize),
            icon: const Icon(Icons.remove, color: Colors.white),
          ),
          IconButton(
            tooltip: 'Increase ${widget.label}',
            onPressed: () => step(widget.stepSize),
            icon: const Icon(Icons.add, color: Colors.white),
          ),
        ],
      ),
    ],
  );
}

class VideoCatalogue extends StatefulWidget {
  final bool clips;
  final String? requestedId;
  const VideoCatalogue({super.key, required this.clips, this.requestedId});
  @override
  State<VideoCatalogue> createState() => _VideoCatalogueState();
}

class _VideoCatalogueState extends State<VideoCatalogue> {
  late Future<List<Programme>> programmes;
  int index = 0;
  PageController? pages;
  bool located = false;
  bool following = false;
  @override
  void didUpdateWidget(VideoCatalogue old) {
    super.didUpdateWidget(old);
    if (old.requestedId != widget.requestedId || old.clips != widget.clips) {
      following = false;
      load();
    }
  }

  @override
  void dispose() {
    pages?.dispose();
    super.dispose();
  }

  @override
  void initState() {
    super.initState();
    load();
  }

  void load() {
    located = false;
    pages?.dispose();
    pages = null;
    programmes = api
        .request(
          following ? '/api/v1/me/clips' : '/api/v1/programmes',
          member: following,
        )
        .then(
          (v) => (v as List)
              .map((j) => Programme(j))
              .where(
                (p) =>
                    p.kind == (widget.clips ? 'clip' : 'broadcast') &&
                    p.video != null,
              )
              .toList(),
        );
  }

  @override
  Widget build(BuildContext context) => FutureBuilder<List<Programme>>(
    future: programmes,
    builder: (c, s) {
      if (s.hasError) {
        return FailureView(
          s.error!,
          () => setState(load),
          foreground: widget.clips ? Colors.white : null,
        );
      }
      if (s.connectionState != ConnectionState.done || !s.hasData) {
        return const Center(child: CircularProgressIndicator());
      }
      final list = s.data!;
      if (widget.requestedId != null &&
          !list.any((p) => p.id == widget.requestedId)) {
        return Center(
          child: Padding(
            padding: const EdgeInsets.all(20),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              children: [
                const Text(
                  'The requested recording is unavailable. No different recording was substituted.',
                ),
                TextButton(
                  onPressed: () =>
                      context.go(widget.clips ? '/clips' : '/newsroom'),
                  child: const Text('Browse available recordings'),
                ),
              ],
            ),
          ),
        );
      }
      if (list.isEmpty) {
        return Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              const Text(
                'No eligible videos match. Fictional coverage is limited; following a topic does not create news.',
              ),
              if (following)
                TextButton(
                  onPressed: () => setState(() {
                    following = false;
                    load();
                  }),
                  child: const Text('Browse all Clips'),
                ),
            ],
          ),
        );
      }
      if (!located) {
        index = widget.clips
            ? math.max(0, list.indexWhere((p) => p.id == widget.requestedId))
            : preferredProgrammeIndex(
                list,
                requestedId: widget.requestedId,
                anchorCount: member.anchorCount,
                treatment: member.mediaTreatment,
              );
        pages = PageController(initialPage: index);
        located = true;
      }
      if (widget.clips) {
        void moveClip(int direction) {
          final target = (index + direction).clamp(0, list.length - 1);
          if (target != index) pages!.jumpToPage(target);
        }

        return DefaultTextStyle.merge(
          style: const TextStyle(color: Colors.white),
          child: Column(
            children: [
              SizedBox(
                height: 48,
                child: Row(
                  children: [
                    const SizedBox(width: 16),
                    if (MediaQuery.textScalerOf(context).scale(1) <= 1.5)
                      const Text(
                        'CLIPS',
                        style: TextStyle(fontSize: 12, letterSpacing: 2),
                      ),
                    StreamBuilder<bool>(
                      stream: media.radio.player.playingStream,
                      initialData: media.radio.player.playing,
                      builder: (context, state) => state.data == true
                          ? IconButton(
                              tooltip: 'Radio playing — pause Radio',
                              onPressed: media.radio.pause,
                              color: Colors.white,
                              icon: const Icon(Icons.radio),
                            )
                          : const SizedBox.shrink(),
                    ),
                    const Spacer(),
                    TextButton(
                      onPressed: () => setState(() {
                        following = false;
                        load();
                      }),
                      child: Text(
                        'All',
                        style: TextStyle(
                          color: !following
                              ? const Color(0xffe4cd99)
                              : Colors.white70,
                        ),
                      ),
                    ),
                    TextButton(
                      onPressed: () => setState(() {
                        following = true;
                        load();
                      }),
                      child: Text(
                        'Following',
                        style: TextStyle(
                          color: following
                              ? const Color(0xffe4cd99)
                              : Colors.white70,
                        ),
                      ),
                    ),
                    const SizedBox(width: 12),
                  ],
                ),
              ),
              Expanded(
                child: PageView.builder(
                  controller: pages,
                  physics: const NeverScrollableScrollPhysics(),
                  scrollDirection: Axis.vertical,
                  itemCount: list.length,
                  onPageChanged: (i) => setState(() => index = i),
                  itemBuilder: (c, i) => i == index
                      ? ProgrammeVideo(
                          key: ValueKey(list[i].id),
                          initialSpeed: member.playbackSpeed,
                          onClipSwipe: moveClip,
                          clipIndex: i,
                          clipCount: list.length,
                          programme: list[i],
                          clip: true,
                        )
                      : const SizedBox.shrink(),
                ),
              ),
            ],
          ),
        );
      }
      return ListView(
        padding: const EdgeInsets.all(16),
        children: [
          DropdownButtonFormField<int>(
            icon: const Icon(Icons.expand_more),
            initialValue: index,
            isExpanded: true,
            decoration: const InputDecoration(
              labelText: 'Newsroom programme and treatment',
            ),
            items: [
              for (var i = 0; i < list.length; i++)
                DropdownMenuItem(
                  value: i,
                  child: Text(
                    '${list[i].raw['variant']} • ${list[i].title}',
                    maxLines: 2,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
            ],
            onChanged: (i) => setState(() => index = i!),
          ),
          const SizedBox(height: 12),
          ProgrammeVideo(
            key: ValueKey(list[index].id),
            initialSpeed: member.playbackSpeed,
            programme: list[index],
            clip: false,
          ),
        ],
      );
    },
  );
}

class ProgrammeVideo extends StatefulWidget {
  final Programme programme;
  final bool clip;
  final double initialSpeed;
  final ValueChanged<int>? onClipSwipe;
  final int clipIndex;
  final int clipCount;
  const ProgrammeVideo({
    super.key,
    required this.programme,
    required this.clip,
    this.initialSpeed = 1,
    this.onClipSwipe,
    this.clipIndex = 0,
    this.clipCount = 1,
  });
  @override
  State<ProgrammeVideo> createState() => _VideoState();
}

class _VideoState extends State<ProgrammeVideo> with WidgetsBindingObserver {
  VideoPlayerController? controller;
  Object? failure;
  bool captions = true;
  double verticalTravel = 0;
  int generation = 0;
  bool ready = false;
  int traceAttempt = 0;
  Programme? attemptProgramme;
  CaptionCancellation? captionCancellation;
  String binding(Programme p) =>
      '${p.id}|${p.video?['renditionKey']}|${p.video?['url']}|${p.video?['captionUrl']}';
  void retire(VideoPlayerController? c) {
    if (c == null) return;
    captionCancellation?.cancel();
    final p = attemptProgramme;
    if (p != null) {
      VideoLoadTrace.add(
        traceAttempt,
        p.id,
        p.video!['renditionKey'],
        'retire',
        outcome: 'cancel-controller',
      );
    }
    c.removeListener(progress);
    media.detach(c);
    unawaited(c.dispose());
  }

  @override
  void didUpdateWidget(ProgrammeVideo old) {
    super.didUpdateWidget(old);
    if (binding(old.programme) != binding(widget.programme)) {
      generation++;
      retire(controller);
      controller = null;
      unawaited(load());
    }
  }

  late int resumeIdentity, resumeHistory;
  void progress() {
    final c = controller;
    if (c != null &&
        c.value.isPlaying &&
        media.video == c &&
        media.owner == 'video' &&
        media.videoAccountGeneration == api.generation) {
      listeningSync.write(
        widget.programme,
        widget.programme.video!['renditionKey'],
        c.value.position,
      );
    }
  }

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addObserver(this);
    unawaited(load());
  }

  Future<void> load() async {
    final token = ++generation;
    ready = false;
    failure = null;
    resumeIdentity = api.generation;
    resumeHistory = listeningSync.operation;
    final p = widget.programme;
    final cancel = CaptionCancellation();
    captionCancellation = cancel;
    final traceId = VideoLoadTrace.begin();
    traceAttempt = traceId;
    attemptProgramme = p;
    final identity = binding(p);
    final c = VideoPlayerController.networkUrl(api.asset(p.video!['url']));
    bool current() =>
        mounted &&
        token == generation &&
        controller == c &&
        binding(widget.programme) == identity;
    void trace(String stage, {String outcome = 'ok', int? status}) =>
        VideoLoadTrace.add(
          traceId,
          p.id,
          p.video!['renditionKey'],
          stage,
          outcome: outcome,
          status: status,
        );
    Future<T> stage<T>(String name, Future<T> Function() action) async {
      trace(name, outcome: 'start');
      try {
        final result = await action();
        trace(name, outcome: current() ? 'ok' : 'obsolete');
        return result;
      } catch (e) {
        trace(
          name,
          outcome: current()
              ? e is FormatException
                    ? 'invalid-format'
                    : 'failed'
              : 'obsolete',
          status: e is ApiFailure ? e.status : null,
        );
        rethrow;
      }
    }

    controller = c;
    c.addListener(progress);
    try {
      // Both futures have error handlers immediately; readiness requires both.
      late WebVTTCaptionFile file;
      await Future.wait([
        stage(
          'video-initialize',
          () => c.initialize().timeout(const Duration(seconds: 20)),
        ),
        stage('caption-load-parse', () async {
          final text = await api.captions(
            p.video!['captionUrl'],
            cancellation: cancel,
          );
          if (!text.startsWith('WEBVTT')) {
            throw const FormatException('Invalid captions');
          }
          file = WebVTTCaptionFile(text);
          if (file.captions.isEmpty) {
            throw const FormatException('Empty captions');
          }
        }),
      ], eagerError: true);
      if (!current()) return;
      await c.setClosedCaptionFile(Future.value(file));
      if (!current()) return;
      await c.setPlaybackSpeed(widget.initialSpeed);
      if (!current()) return;
      final position =
          resumeIdentity == api.generation &&
              resumeHistory == listeningSync.operation
          ? media.videoPositions[p.video!['renditionKey']]
          : null;
      if (position != null) {
        await c.seekTo(position < c.value.duration ? position : Duration.zero);
      }
      if (!current()) return;
      trace('ready');
      setState(() => ready = true);
    } catch (e) {
      if (current()) {
        retire(c);
        controller = null;
        setState(() => failure = e);
      }
    }
  }

  @override
  void didChangeAppLifecycleState(AppLifecycleState state) {
    final p = attemptProgramme;
    if (p != null) {
      VideoLoadTrace.add(
        traceAttempt,
        p.id,
        p.video!['renditionKey'],
        'lifecycle',
        outcome: state.name,
      );
    }
    if (state != AppLifecycleState.resumed) unawaited(controller?.pause());
  }

  @override
  void dispose() {
    WidgetsBinding.instance.removeObserver(this);
    generation++;
    final c = controller;
    if (c != null) {
      c.removeListener(progress);
      if (c.value.isInitialized &&
          resumeIdentity == api.generation &&
          resumeHistory == listeningSync.operation) {
        if (media.videoPositions.length >= 32) {
          media.videoPositions.remove(media.videoPositions.keys.first);
        }
        media.videoPositions[widget.programme.video!['renditionKey']] =
            c.value.position;
      }
      retire(c);
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final c = controller, p = widget.programme;
    if (failure != null) {
      if (failure is ApiFailure &&
          [401, 403, 404, 410].contains((failure as ApiFailure).status)) {
        return const Center(
          child: Text(
            'This recording is no longer available or permitted. Return to the catalogue to check current eligibility.',
          ),
        );
      }
      return FailureView(
        'Video or required captions unavailable.',
        () {
          if (failure == null) return;
          generation++;
          retire(controller);
          controller = null;
          setState(() => failure = null);
          unawaited(load());
        },
        foreground: widget.clip ? Colors.white : null,
      );
    }
    if (c == null || !ready || !c.value.isInitialized) {
      return const SizedBox(
        height: 200,
        child: Center(child: CircularProgressIndicator()),
      );
    }
    if (widget.clip) {
      return ClipSurface(
        key: ValueKey(binding(p)),
        controller: c,
        programme: p,
        index: widget.clipIndex,
        count: widget.clipCount,
        onMove: widget.onClipSwipe,
      );
    }
    return ValueListenableBuilder<VideoPlayerValue>(
      valueListenable: c,
      builder: (context, v, _) => LayoutBuilder(
        builder: (context, box) {
          if (widget.clip) {
            return ClipSurface(
              controller: c,
              programme: p,
              index: widget.clipIndex,
              count: widget.clipCount,
              onMove: widget.onClipSwipe,
            );
          }
          final maxHeight = box.maxHeight.isFinite ? box.maxHeight : 600.0;
          final height = widget.clip
              ? math.min(
                  box.maxWidth * 16 / 9,
                  math.max(400.0, maxHeight - 170),
                )
              : box.maxWidth * 9 / 16;
          return SingleChildScrollView(
            child: Column(
              children: [
                Text(
                  p.title,
                  style: Theme.of(context).textTheme.titleMedium,
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 8),
                GestureDetector(
                  onVerticalDragStart: widget.onClipSwipe == null
                      ? null
                      : (_) => verticalTravel = 0,
                  onVerticalDragUpdate: widget.onClipSwipe == null
                      ? null
                      : (d) => verticalTravel += d.delta.dy,
                  onVerticalDragCancel: widget.onClipSwipe == null
                      ? null
                      : () => verticalTravel = 0,
                  onVerticalDragEnd: widget.onClipSwipe == null
                      ? null
                      : (d) {
                          final velocity = d.primaryVelocity ?? 0;
                          if (verticalTravel.abs() > 40 ||
                              velocity.abs() > 300) {
                            widget.onClipSwipe!(
                              (velocity.abs() > 300
                                          ? velocity
                                          : verticalTravel) <
                                      0
                                  ? 1
                                  : -1,
                            );
                          }
                          verticalTravel = 0;
                        },
                  child: Center(
                    child: SizedBox(
                      height: height,
                      width: height * (widget.clip ? 9 / 16 : 16 / 9),
                      child: Stack(
                        alignment: Alignment.center,
                        children: [
                          VideoPlayer(c),
                          if (!v.isPlaying)
                            IconButton.filled(
                              tooltip: 'Play video',
                              onPressed: () => media.claimVideo(c),
                              icon: const Icon(Icons.play_arrow, size: 40),
                            ),
                        ],
                      ),
                    ),
                  ),
                ),
                if (captions && v.caption.text.isNotEmpty)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(8),
                    color: Colors.black,
                    child: Text(
                      v.caption.text,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white, fontSize: 16),
                    ),
                  ),
                VideoProgressIndicator(
                  c,
                  colors: const VideoProgressColors(
                    playedColor: Color(0xff17634d),
                    bufferedColor: Color(0xffb3aa8d),
                    backgroundColor: Color(0xffdedbd0),
                  ),
                  allowScrubbing: true,
                  padding: const EdgeInsets.symmetric(vertical: 12),
                ),
                Wrap(
                  crossAxisAlignment: WrapCrossAlignment.center,
                  children: [
                    IconButton(
                      tooltip: v.isPlaying ? 'Pause video' : 'Play video',
                      onPressed: () =>
                          v.isPlaying ? c.pause() : media.claimVideo(c),
                      icon: Icon(v.isPlaying ? Icons.pause : Icons.play_arrow),
                    ),
                    Text('${time(v.position)} / ${time(v.duration)}'),
                    IconButton(
                      tooltip: v.volume == 0 ? 'Unmute video' : 'Mute video',
                      onPressed: () => c.setVolume(v.volume == 0 ? 1 : 0),
                      icon: Icon(
                        v.volume == 0 ? Icons.volume_off : Icons.volume_up,
                      ),
                    ),
                    IconButton(
                      tooltip: captions ? 'Hide captions' : 'Show captions',
                      onPressed: () => setState(() => captions = !captions),
                      icon: Icon(
                        captions
                            ? Icons.closed_caption
                            : Icons.closed_caption_off,
                      ),
                    ),
                    IconButton(
                      tooltip: 'Sources',
                      onPressed: () {
                        unawaited(c.pause());
                        showSources(context, p.sources);
                      },
                      icon: const Icon(Icons.source_outlined),
                    ),
                    IconButton(
                      tooltip: 'Read full story',
                      onPressed: () {
                        unawaited(c.pause());
                        final segment = p.segments
                            .where(
                              (s) =>
                                  s['startMs'] <= v.position.inMilliseconds &&
                                  s['endMs'] > v.position.inMilliseconds,
                            )
                            .firstOrNull;
                        final slug =
                            segment?['articleSlug'] ?? p.raw['articleSlugs'][0];
                        final blocks = segment?['blockIds'] as List?;
                        context.push(
                          Uri(
                            path: '/article/$slug',
                            queryParameters: blocks?.isNotEmpty == true
                                ? {'section': blocks!.first}
                                : null,
                          ).toString(),
                        );
                      },
                      icon: const Icon(Icons.newspaper),
                    ),
                    if (widget.clip)
                      IconButton(
                        tooltip: 'Save full story',
                        icon: const Icon(Icons.bookmark_add_outlined),
                        onPressed: () async {
                          await c.pause();
                          if (member.session == null) {
                            router.go('/library');
                            return;
                          }
                          final identity = api.generation;
                          try {
                            final article = await api.request(
                              '/api/v1/articles/${Uri.encodeComponent(p.raw['articleSlugs'][0])}',
                            );
                            if (!mounted || api.generation != identity) return;
                            await api.request(
                              '/api/v1/me/bookmarks/${article['id']}',
                              method: 'PUT',
                              body: {},
                              member: true,
                            );
                            if (context.mounted && api.generation == identity) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text('Full story saved to Library'),
                                ),
                              );
                            }
                          } catch (_) {
                            if (context.mounted) {
                              ScaffoldMessenger.of(context).showSnackBar(
                                const SnackBar(
                                  content: Text(
                                    'Story could not be saved. Retry from the full article.',
                                  ),
                                ),
                              );
                            }
                          }
                        },
                      ),
                    if (widget.clip)
                      IconButton(
                        tooltip: 'Copy local Clip link',
                        icon: const Icon(Icons.link),
                        onPressed: () async {
                          await Clipboard.setData(
                            ClipboardData(
                              text: Uri.http(
                                '127.0.0.1:3000',
                                '/clips/${p.id}',
                              ).toString(),
                            ),
                          );
                          if (context.mounted) {
                            ScaffoldMessenger.of(context).showSnackBar(
                              const SnackBar(
                                content: Text(
                                  'Local demo link copied; available only with the local services.',
                                ),
                              ),
                            );
                          }
                        },
                      ),
                    IconButton(
                      tooltip: 'Full screen video',
                      icon: const Icon(Icons.fullscreen),
                      onPressed: () => showDialog<void>(
                        context: context,
                        useSafeArea: true,
                        builder: (dialog) => Dialog.fullscreen(
                          child: ValueListenableBuilder<VideoPlayerValue>(
                            valueListenable: c,
                            builder: (context, full, _) => ColoredBox(
                              color: Colors.black,
                              child: Column(
                                children: [
                                  Expanded(
                                    child: Center(
                                      child: AspectRatio(
                                        aspectRatio: c.value.aspectRatio,
                                        child: VideoPlayer(c),
                                      ),
                                    ),
                                  ),
                                  if (captions)
                                    Padding(
                                      padding: const EdgeInsets.all(8),
                                      child: Text(
                                        full.caption.text,
                                        style: const TextStyle(
                                          color: Colors.white,
                                        ),
                                        textAlign: TextAlign.center,
                                      ),
                                    ),
                                  VideoProgressIndicator(
                                    c,
                                    colors: const VideoProgressColors(
                                      playedColor: Color(0xffd8bf8f),
                                      bufferedColor: Color(0xff68746b),
                                      backgroundColor: Color(0xff25352e),
                                    ),
                                    allowScrubbing: true,
                                  ),
                                  Row(
                                    mainAxisAlignment: MainAxisAlignment.center,
                                    children: [
                                      IconButton(
                                        tooltip: full.isPlaying
                                            ? 'Pause video'
                                            : 'Play video',
                                        onPressed: () => full.isPlaying
                                            ? c.pause()
                                            : media.claimVideo(c),
                                        icon: Icon(
                                          full.isPlaying
                                              ? Icons.pause
                                              : Icons.play_arrow,
                                          color: Colors.white,
                                        ),
                                      ),
                                      IconButton(
                                        tooltip: 'Exit full screen',
                                        onPressed: () => Navigator.pop(dialog),
                                        icon: const Icon(
                                          Icons.fullscreen_exit,
                                          color: Colors.white,
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
                    ),
                    PopupMenuButton<double>(
                      tooltip: 'Playback speed',
                      initialValue: v.playbackSpeed,
                      onSelected: c.setPlaybackSpeed,
                      icon: const Icon(Icons.speed),
                      itemBuilder: (_) => [
                        for (final rate in [.75, 1.0, 1.25, 1.5])
                          PopupMenuItem(value: rate, child: Text('$rate×')),
                      ],
                    ),
                  ],
                ),
                ExpansionTile(
                  title: const Text('Transcript • tap to seek'),
                  children: [
                    for (final seg in p.segments)
                      ListTile(
                        title: Text(seg['text']),
                        subtitle: Text(
                          time(Duration(milliseconds: seg['startMs'])),
                        ),
                        onTap: () =>
                            c.seekTo(Duration(milliseconds: seg['startMs'])),
                      ),
                  ],
                ),
                if (widget.clip)
                  Text(
                    'Swipe up for the next clip • finite local collection',
                    style: Theme.of(context).textTheme.labelSmall,
                  ),
              ],
            ),
          );
        },
      ),
    );
  }
}
