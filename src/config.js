import { _, envs, mergeConfig } from './utils';

class Dynamic {
  constructor(key) { this.key = key; }
}

function env() {
  return envs('NODE_ENV', 'production');
}

var options = mergeConfig({
  '*': {},
});

export function get(key) {
  if (key == "env") {
    return env();
  }

  var keys   = key.split(':');
  var buffer = options[env()] || options['*'];

  for (var i = 0; i < keys.length; i++) {
    buffer = buffer[keys[i]];
    if (!buffer) {
      break;
    }
  }

  if (buffer instanceof Dynamic) {
    throw new Error(`Config ${buffer.key} to be set by configure`);
  }

  return _.clone(buffer);
}

export function set(key, value) {
  if (key == "env") {
    process.env.NODE_ENV = value;
  } else {
    var keys   = [env(), ...key.split(':')];
    var buffer = {};
    buffer[keys.pop()] = value;

    while ((key = keys.pop())) {
      var inner_buffer  = {};
      inner_buffer[key] = buffer;
      buffer = inner_buffer;
    }

    // Check env exist
    if (!options[env()]) {
      options[env()] = _.cloneDeep(options['*']);
    }

    _.merge(options, buffer);
  }
  return value;
}
