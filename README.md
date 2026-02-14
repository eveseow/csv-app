# CSV Upload and Filter App

A web application for uploading CSV files, displaying data in a responsive table with search and pagination features.

## 📦 Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v16 or higher) - [Download here](https://nodejs.org/)
- **npm** (comes with Node.js)
- **Docker** (optional, for containerized deployment) - [Download here](https://www.docker.com/)
- **Docker Compose** (optional, comes with Docker Desktop)

## 🔧 Installation

### Step 1: Clone or Download the Project

```bash
cd /path/to/your/project
```

### Step 2: Install Backend Dependencies

```bash
cd csv-backend
npm install

# Create necessary directories
mkdir -p db uploads
```

### Step 3: Install Frontend Dependencies

```bash
cd ../csv-frontend-app
npm install
```

## 🚀 Running the Application

### Running Backend with Docker

```bash
cd csv-backend

# Build and start the container
docker-compose up

# Or run in background
docker-compose up -d
```

### Running Frontend locally
```bash
cd csv-frontend-app
npm run dev
```

## 🐛 Troubleshooting

### Backend Issues

#### Port 3001 already in use
```bash
# Find and kill the process using port 3001
# On Mac/Linux:
lsof -ti:3001 | xargs kill -9

# On Windows:
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

#### Database errors
```bash
# Delete the database and restart
cd csv-backend
rm -rf db/database.sqlite
npm run dev  # Database will be recreated
```

### Frontend Issues

#### Port 3000 already in use
```bash
# Change port in frontend/vite.config.ts
server: {
  port: 3002,  // Change to available port
  ...
}
```

