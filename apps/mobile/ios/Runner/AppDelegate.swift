import Flutter
import UIKit
import GoogleSignIn

@main
@objc class AppDelegate: FlutterAppDelegate {
  private var googleBusy = false
  override func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?
  ) -> Bool {
    GeneratedPluginRegistrant.register(with: self)
    if let controller = window?.rootViewController as? FlutterViewController {
      let channel = FlutterMethodChannel(name: "aggregator/google-identity", binaryMessenger: controller.binaryMessenger)
      channel.setMethodCallHandler { [weak self, weak controller] call, result in
        guard let self = self, let controller = controller else { return }
        if call.method == "signOut" { GIDSignIn.sharedInstance.signOut(); result(nil); return }
        guard call.method == "signIn", let args = call.arguments as? [String: String],
          let nonce = args["nonce"], nonce.range(of: "^[a-f0-9]{64}$", options: .regularExpression) != nil,
          args["serverClientId"] == "561423491735-1vddcmrfjfmghq4n16kofsg1taktpp2a.apps.googleusercontent.com" else {
          result(FlutterError(code: "invalid_request", message: "Invalid identity request", details: nil)); return
        }
        guard !self.googleBusy else { result(FlutterError(code: "in_progress", message: "Sign-in already open", details: nil)); return }
        self.googleBusy = true
        GIDSignIn.sharedInstance.configuration = GIDConfiguration(
          clientID: "561423491735-h4qbut1m4qu5o5qo6n62mqdl0jmjdk8d.apps.googleusercontent.com",
          serverClientID: args["serverClientId"])
        GIDSignIn.sharedInstance.signIn(withPresenting: controller, hint: nil, additionalScopes: nil, nonce: nonce) { response, error in
          self.googleBusy = false
          if let token = response?.user.idToken?.tokenString { result(token) }
          else { result(FlutterError(code: (error as NSError?)?.code == -5 ? "cancelled" : "unavailable", message: "Google sign-in did not finish", details: nil)) }
        }
      }
    }
    return super.application(application, didFinishLaunchingWithOptions: launchOptions)
  }
  override func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
    if GIDSignIn.sharedInstance.handle(url) { return true }
    return super.application(app, open: url, options: options)
  }
}
