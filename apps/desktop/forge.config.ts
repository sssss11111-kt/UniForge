import type { ForgeConfig } from '@electron-forge/shared-types';
import SquirrelMaker from '@electron-forge/maker-squirrel';

const config: ForgeConfig = {
  packagerConfig: { asar: true },
  rebuildConfig: {},
  makers: [new SquirrelMaker({})],
};
export default config;
