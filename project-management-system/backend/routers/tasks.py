from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from typing import List, Optional
from database.connection import get_db
from models.user import User
from models.project import ProjectMember
from models.task import Task, TaskComment, TaskAttachment
from schemas.task import (
    TaskCreate, TaskUpdate, TaskResponse, TaskSummary,
    TaskCommentCreate, TaskCommentResponse
)
from services.auth import get_current_active_user
from services.chroma_service import chroma_service

router = APIRouter()

@router.post("/", response_model=TaskResponse)
def create_task(
    task: TaskCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if user has access to project
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == task.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not is_member and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to create tasks in this project")
    
    db_task = Task(
        **task.model_dump(),
        creator_id=current_user.id
    )
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    
    # Add to ChromaDB
    try:
        content = f"{task.title}\n{task.description or ''}"
        chroma_service.add_task_document(db_task.id, task.project_id, content)
    except Exception as e:
        print(f"Failed to add task to ChromaDB: {e}")
    
    return db_task

@router.get("/", response_model=List[TaskSummary])
def list_tasks(
    project_id: Optional[int] = Query(None),
    assignee_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    query = db.query(Task).options(
        joinedload(Task.assignee),
        joinedload(Task.creator)
    )
    
    # Filter by project if specified
    if project_id:
        # Check access to project
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to access this project")
        
        query = query.filter(Task.project_id == project_id)
    else:
        # Show only tasks from projects user has access to
        accessible_projects = db.query(ProjectMember.project_id).filter(
            ProjectMember.user_id == current_user.id
        ).subquery()
        query = query.filter(Task.project_id.in_(accessible_projects))
    
    # Additional filters
    if assignee_id:
        query = query.filter(Task.assignee_id == assignee_id)
    if status:
        query = query.filter(Task.status == status)
    
    tasks = query.offset(skip).limit(limit).all()
    return tasks

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).options(
        joinedload(Task.assignee),
        joinedload(Task.creator),
        joinedload(Task.comments).joinedload(TaskComment.user),
        joinedload(Task.attachments).joinedload(TaskAttachment.user),
        joinedload(Task.subtasks)
    ).filter(Task.id == task_id).first()
    
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check if user has access to the project
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == task.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not is_member and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this task")
    
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_update: TaskUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check permissions
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == task.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not is_member and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to update this task")
    
    # Update task
    update_data = task_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(task, field, value)
    
    # Set completed_at if status changed to done
    if task_update.status == "done" and task.status != "done":
        from datetime import datetime
        task.completed_at = datetime.utcnow()
    
    db.commit()
    db.refresh(task)
    
    # Update in ChromaDB
    try:
        content = f"{task.title}\n{task.description or ''}"
        chroma_service.update_document(f"task_{task_id}", content, {
            "type": "task",
            "task_id": task_id,
            "project_id": task.project_id
        })
    except Exception as e:
        print(f"Failed to update task in ChromaDB: {e}")
    
    return task

@router.delete("/{task_id}")
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check permissions (creator, assignee, or project admin/owner)
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == task.project_id,
        ProjectMember.user_id == current_user.id,
        ProjectMember.role.in_(["owner", "admin"])
    ).first()
    
    can_delete = (
        task.creator_id == current_user.id or
        task.assignee_id == current_user.id or
        is_member or
        current_user.is_admin
    )
    
    if not can_delete:
        raise HTTPException(status_code=403, detail="Not authorized to delete this task")
    
    # Delete from ChromaDB
    try:
        chroma_service.delete_document(f"task_{task_id}")
    except Exception as e:
        print(f"Failed to delete task from ChromaDB: {e}")
    
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted successfully"}

@router.post("/{task_id}/comments", response_model=TaskCommentResponse)
def create_comment(
    task_id: int,
    comment: TaskCommentCreate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check access
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == task.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not is_member and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to comment on this task")
    
    db_comment = TaskComment(
        task_id=task_id,
        user_id=current_user.id,
        content=comment.content
    )
    db.add(db_comment)
    db.commit()
    db.refresh(db_comment)
    
    return db_comment

@router.get("/{task_id}/similar")
def get_similar_tasks(
    task_id: int,
    limit: int = Query(5, ge=1, le=20),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    task = db.query(Task).filter(Task.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    
    # Check access
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == task.project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not is_member and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this task")
    
    # Find similar tasks using ChromaDB
    try:
        content = f"{task.title}\n{task.description or ''}"
        similar_docs = chroma_service.get_similar_tasks(content, task.project_id, limit)
        return {"similar_tasks": similar_docs}
    except Exception as e:
        print(f"Similar tasks search error: {e}")
        return {"similar_tasks": []}