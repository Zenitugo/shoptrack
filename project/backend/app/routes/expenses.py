from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List
from app.database import get_db
from app.models.models import Expense, User
from app.schemas.schemas import ExpenseCreate, ExpenseResponse, ExpenseSummary
from app.services.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=ExpenseResponse, status_code=status.HTTP_201_CREATED)
def create_expense(
    expense: ExpenseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record a new expense"""
    new_expense = Expense(owner_id=current_user.id, **expense.dict())
    db.add(new_expense)
    db.commit()
    db.refresh(new_expense)
    return new_expense


@router.get("/", response_model=List[ExpenseResponse])
def get_expenses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all expenses for current user"""
    return db.query(Expense).filter(
        Expense.owner_id == current_user.id
    ).order_by(Expense.created_at.desc()).all()


@router.get("/summary", response_model=List[ExpenseSummary])
def get_expense_summary(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get total expenses grouped by category"""
    results = db.query(
        Expense.category,
        func.sum(Expense.amount).label("total")
    ).filter(
        Expense.owner_id == current_user.id
    ).group_by(Expense.category).all()

    return [{"category": r.category, "total": r.total} for r in results]