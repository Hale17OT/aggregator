package test.example.aggregator.aggregator_mobile

import com.ryanheise.audioservice.AudioServiceActivity
import android.content.Intent
import io.flutter.embedding.engine.FlutterEngine
import io.flutter.plugin.common.MethodChannel

class MainActivity : AudioServiceActivity() {
    override fun configureFlutterEngine(flutterEngine: FlutterEngine) {
        super.configureFlutterEngine(flutterEngine)
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
