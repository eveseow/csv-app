FROM node:18-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application files
COPY . .

# Create necessary directories with proper permissions
RUN mkdir -p uploads db && \
    chmod -R 777 uploads db

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "dev"]