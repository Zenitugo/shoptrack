import pytest


class TestExpenses:

    def test_create_expense(self, authenticated_client):
        """Test creating an expense"""
        response = authenticated_client.post("/expenses/", json={
            "category": "supplier",
            "amount": 500.00,
            "description": "Monthly oil supplies"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["amount"] == 500.00
        assert data["category"] == "supplier"

    def test_get_all_expenses(self, authenticated_client):
        """Test getting all expenses"""
        authenticated_client.post("/expenses/", json={
            "category": "rent",
            "amount": 1200.00,
            "description": "Monthly rent"
        })
        response = authenticated_client.get("/expenses/")
        assert response.status_code == 200
        assert len(response.json()) >= 1

    def test_expense_summary(self, authenticated_client):
        """Test expense summary grouped by category"""
        authenticated_client.post("/expenses/", json={
            "category": "supplier", "amount": 300.00
        })
        authenticated_client.post("/expenses/", json={
            "category": "supplier", "amount": 200.00
        })
        authenticated_client.post("/expenses/", json={
            "category": "utilities", "amount": 150.00
        })

        response = authenticated_client.get("/expenses/summary")
        assert response.status_code == 200
        data = response.json()

        supplier_total = next(
            (item["total"] for item in data if item["category"] == "supplier"), 0
        )
        assert supplier_total == 500.00

    def test_create_expense_unauthenticated(self, client):
        """Test creating expense without auth fails"""
        response = client.post("/expenses/", json={
            "category": "rent",
            "amount": 1000.00
        })
        assert response.status_code == 401


class TestRevenue:

    def test_create_revenue(self, authenticated_client, sample_product):
        """Test creating a revenue entry"""
        response = authenticated_client.post("/revenue/", json={
            "product_id": sample_product["id"],
            "quantity_sold": 5,
            "unit_price": 100.0,
            "total_amount": 500.0,
            "description": "Sale to customer"
        })
        assert response.status_code == 201
        data = response.json()
        assert data["total_amount"] == 500.0
        assert data["quantity_sold"] == 5

    def test_get_all_revenues(self, authenticated_client, sample_product):
        """Test getting all revenue entries"""
        authenticated_client.post("/revenue/", json={
            "unit_price": 50.0,
            "total_amount": 250.0,
            "description": "Service revenue"
        })
        response = authenticated_client.get("/revenue/")
        assert response.status_code == 200
        assert len(response.json()) >= 1

    def test_financial_summary(self, authenticated_client):
        """Test profit and loss summary calculation"""
        # Add revenue
        authenticated_client.post("/revenue/", json={
            "unit_price": 100.0,
            "total_amount": 1000.0
        })
        authenticated_client.post("/revenue/", json={
            "unit_price": 200.0,
            "total_amount": 500.0
        })

        # Add expenses
        authenticated_client.post("/expenses/", json={
            "category": "supplier",
            "amount": 300.0
        })

        response = authenticated_client.get("/revenue/summary")
        assert response.status_code == 200
        data = response.json()

        assert data["total_revenue"] == 1500.0
        assert data["total_expenses"] == 300.0
        assert data["net_profit"] == 1200.0

    def test_empty_financial_summary(self, authenticated_client):
        """Test financial summary with no data returns zeros"""
        response = authenticated_client.get("/revenue/summary")
        assert response.status_code == 200
        data = response.json()
        assert data["total_revenue"] == 0.0
        assert data["total_expenses"] == 0.0
        assert data["net_profit"] == 0.0