# Use the official lightweight Node.js 12 image.
# https://hub.docker.com/_/node
FROM node:12-slim

# Create and change to the app directory.
WORKDIR /usr/src/app

# Assign ENV variables
# Bind the App to any IP
ENV NUXT_HOST=0.0.0.0
# Provides the Build URL for NUXT BUILD
ENV GATEWAY_BASE_URL="http://localhost:8081"
ENV GATEWAY_LOGIN_URL="http://localhost:8081/api/v2/login"
ENV GATEWAY_PROFILE_URL="http://localhost:8081/api/v2/user/profile"

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