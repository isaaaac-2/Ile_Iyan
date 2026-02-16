import pytest
import json
from app import app


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


def test_health_check(client):
    resp = client.get("/api/health")
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["status"] == "healthy"


def test_get_menu(client):
    resp = client.get("/api/menu")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "soups" in data
    assert "proteins" in data
    assert "portions" in data
    assert "combos" in data
    assert "iyan_base_price" in data
    assert len(data["soups"]) == 10
    assert len(data["proteins"]) == 8


def test_get_soups(client):
    resp = client.get("/api/menu/soups")
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data) == 10
    assert data[0]["id"] == "egusi"


def test_get_proteins(client):
    resp = client.get("/api/menu/proteins")
    assert resp.status_code == 200
    data = resp.get_json()
    assert len(data) == 8


def test_create_order(client):
    order_data = {
        "customer_name": "Test Customer",
        "items": [
            {
                "soups": ["egusi"],
                "proteins": ["beef"],
                "portion": "small",
                "quantity": 1,
            }
        ],
    }
    resp = client.post(
        "/api/order", data=json.dumps(order_data), content_type="application/json"
    )
    assert resp.status_code == 201
    data = resp.get_json()
    assert "id" in data
    assert data["status"] == "confirmed"
    assert data["total"] == 5000  # 1500 base + 2500 egusi + 1000 beef


def test_create_order_combo_discount(client):
    order_data = {
        "items": [
            {
                "soups": ["ewedu", "gbegiri"],
                "proteins": ["assorted"],
                "portion": "small",
                "quantity": 1,
            }
        ],
    }
    resp = client.post(
        "/api/order", data=json.dumps(order_data), content_type="application/json"
    )
    assert resp.status_code == 201
    data = resp.get_json()
    # 1500 + 1800 ewedu + 2000 gbegiri + 1500 assorted - 500 combo discount = 6300
    assert data["total"] == 6300


def test_create_order_no_items(client):
    resp = client.post(
        "/api/order", data=json.dumps({"items": []}), content_type="application/json"
    )
    assert resp.status_code == 400


def test_create_order_no_soup(client):
    resp = client.post(
        "/api/order",
        data=json.dumps({"items": [{"soups": [], "proteins": [], "portion": "small", "quantity": 1}]}),
        content_type="application/json",
    )
    assert resp.status_code == 400


def test_get_order(client):
    order_data = {
        "items": [
            {
                "soups": ["ogbono"],
                "proteins": [],
                "portion": "medium",
                "quantity": 2,
            }
        ],
    }
    resp = client.post(
        "/api/order", data=json.dumps(order_data), content_type="application/json"
    )
    order_id = resp.get_json()["id"]
    resp2 = client.get(f"/api/order/{order_id}")
    assert resp2.status_code == 200
    assert resp2.get_json()["id"] == order_id


def test_get_order_not_found(client):
    resp = client.get("/api/order/NONEXIST")
    assert resp.status_code == 404


def test_bot_greeting(client):
    resp = client.get("/api/bot/greeting")
    assert resp.status_code == 200
    data = resp.get_json()
    assert "message" in data
    assert "Ile Iyan" in data["message"]


def test_bot_process_greeting(client):
    resp = client.post(
        "/api/bot/process",
        data=json.dumps({"message": "show me the menu", "state": "greeting", "cart": []}),
        content_type="application/json",
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert "Egusi" in data["message"]


def test_bot_process_soup_selection(client):
    resp = client.post(
        "/api/bot/process",
        data=json.dumps({"message": "I want egusi soup", "state": "choosing_soup", "cart": []}),
        content_type="application/json",
    )
    assert resp.status_code == 200
    data = resp.get_json()
    assert data["state"] == "choosing_protein"


def test_tts_no_text(client):
    resp = client.post(
        "/api/tts", data=json.dumps({}), content_type="application/json"
    )
    assert resp.status_code == 400
