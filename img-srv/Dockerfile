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

ENV GCS_BUCKET="uzh-gcs-mp"
ENV GCS_PROJECT="mastersproject-305200"
ENV GCLOUD_CLIENT_EMAIL="mp-uz-bkadm@mastersproject-305200.iam.gserviceaccount.com"
ENV GCLOUD_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQDEVl8dQqKXoFXr\noCHubMryZrsDEgH1EdvE2LlfCPJnF8wJoneVTUe6oq5YfPCaKOLe8iHLrpJyWS05\nrDIAqb796eJg47dHXTL7NeFqfGzlzH0lrdS91OBYfsxU46OV5504Wr47aXR6J72n\nQ1EkELJCeH6PLV0TnbnWKz0O3ndG5R9v8zHK4aJWrOWf62f1etqcpcvA+wUjo//4\n0Z0QZ8vgFiO5MmGZJtsrS1vmMCsowJA3YzHGfl8OcUkI54LINMQtTgAQIlCeHEWT\nnhx2R+gKu8JQTgs5GJcIDOfEtKZMcDDR6s25gZBQpnvDZEMouU09taeOO6b0vyds\ncSd6TMpBAgMBAAECggEACGqAZL9yu0eo7zL7yV3Z/DaJnSnUMiZcEo3MsmVuiJtF\nSINxl1GK+dXX3dyrLpyCjxZ3euTmi6bFcMOwGAWutXElXkxckp9M3GZUnY0sWNRh\nZ/BR3npFzJ1Q0nG4lSgqvdvr7B2K2+Kgt08EJyTdE0rZd/c0lm7sJKFRWnYQTFZa\nM3eiPrb4sMwMcFNyw0TwV1akdxGVlATGxfubK1SRNOCeDVvIr8CyiZMsTZyKbKMu\nXDZgIzljDaVxVQGi6MMVz8BIsEdh44RtwnYDfR1MRge4e5nJCMsqxnb8TGCjhuHw\nkzw5mD4PRUelzzdrcZr/hdVva+K7Ee4h0r0XotE7XQKBgQDxFtrrwXTb9YvNdz6T\n9u/ecAkwN2IrjJbif2J2sGRbwb39ng9Onn/XnJrFoxEIWR0PdoXTLEVzvFrTBRQO\nDiPANpw5K0l0+s6y6PHkvdPxDu69Q2E53LBTrohDRqtUFjj8gkiPM1rBXYPD9rKK\nf9cS6fN8AQrQ5DdBl0pnGZakdQKBgQDQeva4JGyrbUAOZZqpsPmakv65aHe8CFYD\naTl2QQ3YjkPVddi7laAVpOfd7kvO1/edJjj9OTzVz8DB7capBT9HXgwRKDq8hukg\nCc7ISFzfyNacFn3nP0YPqxlciW7eYwIDMz4zoyOMpXTz0cbHq7DwXqbsKnaHriPo\nZV5OHLJlHQKBgHPYWpt8Gu3yoBm7mbs5pesJhLDBfA+W/42YTjTf72lTwDpUr+BE\nMwPkwU4EXBPZ1ifu+MEO/dRuBmptf0R9sNoUo56o2SQ3vAil/E3AlU24sikJbneC\nPswHCnzhQUQnZXyYEcuVjp9pkv4f1YzNfwgcmJ3WVl8nuhFvZBYEaqldAoGAaGkM\n4xAq9HfUmuE74jxl5Yo01DqDrMIoAbFTO+w8uPYW9vL8RoYbFHvwO++6O69hrWyV\nIgzmcNaJXRZuZfvgwydQt88EC6MtYgRHcXr8OH9nK+j/yS6hMfuoyfVydyHywhOJ\n1WagyTGcLvgiq6FLDjb5NlHV5wHJrfwGjOxGU+kCgYAr4+ikp9dQ7vIwjJL4rUKS\nhJ9oH66SNmiDafnnSckZOr5P9Myv80jCsrNtLa7PRBytXT51vq/j99myWZlZw6wO\nt6cRXG+CvPp5CNdGmCBfGncFM3jnoo51UbrCBBEp7GVd6/DjXu92SnfH/rH8WG6e\nLEflU2tpGD/3RQiXk2pv/w==\n-----END PRIVATE KEY-----\n"

# DATABASE Credentials
ENV ATLAS_USER_PROD="uzhmp-user"
ENV ATLAS_PASS_PROD="awtzGBTepiBIaX04"
ENV ATLAS_CLUSTER_PROD="uzh-mp.nad1m.mongodb.net"
ENV ATLAS_DB_PROD="ImageDB"

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