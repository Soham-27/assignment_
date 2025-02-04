import requests
import os

BACKEND_URI=os.getenv("BACKEND_URI","http://127.0.0.1:8000")
def warm_up_server():
    """Send a request to the server to keep it warm."""
    url = f"{BACKEND_URI}/health"  # Change this to your actual API URL
    try:
        response = requests.get(url)
        print(f"Warm-up ping status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Warm-up failed: {e}")
    