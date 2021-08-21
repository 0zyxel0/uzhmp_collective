# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
FROM node:12-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Assign ENV variables
# Bind the App to any IP
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=8899
ENV NODE_ENV=prod

#OSM USER SETTINGS
ENV OSM_DEV_API="https://master.apis.dev.openstreetmap.org"
ENV OSM_PROD_API="https://api.openstreetmap.org"
ENV OSM_DEV_USER="chibbyha52@gmail.com"
ENV OSM_DEV_PASS="w93N\spg~zIP"
ENV OSM_PROD_USER="chibbyha52@gmail.com"
ENV OSM_PROD_PASS="w93N\spg~zIP"

#Database Settings
ENV ATLAS_USER_PROD="uzhmp-user"
ENV ATLAS_PASS_PROD="awtzGBTepiBIaX04"
ENV ATLAS_CLUSTER_PROD="uzh-mp.nad1m.mongodb.net"
ENV ATLAS_DB_PROD="QuestDB"

# Copy application dependency manifests to the container image.
# A wildcard is used to ensure both package.json AND package-lock.json are copied.
# Copying this separately prevents re-running npm install on every code change.
COPY package*.json ./

# Install production dependencies.
RUN npm install --only=production

# Copy local code to the container image.
COPY . ./

# Expose the Port Outside the container to the localhost
EXPOSE 8899

# Build the production Version of the Application
RUN npm run build

# Run the web service on container startup.
CMD [ "npm", "start" ]