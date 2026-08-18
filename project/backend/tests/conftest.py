import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.main import app
from app.database import Base, get_db

# Use in-memory SQLite for testing
SQLALCHEMY_TEST_DATABASE_URL = "sqlite:///./test.db"

engine = create_engine(
    SQLALCHEMY_TEST_DATABASE_URL,
    connect_args={"check_same_thread": False}
)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture(scope="function")
def db():
    """Create fresh database for each test"""
    Base.metadata.create_all(bind=engine)
    yield
    Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db):
    """Test client with database override"""
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


@pytest.fixture(scope="function")
def authenticated_client(client):
    """Client with registered and logged in user"""
    # Register user
    client.post("/auth/register", json={
        "name": "Test User",
        "email": "test@shoptrack.com",
        "password": "testpassword123",
        "business_name": "Test Shop"
    })

    # Login and get token
    response = client.post("/auth/login", json={
        "email": "test@shoptrack.com",
        "password": "testpassword123"
    })
    token = response.json()["access_token"]

    # Set auth header
    client.headers.update({"Authorization": f"Bearer {token}"})
    return client


@pytest.fixture(scope="function")
def sample_product(authenticated_client):
    """Create a sample product for tests"""
    response = authenticated_client.post("/products/", json={
        "name": "Test Product",
        "category": "Electronics",
        "unit_price": 100.0,
        "quantity_in_stock": 50,
        "reorder_level": 10,
        "description": "A test product"
    })
    return response.json()