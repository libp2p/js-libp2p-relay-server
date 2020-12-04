'use strict'

const Libp2p = require('libp2p')
const TCP = require('libp2p-tcp')
const Websockets = require('libp2p-websockets')
const MPLEX = require('libp2p-mplex')
const { NOISE } = require('libp2p-noise')
const GossipSub = require('libp2p-gossipsub')
const PubsubPeerDiscovery = require('libp2p-pubsub-peer-discovery')

/**
 * @typedef {import('peer-id')} PeerId
 */

/**
 * @typedef {Object} HopRelayOptions
 * @property {PeerId} [peerId]
 * @property {string[]} [listenAddresses = []]
 * @property {string[]} [announceAddresses = []]
 * @property {boolean} [pubsubDiscoveryEnabled = true]
 * @property {string[]} [pubsubDiscoveryTopics = ['_peer-discovery._p2p._pubsub']] uses discovery default
 */

/**
 * Create a Libp2p Relay with HOP service
 *
 * @param {HopRelayOptions} options
 * @returns {Promise<Libp2p>}
 */
function create ({ peerId, listenAddresses = [], announceAddresses = [], pubsubDiscoveryEnabled = true, pubsubDiscoveryTopics = ['_peer-discovery._p2p._pubsub'] }) {
  return Libp2p.create({
    peerId,
    modules: {
      transport: [Websockets, TCP],
      streamMuxer: [MPLEX],
      connEncryption: [NOISE],
      pubsub: GossipSub,
      peerDiscovery: [PubsubPeerDiscovery]
    },
    addresses: {
      listen: listenAddresses,
      announce: announceAddresses
    },
    config: {
      pubsub: {
        enabled: pubsubDiscoveryEnabled
      },
      peerDiscovery: {
        [PubsubPeerDiscovery.tag]: {
          topics: pubsubDiscoveryTopics,
          enabled: pubsubDiscoveryEnabled
        }
      },
      relay: {
        enabled: true, // Allows you to dial and accept relayed connections. Does not make you a relay.
        hop: {
          enabled: true // Allows you to be a relay for other peers
        }
      }
    }
  })
}

module.exports = create
