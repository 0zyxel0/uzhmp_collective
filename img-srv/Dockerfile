# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
FROM node:12-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Assign ENV variables
# Type of Node Environment
# ENV NODE_ENV production
# Bind the App to any IP
ENV NODE_ENV=prod
ENV NUXT_HOST=0.0.0.0
ENV NUXT_PORT=8899

# GCP BUCKET TOKENS

ENV GCS_BUCKET=${INJECT_GCS_BUCKET}
ENV GCS_PROJECT=${INJECT_GCS_PROJECT}
ENV GCLOUD_CLIENT_EMAIL=${INJECT_GCLOUD_CLIENT_EMAIL}
ENV GCLOUD_PRIVATE_KEY=${INJECT_GCLOUD_PRIVATE_KEY}

# DATABASE Credentials
ENV ATLAS_USER_PROD=${INJECT_ATLAS_USER_PROD}
ENV ATLAS_PASS_PROD=${INJECT_ATLAS_PASS_PROD}
ENV ATLAS_CLUSTER_PROD=${INJECT_ATLAS_CLUSTER_PROD}
ENV ATLAS_DB_PROD=${INJECT_ATLAS_DB_PROD}

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