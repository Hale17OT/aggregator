import 'dart:math';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'main.dart';

class CodeSignInPage extends StatefulWidget {
  const CodeSignInPage({super.key});
  @override
  State<CodeSignInPage> createState() => _CodeSignInState();
}

class _CodeSignInState extends State<CodeSignInPage> {
  final email = TextEditingController(), code = TextEditingController();
  final proof = List<int>.generate(
    32,
    (_) => Random.secure().nextInt(256),
  ).map((v) => v.toRadixString(16).padLeft(2, '0')).join();
  String? challenge, message;
  bool busy = false;
  late final int epoch;
  @override
  void initState() {
    super.initState();
    epoch = ++member.authEpoch;
  }

  @override
  void dispose() {
    email.dispose();
    code.dispose();
    if (member.authEpoch == epoch) member.authEpoch++;
    super.dispose();
  }

  Future<void> send() async {
    if (busy) return;
    setState(() => busy = true);
    try {
      final result = await api.request(
        '/api/v1/native/auth/code/request',
        method: 'POST',
        body: {'email': email.text.trim(), 'proof': proof},
      );
      if (!mounted || epoch != member.authEpoch) return;
      setState(() {
        challenge = result['id'];
        message = result['message'];
        code.clear();
      });
    } catch (_) {
      if (mounted) {
        setState(
          () => message =
              'Code request unavailable. Use an example.test address and try again.',
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  Future<void> confirm() async {
    if (busy || challenge == null) return;
    setState(() => busy = true);
    try {
      final result = await api.request(
        '/api/v1/native/auth/code/confirm',
        method: 'POST',
        body: {'id': challenge, 'proof': proof, 'code': code.text},
      );
      if (!mounted || epoch != member.authEpoch) return;
      await member.acceptCodeCredential(result['credential'], epoch);
    } catch (_) {
      if (mounted) {
        setState(
          () => message =
              'Code unavailable, expired or attempts exhausted. Request another after 60 seconds.',
        );
      }
    } finally {
      if (mounted) setState(() => busy = false);
    }
  }

  @override
  Widget build(BuildContext context) => ListView(
    padding: const EdgeInsets.all(24),
    children: [
      Text(
        'Local email code',
        style: Theme.of(context).textTheme.headlineLarge,
      ),
      const Text(
        'Local demonstration only. Messages are captured on this workstation at 127.0.0.1:8025; no external email is sent. Complete sign-in here with the eight-digit code.',
      ),
      TextField(
        controller: email,
        enabled: !busy,
        keyboardType: TextInputType.emailAddress,
        decoration: const InputDecoration(labelText: 'example.test email'),
      ),
      OutlinedButton(
        onPressed: busy ? null : send,
        child: Text(challenge == null ? 'Request code' : 'Request a new code'),
      ),
      if (challenge != null) ...[
        TextField(
          controller: code,
          enabled: !busy,
          keyboardType: TextInputType.number,
          autofillHints: const [AutofillHints.oneTimeCode],
          inputFormatters: [
            FilteringTextInputFormatter.digitsOnly,
            LengthLimitingTextInputFormatter(8),
          ],
          decoration: const InputDecoration(labelText: 'Eight-digit code'),
        ),
        FilledButton(
          onPressed: busy ? null : confirm,
          child: const Text('Complete sign-in'),
        ),
      ],
      if (busy) const LinearProgressIndicator(),
      if (message != null) Text(message!, semanticsLabel: message),
    ],
  );
}
