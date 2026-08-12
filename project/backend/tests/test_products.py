import pytest


class TestProducts:

    def test_create_product(self, authenticated_client):
        """Test creating a new product"""
        response = authenticated_client.post("/products/", json={
            "name": "Massage Oil",
            "category": "Spa Supplies",
            "unit_price": 25.99,
            "quantity_in_stock": 100,
            "reorder_level": 20,
            "description": "Lavender massage oil"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["name"] == "Massage Oil"
        assert data["unit_price"] == 25.99
        assert data["quantity_in_stock"] == 100
        assert data["is_low_stock"] == False

    def test_create_product_unauthenticated(self, client):
        """Test creating product without auth fails"""
        response = client.post("/products/", json={
            "name": "Test Product",
            "unit_price": 10.0
        })
        assert response.status_code == 401

    def test_get_all_products(self, authenticated_client, sample_product):
        """Test getting all products"""
        response = authenticated_client.get("/products/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert data[0]["name"] == "Test Product"

    def test_get_single_product(self, authenticated_client, sample_product):
        """Test getting a specific product"""
        product_id = sample_product["id"]
        response = authenticated_client.get(f"/products/{product_id}")
        assert response.status_code == 200
        assert response.json()["id"] == product_id

    def test_get_nonexistent_product(self, authenticated_client):
        """Test getting a product that does not exist"""
        response = authenticated_client.get("/products/99999")
        assert response.status_code == 404

    def test_update_product(self, authenticated_client, sample_product):
        """Test updating a product"""
        product_id = sample_product["id"]
        response = authenticated_client.put(f"/products/{product_id}", json={
            "unit_price": 150.0,
            "reorder_level": 5
        })
        assert response.status_code == 200
        data = response.json()
        assert data["unit_price"] == 150.0
        assert data["reorder_level"] == 5

    def test_delete_product(self, authenticated_client, sample_product):
        """Test deleting a product"""
        product_id = sample_product["id"]
        response = authenticated_client.delete(f"/products/{product_id}")
        assert response.status_code == 204

        # Verify it is gone
        response = authenticated_client.get(f"/products/{product_id}")
        assert response.status_code == 404

    def test_low_stock_detection(self, authenticated_client):
        """Test that low stock is detected correctly"""
        # Create product with quantity below reorder level
        response = authenticated_client.post("/products/", json={
            "name": "Low Stock Item",
            "unit_price": 10.0,
            "quantity_in_stock": 5,
            "reorder_level": 10
        })
        assert response.json()["is_low_stock"] == True

    def test_get_low_stock_products(self, authenticated_client):
        """Test getting all low stock products"""
        # Create low stock product
        authenticated_client.post("/products/", json={
            "name": "Nearly Empty",
            "unit_price": 10.0,
            "quantity_in_stock": 2,
            "reorder_level": 15
        })
        response = authenticated_client.get("/products/low-stock")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(p["is_low_stock"] for p in data)

    def test_user_cannot_see_other_users_products(self, client):
        """Test that users can only see their own products"""
        # Register and login as user 1
        client.post("/auth/register", json={
            "name": "User One", "email": "user1@test.com", "password": "pass123"
        })
        r1 = client.post("/auth/login", json={"email": "user1@test.com", "password": "pass123"})
        token1 = r1.json()["access_token"]
        client.headers.update({"Authorization": f"Bearer {token1}"})

        # Create product as user 1
        r = client.post("/products/", json={"name": "User1 Product", "unit_price": 10.0})
        product_id = r.json()["id"]

        # Register and login as user 2
        client.post("/auth/register", json={
            "name": "User Two", "email": "user2@test.com", "password": "pass123"
        })
        r2 = client.post("/auth/login", json={"email": "user2@test.com", "password": "pass123"})
        token2 = r2.json()["access_token"]
        client.headers.update({"Authorization": f"Bearer {token2}"})

        # User 2 tries to access user 1's product
        response = client.get(f"/products/{product_id}")
        assert response.status_code == 404