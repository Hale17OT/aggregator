import 'dart:io';
import 'dart:convert';
import 'package:flutter_test/flutter_test.dart';
import 'package:aggregator_mobile/data.dart';

void main() {
  test('A fresh write connection executes once even if headers fail', () async {
    var calls = 0;
    await expectLater(
      withFreshConnection((_) async {
        calls++;
        throw const HttpException(
          'Connection closed before full header was received',
        );
      }),
      throwsA(isA<HttpException>()),
    );
    expect(calls, 1);
  });
  test(
    'A real pre-header socket close gets one fresh read connection',
    () async {
      final server = await HttpServer.bind(InternetAddress.loopbackIPv4, 0);
      var requests = 0;
      server.listen((request) async {
        requests++;
        if (requests == 1) {
          final socket = await request.response.detachSocket(
            writeHeaders: false,
          );
          socket.destroy();
        } else {
          request.response.write('fictional response');
          await request.response.close();
        }
      });
      final shared = HttpClient();
      final clients = <HttpClient>[];
      try {
        final body = await readWithFreshConnection(shared, (client) async {
          clients.add(client);
          final request = await client.getUrl(
            Uri.parse('http://127.0.0.1:${server.port}/fictional'),
          );
          final response = await request.close();
          return response.transform(utf8.decoder).join();
        }, () => true);
        expect(body, 'fictional response');
        expect(requests, 2);
        expect(clients.length, 2);
        expect(identical(clients[0], clients[1]), isFalse);
      } finally {
        shared.close(force: true);
        await server.close(force: true);
      }
    },
  );
  for (final current in [true, false]) {
    test('Closed read retry is bounded, current=$current', () async {
      final shared = HttpClient();
      var calls = 0;
      try {
        await expectLater(
          readWithFreshConnection(shared, (_) async {
            calls++;
            throw const HttpException(
              'Connection closed before full header was received',
            );
          }, () => current),
          throwsA(isA<HttpException>()),
        );
        expect(calls, current ? 2 : 1);
      } finally {
        shared.close(force: true);
      }
    });
  }
  test(
    'Permission denial and unrelated transport errors never retry',
    () async {
      final shared = HttpClient();
      try {
        for (final error in [
          ApiFailure(403, 'WITHDRAWN'),
          const HttpException('Other failure'),
        ]) {
          var calls = 0;
          await expectLater(
            readWithFreshConnection(shared, (_) async {
              calls++;
              throw error;
            }, () => true),
            throwsA(same(error)),
          );
          expect(calls, 1);
        }
      } finally {
        shared.close(force: true);
      }
    },
  );
}
