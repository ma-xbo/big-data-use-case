# 
# Build stage 1.
# This state builds our React App and produces an intermediate Docker image containing the optimized production build.
#

# Select base image https://hub.docker.com/_/node/
FROM node:alpine

# Set working dir for consecutive commands
WORKDIR /reactapp

# Add directory 'client' to path '/reactapp' in intermediate docker image
ADD client /reactapp

# Create a production build of the React Application
RUN npm run build

#
# Build stage 2.
# This stage pulls the compiled JavaScript code from the stage 1 intermediate image.
# This stage builds the final Docker image that we'll use in production.
#

# Select base image https://hub.docker.com/_/node/
FROM node:alpine

# Expose port 5000
EXPOSE 5000

# Set working dir for consecutive commands
WORKDIR /webapp

# Install the required dependencies
ADD package.json /webapp/
RUN npm install

# Add 'server.js' and 'router.js' to directory 'webapp' of container
ADD server.js /webapp/
ADD router.js /webapp/

# Copy directory 'build' from intermediate docker image to path '/webapp/client/build' in final docker image
COPY --from=0 /reactapp/build /webapp/client/build

# Command to start the express server
CMD node /webapp/server.js
