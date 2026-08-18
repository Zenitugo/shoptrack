from dotenv import load_dotenv
load_dotenv()

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import auth, products, stock, expenses, revenue
from app.database import engine, Base

# Create all tables (replaced by Alembic in production)
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="ShopTrack API",
    description="Small business stock and finance management API",
    version="1.0.0"
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Register routes
app.include_router(auth.router, prefix="/auth", tags=["Authentication"])
app.include_router(products.router, prefix="/products", tags=["Products"])
app.include_router(stock.router, prefix="/stock", tags=["Stock"])
app.include_router(expenses.router, prefix="/expenses", tags=["Expenses"])
app.include_router(revenue.router, prefix="/revenue", tags=["Revenue"])


@app.get("/health")
def health_check():
    return {"status": "healthy", "service": "shoptrack-api"}