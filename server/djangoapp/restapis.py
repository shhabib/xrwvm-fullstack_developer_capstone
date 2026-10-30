# Uncomment the imports below before you add the function code
import requests
from urllib.parse import quote
import os
from dotenv import load_dotenv

load_dotenv(dotenv_path=os.path.join(os.path.dirname(__file__), ".env"))

backend_url = os.getenv(
    'backend_url', default="http://localhost:3030")
sentiment_analyzer_url = os.getenv(
    'sentiment_analyzer_url',
    default="http://localhost:5050/")

def get_request(endpoint, **kwargs):
    request_url = backend_url + endpoint
    print(f"GET from {request_url}")

    try:
        response = requests.get(
            request_url,
            params=kwargs,
            timeout=15
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException as err:
        print(f"Network exception occurred: {err}")
        return None

def analyze_review_sentiments(text):
    """Analyze review sentiment using IBM Cloud Code Engine."""
    request_url = sentiment_analyzer_url.rstrip("/") + "/analyze/" + quote(str(text), safe="")

    try:
        response = requests.get(request_url, timeout=30)
        response.raise_for_status()
        return response.json()
    except requests.RequestException as err:
        print(f"Sentiment analysis error: {err}")
        return None

def post_review(data_dict):
    """Submit a dealership review to the Express backend."""
    request_url = backend_url + "/insert_review"

    try:
        response = requests.post(
            request_url,
            json=data_dict,
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    except requests.RequestException as err:
        print(f"Review submission error: {err}")
        return None
