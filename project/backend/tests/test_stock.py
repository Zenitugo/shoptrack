import pytest


class TestStock:

    def test_receive_stock(self, authenticated_client, sample_product):
        """Test receiving stock increases quantity"""
        product_id = sample_product["id"]
        initial_qty = sample_product["quantity_in_stock"]

        response = authenticated_client.post("/stock/", json={
            "product_id": product_id,
            "movement_type": "in",
            "quantity": 20,
            "notes": "Received from supplier"
        })
        assert response.status_code == 201

        # Verify stock increased
        product = authenticated_client.get(f"/products/{product_id}").json()
        assert product["quantity_in_stock"] == initial_qty + 20

    def test_sell_stock(self, authenticated_client, sample_product):
        """Test selling stock decreases quantity"""
        product_id = sample_product["id"]
        initial_qty = sample_product["quantity_in_stock"]

        response = authenticated_client.post("/stock/", json={
            "product_id": product_id,
            "movement_type": "out",
            "quantity": 10,
            "notes": "Sold to customer"
        })
        assert response.status_code == 201

        # Verify stock decreased
        product = authenticated_client.get(f"/products/{product_id}").json()
        assert product["quantity_in_stock"] == initial_qty - 10

    def test_return_stock(self, authenticated_client, sample_product):
        """Test returning stock increases quantity"""
        product_id = sample_product["id"]
        initial_qty = sample_product["quantity_in_stock"]

        response = authenticated_client.post("/stock/", json={
            "product_id": product_id,
            "movement_type": "return",
            "quantity": 5,
            "notes": "Customer return"
        })
        assert response.status_code == 201

        product = authenticated_client.get(f"/products/{product_id}").json()
        assert product["quantity_in_stock"] == initial_qty + 5

    def test_sell_more_than_available(self, authenticated_client, sample_product):
        """Test selling more than available stock fails"""
        product_id = sample_product["id"]
        initial_qty = sample_product["quantity_in_stock"]

        response = authenticated_client.post("/stock/", json={
            "product_id": product_id,
            "movement_type": "out",
            "quantity": initial_qty + 100,  # more than available
            "notes": "Should fail"
        })
        assert response.status_code == 400
        assert "Insufficient stock" in response.json()["detail"]

    def test_get_all_movements(self, authenticated_client, sample_product):
        """Test getting all stock movements"""
        product_id = sample_product["id"]

        # Create a movement
        authenticated_client.post("/stock/", json={
            "product_id": product_id,
            "movement_type": "in",
            "quantity": 10
        })

        response = authenticated_client.get("/stock/")
        assert response.status_code == 200
        assert len(response.json()) >= 1

    def test_get_product_movements(self, authenticated_client, sample_product):
        """Test getting movements for a specific product"""
        product_id = sample_product["id"]

        authenticated_client.post("/stock/", json={
            "product_id": product_id,
            "movement_type": "in",
            "quantity": 15
        })

        response = authenticated_client.get(f"/stock/{product_id}")
        assert response.status_code == 200
        data = response.json()
        assert len(data) >= 1
        assert all(m["product_id"] == product_id for m in data)

    def test_stock_movement_nonexistent_product(self, authenticated_client):
        """Test stock movement for nonexistent product fails"""
        response = authenticated_client.post("/stock/", json={
            "product_id": 99999,
            "movement_type": "in",
            "quantity": 10
        })
        assert response.status_code == 404