import 'dart:async';
import 'dart:convert';
import 'dart:io';
import 'package:flutter_test/flutter_test.dart';
import 'package:aggregator_mobile/data.dart';

class BodyResponse extends Fake implements HttpClientResponse {
  BodyResponse(this.body);
  final Stream<List<int>> body;
  @override
  StreamSubscription<List<int>> listen(
    void Function(List<int>)? onData, {
    Function? onError,
    void Function()? onDone,
    bool? cancelOnError,
  }) => body.listen(
    onData,
    onError: onError,
    onDone: onDone,
    cancelOnError: cancelOnError,
  );
}

void main() {
  test(
    'Cancelling a caption body releases a stalled response subscription',
    () async {
      var cancelled = false;
      final body = StreamController<List<int>>(
        onCancel: () {
          cancelled = true;
        },
      );
      final token = CaptionCancellation();
      final read = readResponseBody(
        BodyResponse(body.stream),
        1000000,
        cancellation: token,
      );
      body.add(utf8.encode('WEBVTT\n'));
      await Future<void>.delayed(Duration.zero);
      token.cancel();
      await read.timeout(const Duration(seconds: 1));
      expect(cancelled, isTrue);
      await body.close();
    },
  );
  test(
    'Complete caption body is preserved and cancellation is released',
    () async {
      final token = CaptionCancellation();
      const value = 'WEBVTT\n\n00:00.000 --> 00:01.000\nFictional report\n';
      final read = await readResponseBody(
        BodyResponse(Stream.value(utf8.encode(value))),
        1000000,
        cancellation: token,
      );
      expect(read, value);
      token.cancel();
    },
  );
}
