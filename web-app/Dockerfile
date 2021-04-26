# Select base image https://hub.docker.com/_/node/
FROM node:alpine

# Expose port 5000
EXPOSE 5000

# Set working dir for consecutive commands
WORKDIR /webapp

# Add dependencies
ADD package.json /webapp/
RUN npm install

# Copy 'server.js' to directory 'webapp' in container
ADD server.js /webapp/

# Copy directory 'client/build' to directory 'webapp' in container
ADD client/build /webapp/client/build

# Set (default) command to execute on startup
CMD node /webapp/server.js