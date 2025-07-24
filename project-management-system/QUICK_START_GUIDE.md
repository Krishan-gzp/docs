# 🚀 Quick Start Guide - Project Management System

## ⚡ Get Started in 5 Minutes!

### 🎯 Option 1: Docker (Recommended - Easiest)

```bash
# 1. Navigate to project directory
cd project-management-system

# 2. Start everything with one command
docker-compose up --build

# 3. Wait for all services to start (2-3 minutes)
# You'll see: "🟢 All services are running!"

# 4. Open your browser and visit:
# Frontend:    http://localhost:4200
# API Docs:    http://localhost:8000/docs  
# Middleware:  http://localhost:3000
```

### 🛠️ Option 2: Development Mode

```bash
# 1. Run the automated setup
cd project-management-system
chmod +x setup.sh
./setup.sh

# 2. Choose option 3 (Full setup) when prompted

# 3. Start all services
./start-dev.sh

# 4. Access the application:
# Frontend:    http://localhost:4200
# API Docs:    http://localhost:8000/docs
# Middleware:  http://localhost:3000
```

---

## 🧪 Test the System

### 1. 🔐 Test Authentication API

```bash
# Register a new user
curl -X POST "http://localhost:8000/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "full_name": "Test User",
    "password": "testpassword123"
  }'

# Login and get token
curl -X POST "http://localhost:8000/api/auth/login-json" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testpassword123"
  }'

# Save the token from response for next requests
```

### 2. 📁 Test Project Creation

```bash
# Create a project (replace YOUR_TOKEN with actual token)
curl -X POST "http://localhost:8000/api/projects/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "name": "My First Project",
    "description": "Testing the project management system",
    "status": "in_progress",
    "priority": "high"
  }'
```

### 3. ✅ Test Task Creation

```bash
# Create a task (replace PROJECT_ID and YOUR_TOKEN)
curl -X POST "http://localhost:8000/api/tasks/" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "title": "Setup development environment",
    "description": "Install and configure all necessary tools",
    "project_id": 1,
    "status": "todo",
    "priority": "high"
  }'
```

### 4. 📁 Test File Upload

```bash
# Upload a file to middleware
curl -X POST "http://localhost:3000/api/files/upload" \
  -F "file=@/path/to/your/file.pdf"
```

### 5. 📊 Test Analytics

```bash
# Get dashboard statistics
curl -X GET "http://localhost:8000/api/analytics/dashboard" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🌐 Using the Web Interface

### 1. 🔐 Login/Register
1. Go to `http://localhost:4200`
2. Click "Register" to create a new account
3. Fill in your details and register
4. Login with your credentials

### 2. 📁 Create Your First Project
1. Click "Projects" in the navigation
2. Click "➕ New Project" button
3. Fill in project details:
   - Name: "My First Project"
   - Description: "Learning the system"
   - Priority: High
   - Status: In Progress
4. Click "Create Project"

### 3. ✅ Add Tasks to Your Project
1. Click on your project to open it
2. Click "Add Task" 
3. Create tasks like:
   - "Setup project structure"
   - "Design user interface"
   - "Implement features"
   - "Test and deploy"
4. Assign tasks to team members
5. Set due dates and priorities

### 4. 👥 Invite Team Members
1. In your project, click "Team" tab
2. Click "Add Member"
3. Search for users by email/username
4. Set their role (Admin, Member, Viewer)
5. Send invitation

### 5. 📊 View Analytics
1. Click "Analytics" in the navigation
2. See your dashboard with:
   - Project completion rates
   - Task statistics
   - Team performance
   - Progress charts

---

## 🔍 Test ChromaDB Search

### 1. Add Content for Search
```bash
# The system automatically indexes:
# - Project descriptions
# - Task descriptions  
# - Uploaded document content
```

### 2. Test Semantic Search
```bash
# Search for similar content
curl -X GET "http://localhost:8000/api/projects/1/search?query=user%20authentication&limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### 3. Get Similar Tasks
```bash
# Find tasks similar to a specific task
curl -X GET "http://localhost:8000/api/tasks/1/similar?limit=5" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## ⚡ Test Real-time Features

### 1. 🔔 Real-time Notifications
1. Open the frontend in two browser windows
2. Login as different users in each
3. In one window, create/update a task
4. Watch the other window receive live notifications

### 2. 🌐 Live Updates
1. Open a project in multiple browser tabs
2. Update task status in one tab
3. See instant updates in other tabs
4. No page refresh needed!

---

## 🐛 Troubleshooting

### Common Issues & Solutions

**1. Port Already in Use**
```bash
# Check what's using the ports
lsof -i :4200  # Frontend
lsof -i :8000  # Backend  
lsof -i :3000  # Middleware
lsof -i :5432  # PostgreSQL

# Kill processes if needed
kill -9 <PID>
```

**2. Database Connection Issues**
```bash
# Make sure PostgreSQL is running
pg_isready -h localhost -p 5432

# Or use Docker PostgreSQL
docker run --name postgres-pm -e POSTGRES_PASSWORD=password -p 5432:5432 -d postgres:15
```

**3. ChromaDB Issues**
```bash
# Start ChromaDB manually
pip install chromadb
chroma run --host localhost --port 8001

# Or let the system use embedded mode (automatic fallback)
```

**4. Node.js Dependencies**
```bash
# If npm install fails in middleware
cd middleware
rm -rf node_modules package-lock.json
npm install
```

**5. Python Dependencies**
```bash
# If pip install fails in backend
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install --upgrade pip
pip install -r requirements.txt
```

---

## 📋 Verification Checklist

After setup, verify these features work:

- [ ] ✅ Frontend loads at http://localhost:4200
- [ ] ✅ API docs load at http://localhost:8000/docs  
- [ ] ✅ Middleware responds at http://localhost:3000
- [ ] ✅ User registration works
- [ ] ✅ User login works and returns JWT token
- [ ] ✅ Can create projects
- [ ] ✅ Can create tasks within projects
- [ ] ✅ Can upload files
- [ ] ✅ Real-time notifications work
- [ ] ✅ Analytics dashboard shows data
- [ ] ✅ Search functionality works
- [ ] ✅ All database tables created

---

## 🎯 Next Steps

Once everything is running:

1. **Explore the API**: Visit http://localhost:8000/docs
2. **Test all features**: Create projects, tasks, upload files
3. **Invite team members**: Test collaboration features
4. **Check analytics**: Monitor project progress
5. **Test search**: Try semantic search with ChromaDB
6. **Customize**: Modify the code to fit your needs

---

## 📞 Need Help?

If you encounter issues:

1. Check the logs: `docker-compose logs` or individual service logs
2. Verify all ports are available
3. Ensure you have the latest Docker/Node.js/Python versions
4. Check the troubleshooting section above
5. Review the full README.md for detailed information

**The system is ready to use immediately after setup!** 🚀