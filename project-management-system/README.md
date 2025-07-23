# Project Management System

A comprehensive project management system built with Python FastAPI backend, Angular frontend, Node.js middleware, and ChromaDB for semantic search capabilities.

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Angular UI    │    │  Node.js        │    │  Python FastAPI │
│   (Frontend)    │◄──►│  Middleware     │◄──►│   (Backend)     │
│   Port: 4200    │    │   Port: 3000    │    │   Port: 8000    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐    ┌─────────────────┐
                    │   PostgreSQL    │    │    ChromaDB     │
                    │   Database      │    │  Vector Store   │
                    │   Port: 5432    │    │   Port: 8001    │
                    └─────────────────┘    └─────────────────┘
```

## 🚀 Features

### Core Features
- **User Management**: Registration, authentication, profile management
- **Project Management**: Create, update, delete projects with team collaboration
- **Task Management**: Task creation, assignment, status tracking, comments
- **Real-time Updates**: WebSocket-based live updates
- **File Management**: Upload, process, and manage project files
- **Analytics**: Project progress, task completion rates, performance metrics

### Advanced Features
- **Semantic Search**: ChromaDB-powered document and task similarity search
- **Role-based Access Control**: Project owners, admins, members, viewers
- **Real-time Notifications**: Socket.IO integration for live updates
- **File Processing**: Image thumbnails, PDF text extraction, document parsing
- **Data Visualization**: Charts and graphs for project analytics
- **RESTful API**: Complete REST API with OpenAPI documentation

## 🛠️ Technology Stack

### Backend (Python)
- **FastAPI**: Modern, fast web framework
- **SQLAlchemy**: ORM for database operations
- **PostgreSQL**: Primary database
- **ChromaDB**: Vector database for semantic search
- **Pydantic**: Data validation and serialization
- **JWT**: Authentication and authorization

### Middleware (Node.js)
- **Express.js**: Web application framework
- **Socket.IO**: Real-time bidirectional communication
- **Multer**: File upload handling
- **Sharp**: Image processing
- **PDF-Parse**: PDF text extraction

### Frontend (Angular)
- **Angular 17**: Modern web framework
- **Angular Material**: UI component library
- **RxJS**: Reactive programming
- **Chart.js**: Data visualization
- **Socket.IO Client**: Real-time updates

### Database & Storage
- **PostgreSQL**: Relational database
- **ChromaDB**: Vector database for embeddings
- **File System**: Local file storage

## 📦 Installation & Setup

### Prerequisites
- Python 3.8+
- Node.js 18+
- PostgreSQL 12+
- npm or yarn

### 1. Clone the Repository
```bash
git clone <repository-url>
cd project-management-system
```

### 2. Setup PostgreSQL Database
```bash
# Create database
createdb project_management

# Update connection string in backend/.env
DATABASE_URL=postgresql://username:password@localhost:5432/project_management
```

### 3. Setup Python Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Run database migrations
python main.py
```

### 4. Setup Node.js Middleware
```bash
cd ../middleware
npm install

# Setup environment variables
cp .env.example .env
# Edit .env with your configuration

# Start the middleware server
npm start
```

### 5. Setup Angular Frontend
```bash
cd ../frontend/project-management-app
npm install

# Start the development server
npm start
```

### 6. Setup ChromaDB (Optional)
```bash
# Install ChromaDB
pip install chromadb

# Start ChromaDB server (if using HTTP client)
chroma run --host localhost --port 8001
```

## 🚀 Quick Start

### Using Docker (Recommended)
```bash
# Build and start all services
docker-compose up --build

# Access the application
# Frontend: http://localhost:4200
# Backend API: http://localhost:8000
# Middleware: http://localhost:3000
```

### Manual Start
```bash
# Terminal 1: Start Backend
cd backend
source venv/bin/activate
python main.py

# Terminal 2: Start Middleware
cd middleware
npm start

# Terminal 3: Start Frontend
cd frontend/project-management-app
npm start

# Terminal 4: Start ChromaDB (optional)
chroma run --host localhost --port 8001
```

## 📖 API Documentation

### Backend API
- **URL**: http://localhost:8000/docs
- **Interactive**: Swagger UI with all endpoints
- **Authentication**: JWT Bearer tokens

### Key Endpoints

#### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

#### Projects
- `GET /api/projects/` - List projects
- `POST /api/projects/` - Create project
- `GET /api/projects/{id}` - Get project details
- `PUT /api/projects/{id}` - Update project
- `DELETE /api/projects/{id}` - Delete project

#### Tasks
- `GET /api/tasks/` - List tasks
- `POST /api/tasks/` - Create task
- `GET /api/tasks/{id}` - Get task details
- `PUT /api/tasks/{id}` - Update task
- `DELETE /api/tasks/{id}` - Delete task

#### Analytics
- `GET /api/analytics/dashboard` - Dashboard statistics
- `GET /api/analytics/projects/{id}/stats` - Project analytics
- `GET /api/analytics/performance` - Performance metrics

### Middleware API
- **URL**: http://localhost:3000
- **File Upload**: `/api/files/upload`
- **Real-time**: WebSocket connections
- **Notifications**: `/api/notifications`

## 🔧 Configuration

### Backend Configuration (.env)
```env
DATABASE_URL=postgresql://user:password@localhost:5432/project_management
CHROMA_HOST=localhost
CHROMA_PORT=8001
SECRET_KEY=your-secret-key-here
ACCESS_TOKEN_EXPIRE_MINUTES=30
```

### Middleware Configuration (.env)
```env
PORT=3000
PYTHON_API_URL=http://localhost:8000
UPLOAD_DIR=uploads
MAX_FILE_SIZE=10485760
```

### Frontend Configuration
Update `src/environments/environment.ts`:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8000/api',
  middlewareUrl: 'http://localhost:3000/api',
  socketUrl: 'http://localhost:3000'
};
```

## 🧪 Testing

### Backend Tests
```bash
cd backend
pytest
```

### Frontend Tests
```bash
cd frontend/project-management-app
npm test
```

### Middleware Tests
```bash
cd middleware
npm test
```

## 📊 Features Overview

### User Management
- User registration and authentication
- Profile management
- Role-based access control
- Password reset functionality

### Project Management
- Create and manage projects
- Team collaboration
- Project status tracking
- Progress monitoring

### Task Management
- Task creation and assignment
- Status tracking (Todo, In Progress, In Review, Done)
- Priority levels (Low, Medium, High, Urgent)
- Comments and attachments
- Subtask support

### Real-time Features
- Live project updates
- Real-time task changes
- Instant notifications
- WebSocket connections

### Analytics & Reporting
- Project progress tracking
- Task completion rates
- Team performance metrics
- Time tracking
- Custom reports

### File Management
- File upload and storage
- Image thumbnail generation
- PDF text extraction
- Document processing
- File sharing

### Search & Discovery
- Semantic search using ChromaDB
- Similar task recommendations
- Project document search
- Full-text search capabilities

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue in the GitHub repository
- Check the documentation
- Review the API documentation at http://localhost:8000/docs

## 🎯 Roadmap

- [ ] Mobile app (React Native)
- [ ] Advanced reporting
- [ ] Integration with external tools (Slack, Jira, etc.)
- [ ] Advanced AI features
- [ ] Multi-tenant support
- [ ] Advanced security features

---

**Built with ❤️ using Python, Node.js, and Angular**