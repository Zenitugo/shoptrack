import pytest


class TestAuth:

    def test_register_success(self, client):
        """Test successful user registration"""
        response = client.post("/auth/register", json={
            "name": "Ugochi",
            "email": "ugochi@shoptrack.com",
            "password": "password123",
            "business_name": "Ugochi Spa"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["email"] == "ugochi@shoptrack.com"
        assert data["name"] == "Ugochi"
        assert data["business_name"] == "Ugochi Spa"
        assert "id" in data
        assert "hashed_password" not in data

    def test_register_duplicate_email(self, client):
        """Test that duplicate email registration fails"""
        client.post("/auth/register", json={
            "name": "User One",
            "email": "duplicate@shoptrack.com",
            "password": "password123"
        })
        response = client.post("/auth/register", json={
            "name": "User Two",
            "email": "duplicate@shoptrack.com",
            "password": "password456"
        })
        assert response.status_code == 400
        assert "already registered" in response.json()["detail"]

    def test_login_success(self, client):
        """Test successful login returns JWT token"""
        client.post("/auth/register", json={
            "name": "Test User",
            "email": "login@shoptrack.com",
            "password": "password123"
        })
        response = client.post("/auth/login", json={
            "email": "login@shoptrack.com",
            "password": "password123"
        })
        assert response.status_code == 200
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"

    def test_login_wrong_password(self, client):
        """Test login with wrong password fails"""
        client.post("/auth/register", json={
            "name": "Test User",
            "email": "wrong@shoptrack.com",
            "password": "correctpassword"
        })
        response = client.post("/auth/login", json={
            "email": "wrong@shoptrack.com",
            "password": "wrongpassword"
        })
        assert response.status_code == 401

    def test_login_nonexistent_user(self, client):
        """Test login with non-existent email fails"""
        response = client.post("/auth/login", json={
            "email": "nobody@shoptrack.com",
            "password": "password123"
        })
        assert response.status_code == 401

    def test_get_profile_authenticated(self, authenticated_client):
        """Test getting profile with valid token"""
        response = authenticated_client.get("/auth/me")
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "test@shoptrack.com"

    def test_get_profile_unauthenticated(self, client):
        """Test getting profile without token fails"""
        response = client.get("/auth/me")
        assert response.status_code == 401

    def test_health_check(self, client):
        """Test health check endpoint"""
        response = client.get("/health")
        assert response.status_code == 200
        assert response.json()["status"] == "healthy"