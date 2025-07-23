#!/bin/bash

# Project Management System Setup Script
echo "🚀 Setting up Project Management System..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_header() {
    echo -e "${BLUE}$1${NC}"
}

# Check prerequisites
check_prerequisites() {
    print_header "📋 Checking Prerequisites..."
    
    # Check Python
    if command -v python3 &> /dev/null; then
        PYTHON_VERSION=$(python3 --version | cut -d' ' -f2)
        print_status "Python $PYTHON_VERSION found"
    else
        print_error "Python 3.8+ is required but not found"
        exit 1
    fi
    
    # Check Node.js
    if command -v node &> /dev/null; then
        NODE_VERSION=$(node --version)
        print_status "Node.js $NODE_VERSION found"
    else
        print_error "Node.js 18+ is required but not found"
        exit 1
    fi
    
    # Check npm
    if command -v npm &> /dev/null; then
        NPM_VERSION=$(npm --version)
        print_status "npm $NPM_VERSION found"
    else
        print_error "npm is required but not found"
        exit 1
    fi
    
    # Check PostgreSQL
    if command -v psql &> /dev/null; then
        print_status "PostgreSQL found"
    else
        print_warning "PostgreSQL not found. You'll need to install it manually or use Docker"
    fi
    
    # Check Docker (optional)
    if command -v docker &> /dev/null; then
        print_status "Docker found"
        DOCKER_AVAILABLE=true
    else
        print_warning "Docker not found. Manual setup will be used"
        DOCKER_AVAILABLE=false
    fi
}

# Setup backend
setup_backend() {
    print_header "🐍 Setting up Python Backend..."
    
    cd backend
    
    # Create virtual environment
    print_status "Creating virtual environment..."
    python3 -m venv venv
    
    # Activate virtual environment
    print_status "Activating virtual environment..."
    source venv/bin/activate
    
    # Install dependencies
    print_status "Installing Python dependencies..."
    pip install -r requirements.txt
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file..."
        cp .env .env.backup 2>/dev/null || true
        cat > .env << EOF
DATABASE_URL=postgresql://pmuser:pmpassword@localhost:5432/project_management
CHROMA_HOST=localhost
CHROMA_PORT=8001
SECRET_KEY=$(openssl rand -hex 32)
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
NODEJS_API_URL=http://localhost:3000
MAX_FILE_SIZE=10485760
UPLOAD_DIR=uploads
EOF
        print_status ".env file created with default values"
    fi
    
    # Create uploads directory
    mkdir -p uploads
    
    cd ..
}

# Setup middleware
setup_middleware() {
    print_header "🟢 Setting up Node.js Middleware..."
    
    cd middleware
    
    # Install dependencies
    print_status "Installing Node.js dependencies..."
    npm install
    
    # Create .env file if it doesn't exist
    if [ ! -f .env ]; then
        print_status "Creating .env file..."
        cat > .env << EOF
PORT=3000
PYTHON_API_URL=http://localhost:8000
NODE_ENV=development
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
EOF
        print_status ".env file created with default values"
    fi
    
    # Create uploads directory
    mkdir -p uploads
    
    cd ..
}

# Setup frontend
setup_frontend() {
    print_header "🅰️ Setting up Angular Frontend..."
    
    cd frontend/project-management-app
    
    # Install dependencies
    print_status "Installing Angular dependencies..."
    npm install
    
    # Create environment file
    print_status "Creating environment configuration..."
    mkdir -p src/environments
    
    cat > src/environments/environment.ts << EOF
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  middlewareUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000'
};
EOF
    
    cat > src/environments/environment.prod.ts << EOF
export const environment = {
  production: true,
  apiUrl: 'http://localhost:8000/api',
  middlewareUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000'
};
EOF
    
    cd ../..
}

# Setup database
setup_database() {
    print_header "🗄️ Setting up Database..."
    
    # Check if PostgreSQL is running
    if pg_isready -h localhost -p 5432 &> /dev/null; then
        print_status "PostgreSQL is running"
        
        # Create database if it doesn't exist
        if ! psql -h localhost -p 5432 -U postgres -lqt | cut -d \| -f 1 | grep -qw project_management; then
            print_status "Creating database..."
            createdb -h localhost -p 5432 -U postgres project_management 2>/dev/null || true
        fi
    else
        print_warning "PostgreSQL is not running. Please start it manually or use Docker"
    fi
}

# Create Dockerfiles
create_dockerfiles() {
    print_header "🐳 Creating Dockerfiles..."
    
    # Backend Dockerfile
    cat > backend/Dockerfile << 'EOF'
FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 8000

# Run the application
CMD ["python", "main.py"]
EOF

    # Middleware Dockerfile
    cat > middleware/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Create uploads directory
RUN mkdir -p uploads

# Expose port
EXPOSE 3000

# Run the application
CMD ["npm", "start"]
EOF

    # Frontend Dockerfile
    cat > frontend/project-management-app/Dockerfile << 'EOF'
FROM node:18-alpine as build

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Production stage
FROM nginx:alpine

# Copy built application
COPY --from=build /app/dist/project-management-app /usr/share/nginx/html

# Copy nginx configuration
COPY nginx.conf /etc/nginx/nginx.conf

# Expose port
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
EOF

    # Nginx configuration for frontend
    cat > frontend/project-management-app/nginx.conf << 'EOF'
events {
    worker_connections 1024;
}

http {
    include /etc/nginx/mime.types;
    default_type application/octet-stream;

    server {
        listen 80;
        server_name localhost;
        root /usr/share/nginx/html;
        index index.html;

        location / {
            try_files $uri $uri/ /index.html;
        }

        location /api/ {
            proxy_pass http://backend:8000/api/;
            proxy_set_header Host $host;
            proxy_set_header X-Real-IP $remote_addr;
        }

        location /socket.io/ {
            proxy_pass http://middleware:3000/socket.io/;
            proxy_http_version 1.1;
            proxy_set_header Upgrade $http_upgrade;
            proxy_set_header Connection "upgrade";
            proxy_set_header Host $host;
        }
    }
}
EOF

    print_status "Dockerfiles created successfully"
}

# Create start scripts
create_start_scripts() {
    print_header "📜 Creating start scripts..."
    
    # Development start script
    cat > start-dev.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Project Management System in Development Mode..."

# Start backend
echo "Starting Python Backend..."
cd backend
source venv/bin/activate
python main.py &
BACKEND_PID=$!
cd ..

# Start middleware
echo "Starting Node.js Middleware..."
cd middleware
npm start &
MIDDLEWARE_PID=$!
cd ..

# Start frontend
echo "Starting Angular Frontend..."
cd frontend/project-management-app
npm start &
FRONTEND_PID=$!
cd ../..

echo "✅ All services started!"
echo "Frontend: http://localhost:4200"
echo "Backend API: http://localhost:8000/docs"
echo "Middleware: http://localhost:3000"

# Wait for Ctrl+C
trap "echo 'Stopping services...'; kill $BACKEND_PID $MIDDLEWARE_PID $FRONTEND_PID 2>/dev/null; exit" INT
wait
EOF

    # Production start script
    cat > start-prod.sh << 'EOF'
#!/bin/bash

echo "🚀 Starting Project Management System with Docker..."

# Build and start with docker-compose
docker-compose up --build

echo "✅ All services started!"
echo "Frontend: http://localhost:4200"
echo "Backend API: http://localhost:8000/docs"
echo "Middleware: http://localhost:3000"
EOF

    chmod +x start-dev.sh start-prod.sh
    print_status "Start scripts created successfully"
}

# Main setup function
main() {
    print_header "🎯 Project Management System Setup"
    echo "This script will set up the complete project management system."
    echo ""
    
    check_prerequisites
    
    # Ask user for setup type
    echo ""
    echo "Choose setup type:"
    echo "1) Development setup (manual)"
    echo "2) Production setup (Docker)"
    echo "3) Full setup (both)"
    read -p "Enter your choice (1-3): " choice
    
    case $choice in
        1)
            setup_backend
            setup_middleware
            setup_frontend
            setup_database
            create_start_scripts
            ;;
        2)
            create_dockerfiles
            create_start_scripts
            ;;
        3)
            setup_backend
            setup_middleware
            setup_frontend
            setup_database
            create_dockerfiles
            create_start_scripts
            ;;
        *)
            print_error "Invalid choice"
            exit 1
            ;;
    esac
    
    print_header "🎉 Setup Complete!"
    echo ""
    echo "Next steps:"
    echo "1. For development: ./start-dev.sh"
    echo "2. For production: ./start-prod.sh"
    echo ""
    echo "Access points:"
    echo "- Frontend: http://localhost:4200"
    echo "- Backend API: http://localhost:8000/docs"
    echo "- Middleware: http://localhost:3000"
    echo ""
    echo "Check the README.md for detailed instructions."
}

# Run main function
main "$@"