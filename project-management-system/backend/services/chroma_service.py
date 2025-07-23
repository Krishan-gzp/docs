from typing import List, Dict, Any, Optional
import uuid
from database.connection import get_chroma_collection
import json

class ChromaService:
    def __init__(self):
        self.collection = get_chroma_collection()
    
    def add_document(self, 
                    content: str, 
                    metadata: Dict[str, Any], 
                    document_id: Optional[str] = None) -> str:
        """Add a document to ChromaDB with embeddings"""
        if not self.collection:
            raise Exception("ChromaDB collection not available")
        
        if not document_id:
            document_id = str(uuid.uuid4())
        
        try:
            self.collection.add(
                documents=[content],
                metadatas=[metadata],
                ids=[document_id]
            )
            return document_id
        except Exception as e:
            raise Exception(f"Failed to add document to ChromaDB: {str(e)}")
    
    def search_documents(self, 
                        query: str, 
                        n_results: int = 10,
                        where: Optional[Dict[str, Any]] = None) -> List[Dict[str, Any]]:
        """Search documents using semantic similarity"""
        if not self.collection:
            return []
        
        try:
            results = self.collection.query(
                query_texts=[query],
                n_results=n_results,
                where=where
            )
            
            documents = []
            if results['documents'] and results['documents'][0]:
                for i, doc in enumerate(results['documents'][0]):
                    documents.append({
                        'id': results['ids'][0][i],
                        'content': doc,
                        'metadata': results['metadatas'][0][i] if results['metadatas'] and results['metadatas'][0] else {},
                        'distance': results['distances'][0][i] if results['distances'] and results['distances'][0] else None
                    })
            
            return documents
        except Exception as e:
            print(f"ChromaDB search error: {str(e)}")
            return []
    
    def update_document(self, 
                       document_id: str, 
                       content: str, 
                       metadata: Dict[str, Any]) -> bool:
        """Update an existing document"""
        if not self.collection:
            return False
        
        try:
            self.collection.update(
                ids=[document_id],
                documents=[content],
                metadatas=[metadata]
            )
            return True
        except Exception as e:
            print(f"Failed to update document in ChromaDB: {str(e)}")
            return False
    
    def delete_document(self, document_id: str) -> bool:
        """Delete a document from ChromaDB"""
        if not self.collection:
            return False
        
        try:
            self.collection.delete(ids=[document_id])
            return True
        except Exception as e:
            print(f"Failed to delete document from ChromaDB: {str(e)}")
            return False
    
    def add_project_document(self, project_id: int, content: str, doc_type: str = "project") -> str:
        """Add project-related document"""
        metadata = {
            "type": doc_type,
            "project_id": project_id,
            "created_at": str(uuid.uuid4())
        }
        return self.add_document(content, metadata)
    
    def add_task_document(self, task_id: int, project_id: int, content: str, doc_type: str = "task") -> str:
        """Add task-related document"""
        metadata = {
            "type": doc_type,
            "task_id": task_id,
            "project_id": project_id,
            "created_at": str(uuid.uuid4())
        }
        return self.add_document(content, metadata)
    
    def search_project_documents(self, project_id: int, query: str, n_results: int = 10) -> List[Dict[str, Any]]:
        """Search documents within a specific project"""
        where_filter = {"project_id": project_id}
        return self.search_documents(query, n_results, where_filter)
    
    def get_similar_tasks(self, task_content: str, project_id: int, n_results: int = 5) -> List[Dict[str, Any]]:
        """Find similar tasks within a project"""
        where_filter = {"type": "task", "project_id": project_id}
        return self.search_documents(task_content, n_results, where_filter)

# Global instance
chroma_service = ChromaService()