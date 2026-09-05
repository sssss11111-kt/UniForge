import type { ForgeConfig } from '@electron-forge/shared-types';
import { MakerSquirrel } from '@electron-forge/maker-squirrel';

const config: ForgeConfig = {
  packagerConfig: {
    asar: true,
    name: 'UniForge',
    executableName: 'uniforge',
    appBundleId: 'com.uniforge.desktop',
    extraResource: ['sidecars'],
  },
  rebuildConfig: {},
  makers: [new MakerSquirrel({})],
};
export default config;
