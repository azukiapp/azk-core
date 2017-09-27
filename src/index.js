import * as Utils    from './utils/utils';
import * as azk_core from './azk-core';
import * as config_module from './config';
import { Log }       from './log';
import { NetUtils }  from './utils/net';

module.exports = {
  __esModule: true,

  get Q                () { return azk_core.Q; },
  get _                () { return azk_core._; },
  get fs               () { return azk_core.fs; },
  get os               () { return azk_core.os; },
  get path             () { return azk_core.path; },
  get defer            () { return azk_core.defer; },
  get isBlank          () { return azk_core.isBlank; },
  get lazy_require     () { return azk_core.lazy_require; },
  get version          () { return azk_core.version; },

  get envs             () { return Utils.envs; },
  get envDefaultArray  () { return Utils.envDefaultArray; },
  get dlog             () { return Utils.dlog; },

  get Dynamic          () { return config_module.Dynamic; },
  get ConfigAzk        () { return config_module.ConfigAzk; },

  get Log              () { return Log; },
  get Utils            () { return Utils; },
  get NetUtils         () { return NetUtils; },
};
