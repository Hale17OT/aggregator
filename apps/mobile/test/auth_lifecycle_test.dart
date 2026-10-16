import 'dart:async';
import 'package:flutter_test/flutter_test.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import 'package:aggregator_mobile/data.dart';
import 'package:aggregator_mobile/member.dart';

class TestApi extends Fake implements Api {
  TestApi? retiring;
  Completer<void>? revocation;
  @override
  String? credential;
  @override
  int generation = 0;
  @override
  void clear() {
    credential = null;
    generation++;
  }

  @override
  Api forRevocation() => retiring ?? TestApi();
  @override
  Future<dynamic> request(
    String path, {
    String method = 'GET',
    Json? body,
    bool member = false,
  }) async {
    if (path.endsWith('/exchange')) return {'credential': 'opaque-native-test'};
    if (path.endsWith('/logout')) {
      await revocation?.future;
      return null;
    }
    if (path.endsWith('/session')) {
      return {
        'user': {'id': 'owner-a', 'displayName': 'A'},
      };
    }
    if (path.endsWith('/interests')) return {'status': 'completed'};
    throw StateError('Unexpected operation');
  }
}

class DelayedStorage extends FlutterSecureStorage {
  final entered = Completer<void>(), release = Completer<void>();
  String? value;
  @override
  Future<void> write({
    required String key,
    required String? value,
    AndroidOptions? aOptions,
    AppleOptions? iOptions,
    LinuxOptions? lOptions,
    WindowsOptions? wOptions,
    WebOptions? webOptions,
    AppleOptions? mOptions,
  }) async {
    entered.complete();
    await release.future;
    this.value = value;
  }

  @override
  Future<void> delete({
    required String key,
    AndroidOptions? aOptions,
    AppleOptions? iOptions,
    LinuxOptions? lOptions,
    WindowsOptions? wOptions,
    WebOptions? webOptions,
    AppleOptions? mOptions,
  }) async {
    value = null;
  }
}

void main() {
  test('A delayed logout never erases a later account B credential', () async {
    final retiring = TestApi()..revocation = Completer<void>();
    final api = TestApi()
      ..retiring = retiring
      ..credential = 'account-a';
    final storage = DelayedStorage()..value = 'account-a';
    storage.release.complete();
    final subject = MemberState(api, secureStorage: storage);
    final logout = subject.logout();
    await Future<void>.delayed(Duration.zero);
    subject.authEpoch++;
    subject.state = 'b-state';
    subject.pending = 'b-pending';
    subject.verifier = 'b-proof';
    await subject.callback(
      Uri.parse('aggregator-local://auth/callback?code=b-code&state=b-state'),
    );
    expect(storage.value, 'opaque-native-test');
    expect(api.credential, 'opaque-native-test');
    retiring.revocation!.complete();
    await logout;
    expect(storage.value, 'opaque-native-test');
    expect(api.credential, 'opaque-native-test');
    expect(subject.session, isNotNull);
    subject.dispose();
  });
  test('Logout during secure storage cannot resurrect account', () async {
    final api = TestApi(),
        storage = DelayedStorage(),
        member = MemberState(TestApi());
    final subject = MemberState(api, secureStorage: storage)
      ..state = 'valid-state'
      ..pending = 'pending'
      ..verifier = 'proof';
    final callback = subject.callback(
      Uri.parse('aggregator-local://auth/callback?code=code&state=valid-state'),
    );
    await storage.entered.future;
    final logout = subject.logout();
    storage.release.complete();
    await Future.wait([callback, logout]);
    expect(api.credential, isNull);
    expect(subject.session, isNull);
    expect(storage.value, isNull);
    member.dispose();
    subject.dispose();
  });
  test('Explicit callback port and unsolicited state are rejected', () async {
    final subject = MemberState(TestApi())
      ..state = 'valid-state'
      ..pending = 'pending'
      ..verifier = 'proof';
    await subject.callback(
      Uri.parse(
        'aggregator-local://auth:99/callback?code=code&state=valid-state',
      ),
    );
    expect(subject.session, isNull);
    expect(subject.error, contains('rejected'));
    await subject.callback(
      Uri.parse('aggregator-local://auth/callback?code=code&state=unrequested'),
    );
    expect(subject.session, isNull);
    subject.dispose();
  });
}
