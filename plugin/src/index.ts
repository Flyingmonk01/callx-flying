import type { ConfigPlugin } from '@expo/config-plugins';
import { createRunOncePlugin } from '@expo/config-plugins';
import { withCallxModifyMainActivity } from './android/modifyMainActivity';
import { withCallxInfoPlist } from './ios/infoPlist';

export interface CallxPluginOptions {
  package: string;
}

const withCallx: ConfigPlugin<CallxPluginOptions> = (config, options) => {
  if (!options?.package) {
    throw new Error(
      '[callx] Package option is required. Please provide the Android package name.'
    );
  }

  const { package: packageName } = options;
  // Intentionally no general logs: keep output minimal

  // Android: modify MainActivity only
  config = withCallxModifyMainActivity(config, { package: packageName });

  // iOS: enable required background modes only
  config = withCallxInfoPlist(config);

  return config;
};

// Create run-once plugin to prevent duplicate execution
const pak = require('../../package.json');
export default createRunOncePlugin(withCallx, pak.name, pak.version);
