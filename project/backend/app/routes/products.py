from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.models.models import Product, User
from app.schemas.schemas import ProductCreate, ProductUpdate, ProductResponse
from app.services.auth import get_current_user

router = APIRouter()


def format_product(product: Product) -> dict:
    data = {c.name: getattr(product, c.name) for c in product.__table__.columns}
    data["is_low_stock"] = product.quantity_in_stock <= product.reorder_level
    return data


@router.post("/", response_model=ProductResponse, status_code=status.HTTP_201_CREATED)
def create_product(
    product: ProductCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new product"""
    new_product = Product(owner_id=current_user.id, **product.dict())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return format_product(new_product)


@router.get("/", response_model=List[ProductResponse])
def get_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all products for current user"""
    products = db.query(Product).filter(Product.owner_id == current_user.id).all()
    return [format_product(p) for p in products]


@router.get("/low-stock", response_model=List[ProductResponse])
def get_low_stock_products(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get products below reorder level"""
    products = db.query(Product).filter(
        Product.owner_id == current_user.id,
        Product.quantity_in_stock <= Product.reorder_level
    ).all()
    return [format_product(p) for p in products]


@router.get("/{product_id}", response_model=ProductResponse)
def get_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific product"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.owner_id == current_user.id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return format_product(product)


@router.put("/{product_id}", response_model=ProductResponse)
def update_product(
    product_id: int,
    updates: ProductUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a product"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.owner_id == current_user.id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    for field, value in updates.dict(exclude_unset=True).items():
        setattr(product, field, value)

    db.commit()
    db.refresh(product)
    return format_product(product)


@router.delete("/{product_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_product(
    product_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a product"""
    product = db.query(Product).filter(
        Product.id == product_id,
        Product.owner_id == current_user.id
    ).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    db.delete(product)
    db.commit()