from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
import chromadb
from chromadb.config import Settings as ChromaSettings
from config import settings
import asyncio

# SQLAlchemy setup
SQLALCHEMY_DATABASE_URL = settings.DATABASE_URL
ASYNC_DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+asyncpg://")

engine = create_engine(SQLALCHEMY_DATABASE_URL)
async_engine = create_async_engine(ASYNC_DATABASE_URL)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
AsyncSessionLocal = sessionmaker(async_engine, class_=AsyncSession, expire_on_commit=False)

Base = declarative_base()

# ChromaDB setup
chroma_client = None
chroma_collection = None

def get_chroma_client():
    global chroma_client
    if chroma_client is None:
        try:
            chroma_client = chromadb.HttpClient(
                host=settings.CHROMA_HOST,
                port=settings.CHROMA_PORT,
                settings=ChromaSettings(allow_reset=True)
            )
        except Exception as e:
            print(f"Failed to connect to ChromaDB: {e}")
            # Fallback to persistent client
            chroma_client = chromadb.PersistentClient(path="./chroma_db")
    return chroma_client

def get_chroma_collection():
    global chroma_collection
    if chroma_collection is None:
        client = get_chroma_client()
        try:
            chroma_collection = client.get_or_create_collection(
                name=settings.CHROMA_COLLECTION_NAME,
                metadata={"description": "Project management documents and embeddings"}
            )
        except Exception as e:
            print(f"Failed to create ChromaDB collection: {e}")
            chroma_collection = None
    return chroma_collection

# Database dependency
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

async def get_async_db():
    async with AsyncSessionLocal() as session:
        yield session

async def init_db():
    """Initialize database tables"""
    from models import user, project, task  # Import all models
    
    async with async_engine.begin() as conn:
        # Create all tables
        await conn.run_sync(Base.metadata.create_all)
    
    # Initialize ChromaDB
    get_chroma_collection()
    print("Database initialized successfully!")