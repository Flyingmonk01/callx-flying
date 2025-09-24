import type { ConfigPlugin } from '@expo/config-plugins';
import { withInfoPlist } from '@expo/config-plugins';

export const withCallxInfoPlist: ConfigPlugin = (config) => {
  return withInfoPlist(config, (config) => {
    // Add background modes for VoIP and push notifications
    if (!config.modResults.UIBackgroundModes) {
      config.modResults.UIBackgroundModes = [];
    }

    const backgroundModes = config.modResults.UIBackgroundModes as string[];

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
