plugins {
    id("com.android.application")
    id("kotlin-android")
    // The Flutter Gradle Plugin must be applied after the Android and Kotlin Gradle plugins.
    id("dev.flutter.flutter-gradle-plugin")
}

android {
    namespace = "test.example.aggregator.aggregator_mobile"
    compileSdk = flutter.compileSdkVersion
    ndkVersion = flutter.ndkVersion

    compileOptions {
        sourceCompatibility = JavaVersion.VERSION_17
        targetCompatibility = JavaVersion.VERSION_17
    }

    kotlinOptions {
        jvmTarget = JavaVersion.VERSION_17.toString()
    }

    defaultConfig {
        testInstrumentationRunner = "androidx.test.runner.AndroidJUnitRunner"
        // TODO: Specify your own unique Application ID (https://developer.android.com/studio/build/application-id.html).
        applicationId = "test.example.aggregator.aggregator_mobile"
        // You can update the following values to match your application needs.
        // For more information, see: https://flutter.dev/to/review-gradle-config.
        minSdk = flutter.minSdkVersion
        targetSdk = flutter.targetSdkVersion
        versionCode = flutter.versionCode
        versionName = flutter.versionName
    }

    flavorDimensions += "environment"
    productFlavors {
        create("localDemo") { dimension = "environment"; applicationIdSuffix = ".localdemo" }
        create("production") { dimension = "environment" }
    }

    buildTypes {
        release {
            // TODO: Add your own signing config for the release build.
            // Signing with the debug keys for now, so `flutter run --release` works.
            // No production signing identity is configured.
        }
    }
}

dependencies {
    implementation("androidx.credentials:credentials:1.5.0")
    implementation("androidx.credentials:credentials-play-services-auth:1.5.0")
    implementation("com.google.android.libraries.identity.googleid:googleid:1.1.1")
    constraints {
        // The installed integration_test SDK requests vulnerable 28.1-android.
        // Keep this repair local to the app graph; never rewrite the global SDK.
        add("implementation", "com.google.guava:guava:33.3.1-android") {
            version { strictly("33.3.1-android") }
            because("Patched Android Guava matching media3-common's requested version, without downgrading its runtime")
        }
        add("androidTestImplementation", "com.google.guava:guava:33.3.1-android") {
            version { strictly("33.3.1-android") }
            because("Keep instrumentation and the application on the same reviewed patched Guava runtime")
        }
        add("implementation", "junit:junit:4.13.2") {
            version { strictly("4.13.2") }
            because("Repair CVE-2020-15250 in the installed integration_test transitive runtime")
        }
        add("androidTestImplementation", "junit:junit:4.13.2") {
            version { strictly("4.13.2") }
            because("Keep instrumentation on the same patched JUnit runtime")
        }
    }
    // Match this installed Flutter SDK's integration_test runtime constraints.
    androidTestImplementation("androidx.test:runner:1.2.0")
    androidTestImplementation("androidx.test:rules:1.2.0")
}

flutter {
    source = "../.."
}
