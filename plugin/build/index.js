"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config_plugins_1 = require("@expo/config-plugins");
const modifyMainActivity_1 = require("./android/modifyMainActivity");
const infoPlist_1 = require("./ios/infoPlist");
const withCallx = (config, options) => {
    if (!options?.package) {
        throw new Error('[callx] Package option is required. Please provide the Android package name.');
    }
    const { package: packageName } = options;
    // Intentionally no general logs: keep output minimal
    // Android: modify MainActivity only
    config = (0, modifyMainActivity_1.withCallxModifyMainActivity)(config, { package: packageName });
    // iOS: enable required background modes only
    config = (0, infoPlist_1.withCallxInfoPlist)(config);
    return config;
};
// Create run-once plugin to prevent duplicate execution
const pak = require('../../package.json');
exports.default = (0, config_plugins_1.createRunOncePlugin)(withCallx, pak.name, pak.version);
