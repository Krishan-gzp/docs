from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List
from database.connection import get_db
from models.user import User
from models.project import Project
from models.task import Task
from schemas.user import UserResponse, UserUpdate, UserProfile, UserPasswordUpdate
from services.auth import get_current_active_user, get_current_admin_user

router = APIRouter()

@router.get("/", response_model=List[UserResponse])
def list_users(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).offset(skip).limit(limit).all()
    return users

@router.get("/me", response_model=UserProfile)
def get_current_user_profile(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get user stats
    projects_count = db.query(Project).filter(Project.owner_id == current_user.id).count()
    tasks_count = db.query(Task).filter(Task.assignee_id == current_user.id).count()
    
    user_profile = UserProfile(
        **current_user.__dict__,
        projects_count=projects_count,
        tasks_count=tasks_count
    )
    return user_profile

@router.get("/{user_id}", response_model=UserResponse)
def get_user(
    user_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Users can only see their own profile or admins can see all
    if user_id != current_user.id and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to view this user")
    
    return user

@router.put("/me", response_model=UserResponse)
def update_current_user(
    user_update: UserUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check if email/username already exists (excluding current user)
    if user_update.email or user_update.username:
        existing_user = db.query(User).filter(
            User.id != current_user.id,
            (User.email == user_update.email) | (User.username == user_update.username)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email or username already exists"
            )
    
    # Update user
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    db.commit()
    db.refresh(current_user)
    
    return current_user

@router.put("/me/password")
def update_password(
    password_update: UserPasswordUpdate,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Verify current password
    if not current_user.verify_password(password_update.current_password):
        raise HTTPException(
            status_code=400,
            detail="Incorrect current password"
        )
    
    # Update password
    current_user.hashed_password = User.get_password_hash(password_update.new_password)
    db.commit()
    
    return {"message": "Password updated successfully"}

@router.put("/{user_id}", response_model=UserResponse)
def update_user(
    user_id: int,
    user_update: UserUpdate,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Check if email/username already exists (excluding target user)
    if user_update.email or user_update.username:
        existing_user = db.query(User).filter(
            User.id != user_id,
            (User.email == user_update.email) | (User.username == user_update.username)
        ).first()
        
        if existing_user:
            raise HTTPException(
                status_code=400,
                detail="Email or username already exists"
            )
    
    # Update user
    update_data = user_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(user, field, value)
    
    db.commit()
    db.refresh(user)
    
    return user

@router.delete("/{user_id}")
def delete_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Prevent self-deletion
    if user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot delete your own account")
    
    # Deactivate instead of delete to preserve data integrity
    user.is_active = False
    db.commit()
    
    return {"message": "User deactivated successfully"}

@router.post("/{user_id}/activate")
def activate_user(
    user_id: int,
    current_user: User = Depends(get_current_admin_user),
    db: Session = Depends(get_db)
):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_active = True
    db.commit()
    
    return {"message": "User activated successfully"}

@router.get("/search/{query}", response_model=List[UserResponse])
def search_users(
    query: str,
    limit: int = Query(10, ge=1, le=50),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    users = db.query(User).filter(
        (User.username.ilike(f"%{query}%")) |
        (User.full_name.ilike(f"%{query}%")) |
        (User.email.ilike(f"%{query}%"))
    ).filter(User.is_active == True).limit(limit).all()
    
    return users