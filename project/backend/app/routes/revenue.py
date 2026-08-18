from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.models import Revenue, Expense, User
from app.schemas.schemas import RevenueCreate, RevenueResponse, FinancialSummary
from app.services.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=RevenueResponse, status_code=status.HTTP_201_CREATED)
def create_revenue(
    revenue: RevenueCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record a new revenue entry"""
    new_revenue = Revenue(owner_id=current_user.id, **revenue.dict())
    db.add(new_revenue)
    db.commit()
    db.refresh(new_revenue)
    return new_revenue


@router.get("/", response_model=List[RevenueResponse])
def get_revenues(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all revenue entries for current user"""
    return db.query(Revenue).filter(
        Revenue.owner_id == current_user.id
    ).order_by(Revenue.created_at.desc()).all()


@router.get("/summary", response_model=FinancialSummary)
def get_financial_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get profit and loss summary"""
    total_revenue = db.query(
        func.sum(Revenue.total_amount)
    ).filter(Revenue.owner_id == current_user.id).scalar() or 0.0

    total_expenses = db.query(
        func.sum(Expense.amount)
    ).filter(Expense.owner_id == current_user.id).scalar() or 0.0

    return {
        "total_revenue": total_revenue,
        "total_expenses": total_expenses,
        "net_profit": total_revenue - total_expenses
    }