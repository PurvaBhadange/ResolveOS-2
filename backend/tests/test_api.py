from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "healthy"


def test_list_customers(client: TestClient):
    response = client.get("/api/v1/customers")
    assert response.status_code == 200
    data = response.json()
    assert len(data) > 0
    assert any(c["customer_number"] == "CUST-1001" for c in data)


def test_get_order_by_number(client: TestClient):
    response = client.get("/api/v1/orders/number/ORD-2026-8801")
    assert response.status_code == 200
    data = response.json()
    assert data["order_number"] == "ORD-2026-8801"
    assert data["total_amount"] == "199.99"


def test_inventory_stockout(client: TestClient):
    # Variant 1 = SKU-HD-BLK (Out of stock)
    response = client.get("/api/v1/inventory/variant/1")
    assert response.status_code == 200
    data = response.json()
    assert data["is_in_stock"] == False
    assert data["total_available"] == 0


def test_action_idempotency(client: TestClient):
    payload = {
        "case_id": 1,
        "order_id": 4,  # Processing order ORD-2026-8804
        "reason": "Test cancellation",
        "idempotency_key": "IDEM-TEST-CANCEL-001"
    }

    # Request 1
    res1 = client.post("/api/v1/actions/cancel", json=payload)
    assert res1.status_code == 200
    data1 = res1.json()
    assert data1["execution_status"] == "verified"

    # Request 2 (Identical Idempotency Key)
    res2 = client.post("/api/v1/actions/cancel", json=payload)
    assert res2.status_code == 200
    data2 = res2.json()
    assert data2["idempotency_key"] == "IDEM-TEST-CANCEL-001"
