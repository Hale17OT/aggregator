import 'dart:async';
import 'dart:math' as math;
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:go_router/go_router.dart';
import 'package:video_player/video_player.dart';
import 'data.dart';
import 'main.dart';
import 'reader.dart';

/// A short-form canvas around the existing controller, never a second decoder.
class ClipSurface extends StatefulWidget {
  final VideoPlayerController controller;
  final Programme programme;
  final int index, count;
  final ValueChanged<int>? onMove;
  const ClipSurface({
    super.key,
    required this.controller,
    required this.programme,
    required this.index,
    required this.count,
    this.onMove,
  });
  @override
  State<ClipSurface> createState() => _ClipSurfaceState();
}

class _ClipSurfaceState extends State<ClipSurface> {
  bool captions = true, saving = false, saved = false, seeking = false;
  bool seekWasPlaying = false;
  bool seekCancelled = false;
  double travel = 0, seekPreview = 0;
  Duration seekOriginal = Duration.zero;
  String? articleId;
  set message(String value) {
    if (!mounted) return;
    final messenger = ScaffoldMessenger.of(context);
    messenger.hideCurrentSnackBar();
    messenger.showSnackBar(
      SnackBar(
        content: Text(value),
        showCloseIcon: true,
        duration: const Duration(seconds: 5),
      ),
    );
  }

  int epoch = 0;
  VideoPlayerController get c => widget.controller;
  Programme get p => widget.programme;
  @override
  void initState() {
    super.initState();
    member.addListener(identityChanged);
    unawaited(readSaved());
  }

  @override
  void dispose() {
    epoch++;
    member.removeListener(identityChanged);
    super.dispose();
  }

  void identityChanged() {
    if (mounted) {
      setState(() {
        saved = false;
      });
      unawaited(readSaved());
    }
  }

  Future<void> readSaved() async {
    final token = ++epoch, identity = api.generation;
    try {
      final article = await api.request(
        '/api/v1/articles/${Uri.encodeComponent(p.raw['articleSlugs'][0])}',
      );
      if (!mounted || token != epoch || identity != api.generation) return;
      articleId = article['id'];
      if (member.session == null) return;
      final rows =
          await api.request('/api/v1/me/bookmarks', member: true) as List;
      if (mounted && token == epoch && identity == api.generation) {
        setState(() => saved = rows.any((b) => b['articleId'] == articleId));
      }
    } catch (_) {
      /* The explicit Save action reports failures. */
    }
  }

  Future<void> toggle() async {
    try {
      if (c.value.isPlaying) {
        await c.pause();
      } else {
        if (c.value.position >= c.value.duration) await c.seekTo(Duration.zero);
        await media.claimVideo(c);
      }
    } catch (_) {
      if (mounted) {
        setState(() => message = 'Playback could not start. Try Play again.');
      }
    }
  }

  Future<void> save() async {
    final identity = api.generation, token = epoch, target = articleId;
    final remove = saved;
    await c.pause();
    if (!mounted || identity != api.generation || token != epoch) return;
    if (member.session == null) {
      context.go('/library');
      return;
    }
    if (saving) return;
    if (target == null) {
      setState(
        () => message =
            'Story details unavailable. Try Save again after loading.',
      );
      unawaited(readSaved());
      return;
    }
    setState(() => saving = true);
    try {
      await api.request(
        '/api/v1/me/bookmarks/$target',
        method: remove ? 'DELETE' : 'PUT',
        body: {},
        member: true,
      );
      if (mounted && identity == api.generation && token == epoch) {
        setState(() {
          saved = !remove;
          message = saved ? 'Saved to Library' : 'Removed from Library';
        });
      }
    } catch (_) {
      if (mounted && token == epoch) {
        setState(() => message = 'Save failed. Please retry.');
      }
    } finally {
      if (mounted) setState(() => saving = false);
    }
  }

  Future<void> copy() async {
    await c.pause();
    try {
      await Clipboard.setData(
        ClipboardData(
          text: Uri.http('127.0.0.1:3000', '/clips/${p.id}').toString(),
        ),
      );
      if (mounted) {
        setState(
          () => message =
              'Local link copied. It requires the local demo services.',
        );
      }
    } catch (_) {
      if (mounted) setState(() => message = 'Copy failed. Try again.');
    }
  }

  Future<void> share() async {
    await c.pause();
    try {
      await const MethodChannel('aggregator/local-share').invokeMethod<void>(
        'share',
        {'url': Uri.http('127.0.0.1:3000', '/clips/${p.id}').toString()},
      );
      if (mounted) {
        setState(
          () => message = 'Share sheet opened. Delivery is not verified.',
        );
      }
    } on MissingPluginException {
      await copy();
    } catch (_) {
      if (mounted) {
        setState(() => message = 'Sharing unavailable. Copy link from More.');
      }
    }
  }

  Future<void> story() async {
    await c.pause();
    if (!mounted) return;
    final segment = p.segments
        .where(
          (s) =>
              s['startMs'] <= c.value.position.inMilliseconds &&
              s['endMs'] > c.value.position.inMilliseconds,
        )
        .firstOrNull;
    final blocks = segment?['blockIds'] as List?;
    await context.push(
      Uri(
        path: '/article/${segment?['articleSlug'] ?? p.raw['articleSlugs'][0]}',
        queryParameters: blocks?.isNotEmpty == true
            ? {'section': blocks!.first}
            : null,
      ).toString(),
    );
    if (mounted) await c.pause();
  }

  Future<void> more() async {
    await c.pause();
    if (!mounted) return;
    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      useSafeArea: true,
      builder: (context) => StatefulBuilder(
        builder: (context, update) => DraggableScrollableSheet(
          expand: false,
          initialChildSize: .6,
          minChildSize: .3,
          maxChildSize: .9,
          builder: (context, scroll) => ListView(
            controller: scroll,
            padding: const EdgeInsets.all(20),
            children: [
              Text(p.title, style: Theme.of(context).textTheme.titleLarge),
              SwitchListTile(
                title: const Text('Captions'),
                value: captions,
                onChanged: (v) {
                  setState(() => captions = v);
                  update(() {});
                },
              ),
              DropdownButtonFormField<double>(
                initialValue: c.value.playbackSpeed,
                decoration: const InputDecoration(labelText: 'Playback speed'),
                items: [.75, 1.0, 1.25, 1.5, 2.0]
                    .map((n) => DropdownMenuItem(value: n, child: Text('$n×')))
                    .toList(),
                onChanged: (n) {
                  if (n != null) unawaited(c.setPlaybackSpeed(n));
                },
              ),
              TextButton(onPressed: copy, child: const Text('Copy local link')),
              Wrap(
                children: [
                  TextButton(
                    onPressed: widget.index > 0
                        ? () {
                            Navigator.pop(context);
                            widget.onMove?.call(-1);
                          }
                        : null,
                    child: const Text('Previous clip'),
                  ),
                  TextButton(
                    onPressed: widget.index + 1 < widget.count
                        ? () {
                            Navigator.pop(context);
                            widget.onMove?.call(1);
                          }
                        : null,
                    child: const Text('Next clip'),
                  ),
                ],
              ),
              const Text(
                'Transcript',
                style: TextStyle(fontWeight: FontWeight.bold),
              ),
              ...p.segments.map(
                (s) => Padding(
                  padding: const EdgeInsets.symmetric(vertical: 8),
                  child: SelectableText(s['text'] as String),
                ),
              ),
              TextButton(
                onPressed: () => Navigator.pop(context),
                child: const Text('Close'),
              ),
            ],
          ),
        ),
      ),
    );
    if (mounted) await c.pause();
  }

  Widget action(
    String label,
    IconData icon,
    VoidCallback? call, {
    bool selected = false,
  }) => Semantics(
    onTap: call,
    enabled: call != null,
    button: true,
    selected: selected,
    label: label,
    child: ExcludeSemantics(
      child: InkWell(
        onTap: call,
        child: SizedBox(
          width: 52,
          height: 56,
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              Icon(
                icon,
                color: selected ? const Color(0xffe3c78e) : Colors.white,
                size: 26,
              ),
              if (MediaQuery.textScalerOf(context).scale(1) <= 1.5)
                Text(
                  label,
                  style: const TextStyle(fontSize: 10, color: Colors.white),
                ),
            ],
          ),
        ),
      ),
    ),
  );
  @override
  Widget build(BuildContext context) => LayoutBuilder(
    builder: (context, box) {
      final textScale = MediaQuery.textScalerOf(context).scale(1);
      final compact = box.maxHeight < 260;
      final metadataHeight = textScale > 1.5 ? 88.0 : 52.0;
      final captionHeight = math.min(
        textScale > 1.5 ? 176.0 : 84.0,
        math.max(48.0, box.maxHeight * .3),
      );
      final lower = compact ? 48.0 : metadataHeight + captionHeight + 56.0;
      final height = math.max(
        0.0,
        math.min(box.maxHeight - lower, (box.maxWidth - 112) * 16 / 9),
      );
      final width = height * 9 / 16;
      return Material(
        color: const Color(0xff101512),
        child: Stack(
          children: [
            Positioned(
              top: 4,
              left: (box.maxWidth - width) / 2,
              width: width,
              height: height,
              child: GestureDetector(
                onTap: toggle,
                onVerticalDragStart: (_) => travel = 0,
                onVerticalDragUpdate: (d) => travel += d.delta.dy,
                onVerticalDragCancel: () => travel = 0,
                onVerticalDragEnd: (d) {
                  if (travel.abs() > 40 ||
                      (d.primaryVelocity ?? 0).abs() > 300) {
                    widget.onMove?.call(
                      (travel == 0 ? d.primaryVelocity! : travel) < 0 ? 1 : -1,
                    );
                  }
                  travel = 0;
                },
                child: Stack(
                  alignment: Alignment.center,
                  children: [
                    VideoPlayer(c),
                    _VideoSlice<bool>(
                      controller: c,
                      select: (v) => v.isPlaying,
                      builder: (playing) => playing
                          ? const SizedBox.shrink()
                          : IconButton(
                              tooltip: 'Play video',
                              onPressed: toggle,
                              style: IconButton.styleFrom(
                                backgroundColor: Colors.black54,
                                foregroundColor: Colors.white,
                              ),
                              icon: const Icon(Icons.play_arrow, size: 30),
                            ),
                    ),
                  ],
                ),
              ),
            ),
            Positioned(
              top: 0,
              left: 0,
              child: _VideoSlice<(bool, double)>(
                controller: c,
                select: (v) => (v.isPlaying, v.volume),
                builder: (state) => Column(
                  children: [
                    IconButton(
                      tooltip: state.$1 ? 'Pause video' : 'Play video',
                      color: Colors.white,
                      onPressed: toggle,
                      icon: Icon(state.$1 ? Icons.pause : Icons.play_arrow),
                    ),
                    IconButton(
                      tooltip: state.$2 == 0 ? 'Unmute video' : 'Mute video',
                      color: Colors.white,
                      onPressed: () => c.setVolume(state.$2 == 0 ? 1 : 0),
                      icon: Icon(
                        state.$2 == 0
                            ? Icons.volume_off_outlined
                            : Icons.volume_up_outlined,
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Positioned(
              right: 2,
              width: compact ? 104 : 52,
              top: math.max(0, (box.maxHeight - lower - 224) / 2),
              child: Wrap(
                children: [
                  action(
                    saved ? 'Saved' : 'Save',
                    saved ? Icons.bookmark : Icons.bookmark_border,
                    saving ? null : save,
                    selected: saved,
                  ),
                  action('Sources', Icons.source_outlined, () {
                    unawaited(c.pause());
                    showSources(context, p.sources);
                  }),
                  action('Share', Icons.ios_share_outlined, share),
                  action('More', Icons.more_horiz, more),
                ],
              ),
            ),
            if (!compact && textScale <= 1.5)
              Positioned(
                left: 0,
                bottom: lower,
                child: Column(
                  children: [
                    IconButton(
                      tooltip: 'Previous clip',
                      color: Colors.white,
                      disabledColor: Colors.white24,
                      onPressed: widget.index > 0
                          ? () => widget.onMove?.call(-1)
                          : null,
                      icon: const Icon(Icons.arrow_upward),
                    ),
                    Text(
                      '${widget.index + 1}/${widget.count}',
                      style: const TextStyle(
                        color: Colors.white70,
                        fontSize: 10,
                      ),
                    ),
                    IconButton(
                      tooltip: 'Next clip',
                      color: Colors.white,
                      disabledColor: Colors.white24,
                      onPressed: widget.index + 1 < widget.count
                          ? () => widget.onMove?.call(1)
                          : null,
                      icon: const Icon(Icons.arrow_downward),
                    ),
                  ],
                ),
              ),
            if (captions)
              Positioned(
                left: compact || textScale > 1.5 ? 56 : 12,
                width: compact
                    ? math.max(0, (box.maxWidth - width) / 2 - 64)
                    : null,
                right: compact
                    ? null
                    : textScale > 1.5
                    ? 56
                    : 12,
                bottom: compact ? 48 : metadataHeight + 48,
                height: compact
                    ? math.max(0, box.maxHeight - 108)
                    : captionHeight,
                child: _VideoSlice<String>(
                  controller: c,
                  select: (v) => v.caption.text,
                  builder: (cue) => SingleChildScrollView(
                    child: Text(
                      cue,
                      textAlign: TextAlign.center,
                      style: const TextStyle(color: Colors.white, fontSize: 14),
                    ),
                  ),
                ),
              ),
            Positioned(
              left: compact ? 56 : 16,
              width: compact
                  ? math.max(0, (box.maxWidth - width) / 2 - 64)
                  : null,
              right: compact ? null : 16,
              top: compact ? 0 : null,
              bottom: compact ? null : 48,
              height: compact ? 56 : metadataHeight,
              child: InkWell(
                onTap: story,
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    const Text(
                      'FICTIONAL LOCAL REPORTING',
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: Color(0xffd9c795), fontSize: 9),
                    ),
                    Expanded(
                      child: Text(
                        '${p.title} · Read story ↗',
                        maxLines: 2,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 12,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ),
            Positioned(
              left: 0,
              right: 0,
              bottom: 0,
              height: 48,
              child: _VideoSlice<(Duration, Duration, bool)>(
                controller: c,
                select: (v) => (v.position, v.duration, v.isPlaying),
                builder: (_) {
                  final v = c.value;
                  return Listener(
                    onPointerCancel: (_) {
                      if (seeking) {
                        seekCancelled = true;
                        unawaited(c.seekTo(seekOriginal));
                        if (seekWasPlaying) unawaited(media.claimVideo(c));
                        setState(() => seeking = false);
                      }
                    },
                    child: SliderTheme(
                      data: SliderTheme.of(context).copyWith(
                        trackHeight: 2,
                        thumbShape: const RoundSliderThumbShape(
                          enabledThumbRadius: 4,
                        ),
                        overlayShape: const RoundSliderOverlayShape(
                          overlayRadius: 12,
                        ),
                      ),
                      child: Slider(
                        label:
                            '${(seeking ? seekPreview : v.position.inMilliseconds / 1000).floor()} seconds',
                        min: 0,
                        max: math.max(1, v.duration.inMilliseconds / 1000),
                        value:
                            (seeking
                                    ? seekPreview
                                    : v.position.inMilliseconds / 1000)
                                .clamp(
                                  0,
                                  math.max(1, v.duration.inMilliseconds / 1000),
                                ),
                        onChangeStart: (n) {
                          seekCancelled = false;
                          seekOriginal = v.position;
                          seekWasPlaying = v.isPlaying;
                          unawaited(c.pause());
                          setState(() {
                            seeking = true;
                            seekPreview = n;
                          });
                        },
                        onChanged: (n) => setState(() => seekPreview = n),
                        onChangeEnd: (n) async {
                          if (seekCancelled) return;
                          await c.seekTo(
                            Duration(milliseconds: (n * 1000).round()),
                          );
                          if (mounted) setState(() => seeking = false);
                          if (seekWasPlaying && mounted) {
                            await media.claimVideo(c);
                          }
                        },
                      ),
                    ),
                  );
                },
              ),
            ),
          ],
        ),
      );
    },
  );
}

/// Rebuild only when the selected value changes; detach on route/controller change.
class _VideoSlice<T> extends StatefulWidget {
  final VideoPlayerController controller;
  final T Function(VideoPlayerValue) select;
  final Widget Function(T) builder;
  const _VideoSlice({
    required this.controller,
    required this.select,
    required this.builder,
  });
  @override
  State<_VideoSlice<T>> createState() => _VideoSliceState<T>();
}

class _VideoSliceState<T> extends State<_VideoSlice<T>> {
  late T selected;
  void changed() {
    final next = widget.select(widget.controller.value);
    if (next != selected && mounted) setState(() => selected = next);
  }

  @override
  void initState() {
    super.initState();
    selected = widget.select(widget.controller.value);
    widget.controller.addListener(changed);
  }

  @override
  void didUpdateWidget(covariant _VideoSlice<T> old) {
    super.didUpdateWidget(old);
    if (old.controller != widget.controller) {
      old.controller.removeListener(changed);
      widget.controller.addListener(changed);
    }
    selected = widget.select(widget.controller.value);
  }

  @override
  void dispose() {
    widget.controller.removeListener(changed);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => widget.builder(selected);
}
