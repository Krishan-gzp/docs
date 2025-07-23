from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from database.connection import get_db
from models.user import User
from models.project import Project, ProjectMember
from models.task import Task
from schemas.project import (
    ProjectCreate, ProjectUpdate, ProjectResponse, ProjectSummary,
    ProjectMemberAdd, ProjectMemberUpdate, ProjectMemberResponse
)
from services.auth import get_current_active_user
from services.chroma_service import chroma_service

router = APIRouter()

@router.post("/", response_model=ProjectResponse)
def create_project(
    project: ProjectCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    db_project = Project(
        **project.model_dump(),
        owner_id=current_user.id
    )
    db.add(db_project)
    db.commit()
    db.refresh(db_project)
    
    # Add owner as project member
    project_member = ProjectMember(
        project_id=db_project.id,
        user_id=current_user.id,
        role="owner"
    )
    db.add(project_member)
    db.commit()
    
    # Add to ChromaDB
    try:
        content = f"{project.name}\n{project.description or ''}"
        chroma_service.add_project_document(db_project.id, content)
    except Exception as e:
        print(f"Failed to add project to ChromaDB: {e}")
    
    return db_project

@router.get("/", response_model=List[ProjectSummary])
def list_projects(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get projects where user is owner or member
    projects = db.query(Project).join(ProjectMember).filter(
        ProjectMember.user_id == current_user.id
    ).options(
        joinedload(Project.owner)
    ).offset(skip).limit(limit).all()
    
    # Add task counts
    project_summaries = []
    for project in projects:
        tasks_count = db.query(Task).filter(Task.project_id == project.id).count()
        completed_tasks_count = db.query(Task).filter(
            Task.project_id == project.id,
            Task.status == "done"
        ).count()
        
        project_dict = project.__dict__.copy()
        project_dict['tasks_count'] = tasks_count
        project_dict['completed_tasks_count'] = completed_tasks_count
        project_summaries.append(project_dict)
    
    return project_summaries

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).options(
        joinedload(Project.owner),
        joinedload(Project.members)
    ).filter(Project.id == project_id).first()
    
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check if user has access to project
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not is_member and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
    # Add task counts
    tasks_count = db.query(Task).filter(Task.project_id == project_id).count()
    completed_tasks_count = db.query(Task).filter(
        Task.project_id == project_id,
        Task.status == "done"
    ).count()
    
    project_dict = project.__dict__.copy()
    project_dict['tasks_count'] = tasks_count
    project_dict['completed_tasks_count'] = completed_tasks_count
    
    return project_dict

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_update: ProjectUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check permissions (owner or admin role)
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id,
        ProjectMember.role.in_(["owner", "admin"])
    ).first()
    
    if not member and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to update this project")
    
    # Update project
    update_data = project_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)
    
    db.commit()
    db.refresh(project)
    
    # Update in ChromaDB
    try:
        content = f"{project.name}\n{project.description or ''}"
        chroma_service.update_document(f"project_{project_id}", content, {
            "type": "project",
            "project_id": project_id
        })
    except Exception as e:
        print(f"Failed to update project in ChromaDB: {e}")
    
    return project

@router.delete("/{project_id}")
def delete_project(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Only owner or admin can delete
    if project.owner_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to delete this project")
    
    # Delete from ChromaDB
    try:
        chroma_service.delete_document(f"project_{project_id}")
    except Exception as e:
        print(f"Failed to delete project from ChromaDB: {e}")
    
    db.delete(project)
    db.commit()
    
    return {"message": "Project deleted successfully"}

@router.post("/{project_id}/members", response_model=ProjectMemberResponse)
def add_project_member(
    project_id: int,
    member_data: ProjectMemberAdd,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Check permissions
    member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id,
        ProjectMember.role.in_(["owner", "admin"])
    ).first()
    
    if not member and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to add members")
    
    # Check if user exists
    user = db.query(User).filter(User.id == member_data.user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if already a member
    existing_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == member_data.user_id
    ).first()
    
    if existing_member:
        raise HTTPException(status_code=400, detail="User is already a project member")
    
    # Add member
    new_member = ProjectMember(
        project_id=project_id,
        user_id=member_data.user_id,
        role=member_data.role
    )
    db.add(new_member)
    db.commit()
    db.refresh(new_member)
    
    return new_member

@router.get("/{project_id}/search")
def search_project_documents(
    project_id: int,
    query: str = Query(..., min_length=1),
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if user has access to project
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not is_member and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
    # Search in ChromaDB
    try:
        results = chroma_service.search_project_documents(project_id, query, limit)
        return {"results": results}
    except Exception as e:
        print(f"Search error: {e}")
        return {"results": []}