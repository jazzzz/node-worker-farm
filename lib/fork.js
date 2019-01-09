'use strict'

const childProcess = require('child_process')
    , childModule  = require.resolve('./child/index')


function fork (forkModule, workerOptions) {
  // suppress --debug / --inspect flags while preserving others (like --harmony)
  let filteredArgs = process.execArgv.filter(function (v) {
        return !(/^--(debug|inspect)/).test(v)
      })
    , options       = Object.assign({
          execArgv : filteredArgs
        , env      : process.env
        , cwd      : process.cwd()
      }, workerOptions)
    , child         = childProcess.fork(childModule, process.argv, options)

  child.on('error', function() {
    // this *should* be picked up by onExit and the operation requeued
  })

  console.log('Send module name %j to child %s', forkModule, child.pid);
  child.send({ module: forkModule })

  // return a send() function for this child
  return {
      send  : function() {
          console.log('Send message to child %s', child.pid);
          child.send.apply(child, arguments);
      }
    , child : child
  }
}


module.exports = fork
