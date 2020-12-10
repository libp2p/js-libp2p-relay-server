'use strict'
/* eslint-env mocha */

const { expect } = require('aegir/utils/chai')
const PeerId = require('peer-id')

const Peers = require('./fixtures/peers')

const createRelayServer = require('../src')

describe('Relay Server', () => {
  let relay
  let peerId

  before(async () => {
    peerId = await PeerId.createFromJSON(Peers[0])
  })

  afterEach(async () => {
    relay && await relay.stop()
  })

  it('can create an start a relay with only a peerId', async () => {
    relay = await createRelayServer({ peerId })

    await relay.start()
  })

  it('can specify listenMultiaddrs for the relay', async () => {
    const listenAddresses = ['/ip4/127.0.0.1/tcp/15002/ws', '/ip4/127.0.0.1/tcp/8000']

    relay = await createRelayServer({
      peerId,
      listenAddresses
    })

    await relay.start()

    expect(relay.multiaddrs).to.have.lengthOf(listenAddresses.length)
    relay.multiaddrs.forEach((m) => {
      expect(listenAddresses.includes(m.toString())).to.eql(true)
    })
  })

  it('can specify announceMultiaddrs for the relay', async () => {
    const announceAddresses = ['/dns4/test.io/tcp/443/wss']

    relay = await createRelayServer({
      peerId,
      announceAddresses
    })

    await relay.start()

    expect(relay.multiaddrs).to.have.lengthOf(announceAddresses.length)
    relay.multiaddrs.forEach((m) => {
      expect(announceAddresses.includes(m.toString())).to.eql(true)
    })
  })

  it('can disable discovery', async () => {
    relay = await createRelayServer({
      peerId,
      pubsubDiscoveryEnabled: false
    })

    await relay.start()

    expect(relay._discovery.size).to.eql(0)
  })
})
