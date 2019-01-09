'use strict'

let $module

/*
  let contextProto = this.context;
  while (contextProto = Object.getPrototypeOf(contextProto)) {
    completionGroups.push(Object.getOwnPropertyNames(contextProto));
  }
*/


function handle (data) {
  let idx      = data.idx
    , child    = data.child
    , method   = data.method
    , args     = data.args
    , callback = function () {
        let _args = Array.prototype.slice.call(arguments)
        if (_args[0] instanceof Error) {
          let e = _args[0]
          _args[0] = {
              '$error'  : '$error'
            , 'type'    : e.constructor.name
            , 'message' : e.message
            , 'stack'   : e.stack
          }
          Object.keys(e).forEach(function(key) {
            _args[0][key] = e[key]
          })
        }
        process.send({ idx: idx, child: child, args: _args })
      }
    , exec

  if (method == null && typeof $module == 'function')
    exec = $module
  else if (typeof $module[method] == 'function')
    exec = $module[method]

  if (!exec)
    return console.error('NO SUCH METHOD:', method)

  exec.apply(null, args.concat([ callback ]))
}

const util = require('util');

console.log('[%s] started child', process.pid);
process.on('message', function (data) {
  console.log('[%s] Received message: %s', process.pid, data.module ? 'module ' +data.module+' to load' : 'other');
  if (!$module && !data.module) { console.log('[%s] no $module and no module in data.', process.pid); }
    if (!$module) {
        console.log('[%s] require(%s)', process.pid, data.module);
        $module = require(data.module);
        if (!$module) {
            console.log('[%s] require(%s) returned %s', process.pid, data.module, util.inspect($module));
        } else {
            console.log('[%s] module %s loaded', process.pid, data.module);
        }
        return $module;
    }
  if (data == 'die') return process.exit(0)
  handle(data)
})
