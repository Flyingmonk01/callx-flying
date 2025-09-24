"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCallxAndroidManifest = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const FCM_SERVICE = {
    'android:name': 'com.callx.CallxFirebaseMessagingService',
    'android:directBootAware': 'true',
    'android:exported': 'false',
};
const withCallxAndroidManifest = (config) => {
    return (0, config_plugins_1.withAndroidManifest)(config, (modConfig) => {
        const app = modConfig.modResults.manifest.application?.[0];
        if (!app) {
            return modConfig;
        }
        // Check if service already exists
        const exists = (app.service || []).some((s) => s.$ && s.$['android:name'] === FCM_SERVICE['android:name']);
        if (!exists) {
            app.service = app.service || [];
            app.service.push({
                '$': FCM_SERVICE,
                'intent-filter': [
                    {
                        $: { 'android:priority': '1' },
                        action: [
                            { $: { 'android:name': 'com.google.firebase.MESSAGING_EVENT' } },
                        ],
                    },
                ],
            });
            // No logs
        }
        else {
            // No logs
        }
        // Remove legacy mapping injection. Config is set from JS at runtime.
        return modConfig;
    });
};
exports.withCallxAndroidManifest = withCallxAndroidManifest;
