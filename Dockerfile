FROM node:lts-alpine

# Install deps
RUN apk add --update git build-base python3

# Get dumb-init to allow quit running interactively
RUN wget -O /usr/local/bin/dumb-init https://github.com/Yelp/dumb-init/releases/download/v1.2.0/dumb-init_1.2.0_amd64 && chmod +x /usr/local/bin/dumb-init

# Setup directories for the `node` user
RUN mkdir -p /home/node/app/hop-relay-server/node_modules && chown -R node:node /home/node/app/hop-relay-server

WORKDIR /home/node/app/hop-relay-server

# Install node modules
COPY package.json ./
# Switch to the node user for installation
USER node
RUN npm install --production

# Copy over source files under the node user
COPY --chown=node:node ./src ./src
COPY --chown=node:node ./README.md ./

ENV DEBUG libp2p*

# Available overrides (defaults shown):
# Server logging can be enabled via the DEBUG environment variable
CMD [ "/usr/local/bin/dumb-init", "node", "src/bin.js"]