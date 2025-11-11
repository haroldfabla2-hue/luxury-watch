#!/bin/bash

# LuxuryWatch Full Stack Application Startup Script
# This script starts both frontend and backend services

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Project paths
PROJECT_ROOT="/workspace/luxurywatch"
FRONTEND_DIR="$PROJECT_ROOT"
BACKEND_DIR="$PROJECT_ROOT/backend"

# Check if directories exist
if [ ! -d "$FRONTEND_DIR" ]; then
    print_error "Frontend directory not found: $FRONTEND_DIR"
    exit 1
fi

if [ ! -d "$BACKEND_DIR" ]; then
    print_error "Backend directory not found: $BACKEND_DIR"
    exit 1
fi

# Function to start backend
start_backend() {
    print_status "Starting LuxuryWatch Backend..."
    
    cd "$BACKEND_DIR"
    
    # Check if .env exists
    if [ ! -f ".env" ]; then
        print_warning "No .env file found in backend directory"
        print_status "Creating .env from example..."
        cp .env.example .env
        print_warning "Please configure the .env file with your database and other settings"
    fi
    
    # Install backend dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing backend dependencies..."
        npm install
    fi
    
    # Run database migrations if needed
    if command -v npx &> /dev/null && [ -f "prisma/schema.prisma" ]; then
        print_status "Running database migrations..."
        npx prisma migrate deploy
    fi
    
    # Start backend server
    print_status "Starting backend server..."
    npm start &
    BACKEND_PID=$!
    echo $BACKEND_PID > "$PROJECT_ROOT/.backend.pid"
    
    # Wait for backend to be ready
    sleep 5
    if curl -s http://localhost:3001/health > /dev/null; then
        print_success "Backend server started successfully on http://localhost:3001"
    else
        print_error "Backend server failed to start"
        kill $BACKEND_PID 2>/dev/null || true
        exit 1
    fi
}

# Function to start frontend
start_frontend() {
    print_status "Starting LuxuryWatch Frontend..."
    
    cd "$FRONTEND_DIR"
    
    # Install frontend dependencies
    if [ ! -d "node_modules" ]; then
        print_status "Installing frontend dependencies..."
        pnpm install
    fi
    
    # Build frontend for production
    if [ "$1" = "production" ]; then
        print_status "Building frontend for production..."
        pnpm run build
        print_status "Starting frontend preview server..."
        pnpm run preview &
        FRONTEND_PID=$!
    else
        print_status "Starting frontend development server..."
        pnpm run dev &
        FRONTEND_PID=$!
    fi
    
    echo $FRONTEND_PID > "$PROJECT_ROOT/.frontend.pid"
    print_success "Frontend server started successfully"
}

# Function to stop services
stop_services() {
    print_status "Stopping services..."
    
    if [ -f "$PROJECT_ROOT/.backend.pid" ]; then
        BACKEND_PID=$(cat "$PROJECT_ROOT/.backend.pid")
        kill $BACKEND_PID 2>/dev/null || true
        rm -f "$PROJECT_ROOT/.backend.pid"
        print_status "Backend stopped"
    fi
    
    if [ -f "$PROJECT_ROOT/.frontend.pid" ]; then
        FRONTEND_PID=$(cat "$PROJECT_ROOT/.frontend.pid")
        kill $FRONTEND_PID 2>/dev/null || true
        rm -f "$PROJECT_ROOT/.frontend.pid"
        print_status "Frontend stopped"
    fi
}

# Function to show status
show_status() {
    print_status "LuxuryWatch Application Status:"
    echo "=========================="
    
    # Check backend
    if curl -s http://localhost:3001/health > /dev/null 2>&1; then
        print_success "Backend: Running on http://localhost:3001"
    else
        print_error "Backend: Not running"
    fi
    
    # Check frontend
    if curl -s http://localhost:3000 > /dev/null 2>&1; then
        print_success "Frontend: Running on http://localhost:3000"
    else
        print_error "Frontend: Not running"
    fi
}

# Function to show help
show_help() {
    echo "LuxuryWatch Full Stack Application Manager"
    echo "=========================================="
    echo ""
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  start [production]  - Start both frontend and backend (add 'production' for production build)"
    echo "  stop               - Stop all services"
    echo "  restart [production] - Restart all services"
    echo "  status             - Show application status"
    echo "  logs               - Show application logs"
    echo "  install            - Install all dependencies"
    echo "  help               - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 start           # Start in development mode"
    echo "  $0 start production # Start in production mode"
    echo "  $0 stop            # Stop all services"
    echo "  $0 status          # Check service status"
}

# Function to install dependencies
install_dependencies() {
    print_status "Installing all dependencies..."
    
    # Install backend dependencies
    if [ -d "$BACKEND_DIR" ]; then
        print_status "Installing backend dependencies..."
        cd "$BACKEND_DIR"
        npm install
    fi
    
    # Install frontend dependencies
    print_status "Installing frontend dependencies..."
    cd "$FRONTEND_DIR"
    pnpm install
    
    print_success "All dependencies installed successfully"
}

# Function to show logs
show_logs() {
    print_status "Application logs:"
    echo "=================="
    
    # Backend logs
    if [ -f "$BACKEND_DIR/logs/app.log" ]; then
        print_status "Backend logs (last 20 lines):"
        tail -n 20 "$BACKEND_DIR/logs/app.log"
        echo ""
    fi
    
    # PM2 logs (if using PM2)
    if command -v pm2 &> /dev/null; then
        print_status "PM2 logs:"
        pm2 logs --lines 20
    fi
}

# Signal handling
trap stop_services EXIT

# Main script logic
case "$1" in
    start)
        if [ "$2" = "production" ]; then
            start_backend
            start_frontend production
        else
            start_backend
            start_frontend
        fi
        print_success "LuxuryWatch application started successfully!"
        print_status "Frontend: http://localhost:3000"
        print_status "Backend: http://localhost:3001"
        print_status "Press Ctrl+C to stop all services"
        wait
        ;;
    stop)
        stop_services
        print_success "All services stopped"
        ;;
    restart)
        if [ "$2" = "production" ]; then
            stop_services
            sleep 2
            start_backend
            start_frontend production
        else
            stop_services
            sleep 2
            start_backend
            start_frontend
        fi
        print_success "LuxuryWatch application restarted"
        ;;
    status)
        show_status
        ;;
    logs)
        show_logs
        ;;
    install)
        install_dependencies
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        print_error "Unknown command: $1"
        show_help
        exit 1
        ;;
esac