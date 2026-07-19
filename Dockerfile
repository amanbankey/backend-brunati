FROM node:20-slim

WORKDIR /app

# Copy package files first for better caching
COPY package*.json ./

# Install dependencies
RUN npm install --production

# Copy the rest of the application code
COPY . .

# Set environment to production
ENV NODE_ENV=production

# Expose the port your server runs on
EXPOSE 5000

# Start the server
CMD ["node", "server.js"]
