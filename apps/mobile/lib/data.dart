import 'dart:convert';
import 'dart:io';
import 'dart:async';
import 'dart:typed_data';

typedef Json = Map<String, dynamic>;

class CaptionCancellation {
  bool cancelled = false;
  void Function()? _abort;
  void attach(void Function() abort) {
    if (cancelled) {
      abort();
    } else {
      _abort = abort;
    }
  }

  void release() => _abort = null;
  void cancel() {
    cancelled = true;
    final abort = _abort;
    _abort = null;
    abort?.call();
  }
}

class ApiFailure implements Exception {
  final int status;
  final String code;
  ApiFailure(this.status, this.code);
  @override
  String toString() => status == 0
      ? 'The local service is unavailable. Your changes have not been saved.'
      : '$code ($status)';
}

Future<String> readResponseBody(
  HttpClientResponse response,
  int limit, {
  CaptionCancellation? cancellation,
}) async {
  final input = StreamIterator<List<int>>(response);
  cancellation?.attach(() => unawaited(input.cancel()));
  final bytes = BytesBuilder(copy: false), elapsed = Stopwatch()..start();
  try {
    while (await input.moveNext().timeout(
      const Duration(seconds: 15) - elapsed.elapsed,
    )) {
      if (bytes.length + input.current.length > limit) {
        throw ApiFailure(502, 'RESPONSE_TOO_LARGE');
      }
      bytes.add(input.current);
    }
    return utf8.decode(bytes.takeBytes());
  } finally {
    await input.cancel();
    cancellation?.release();
  }
}

Future<T> withFreshConnection<T>(
  Future<T> Function(HttpClient) operation,
) async {
  final fresh = HttpClient()..connectionTimeout = const Duration(seconds: 10);
  try {
    return await operation(fresh);
  } finally {
    fresh.close(force: true);
  }
}

// A server may close an idle pooled socket just as a read reuses it.
// Retry only this precise pre-header failure, once, on an isolated connection.
Future<T> readWithFreshConnection<T>(
  HttpClient shared,
  Future<T> Function(HttpClient) read,
  bool Function() current,
) async {
  try {
    return await read(shared);
  } on HttpException catch (e) {
    if (!e.message.contains('Connection closed before full header') ||
        !current()) {
      rethrow;
    }
    return withFreshConnection(read);
  }
}

class Api {
  ApiFailure? lastFailure;
  int requestSequence = 0;
  int? lastFailureAttempt;
  String? lastFailureOperation;
  void rememberFailure(ApiFailure failure, int attempt, String operation) {
    // One bounded diagnostic record, without URL, payload or credentials.
    lastFailure = ApiFailure(
      failure.status,
      RegExp(r'^[A-Z0-9_]{1,64}$').hasMatch(failure.code)
          ? failure.code
          : 'UNCLASSIFIED_FAILURE',
    );
    lastFailureAttempt = attempt;
    lastFailureOperation = operation;
  }

  Future<String> readBody(
    HttpClientResponse response,
    int limit, {
    CaptionCancellation? cancellation,
  }) => readResponseBody(response, limit, cancellation: cancellation);

  static const demo = bool.fromEnvironment('LOCAL_DEMO');
  static final base = Uri.parse('http://127.0.0.1:4000');
  final HttpClient _client = HttpClient()
    ..connectionTimeout = const Duration(seconds: 10);
  String? credential;
  int generation = 0;
  Api() {
    if (!demo) {
      throw StateError(
        'Only the explicitly selected local-demo transport is configured. Production is unavailable.',
      );
    }
  }
  Uri asset(String path) {
    if (!RegExp(r'^/api/v1/programme-assets/[a-f0-9]{64}$').hasMatch(path)) {
      throw const FormatException('Unsafe media destination');
    }
    return base.resolve(path);
  }

  Uri illustration(String path) {
    if (!RegExp(r'^/media/[a-z0-9.-]+$').hasMatch(path)) {
      throw const FormatException('Unsafe illustration');
    }
    return Uri.parse('http://127.0.0.1:3000').resolve(path);
  }

  void clear() {
    credential = null;
    generation++;
  }

  Api forRevocation() => Api()..credential = credential;

  Future<dynamic> request(
    String path, {
    String method = 'GET',
    Json? body,
    bool member = false,
  }) async {
    if (!path.startsWith('/api/v1/') || path.contains('..')) {
      throw const FormatException('Invalid API route');
    }
    final epoch = generation;
    final bearer = credential;
    final attempt = ++requestSequence;
    final operation = path == '/api/v1/native/auth/start'
        ? 'native-sign-in-start'
        : method == 'GET'
        ? 'read'
        : 'write';
    Future<dynamic> perform(HttpClient transport) async {
      final r = await transport
          .openUrl(
            method,
            base.resolve(
              member ? path.replaceFirst('/api/v1/', '/api/v1/native/') : path,
            ),
          )
          .timeout(const Duration(seconds: 12));
      if (epoch != generation) {
        r.abort();
        throw ApiFailure(409, 'IDENTITY_CHANGED');
      }
      r.followRedirects = false;
      r.headers.set('Accept', 'application/json');
      if (member) {
        if (bearer == null) {
          r.abort();
          throw ApiFailure(401, 'SIGN_IN_REQUIRED');
        }
        r.headers.set('Authorization', 'Bearer $bearer');
      }
      if (body != null) {
        r.headers.contentType = ContentType.json;
        r.write(jsonEncode(body));
      }
      final response = await r.close().timeout(const Duration(seconds: 15));
      final buffer = await readBody(response, 4000000);
      if (epoch != generation) throw ApiFailure(409, 'IDENTITY_CHANGED');
      final value = buffer.isEmpty ? <String, dynamic>{} : jsonDecode(buffer);
      if (response.statusCode < 200 || response.statusCode >= 300) {
        throw ApiFailure(
          response.statusCode,
          value['error'] is Map
              ? value['error']['code'] ?? 'REQUEST_FAILED'
              : 'REQUEST_FAILED',
        );
      }
      return value['data'];
    }

    try {
      return method == 'GET' && body == null
          ? await readWithFreshConnection(
              _client,
              perform,
              () => epoch == generation,
            )
          // Writes run once on a fresh connection; never retry uncertain writes.
          : await withFreshConnection(perform);
    } on ApiFailure catch (e) {
      rememberFailure(e, attempt, operation);
      rethrow;
    } on SocketException {
      final failure = ApiFailure(0, 'NETWORK_UNAVAILABLE');
      rememberFailure(failure, attempt, operation);
      throw failure;
    } on HttpException catch (e) {
      final failure = ApiFailure(
        0,
        e.message.contains('Connection closed before full header')
            ? 'CONNECTION_CLOSED_BEFORE_HEADERS'
            : 'HTTP_TRANSPORT_FAILURE',
      );
      rememberFailure(failure, attempt, operation);
      throw failure;
    }
  }

  Future<String> captions(
    String path, {
    CaptionCancellation? cancellation,
  }) async {
    final epoch = generation;
    Future<String> perform(HttpClient transport) async {
      if (cancellation?.cancelled == true || epoch != generation) {
        throw ApiFailure(409, 'REQUEST_CANCELLED');
      }
      final r = await transport.getUrl(asset(path));
      cancellation?.attach(() => r.abort());
      try {
        r.followRedirects = false;
        final response = await r.close().timeout(const Duration(seconds: 15));
        if (response.statusCode != 200) {
          throw ApiFailure(response.statusCode, 'CAPTIONS_UNAVAILABLE');
        }
        final text = await readBody(
          response,
          1000000,
          cancellation: cancellation,
        );
        if (!text.startsWith('WEBVTT')) {
          throw const FormatException('Invalid captions');
        }
        return text;
      } finally {
        cancellation?.release();
      }
    }

    return readWithFreshConnection(
      _client,
      perform,
      () => cancellation?.cancelled != true && epoch == generation,
    );
  }
}

class Article {
  final Json raw;
  Article(this.raw) {
    for (final key in ['id', 'versionId', 'slug', 'headline', 'deck']) {
      if (raw[key] is! String) throw FormatException('Article missing $key');
    }
    if (raw['blocks'] is! List || raw['sources'] is! List) {
      throw const FormatException('Article attribution missing');
    }
  }
  String get slug => raw['slug'];
  String get title => raw['headline'];
  List<Json> get blocks => (raw['blocks'] as List).cast<Json>();
  List<Json> get sources => (raw['sources'] as List).cast<Json>();
}

int preferredProgrammeIndex(
  List<Programme> rows, {
  String? requestedId,
  int anchorCount = 1,
  String treatment = 'narration_over_visual',
}) {
  final explicit = rows.indexWhere((p) => p.id == requestedId);
  if (explicit >= 0) return explicit;
  final variant = anchorCount == 2 ? 'duo' : 'solo';
  final exact = rows.indexWhere(
    (p) => p.raw['variant'] == variant && p.raw['mediaTreatment'] == treatment,
  );
  if (exact >= 0) return exact;
  final anchors = rows.indexWhere((p) => p.raw['variant'] == variant);
  return anchors < 0 ? 0 : anchors;
}

class Programme {
  final Json raw;
  Programme(this.raw) {
    if (raw['programmeId'] is! String ||
        raw['renditionKey'] is! String ||
        raw['durationMs'] is! num ||
        raw['segments'] is! List ||
        raw['sources'] is! List) {
      throw const FormatException('Invalid programme');
    }
  }
  String get id => raw['programmeId'];
  String get title => raw['title'];
  String get kind => raw['kind'];
  Duration get duration =>
      Duration(milliseconds: (raw['durationMs'] as num).toInt());
  Json? get video => raw['videoRendition'];
  List<Json> get chapters => (raw['chapters'] as List).cast<Json>();
  List<Json> get segments => (raw['segments'] as List).cast<Json>();
  List<Json> get sources => (raw['sources'] as List).cast<Json>();
}
