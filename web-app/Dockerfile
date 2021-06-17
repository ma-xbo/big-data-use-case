# -------------------------------
# Build stage 1.
# This state builds our React App and produces an intermediate Docker image containing the optimized production build.
# -------------------------------

# Select base image https://hub.docker.com/_/node/
FROM node:alpine AS builder

# Set working dir for consecutive commands
WORKDIR /reactapp

COPY client/package*.json ./
RUN npm install

# Add directories 'public' and 'src' from react client folder to working directory in intermediate docker image
COPY client/public public/
COPY client/src src/

# Create a production build of the React Application
RUN npm run build

# -------------------------------
# Build stage 2.
# This stage pulls the compiled JavaScript code from the stage 1 intermediate image.
# This stage builds the final Docker image that we'll use in production.
# -------------------------------

# Select base image https://hub.docker.com/_/node/
FROM node:alpine

# Expose port 5000
EXPOSE 5000

# Set working dir for consecutive commands
WORKDIR /webapp

# Install the required dependencies
COPY package.json .
RUN npm install

# Add 'server.js' and 'server-routes' to directory 'webapp' of container
COPY server.js .
COPY server-routes ./server-routes

# Copy directory 'build' from intermediate docker image to path '/webapp/client/build' in final docker image
COPY --from=builder /reactapp/build /webapp/client/build

# Command to start the express server
CMD node server.js