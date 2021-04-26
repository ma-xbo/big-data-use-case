# Select base image https://hub.docker.com/_/node/
FROM node:alpine

# Expose port 3000
EXPOSE 3000

# Set working dir for consecutive commands
WORKDIR /generatorapp

# Add dependencies
ADD package.json /generatorapp/
RUN npm install

# Copy 'server.js' to directory 'src' in container
ADD server.js /generatorapp/

# Copy directory 'www' to directory 'src' in container
ADD server-routes /generatorapp/server-routes
ADD client/build /generatorapp/client/build

# Set (default) command to execute on startup
CMD node /generatorapp/server.js