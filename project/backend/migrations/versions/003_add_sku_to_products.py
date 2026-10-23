"""add sku to products

Revision ID: 003
Revises: 002
Create Date: 2026-08-06 02:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


revision = '003'
down_revision = '002'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add SKU (Stock Keeping Unit) column to products
    op.add_column('products', sa.Column('sku', sa.String(length=100), nullable=True))
    op.create_index(op.f('ix_products_sku'), 'products', ['sku'], unique=True)


def downgrade() -> None:
    op.drop_index(op.f('ix_products_sku'), table_name='products')
    op.drop_column('products', 'sku')