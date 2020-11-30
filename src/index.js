'use strict'

const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
const Muxer = require('libp2p-mplex')
const { NOISE: Crypto } = require('libp2p-noise')
const DelegatedContentRouting = require('libp2p-delegated-content-routing')
const ipfsHttpClient = require('ipfs-http-client')

/**
 * @typedef {import('peer-id')} PeerId
 */

/**
 * @typedef {Object} DelegateOptions
 * @property {string} host
 * @property {string} protocol
 * @property {number} port
 */

 const defaulDelegateOptions = {
   host: 'node0.delegate.ipfs.io',
   protocol: 'https',
   port: 443
 }

/**
 * @typedef {Object} HopRelayOptions
 * @property {PeerId} peerId
 * @property {DelegateOptions} [delegateOptions = defaulDelegateOptions]
 * @property {string[]} [listenAddresses = []]
 * @property {string[]} [announceAddresses = []]
 * @property {boolean} [shouldAdvertise = true]
 */

/**
 * Create a Libp2p Relay with HOP service
 *
 * @param {HopRelayOptions} options
 * @returns {Promise<Libp2p>}
 */
function create ({ peerId, delegateOptions = defaulDelegateOptions, listenAddresses = [], announceAddresses = [], shouldAdvertise = true }) {
  let contentRouting = []

  if (shouldAdvertise) {
    const httpClient = ipfsHttpClient(delegateOptions)
    contentRouting.push(new DelegatedContentRouting(peerId, httpClient))
  }

  return Libp2p.create({
    peerId,
    modules: {
      transport: [Websockets, TCP],
      streamMuxer: [Muxer],
      connEncryption: [Crypto],
      contentRouting
    },
    peerId,
    addresses: {
      listen: listenAddresses,
      announce: announceAddresses
    },
    config: {
      relay: {
        enabled: true, // Allows you to dial and accept relayed connections. Does not make you a relay.
        hop: {
          enabled: true, // Allows you to be a relay for other peers
          active: true // You will attempt to dial destination peers if you are not connected to them
        },
        advertise: {
          enabled: shouldAdvertise // Allows you to advertise the Hop service
        }
      }
    }
  })
}

module.exports = create
