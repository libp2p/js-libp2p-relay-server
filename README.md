# js-libp2p-relay-server <!-- omit in toc -->

[![](https://img.shields.io/badge/made%20by-Protocol%20Labs-blue.svg?style=flat-square)](http://protocol.ai)
[![](https://img.shields.io/badge/project-libp2p-yellow.svg?style=flat-square)](http://libp2p.io/)
[![](https://img.shields.io/badge/freenode-%23libp2p-yellow.svg?style=flat-square)](http://webchat.freenode.net/?channels=%23libp2p)
[![](https://img.shields.io/discourse/https/discuss.libp2p.io/posts.svg)](https://discuss.libp2p.io)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/libp2p/js-libp2p-relay-server/ci?label=ci&style=flat-square)](https://github.com/libp2p/js-libp2p-relay-server/actions?query=branch%3Amaster+workflow%3Aci+)

> An out of the box libp2p relay server with HOP

## Lead Maintainer <!-- omit in toc -->

[Vasco Santos](https://github.com/vasco-santos)

## Table of Contents<!-- omit in toc -->

- [Background](#background)
- [Usage](#usage)
  - [Install](#install)
  - [CLI](#cli)
  - [Docker](#docker)
  - [SSL](#ssl)
  - [Debug](#debug)
- [Contribute](#contribute)
- [License](#license)

## Background

Libp2p nodes acting as circuit relay aim to establish connectivity between libp2p nodes (e.g. IPFS nodes) that wouldn't otherwise be able to establish a direct connection to each other.

A relay is needed in situations where nodes are behind NAT, reverse proxies, firewalls and/or simply don't support the same transports (e.g. go-libp2p vs. browser-libp2p). The circuit relay protocol exists to overcome those scenarios. Nodes with the `auto-relay` feature enabled can automatically bind themselves on a relay to listen for connections on their behalf.

You can read more in its [SPEC](https://github.com/libp2p/specs/tree/master/relay).

## Usage

### Install

```bash
> npm install --global libp2p-relay-server
```

Now you can use the cli command `libp2p-relay-server` to spawn an out of the box libp2p relay server.

### CLI

After installing the relay server, you can use its binary. It accepts several arguments: `--peerId`, `--listenMultiaddrs`, `--announceMultiaddrs`, `--metricsMultiaddr`, `--disableMetrics` and `--disablePubsubDiscovery`.

```sh
libp2p-relay-server [--peerId <jsonFilePath>] [--listenMultiaddrs <ma> ... <ma>] [--announceMultiaddrs <ma> ... <ma>] [--metricsMultiaddr <ma>] [--disableMetrics] [--disablePubsubDiscovery]
```

#### PeerId

You can create a [PeerId](https://github.com/libp2p/js-peer-id) via its [CLI](https://github.com/libp2p/js-peer-id#cli). 

```sh
libp2p-relay-server --peerId id.json
```

#### Multiaddrs

You can specify the libp2p rendezvous server listen and announce multiaddrs. This server is configured with [libp2p-tcp](https://github.com/libp2p/js-libp2p-tcp) and [libp2p-websockets](https://github.com/libp2p/js-libp2p-websockets) and addresses with this transports should be used. It can always be modified via the API.

```sh
libp2p-relay-server --peerId id.json --listenMultiaddrs '/ip4/127.0.0.1/tcp/15002/ws' '/ip4/127.0.0.1/tcp/8000' --announceMultiaddrs '/dns4/test.io/tcp/443/wss/p2p/12D3KooWAuEpJKhCAfNcHycKcZCv9Qy69utLAJ3MobjKpsoKbrGA' '/dns6/test.io/tcp/443/wss/p2p/12D3KooWAuEpJKhCAfNcHycKcZCv9Qy69utLAJ3MobjKpsoKbrGA'
```

By default it listens on `/ip4/127.0.0.1/tcp/15003/ws` and has no announce multiaddrs specified.

#### Metrics

Metrics are enabled by default on `/ip4/127.0.0.1/tcp/8003` via Prometheus. This address can also be modified with:

```sh
libp2p-relay-server --metricsMultiaddr '/ip4/127.0.0.1/tcp/8000'
```

Moreover, metrics can also be disabled with:

```sh
libp2p-relay-server --disableMetrics
```

#### Discovery

A discovery module [libp2p/js-libp2p-pubsub-peer-discovery](https://github.com/libp2p/js-libp2p-pubsub-peer-discovery) is configured and enabled by default. It can be disabled with:

```sh
libp2p-relay-server --disablePubsubDiscovery
```

### Docker

When running the relay server in Docker, you can configure the same parameters via environment variables, as follows:

```sh
PEER_ID='./id.json'
LISTEN_MULTIADDRS='/ip4/127.0.0.1/tcp/15002/ws,/ip4/127.0.0.1/tcp/8000'
ANNOUNCE_MULTIADDRS='/dns4/test.io/tcp/443/wss/p2p/12D3KooWAuEpJKhCAfNcHycKcZCv9Qy69utLAJ3MobjKpsoKbrGA,/dns6/test.io/tcp/443/wss/p2p/12D3KooWAuEpJKhCAfNcHycKcZCv9Qy69utLAJ3MobjKpsoKbrGA'
METRICS_MULTIADDR='/ip4/127.0.0.1/tcp/8000'
DISABLE_METRICS='true'
DISABLE_PUBSUB_DISCOVERY='true'
DISCOVERY_TOPICS='_peer-discovery._app1._pubsub,_peer_discovery._app2._pubsub'
```

Please note that you should expose expose the used ports with the docker run command. The default ports used are `8003` for the metrics and `150003` for the websockets listener.

Configuration example:

```sh
docker build NAME -t libp2p-relay
docker run -p 8003:8003 -p 15002:15002 -p 8000:8000 -e LISTEN_MULTIADDRS='/ip4/127.0.0.1/tcp/15002/ws,/ip4/127.0.0.1/tcp/8000' -d libp2p-relay
```

### SSL

You should setup an SSL certificate with nginx and proxy to the API. You can use a service that already offers an SSL certificate with the server and configure nginx, or you can create valid certificates with for example [Letsencrypt](https://certbot.eff.org/lets-encrypt/osx-nginx). Letsencrypt won’t give you a cert for an IP address (yet) so you need to connect via SSL to a domain name.

With this, you should specify in your relay the announce multiaddrs for your listening transports. This is specially important for browser peers that will leverage this relay, as browser nodes can only dial peers behind a `DNS+WSS` multiaddr.

### Debug

You can debug the relay by setting the `DEBUG` environment variable. For instance, you can set it to `libp2p*`.

## Contribute

Feel free to join in. All welcome. Open an [issue](https://github.com/libp2p/js-libp2p-relay-server/issues)!

This repository falls under the IPFS [Code of Conduct](https://github.com/ipfs/community/blob/master/code-of-conduct.md).

[![](https://cdn.rawgit.com/jbenet/contribute-ipfs-gif/master/img/contribute.gif)](https://github.com/ipfs/community/blob/master/contributing.md)

## License

MIT - Protocol Labs 2020
