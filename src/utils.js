'use strict'

function getAnnounceAddresses (argv) {
  let announceAddresses = []
  const argvAddr = argv.announceMultiaddrs || argv.am

  if (argvAddr) {
    announceAddresses = [argvAddr]

    const flagIndex = process.argv.findIndex((e) => e === '--announceMultiaddrs' || e === '--am')
    const tmpEndIndex = process.argv.slice(flagIndex + 1).findIndex((e) => e.startsWith('--'))
    const endIndex = tmpEndIndex !== -1 ? tmpEndIndex : process.argv.length - flagIndex - 1

    for (let i = flagIndex + 1; i < flagIndex + endIndex; i++) {
      announceAddresses.push(process.argv[i + 1])
    }
  } else if (process.env.ANNOUNCE_MULTIADDRS) {
    announceAddresses = process.env.ANNOUNCE_MULTIADDRS.split(',')
  }

  return announceAddresses
}

module.exports.getAnnounceAddresses = getAnnounceAddresses

function getListenAddresses (argv) {
  let listenAddresses = ['/ip4/127.0.0.1/tcp/15003/ws']
  const argvAddr = argv.listenMultiaddrs || argv.lm

  if (argvAddr) {
    listenAddresses = [argvAddr]

    const flagIndex = process.argv.findIndex((e) => e === '--listenMultiaddrs' || e === '--lm')
    const tmpEndIndex = process.argv.slice(flagIndex + 1).findIndex((e) => e.startsWith('--'))
    const endIndex = tmpEndIndex !== -1 ? tmpEndIndex : process.argv.length - flagIndex - 1

    for (let i = flagIndex + 1; i < flagIndex + endIndex; i++) {
      listenAddresses.push(process.argv[i + 1])
    }
  } else if (process.env.LISTEN_MULTIADDRS) {
    listenAddresses = process.env.LISTEN_MULTIADDRS.split(',')
  }

  return listenAddresses
}

module.exports.getListenAddresses = getListenAddresses
