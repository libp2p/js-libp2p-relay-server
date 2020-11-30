'use strict'
/* eslint-env mocha */

const { expect } = require('aegir/utils/chai')
const PeerId = require('peer-id')

const Peers = require('./fixtures/peers')

const createRelayServer = require('../src')

describe('Relay Hop Server', () => {
  let relay
  let peerId

  before(async () => {
    peerId = await PeerId.createFromJSON(Peers[0])
  })

  afterEach(async () => {
    relay && await relay.stop()
  })

  it('fails to create a relay if no peerId is provided', async () => {
    try {
      relay = await createRelayServer({})
    } catch (err) {
      expect(err).to.exist()
      return
    }
    throw new Error('should fail to create a relay if no peerId is provided')
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
    relay.multiaddrs.forEach((m) => listenAddresses.includes(m.toString()))
  })

  it('can specify announceMultiaddrs for the relay', async () => {
    const announceAddresses = ['/dns4/test.io/tcp/443/wss/p2p/12D3KooWAuEpJKhCAfNcHycKcZCv9Qy69utLAJ3MobjKpsoKbrGA']

    relay = await createRelayServer({
      peerId,
      announceAddresses
    })

    await relay.start()

    expect(relay.multiaddrs).to.have.lengthOf(announceAddresses.length)
    relay.multiaddrs.forEach((m) => announceAddresses.includes(m.toString()))
  })
})
