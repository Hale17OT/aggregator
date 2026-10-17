package test.example.aggregator.aggregator_mobile

import com.ryanheise.audioservice.AudioServiceActivity
import android.content.Intent
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.CustomCredential
import androidx.credentials.ClearCredentialStateRequest
import androidx.credentials.exceptions.GetCredentialCancellationException
import com.google.android.libraries.identity.googleid.GetSignInWithGoogleOption
import com.google.android.libraries.identity.googleid.GoogleIdTokenCredential
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.SupervisorJob
import kotlinx.coroutines.cancel
import kotlinx.coroutines.launch

class MainActivity : AudioServiceActivity() {
    private val identityScope = CoroutineScope(SupervisorJob() + Dispatchers.Main)
    private var identityBusy = false
    override fun onDestroy() { identityScope.cancel(); super.onDestroy() }
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "aggregator/google-identity").setMethodCallHandler { call, result ->
            if (call.method == "signOut") {
                identityScope.launch {
                    try {
                        CredentialManager.create(this@MainActivity).clearCredentialState(ClearCredentialStateRequest())
                        result.success(null)
                    } catch (_: Exception) {
                        result.error("clear_failed", "Google sign-in state could not be cleared", null)
                    }
                }
                return@setMethodCallHandler
            }
            val nonce = call.argument<String>("nonce")
            val audience = call.argument<String>("serverClientId")
            if (call.method != "signIn" || nonce == null || !nonce.matches(Regex("[a-f0-9]{64}")) ||
                audience != "561423491735-1vddcmrfjfmghq4n16kofsg1taktpp2a.apps.googleusercontent.com") {
                result.error("invalid_request", "Invalid identity request", null)
            } else if (identityBusy) {
                result.error("in_progress", "An account selector is already open", null)
            } else {
                identityBusy = true
                identityScope.launch {
                    try {
                        val option = GetSignInWithGoogleOption.Builder(audience).setNonce(nonce).build()
                        val request = GetCredentialRequest.Builder().addCredentialOption(option).build()
                        val credential = CredentialManager.create(this@MainActivity).getCredential(this@MainActivity, request).credential
                        if (credential !is CustomCredential || credential.type != GoogleIdTokenCredential.TYPE_GOOGLE_ID_TOKEN_CREDENTIAL) {
                            result.error("unsupported_credential", "Google credential unavailable", null)
                        } else {
                            result.success(GoogleIdTokenCredential.createFrom(credential.data).idToken)
                        }
                    } catch (_: GetCredentialCancellationException) {
                        result.error("cancelled", "Sign-in cancelled", null)
                    } catch (_: Exception) {
                        result.error("unavailable", "Google sign-in unavailable", null)
                    } finally { identityBusy = false }
                }
            }
        }
        MethodChannel(flutterEngine.dartExecutor.binaryMessenger, "aggregator/local-share").setMethodCallHandler { call, result ->
            val url = call.argument<String>("url")
            if (call.method != "share" || url == null || !url.matches(Regex("http://127\\.0\\.0\\.1:3000/clips/[a-zA-Z0-9_-]+"))) {
                result.error("invalid_link", "Only local public clip links can be shared", null)
            } else {
                try {
                    startActivity(Intent.createChooser(Intent(Intent.ACTION_SEND).apply {
                        type = "text/plain"
                        putExtra(Intent.EXTRA_TEXT, url)
                    }, "Share local Clip"))
                    result.success(null)
                } catch (e: Exception) { result.error("share_unavailable", "Share sheet unavailable", null) }
            }
        }
    }
}
