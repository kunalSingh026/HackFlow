# Use Node.js LTS Alpine image for a lean and secure base
FROM node:22-alpine

# Set the working directory inside the container
WORKDIR /usr/src/app

# Copy package manifests first to leverage Docker layer caching
COPY package*.json ./

# Install only production dependencies for a lightweight image
RUN npm ci --only=production

# Copy the remaining application source files
COPY . .

# Use non-root node user for better container runtime security
USER node

# Expose the port the backend app runs on
EXPOSE 3000

# Set default environment variable to production
ENV NODE_ENV=production

# Command to start the server
CMD ["node", "server.js"]
