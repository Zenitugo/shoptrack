from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import StockMovement, Product, User, MovementType
from app.schemas.schemas import StockMovementCreate, StockMovementResponse
from app.services.auth import get_current_user

router = APIRouter()


@router.post("/", response_model=StockMovementResponse, status_code=status.HTTP_201_CREATED)
def create_stock_movement(
    movement: StockMovementCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Record a stock movement (receive, sell, return)"""
    product = db.query(Product).filter(
        Product.id == movement.product_id,
        Product.owner_id == current_user.id
    ).first()

    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    # Update stock quantity based on movement type
    if movement.movement_type == MovementType.IN:
        product.quantity_in_stock += movement.quantity
    elif movement.movement_type == MovementType.OUT:
        if product.quantity_in_stock < movement.quantity:
            raise HTTPException(
                status_code=400,
                detail=f"Insufficient stock. Available: {product.quantity_in_stock}"
            )
        product.quantity_in_stock -= movement.quantity
    elif movement.movement_type == MovementType.RETURN:
        product.quantity_in_stock += movement.quantity

    new_movement = StockMovement(**movement.dict())
    db.add(new_movement)
    db.commit()
    db.refresh(new_movement)
    return new_movement


@router.get("/", response_model=List[StockMovementResponse])
def get_stock_movements(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all stock movements for current user's products"""
    product_ids = [
        p.id for p in db.query(Product).filter(
            Product.owner_id == current_user.id
        ).all()
    ]
    movements = db.query(StockMovement).filter(
        StockMovement.product_id.in_(product_ids)
    ).order_by(StockMovement.created_at.desc()).all()
    return movements


@router.get("/{product_id}", response_model=List[StockMovementResponse])
def get_product_movements(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get stock movements for a specific product"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.owner_id == current_user.id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    movements = db.query(StockMovement).filter(
        StockMovement.product_id == product_id
    ).order_by(StockMovement.created_at.desc()).all()
    return movements