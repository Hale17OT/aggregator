import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:flutter_svg/flutter_svg.dart';
import 'main.dart';
import 'data.dart';
import 'paper_turn.dart';
import 'format_links.dart';

Future<void> openOriginal(String value) async {
  final uri = Uri.tryParse(value);
  if (uri == null ||
      uri.scheme != 'https' ||
      uri.userInfo.isNotEmpty ||
      uri.host.isEmpty) {
    throw const FormatException('Unsafe source URL');
  }
  await launchUrl(uri, mode: LaunchMode.externalApplication);
}

class HomePage extends StatefulWidget {
  final Map<String, String> query;
  final String defaultMode;
  const HomePage({
    super.key,
    required this.query,
    this.defaultMode = 'editorial',
  });
  @override
  State<HomePage> createState() => _HomeState();
}

class _HomeState extends State<HomePage> {
  late Future<Json> edition;
  final search = TextEditingController();
  final scroll = ScrollController();
  late final Future<List<String>> desks = api
      .request('/api/v1/articles')
      .then(
        (rows) =>
            (rows as List).map((a) => a['topic'] as String).toSet().toList()
              ..sort(),
      );
  int direction = 1;
  @override
  void initState() {
    super.initState();
    load();
  }

  @override
  void didUpdateWidget(HomePage old) {
    super.didUpdateWidget(old);
    if (old.query.toString() != widget.query.toString() ||
        old.defaultMode != widget.defaultMode) {
      load();
    }
  }

  void load() {
    search.text = widget.query['q'] ?? '';
    final query = {...widget.query}..remove('mode');
    final following =
        (widget.query['mode'] ?? widget.defaultMode) == 'following';
    edition = api
        .request(
          '/api/v1/${following ? 'me/' : ''}edition${query.isEmpty ? '' : '?${Uri(queryParameters: query).query}'}',
          member: following,
        )
        .then((v) => v as Json);
  }

  void scope(String key, String value) {
    if (scroll.hasClients) scroll.jumpTo(0);
    final q = {...widget.query}
      ..remove('edition')
      ..remove('page');
    if (value.isEmpty) {
      q.remove(key);
    } else {
      q[key] = value;
    }
    context.go(Uri(path: '/', queryParameters: q).toString());
  }

  @override
  void dispose() {
    search.dispose();
    scroll.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) => FutureBuilder<Json>(
    future: edition,
    builder: (context, s) {
      if (s.hasError) return FailureView(s.error!, () => setState(load));
      if (!s.hasData) return const Center(child: CircularProgressIndicator());
      final data = s.data!, meta = data['meta'] as Json;
      final rows = (data['data'] as List).cast<Json>();
      return RefreshIndicator(
        onRefresh: () async {
          setState(load);
          await edition;
        },
        child: ListView(
          controller: scroll,
          padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
          children: [
            const Center(
              child: Text(
                'THE LOCAL DEMONSTRATION EDITION',
                style: TextStyle(fontSize: 11, letterSpacing: 1.2),
              ),
            ),
            const Divider(thickness: 2),
            Wrap(
              spacing: 8,
              children: [
                ChoiceChip(
                  label: const Text('Editorial'),
                  selected:
                      (widget.query['mode'] ?? widget.defaultMode) !=
                      'following',
                  onSelected: (_) => scope('mode', 'editorial'),
                ),
                ChoiceChip(
                  label: const Text('Following'),
                  selected:
                      (widget.query['mode'] ?? widget.defaultMode) ==
                      'following',
                  onSelected: (_) => scope('mode', 'following'),
                ),
              ],
            ),
            TextField(
              controller: search,
              decoration: InputDecoration(
                hintText: 'Search the whole edition',
                suffixIcon: IconButton(
                  tooltip: 'Search articles',
                  onPressed: () => scope('q', search.text),
                  icon: const Icon(Icons.search),
                ),
              ),
              onSubmitted: (v) => scope('q', v),
            ),
            const SizedBox(height: 12),
            FutureBuilder<List<String>>(
              future: desks,
              builder: (context, topics) {
                if (topics.hasError) {
                  return const Text(
                    'Topic navigation unavailable. Search remains available.',
                  );
                }
                if (!topics.hasData) return const Text('Loading topics…');
                return DropdownButtonFormField<String>(
                  isExpanded: true,
                  icon: const Icon(Icons.expand_more),
                  key: ValueKey(widget.query['topic']),
                  initialValue: widget.query['topic'] ?? '',
                  decoration: const InputDecoration(labelText: 'Topic'),
                  items: [
                    if (widget.query['topic'] != null &&
                        !topics.data!.any(
                          (name) =>
                              name.toLowerCase().replaceAll(
                                RegExp('[^a-z0-9]+'),
                                '-',
                              ) ==
                              widget.query['topic'],
                        ))
                      DropdownMenuItem(
                        value: widget.query['topic'],
                        child: Text('Topic: ${widget.query['topic']}'),
                      ),
                    const DropdownMenuItem(
                      value: '',
                      child: Text('All topics'),
                    ),
                    for (final name in topics.data ?? <String>[])
                      DropdownMenuItem(
                        value: name.toLowerCase().replaceAll(
                          RegExp('[^a-z0-9]+'),
                          '-',
                        ),
                        child: Text(name),
                      ),
                  ],
                  onChanged: topics.hasData
                      ? (value) => scope('topic', value!)
                      : null,
                );
              },
            ),
            const Divider(),
            Text(
              '${meta['total']} matching stories • Page ${meta['page']} of ${meta['pages']}',
              style: Theme.of(context).textTheme.labelMedium,
            ),
            if (rows.isEmpty)
              const Padding(
                padding: EdgeInsets.all(24),
                child: Text(
                  'No eligible stories match this selection. Clear a filter to explore the edition.',
                ),
              ),
            PaperTurn(
              spreadKey: '${meta['token']}:${meta['page']}',
              direction: direction,
              child: Column(
                children: [
                  for (final row in rows)
                    if (row['article'] != null)
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          if (row['reason']?['label'] != null)
                            Text(
                              'Because you follow ${row['reason']['label']}',
                            ),
                          StoryTile(Article(row['article'])),
                        ],
                      ),
                ],
              ),
            ),
            const SizedBox(height: 18),
            Wrap(
              alignment: WrapAlignment.spaceBetween,
              spacing: 12,
              runSpacing: 8,
              children: [
                OutlinedButton.icon(
                  onPressed: meta['page'] > 1 ? () => page(meta, -1) : null,
                  icon: const Icon(Icons.arrow_back),
                  label: const Text('Previous'),
                ),
                FilledButton.icon(
                  onPressed: meta['page'] < meta['pages']
                      ? () => page(meta, 1)
                      : null,
                  icon: const Icon(Icons.arrow_forward),
                  label: const Text('Next'),
                ),
              ],
            ),
            const SizedBox(height: 20),
            const Text(
              'Fictional sources and local synthetic media. No live news ingestion.',
              textAlign: TextAlign.center,
            ),
          ],
        ),
      );
    },
  );
  void page(Json m, int direction) {
    this.direction = direction;
    // Reveal the incoming spread instead of leaving the reader at its footer.
    if (scroll.hasClients) scroll.jumpTo(0);
    context.go(
      Uri(
        path: '/',
        queryParameters: {
          ...widget.query,
          'page': '${m['page'] + direction}',
          'edition': m['token'],
        },
      ).toString(),
    );
  }
}

class StoryTile extends StatelessWidget {
  final Article article;
  const StoryTile(this.article, {super.key});
  @override
  Widget build(BuildContext context) => Padding(
    padding: const EdgeInsets.symmetric(vertical: 18),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Text(
          article.raw['topic'].toString().toUpperCase(),
          style: Theme.of(context).textTheme.labelSmall,
        ),
        const SizedBox(height: 6),
        InkWell(
          onTap: () => context.push('/article/${article.slug}'),
          child: Text(
            article.title,
            style: Theme.of(context).textTheme.headlineMedium,
          ),
        ),
        const SizedBox(height: 8),
        Text(article.raw['deck'], style: Theme.of(context).textTheme.bodyLarge),
        const SizedBox(height: 10),
        TextButton.icon(
          onPressed: () => context.push('/article/${article.slug}'),
          icon: const Icon(Icons.arrow_forward, size: 18),
          label: const Text('Read with sources'),
        ),
        const Divider(),
      ],
    ),
  );
}

class ArticlePage extends StatefulWidget {
  final String slug;
  final String? section;
  const ArticlePage({super.key, required this.slug, this.section});
  @override
  State<ArticlePage> createState() => _ArticleState();
}

class _ArticleState extends State<ArticlePage> {
  late Future<Article> article;
  String variant = 'standard';
  final sourcesKey = GlobalKey();
  final sectionKeys = <String, GlobalKey>{};
  String? locatedVersion;
  @override
  void initState() {
    super.initState();
    load();
  }

  void load() {
    article = api
        .request(
          '/api/v1/articles/${Uri.encodeComponent(widget.slug)}?variant=$variant',
        )
        .then((a) => Article(a));
  }

  @override
  Widget build(BuildContext context) => FutureBuilder<Article>(
    future: article,
    builder: (context, s) {
      if (s.hasError) return FailureView(s.error!, () => setState(load));
      if (!s.hasData) return const Center(child: CircularProgressIndicator());
      final a = s.data!;
      for (final b in a.blocks) {
        sectionKeys.putIfAbsent(b['id'], () => GlobalKey());
      }
      if (widget.section != null && locatedVersion != a.raw['versionId']) {
        locatedVersion = a.raw['versionId'];
        WidgetsBinding.instance.addPostFrameCallback((_) {
          if (!mounted) return;
          final target = sectionKeys[widget.section]?.currentContext;
          if (target != null) Scrollable.ensureVisible(target);
        });
      }
      return SelectionArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(a.raw['topic'].toString().toUpperCase()),
              const SizedBox(height: 12),
              Semantics(
                header: true,
                child: Text(
                  a.title,
                  style: Theme.of(context).textTheme.headlineLarge,
                ),
              ),
              const SizedBox(height: 14),
              Text(a.raw['deck'], style: Theme.of(context).textTheme.bodyLarge),
              Wrap(
                spacing: 8,
                children: [
                  TextButton(
                    onPressed: () => Scrollable.ensureVisible(
                      sourcesKey.currentContext!,
                      duration: const Duration(milliseconds: 250),
                    ),
                    child: const Text('Sources ↓'),
                  ),
                  TextButton(
                    onPressed: () => setState(() {
                      variant = variant == 'standard' ? 'brief' : 'standard';
                      load();
                    }),
                    child: Text(
                      variant == 'standard' ? 'Read brief' : 'Read standard',
                    ),
                  ),
                  TextButton.icon(
                    onPressed: () => save(a),
                    icon: const Icon(Icons.bookmark_add_outlined),
                    label: const Text('Save'),
                  ),
                ],
              ),
              FormatLinks(a, key: ValueKey(a.raw['versionId'])),
              if (widget.section != null &&
                  !a.blocks.any((b) => b['id'] == widget.section))
                const Text(
                  'The linked section is unavailable in this version. The complete current article remains below.',
                ),
              if (a.raw['leadMedia'] != null) Illustration(a.raw['leadMedia']),
              if (a.raw['correction'] != null)
                Text(
                  a.raw['correction'],
                  style: const TextStyle(fontWeight: FontWeight.bold),
                ),
              const Divider(),
              for (final b in a.blocks) ...[
                Semantics(
                  key: sectionKeys[b['id']],
                  header: true,
                  child: Padding(
                    padding: const EdgeInsets.only(top: 22, bottom: 10),
                    child: Text(
                      b['heading'],
                      style: Theme.of(context).textTheme.titleLarge,
                    ),
                  ),
                ),
                Text(b['text'], style: Theme.of(context).textTheme.bodyLarge),
                Wrap(
                  children: [
                    for (final id in b['sourceIds'])
                      TextButton(
                        onPressed: () => showSources(
                          context,
                          a.sources.where((s) => s['id'] == id).toList(),
                        ),
                        child: Text(
                          '[${a.sources.firstWhere((s) => s['id'] == id)['ordinal']}]',
                        ),
                      ),
                  ],
                ),
                for (final item in (a.raw['inlineMedia'] as List))
                  if ((item['afterBlockIds'] as List).contains(b['id']))
                    Illustration(item['media']),
              ],
              const Divider(),
              Semantics(
                header: true,
                child: Text(
                  'Sources',
                  key: sourcesKey,
                  style: Theme.of(context).textTheme.headlineMedium,
                ),
              ),
              for (final s in a.sources) SourceTile(s),
              const SizedBox(height: 20),
              Text(
                a.raw['disclosure'],
                style: Theme.of(context).textTheme.labelSmall,
              ),
            ],
          ),
        ),
      );
    },
  );
  Future<void> save(Article a) async {
    try {
      await api.request(
        '/api/v1/me/bookmarks/${a.raw['id']}',
        method: 'PUT',
        body: {},
        member: true,
      );
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(const SnackBar(content: Text('Saved to your Library')));
      }
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(
          context,
        ).showSnackBar(SnackBar(content: Text(e.toString())));
      }
    }
  }
}

class Illustration extends StatelessWidget {
  final Json item;
  const Illustration(this.item, {super.key});
  @override
  Widget build(BuildContext context) {
    if (item['availability'] != 'available' ||
        item['displayPermitted'] != true) {
      return Text('Illustration unavailable: ${item['alt']}');
    }
    final path = item['src'] as String;
    final url = api.illustration(path).toString();
    return Column(
      children: [
        if (path.endsWith('.svg'))
          SvgPicture.network(
            url,
            semanticsLabel: item['alt'],
            placeholderBuilder: (_) => const SizedBox(
              height: 100,
              child: Center(child: CircularProgressIndicator()),
            ),
          )
        else
          Image.network(
            url,
            semanticLabel: item['alt'],
            errorBuilder: (c, e, s) => Text(item['alt']),
          ),
        Text(
          '${item['caption']} • ${item['credit']}',
          style: Theme.of(context).textTheme.labelSmall,
        ),
      ],
    );
  }
}

class SourceTile extends StatelessWidget {
  final Json source;
  const SourceTile(this.source, {super.key});
  @override
  Widget build(BuildContext context) => ListTile(
    contentPadding: EdgeInsets.zero,
    title: Text('[${source['ordinal']}] ${source['title']}'),
    subtitle: Text(
      '${source['publisher']} • ${source['role'] ?? 'Evidence'}${source['availability'] == 'unavailable' ? ' • original unavailable' : ''}\n${source['url']}',
    ),
    trailing: const Icon(Icons.open_in_new),
    onTap: () => openOriginal(source['url']),
  );
}

void showSources(BuildContext context, List<Json> sources) {
  showModalBottomSheet<void>(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    builder: (context) => SafeArea(
      child: SizedBox(
        height: MediaQuery.sizeOf(context).height * .65,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text(
              'Original sources',
              style: Theme.of(context).textTheme.headlineMedium,
            ),
            for (final s in sources) SourceTile(s),
          ],
        ),
      ),
    ),
  );
}
