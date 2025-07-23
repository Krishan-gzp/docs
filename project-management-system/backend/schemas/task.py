from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime
from models.task import TaskStatus, TaskPriority
from .user import UserResponse

class TaskBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.TODO
    priority: TaskPriority = TaskPriority.MEDIUM
    assignee_id: Optional[int] = None
    parent_task_id: Optional[int] = None
    estimated_hours: Optional[int] = Field(None, ge=0)
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    is_milestone: bool = False
    tags: Optional[str] = None

class TaskCreate(TaskBase):
    project_id: int

class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    assignee_id: Optional[int] = None
    parent_task_id: Optional[int] = None
    estimated_hours: Optional[int] = Field(None, ge=0)
    actual_hours: Optional[int] = Field(None, ge=0)
    start_date: Optional[datetime] = None
    due_date: Optional[datetime] = None
    is_milestone: Optional[bool] = None
    tags: Optional[str] = None

class TaskCommentCreate(BaseModel):
    content: str = Field(..., min_length=1)

class TaskCommentResponse(BaseModel):
    id: int
    content: str
    user: UserResponse
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TaskAttachmentResponse(BaseModel):
    id: int
    filename: str
    file_size: int
    content_type: str
    user: UserResponse
    created_at: datetime

    class Config:
        from_attributes = True

class TaskResponse(TaskBase):
    id: int
    project_id: int
    creator_id: int
    creator: UserResponse
    assignee: Optional[UserResponse] = None
    parent_task: Optional["TaskResponse"] = None
    actual_hours: Optional[int] = None
    completed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: Optional[datetime] = None
    comments: List[TaskCommentResponse] = []
    attachments: List[TaskAttachmentResponse] = []
    subtasks: List["TaskResponse"] = []

    class Config:
        from_attributes = True

class TaskSummary(BaseModel):
    id: int
    title: str
    status: TaskStatus
    priority: TaskPriority
    assignee: Optional[UserResponse] = None
    due_date: Optional[datetime] = None
    is_milestone: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Enable forward references
TaskResponse.model_rebuild()