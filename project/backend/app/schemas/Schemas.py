from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime
from app.models.models import MovementType, ExpenseCategory


# ─── Auth Schemas ─────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    business_name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    id: int
    name: str
    email: str
    business_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


# ─── Product Schemas ──────────────────────────────────────────

class ProductCreate(BaseModel):
    name: str
    category: Optional[str] = None
    unit_price: float
    quantity_in_stock: Optional[int] = 0
    reorder_level: Optional[int] = 10
    description: Optional[str] = None


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    category: Optional[str] = None
    unit_price: Optional[float] = None
    reorder_level: Optional[int] = None
    description: Optional[str] = None


class ProductResponse(BaseModel):
    id: int
    owner_id: int
    name: str
    category: Optional[str] = None
    unit_price: float
    quantity_in_stock: int
    reorder_level: int
    description: Optional[str] = None
    created_at: datetime
    is_low_stock: bool = False

    class Config:
        from_attributes = True


# ─── Stock Schemas ────────────────────────────────────────────

class StockMovementCreate(BaseModel):
    product_id: int
    movement_type: MovementType
    quantity: int
    notes: Optional[str] = None


class StockMovementResponse(BaseModel):
    id: int
    product_id: int
    movement_type: MovementType
    quantity: int
    notes: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


# ─── Expense Schemas ──────────────────────────────────────────

class ExpenseCreate(BaseModel):
    category: ExpenseCategory
    amount: float
    description: Optional[str] = None


class ExpenseResponse(BaseModel):
    id: int
    owner_id: int
    category: ExpenseCategory
    amount: float
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class ExpenseSummary(BaseModel):
    category: str
    total: float


# ─── Revenue Schemas ──────────────────────────────────────────

class RevenueCreate(BaseModel):
    product_id: Optional[int] = None
    quantity_sold: Optional[int] = None
    unit_price: float
    total_amount: float
    description: Optional[str] = None


class RevenueResponse(BaseModel):
    id: int
    owner_id: int
    product_id: Optional[int] = None
    quantity_sold: Optional[int] = None
    unit_price: float
    total_amount: float
    description: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class FinancialSummary(BaseModel):
    total_revenue: float
    total_expenses: float
    net_profit: float