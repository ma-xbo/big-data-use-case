# Select base image https://hub.docker.com/_/node/
FROM node:alpine

# Expose port 3000
EXPOSE 3000

# Set working dir for consecutive commands
WORKDIR /src

# Add dependencies
ADD package.json /src/
RUN npm install

# Copy 'server.js' to directory 'src' in container
ADD server.js /src/

# Copy directory 'www' to directory 'src' in container
ADD www /src/www

# Set (default) command to execute on startup
CMD node /src/server.js