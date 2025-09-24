"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.withCallxInfoPlist = void 0;
const config_plugins_1 = require("@expo/config-plugins");
const withCallxInfoPlist = (config) => {
    return (0, config_plugins_1.withInfoPlist)(config, (config) => {
        // Add background modes for VoIP and push notifications
        if (!config.modResults.UIBackgroundModes) {
            config.modResults.UIBackgroundModes = [];
        }
        const backgroundModes = config.modResults.UIBackgroundModes;
        if (!backgroundModes.includes('voip')) {
            backgroundModes.push('voip');
        }
        if (!backgroundModes.includes('remote-notification')) {
            backgroundModes.push('remote-notification');
        }
        // Do not force 'background-fetch' — not required for VoIP/remote-notification
        // Remove legacy mapping injection (triggers/fields/app). Config now set from JS.
        return config;
    });
};
exports.withCallxInfoPlist = withCallxInfoPlist;
