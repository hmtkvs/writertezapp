#!/bin/bash

# Define project directories and URLs
PROJECT_ROOT="$(pwd)"
BACKEND_DIR="$PROJECT_ROOT/thesis-search-api"
FRONTEND_DIR="$PROJECT_ROOT/thesis-search-navigator"
BACKEND_URL="http://localhost:8000"
FRONTEND_URL="http://localhost:8080"

# Set trap to ensure child processes are killed when this script exits
cleanup() {
  echo
  echo "Shutting down services..."
  
  # Kill any remaining background processes
  if [ ! -z "$BACKEND_PID" ] && ps -p $BACKEND_PID > /dev/null; then
    echo "Stopping backend API (PID: $BACKEND_PID)..."
    kill -TERM $BACKEND_PID 2>/dev/null || kill -KILL $BACKEND_PID 2>/dev/null
  fi
  
  if [ ! -z "$FRONTEND_PID" ] && ps -p $FRONTEND_PID > /dev/null; then
    echo "Stopping frontend application (PID: $FRONTEND_PID)..."
    kill -TERM $FRONTEND_PID 2>/dev/null || kill -KILL $FRONTEND_PID 2>/dev/null
  fi
  
  echo "All services stopped. Goodbye!"
  exit 0
}

# Set up trap for clean shutdown
trap cleanup INT TERM EXIT

echo "======================================================="
echo "         Thesis Search Navigator System Startup         "
echo "======================================================="

# Start the backend API server

echo "Starting backend API server..."
cd "$BACKEND_DIR"
./run_api.sh &
BACKEND_PID=$!

cd "$PROJECT_ROOT"
echo "Backend API started with PID: $BACKEND_PID"

# Wait briefly for backend to initialize
echo "Waiting for backend API to initialize..."
sleep 2

# Start the frontend in background
echo "Starting frontend application..."
cd "$FRONTEND_DIR"
npm run dev &
FRONTEND_PID=$!

cd "$PROJECT_ROOT"
echo "Frontend started with PID: $FRONTEND_PID"

# Print status information
echo
echo "======================================================="
echo "           System is now running!                       "
echo "======================================================="
echo "Backend API URL: $BACKEND_URL"
echo "Frontend URL:    $FRONTEND_URL"
echo
echo "Press Ctrl+C to stop all services and exit"
echo "======================================================="

# Keep the script running until user interrupts with Ctrl+C
wait 