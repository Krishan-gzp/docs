from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import List, Dict, Any
from datetime import datetime, timedelta
from database.connection import get_db
from models.user import User
from models.project import Project, ProjectMember
from models.task import Task, TaskStatus
from services.auth import get_current_active_user

router = APIRouter()

@router.get("/dashboard")
def get_dashboard_stats(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get user's accessible projects
    accessible_projects = db.query(ProjectMember.project_id).filter(
        ProjectMember.user_id == current_user.id
    ).subquery()
    
    # Basic stats
    total_projects = db.query(Project).join(ProjectMember).filter(
        ProjectMember.user_id == current_user.id
    ).count()
    
    total_tasks = db.query(Task).filter(
        Task.project_id.in_(accessible_projects)
    ).count()
    
    my_tasks = db.query(Task).filter(
        Task.assignee_id == current_user.id
    ).count()
    
    completed_tasks = db.query(Task).filter(
        and_(
            Task.project_id.in_(accessible_projects),
            Task.status == TaskStatus.DONE
        )
    ).count()
    
    # Recent activity (last 7 days)
    week_ago = datetime.utcnow() - timedelta(days=7)
    recent_tasks = db.query(Task).filter(
        and_(
            Task.project_id.in_(accessible_projects),
            Task.created_at >= week_ago
        )
    ).count()
    
    return {
        "total_projects": total_projects,
        "total_tasks": total_tasks,
        "my_tasks": my_tasks,
        "completed_tasks": completed_tasks,
        "completion_rate": (completed_tasks / total_tasks * 100) if total_tasks > 0 else 0,
        "recent_tasks": recent_tasks
    }

@router.get("/projects/{project_id}/stats")
def get_project_stats(
    project_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Check access
    is_member = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id,
        ProjectMember.user_id == current_user.id
    ).first()
    
    if not is_member and not current_user.is_admin:
        raise HTTPException(status_code=403, detail="Not authorized to access this project")
    
    project = db.query(Project).filter(Project.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")
    
    # Task statistics by status
    task_stats = db.query(
        Task.status,
        func.count(Task.id).label('count')
    ).filter(Task.project_id == project_id).group_by(Task.status).all()
    
    status_counts = {status.value: 0 for status in TaskStatus}
    for stat in task_stats:
        status_counts[stat.status.value] = stat.count
    
    # Task statistics by priority
    priority_stats = db.query(
        Task.priority,
        func.count(Task.id).label('count')
    ).filter(Task.project_id == project_id).group_by(Task.priority).all()
    
    priority_counts = {}
    for stat in priority_stats:
        priority_counts[stat.priority.value] = stat.count
    
    # Member statistics
    member_count = db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).count()
    
    # Task assignment statistics
    assignment_stats = db.query(
        User.full_name,
        func.count(Task.id).label('task_count'),
        func.count(func.nullif(Task.status == TaskStatus.DONE, False)).label('completed_count')
    ).outerjoin(Task, Task.assignee_id == User.id).filter(
        Task.project_id == project_id
    ).group_by(User.id, User.full_name).all()
    
    member_stats = []
    for stat in assignment_stats:
        member_stats.append({
            "name": stat.full_name,
            "total_tasks": stat.task_count,
            "completed_tasks": stat.completed_count or 0,
            "completion_rate": (stat.completed_count / stat.task_count * 100) if stat.task_count > 0 else 0
        })
    
    # Timeline data (last 30 days)
    thirty_days_ago = datetime.utcnow() - timedelta(days=30)
    timeline_data = db.query(
        func.date(Task.created_at).label('date'),
        func.count(Task.id).label('tasks_created')
    ).filter(
        and_(
            Task.project_id == project_id,
            Task.created_at >= thirty_days_ago
        )
    ).group_by(func.date(Task.created_at)).all()
    
    timeline = []
    for data in timeline_data:
        timeline.append({
            "date": data.date.isoformat(),
            "tasks_created": data.tasks_created
        })
    
    return {
        "project": {
            "id": project.id,
            "name": project.name,
            "status": project.status.value,
            "progress": project.progress
        },
        "task_status_distribution": status_counts,
        "task_priority_distribution": priority_counts,
        "member_count": member_count,
        "member_performance": member_stats,
        "timeline": timeline
    }

@router.get("/tasks/trends")
def get_task_trends(
    days: int = Query(30, ge=1, le=365),
    project_id: int = Query(None),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Date range
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Base query
    query = db.query(
        func.date(Task.created_at).label('date'),
        func.count(Task.id).label('created'),
        func.count(func.nullif(Task.status != TaskStatus.DONE, True)).label('completed')
    ).filter(Task.created_at >= start_date)
    
    # Filter by project if specified
    if project_id:
        # Check access
        is_member = db.query(ProjectMember).filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == current_user.id
        ).first()
        
        if not is_member and not current_user.is_admin:
            raise HTTPException(status_code=403, detail="Not authorized to access this project")
        
        query = query.filter(Task.project_id == project_id)
    else:
        # Show only tasks from accessible projects
        accessible_projects = db.query(ProjectMember.project_id).filter(
            ProjectMember.user_id == current_user.id
        ).subquery()
        query = query.filter(Task.project_id.in_(accessible_projects))
    
    trends = query.group_by(func.date(Task.created_at)).all()
    
    trend_data = []
    for trend in trends:
        trend_data.append({
            "date": trend.date.isoformat(),
            "tasks_created": trend.created,
            "tasks_completed": trend.completed
        })
    
    return {"trends": trend_data}

@router.get("/workload")
def get_workload_analysis(
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    # Get user's task workload
    my_tasks = db.query(
        Task.status,
        func.count(Task.id).label('count')
    ).filter(Task.assignee_id == current_user.id).group_by(Task.status).all()
    
    workload = {status.value: 0 for status in TaskStatus}
    for task in my_tasks:
        workload[task.status.value] = task.count
    
    # Overdue tasks
    overdue_tasks = db.query(Task).filter(
        and_(
            Task.assignee_id == current_user.id,
            Task.due_date < datetime.utcnow(),
            Task.status.notin_([TaskStatus.DONE, TaskStatus.CANCELLED])
        )
    ).count()
    
    # Upcoming tasks (next 7 days)
    week_ahead = datetime.utcnow() + timedelta(days=7)
    upcoming_tasks = db.query(Task).filter(
        and_(
            Task.assignee_id == current_user.id,
            Task.due_date.between(datetime.utcnow(), week_ahead),
            Task.status.notin_([TaskStatus.DONE, TaskStatus.CANCELLED])
        )
    ).count()
    
    # Task priority distribution
    priority_distribution = db.query(
        Task.priority,
        func.count(Task.id).label('count')
    ).filter(
        and_(
            Task.assignee_id == current_user.id,
            Task.status.notin_([TaskStatus.DONE, TaskStatus.CANCELLED])
        )
    ).group_by(Task.priority).all()
    
    priority_counts = {}
    for priority in priority_distribution:
        priority_counts[priority.priority.value] = priority.count
    
    return {
        "status_distribution": workload,
        "overdue_tasks": overdue_tasks,
        "upcoming_tasks": upcoming_tasks,
        "priority_distribution": priority_counts
    }

@router.get("/performance")
def get_performance_metrics(
    days: int = Query(30, ge=1, le=365),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
):
    start_date = datetime.utcnow() - timedelta(days=days)
    
    # Tasks completed in period
    completed_tasks = db.query(Task).filter(
        and_(
            Task.assignee_id == current_user.id,
            Task.completed_at >= start_date,
            Task.status == TaskStatus.DONE
        )
    ).count()
    
    # Average completion time
    avg_completion_time = db.query(
        func.avg(
            func.extract('epoch', Task.completed_at - Task.created_at) / 3600
        ).label('avg_hours')
    ).filter(
        and_(
            Task.assignee_id == current_user.id,
            Task.completed_at >= start_date,
            Task.status == TaskStatus.DONE
        )
    ).scalar()
    
    # On-time completion rate
    on_time_completions = db.query(Task).filter(
        and_(
            Task.assignee_id == current_user.id,
            Task.completed_at >= start_date,
            Task.status == TaskStatus.DONE,
            Task.completed_at <= Task.due_date
        )
    ).count()
    
    on_time_rate = (on_time_completions / completed_tasks * 100) if completed_tasks > 0 else 0
    
    return {
        "period_days": days,
        "completed_tasks": completed_tasks,
        "average_completion_hours": round(avg_completion_time or 0, 2),
        "on_time_completion_rate": round(on_time_rate, 2),
        "tasks_per_day": round(completed_tasks / days, 2)
    }