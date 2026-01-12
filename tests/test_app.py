import pytest
from fastapi.testclient import TestClient
from src.app import app

client = TestClient(app)

# Test the root endpoint
def test_root():
    response = client.get("/")
    assert response.status_code == 200
    assert response.json() == {"message": "Hello, World!"}

# Test the activities endpoint
def test_get_activities():
    response = client.get("/activities")
    assert response.status_code == 200
    assert isinstance(response.json(), dict)  # Updated to check for a dictionary

# Test registering a participant
def test_register_participant():
    activity_name = "Chess Club"  # Use a valid activity name
    email = "test@example.com"
    response = client.post(f"/activities/{activity_name}/signup", params={"email": email})
    assert response.status_code == 200
    assert response.json().get("message") == f"Signed up {email} for {activity_name}"

# Test unregistering a participant
def test_unregister_participant():
    activity_name = "Chess Club"  # Use a valid activity name
    email = "test@example.com"
    response = client.delete(f"/activities/{activity_name}/participants/{email}")
    assert response.status_code == 200
    assert response.json().get("message") == f"Unregistered {email} from {activity_name}"