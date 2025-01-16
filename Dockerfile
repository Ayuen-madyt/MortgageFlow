# Use the official Node.js image as the base image
FROM node:18.19.0-alpine

# Set the working directory in the container
WORKDIR /usr/src/app

# Copy package.json and yarn.lock to the container
COPY package.json ./

# Install project dependencies
RUN yarn install

# Copy the rest of the application code to the container
COPY . .

# Build the React app
RUN yarn build

# Expose the port the app runs on
EXPOSE 3000

# Command to run the production-ready React app
CMD yarn start
