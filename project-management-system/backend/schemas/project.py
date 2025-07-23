from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models.project import ProjectStatus, ProjectPriority
from .user import UserResponse

class ProjectBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: ProjectStatus = ProjectStatus.PLANNING
    priority: ProjectPriority = ProjectPriority.MEDIUM
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget: Optional[str] = None

class ProjectCreate(ProjectBase):
    pass

class ProjectUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[ProjectStatus] = None
    priority: Optional[ProjectPriority] = None
    start_date: Optional[datetime] = None
    end_date: Optional[datetime] = None
    budget: Optional[str] = None
    progress: Optional[int] = Field(None, ge=0, le=100)

class ProjectMemberAdd(BaseModel):
    user_id: int
    role: str = Field(default="member", regex="^(owner|admin|member|viewer)$")

class ProjectMemberUpdate(BaseModel):
    role: str = Field(..., regex="^(owner|admin|member|viewer)$")

class ProjectMemberResponse(BaseModel):
    id: int
    user: UserResponse
    role: str
    joined_at: datetime

    class Config:
        from_attributes = True

class ProjectResponse(ProjectBase):
    id: int
    owner_id: int
    owner: UserResponse
    progress: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    members: List[ProjectMemberResponse] = []
    tasks_count: int = 0
    completed_tasks_count: int = 0

    class Config:
        from_attributes = True

class ProjectSummary(BaseModel):
    id: int
    name: str
    status: ProjectStatus
    priority: ProjectPriority
    progress: int
    owner: UserResponse
    tasks_count: int
    completed_tasks_count: int
    created_at: datetime

    class Config:
        from_attributes = True