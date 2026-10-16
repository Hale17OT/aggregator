import 'package:flutter/material.dart';
import 'data.dart';
import 'main.dart';

/// Handoffs resolve source block IDs in the destination's own time map.
class FormatLinks extends StatefulWidget {
  final Article article;
  const FormatLinks(this.article, {super.key});
  @override
  State<FormatLinks> createState() => _FormatLinksState();
}

class _FormatLinksState extends State<FormatLinks> {
  late final Future<List<Programme>> available = api
      .request('/api/v1/programmes')
      .then(
        (rows) => (rows as List)
            .map((p) => Programme(p))
            .where(
              (p) =>
                  (p.raw['articleSlugs'] as List).contains(widget.article.slug),
            )
            .toList(),
      );
  String? block;
  String? error;
  bool busy = false;
  Future<void> open(Programme p, Json segment) async {
    setState(() => busy = true);
    try {
      final position = Duration(milliseconds: segment['startMs']);
      if (p.kind == 'radio') {
        final expected = media.epoch + 1;
        await media.loadRadio(p);
        if (media.epoch != expected || !mounted) return;
        if (media.error.value != null || media.programme?.id != p.id) {
          throw StateError('Requested recording could not be prepared');
        }
        await media.radio.seek(position);
        if (media.epoch == expected && mounted) router.go('/radio');
      } else {
        media.videoPositions[p.video!['renditionKey']] = position;
        router.go(
          Uri(
            path: p.kind == 'clip' ? '/clips' : '/newsroom',
            queryParameters: {'programme': p.id},
          ).toString(),
        );
      }
    } catch (_) {
      if (mounted) setState(() => error = 'That format could not be prepared.');
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => FutureBuilder<List<Programme>>(
    future: available,
    builder: (context, snapshot) {
      if (snapshot.hasError) {
        return const Text(
          'Prepared formats could not be checked. The attributed article remains available.',
        );
      }
      if (!snapshot.hasData) return const Text('Checking prepared formats…');
      final rows = snapshot.data!;
      if (rows.isEmpty) return const Text('No prepared media for this story.');
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          DropdownButton<String>(
            icon: const Icon(Icons.expand_more),
            isExpanded: true,
            value: block,
            hint: const Text('Choose a section for Listen / Watch / Clips'),
            items: [
              for (final b in widget.article.blocks)
                DropdownMenuItem(
                  value: b['id'],
                  child: Text(
                    b['heading'],
                    maxLines: 1,
                    overflow: TextOverflow.ellipsis,
                  ),
                ),
            ],
            onChanged: busy ? null : (id) => setState(() => block = id),
          ),
          if (error != null) Text(error!),
          Wrap(
            spacing: 8,
            children: [
              for (final kind in ['radio', 'broadcast', 'clip'])
                Builder(
                  builder: (context) {
                    Programme? chosen;
                    Json? segment;
                    for (final p in rows.where((p) => p.kind == kind)) {
                      final matches = p.segments.where(
                        (s) =>
                            s['articleSlug'] == widget.article.slug &&
                            s['articleVersionId'] ==
                                widget.article.raw['versionId'] &&
                            (block == null ||
                                (s['blockIds'] as List).contains(block)),
                      );
                      if (matches.isNotEmpty) {
                        chosen = p;
                        segment = matches.first;
                        break;
                      }
                    }
                    return OutlinedButton.icon(
                      onPressed: busy || chosen == null
                          ? null
                          : () => open(chosen!, segment!),
                      icon: Icon(
                        kind == 'radio'
                            ? Icons.headphones
                            : kind == 'clip'
                            ? Icons.smart_display_outlined
                            : Icons.live_tv,
                      ),
                      label: Text(
                        kind == 'radio'
                            ? 'Listen'
                            : kind == 'clip'
                            ? 'Clip'
                            : 'Watch',
                      ),
                    );
                  },
                ),
            ],
          ),
          const Text(
            'Prepared formats open paused at the mapped section. Unmapped sections stay unavailable.',
          ),
        ],
      );
    },
  );
}
