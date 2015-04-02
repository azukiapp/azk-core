import { Q, _, async, defer, fs, envDefaultArray, isBlank } from './utils';

var portscanner = require('portscanner');
var url         = require('url');
var nativeNet   = require('net');
var os          = require('os');
var { isIPv4 }  = require('net');
var Netmask     = require('netmask').Netmask;
var cache_key   = "agent:dns:file_cache";

export class NetUtils {
  constructor(configGetKey, configSetKey) {
    this._getConfig = configGetKey;
    this._setConfig = configSetKey;
  }

  getPort(host = 'localhost') {
    var portrange = this._getConfig("agent:portrange_start");
    var port   = portrange;
    portrange += 1;

    return this
      .checkPort(port, host)
      .then((isAvailable) => {
        return (isAvailable) ? port : this.getPort(host);
      });
  }

  checkPort(port, host = 'localhost') {
    return Q.ninvoke(portscanner, "checkPortStatus", port, host)
      .then((status) => {
        return status == 'closed';
      });
  }

  calculateNetIp(ip) {
    return ip.replace(/^(.*)\..*$/, "$1.0/24");
  }

  calculateGatewayIp(ip) {
    return ip.replace(/^(.*)\..*$/, "$1.1");
  }

  nameServers(custom_dns_servers, options={}) {
    var dns_servers;
    var nameservers     = this._getConfig(cache_key);
    var env_dns_servers = envDefaultArray('AZK_DNS_SERVERS', []);

    if (custom_dns_servers && !_.isArray(custom_dns_servers)) {
      options = custom_dns_servers || {};
      custom_dns_servers = null;
    }

    if (!_.isEmpty(env_dns_servers)) {
      // env AZK_DNS_SERVERS
      dns_servers = env_dns_servers;
    } else if (custom_dns_servers) {
      // custom_dns_servers (i.g. from Azkfile.js)
      dns_servers = custom_dns_servers;
    } else if (isBlank(nameservers)) {
      var resolv = this._readResolverFile(options.resolv_path);
      dns_servers = this.filterDnsServers(resolv);

      if (_.isEmpty(dns_servers)) {
        dns_servers = this._getConfig('agent:dns:defaultserver');
      }
    } else {
      dns_servers = nameservers;
    }

    if (!_.contains(dns_servers, this._getConfig("agent:dns:ip"))) {
      dns_servers.unshift(this._getConfig("agent:dns:ip"));
    }

    if (!custom_dns_servers) {
      this._setConfig(cache_key, dns_servers);
    }

    return dns_servers;
  }

  filterDnsServers(nameservers) {
    return _.filter(nameservers, (server) => { return !server.match(/^127\./); });
  }

  _readResolverFile(file = "/etc/resolv.conf") {
    var data = null;
    if (file) {
      try {
        var content = fs.readFileSync(file).toString();
        data = this.parseNameserver(content);
        data = _.map(data, (nameserver) => nameserver.ip);
      } catch (err) { }
    }
    return data ? data : [];
  }

  // Regex: https://regex101.com/r/qK0aS1/1
  parseNameserver(content) {
    var lines   = content.split('\n');
    var regex   = /^\s*nameserver\s{1,}((?:\d{1,3}\.){3}\d{1,3})(?:[:|\.]?(\d{1,5}))?$/;
    var capture = null;
    return _.reduce(lines, (acc, line) => {
      if ((capture = line.match(regex))) {
        var ip   = capture[1];
        var port = capture[2] || "53";
        if (isIPv4(ip)) {
          acc.push({ ip, port });
        }
      }
      return acc;
    }, []);
  }

  // TODO: improve to get a free network ip ranges
  generateSuggestionIp(ip, interfaces, info = () => {}) {
    if (_.isEmpty(this._suggestion_ips)) {
      var ranges = _.range(50, 255).concat(_.range(10, 50 ), _.range(0 , 10 ));
      this._suggestion_ips = _.map(ranges, (i) => `192.168.${i}.4`);
    }
    info("configure.find_suggestions_ips");
    return _.find(this._suggestion_ips, (new_ip) => {
      if (new_ip != ip) {
        var conflict = this.conflictInterface(new_ip, interfaces);
        if (_.isEmpty(conflict)) { return true; }
        var info_data = { ip: new_ip, inter_name: conflict.name, inter_ip: conflict.ip };
        info("configure.errors.ip_conflict", info_data);
      }
    });
  }

  conflictInterface(ip, interfaces) {
    if (_.isEmpty(ip)) { return null; }
    var block = new Netmask(this.calculateNetIp(ip));
    return _.find(interfaces, (network) => {
      return block.contains(network.ip);
    });
  }

  getInterfacesIps(hostonly_interface, hostonly_list) {
    return async(this, function* () {
      // System interfaces
      var system_interfaces = _.reduce(os.networkInterfaces(), (acc, ips, name) => {
        if (name != hostonly_interface) {
          var ip = _.find(ips, (ip) => {
            return ip.family == 'IPv4';
          });
          if (ip) { acc.push({ name: name, ip: ip.address }); }
        }
        return acc;
      }, []);

      // VirtualBox interfaces
      var vbox_interfaces = _.reduce(yield hostonly_list, (acc, inter) => {
        var ip = inter.IPAddress;
        if (inter.Name != hostonly_interface) {
          acc.push({ name: inter.Name, ip });
        }
        return acc;
      }, []);

      return system_interfaces.concat(vbox_interfaces);
    });
  }

  waitService(uri, retry = 15, opts = {}) {
    opts = _.defaults(opts, {
      timeout: 10000,
      retry_if: () => { return Q(true); }
    });

    // Parse options to try connect
    var address = url.parse(uri);
    if (address.protocol == 'unix:') {
      address = { path: address.path };
    } else {
      address = {
        host: address.hostname,
        port: address.port,
      };
    }

    return defer((resolve, reject, notify) => {
      var client   = null;
      var attempts = 1, max = retry;
      var connect  = () => {
        var t = null;
        notify(_.merge({
          uri : uri,
          type: 'try_connect', attempts: attempts, max: max, context: opts.context
        }, address ));

        client = nativeNet.connect(address, function() {
          client.end();
          clearTimeout(t);
          resolve(true);
        });

        t = setTimeout(() => {
          client.end();

          opts.retry_if().then((result) => {
            if (attempts >= max || !result) {
              return resolve(false);
            }
            attempts += 1;
            connect();
          }, () => resolve(false));
        }, opts.timeout);

        // Ignore connect error
        client.on('error', () => { return false; });
      };
      connect();
    });
  }

  // TODO: change for a generic service wait function
  waitForwardingService(host, port, retry = 15, timeout = 10000) {
    return defer((resolve, reject, notify) => {
      var client   = null;
      var attempts = 1, max = retry;
      var connect  = () => {
        notify({ type: 'try_connect', attempts: attempts, max: max });

        var timeout_func = function() {
          attempts += 1;
          connect();
        };

        client = nativeNet.connect({ host, port}, function() {
          client.on('data', function() {
            client.destroy();
            resolve();
          });
          if (attempts <= max) {
            client.setTimeout(timeout, timeout_func);
          } else {
            client.destroy();
            reject();
          }
        });

        client.on('error', (error) => {
          if (error.code == 'ECONNREFUSED' && attempts <= max) {
            setTimeout(timeout_func, timeout);
          } else {
            reject(error);
          }
        });
      };

      connect();
    });
  }

}

export default NetUtils;
