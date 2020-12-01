#!/usr/bin/env node

'use strict'

// Usage: $0 [--peerId <jsonFilePath>] [--listenMultiaddrs <ma> ... <ma>] [--announceMultiaddrs <ma> ... <ma>]
//           [--metricsMultiaddr <ma>] [--disableMetrics] [--disablePubsubDiscovery] [--discoveryTopics <topic> ... <topic>]

/* eslint-disable no-console */

const debug = require('debug')
const log = debug('libp2p:relay:bin')

const fs = require('fs')
const http = require('http')
const menoetius = require('menoetius')
const argv = require('minimist')(process.argv.slice(2))

const multiaddr = require('multiaddr')
const PeerId = require('peer-id')

const { getAnnounceAddresses, getListenAddresses, getDiscoveryTopics } = require('./utils')
const createRelay = require('./index')

async function main () {
  // Metrics
  let metricsServer
  const metrics = !(argv.disableMetrics || process.env.DISABLE_METRICS)
  const metricsMa = multiaddr(argv.metricsMultiaddr || argv.ma || process.env.METRICS_MULTIADDR || '/ip4/0.0.0.0/tcp/8003')
  const metricsAddr = metricsMa.nodeAddress()

  // multiaddrs
  const listenAddresses = getListenAddresses(argv)
  const announceAddresses = getAnnounceAddresses(argv)

  log(`listenAddresses: ${listenAddresses.map((a) => a)}`)
  announceAddresses.length && log(`announceAddresses: ${announceAddresses.map((a) => a)}`)

  // Discovery
  const pubsubDiscoveryEnabled = !(argv.disablePubsubDiscovery || process.env.DISABLE_PUBSUB_DISCOVERY)
  const pubsubDiscoveryTopics = getDiscoveryTopics(argv)

  // PeerId
  let peerId
  if (argv.peerId || process.env.PEER_ID) {
    const peerData = fs.readFileSync(argv.peerId || process.env.PEER_ID)
    peerId = await PeerId.createFromJSON(JSON.parse(peerData))
    log('PeerId provided was loaded.')
  } else {
    peerId = await PeerId.create()
    log('You are using an automatically generated peer.')
    log('If you want to keep the same address for the server you should provide a peerId with --peerId <jsonFilePath>')
  }

  // Create Relay
  const relay = await createRelay({
    peerId,
    listenAddresses,
    announceAddresses,
    pubsubDiscoveryEnabled,
    pubsubDiscoveryTopics
  })

  await relay.start()
  console.log('Relay server listening on:')
  relay.multiaddrs.forEach((m) => console.log(m))

  if (metrics) {
    log('enabling metrics')
    metricsServer = http.createServer((req, res) => {
      if (req.url !== '/metrics') {
        res.statusCode = 200
        res.end()
      }
    })

    menoetius.instrument(metricsServer)

    metricsServer.listen(metricsAddr.port, metricsAddr.address, () => {
      console.log(`metrics server listening on ${metricsAddr.port}`)
    })
  }

  const stop = async () => {
    console.log('Stopping...')
    await relay.stop()
    metricsServer && await metricsServer.close()
    process.exit(0)
  }

  process.on('SIGTERM', stop)
  process.on('SIGINT', stop)
}

main()
