import requests

def warm_up_server():
    """Send a request to the server to keep it warm."""
    url = "http://127.0.0.1:8000/health"  # Change this to your actual API URL
    try:
        response = requests.get(url)
        print(f"Warm-up ping status: {response.status_code}")
    except requests.exceptions.RequestException as e:
        print(f"Warm-up failed: {e}")
    