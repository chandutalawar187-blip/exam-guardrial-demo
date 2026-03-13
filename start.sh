#!/bin/bash

# Exam Guardrail - Quick Start Script
# This script sets up and runs the entire application

set -e  # Exit on error

echo "🛡️  Exam Guardrail - Quick Start"
echo "================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Check if running from correct directory
if [ ! -f "requirements.txt" ]; then
    echo -e "${RED}❌ Error: Run this script from the project root directory${NC}"
    exit 1
fi

# Menu
echo -e "${BLUE}Select what to do:${NC}"
echo "1. Quick Start (requires Supabase setup)"
echo "2. Backend only"
echo "3. Frontend only"
echo "4. Install dependencies & run seed"
echo "5. Install dependencies only"
echo ""
read -p "Enter choice (1-5): " choice

case $choice in
    1)
        echo ""
        echo -e "${YELLOW}Quick Start Mode${NC}"
        echo "=================="
        
        # Check for .env.backend
        if [ ! -f ".env.backend" ]; then
            echo -e "${RED}❌ .env.backend not found!${NC}"
            echo "Please create .env.backend with your Supabase credentials:"
            echo ""
            echo "  SUPABASE_URL=https://your-project-id.supabase.co"
            echo "  SUPABASE_KEY=your-anon-key-here"
            echo ""
            echo "See SUPABASE_SETUP.md for detailed instructions"
            exit 1
        fi
        
        # Install dependencies
        echo -e "${BLUE}📦 Installing Python dependencies...${NC}"
        pip install -q -r requirements.txt
        
        echo -e "${BLUE}📦 Installing Frontend dependencies...${NC}"
        cd interface-companion && npm install --quiet && cd ..
        
        echo ""
        echo -e "${GREEN}✓ Setup complete!${NC}"
        echo ""
        echo -e "${BLUE}Starting Backend...${NC}"
        cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
        BACKEND_PID=$!
        
        sleep 2
        
        echo -e "${BLUE}Starting Frontend...${NC}"
        cd ../interface-companion && npm run dev &
        FRONTEND_PID=$!
        
        echo ""
        echo -e "${GREEN}🚀 Application started!${NC}"
        echo "Backend:  http://localhost:8000"
        echo "Frontend: http://localhost:5173"
        echo ""
        echo "Press Ctrl+C to stop both services"
        wait
        ;;
        
    2)
        echo ""
        echo -e "${YELLOW}Docker MongoDB Setup${NC}"
        echo "===================="
        
        # Check if Docker is installed
        if ! command -v docker-compose &> /dev/null; then
            echo -e "${RED}❌ Docker Compose is not installed!${NC}"
            echo "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop"
            exit 1
        fi
        
        echo -e "${BLUE}🐳 Starting MongoDB with Docker Compose...${NC}"
        docker-compose up -d
        
        sleep 3
        
        # Create .env.backend if it doesn't exist
        if [ ! -f ".env.backend" ]; then
            echo -e "${BLUE}📝 Creating .env.backend for local MongoDB...${NC}"
            cat > .env.backend << EOF
MONGODB_URI=mongodb://admin:password@localhost:27017/exam_guardrail?authSource=admin
API_HOST=0.0.0.0
API_PORT=8000
EOF
            echo -e "${GREEN}✓ .env.backend created${NC}"
        fi
        
        # Create frontend .env
        if [ ! -f "interface-companion/.env.local" ]; then
            echo -e "${BLUE}📝 Creating .env.local for frontend...${NC}"
            echo "VITE_API_URL=http://localhost:8000" > interface-companion/.env.local
            echo -e "${GREEN}✓ .env.local created${NC}"
        fi
        
        echo ""
        echo -e "${GREEN}✓ MongoDB is running!${NC}"
        echo "MongoDB URL: mongodb://admin:password@localhost:27017/"
        echo "MongoDB Express: http://localhost:8081 (user: admin, pass: password)"
        echo ""
        
        read -p "Would you like to start Backend and Frontend? (y/n): " start_apps
        
        if [ "$start_apps" = "y" ] || [ "$start_apps" = "Y" ]; then
            # Install dependencies
            echo -e "${BLUE}📦 Installing Python dependencies...${NC}"
            pip install -q -r requirements.txt
            
            echo -e "${BLUE}📦 Installing Frontend dependencies...${NC}"
            cd interface-companion && npm install --quiet && cd ..
            
            echo -e "${BLUE}Starting Backend...${NC}"
            cd backend && python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000 &
            BACKEND_PID=$!
            
            sleep 2
            
            echo -e "${BLUE}Starting Frontend...${NC}"
            cd ../interface-companion && npm run dev &
            FRONTEND_PID=$!
            
            echo ""
            echo -e "${GREEN}🚀 Application started!${NC}"
            echo "Frontend: http://localhost:5173"
            echo "Backend:  http://localhost:8000"
            echo ""
            echo "Press Ctrl+C to stop"
            wait
        fi
        ;;
        
    3)
        echo ""
        echo -e "${YELLOW}Backend Only${NC}"
        echo "============"
        
        echo -e "${BLUE}📦 Installing Python dependencies...${NC}"
        pip install -q -r requirements.txt
        
        echo ""
        echo -e "${BLUE}Starting Backend...${NC}"
        cd backend
        python -m uvicorn main:app --reload --host 0.0.0.0 --port 8000
        ;;
        
    4)
        echo ""
        echo -e "${YELLOW}Frontend Only${NC}"
        echo "============="
        
        echo -e "${BLUE}📦 Installing dependencies...${NC}"
        cd interface-companion
        npm install --quiet
        
        echo ""
        echo -e "${BLUE}Starting Frontend...${NC}"
        npm run dev
        ;;
        
    5)
        echo ""
        echo -e "${YELLOW}Installing Dependencies${NC}"
        echo "======================="
        
        echo -e "${BLUE}📦 Installing Python dependencies...${NC}"
        pip install -q -r requirements.txt
        echo -e "${GREEN}✓ Python dependencies installed${NC}"
        
        echo -e "${BLUE}📦 Installing Frontend dependencies...${NC}"
        cd interface-companion
        npm install --quiet
        echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
        
        echo ""
        echo -e "${GREEN}✓ All dependencies installed!${NC}"
        ;;
        
    *)
        echo -e "${RED}Invalid choice!${NC}"
        exit 1
        ;;
esac
