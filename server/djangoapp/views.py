# Uncomment the required imports before adding the code

# from django.shortcuts import render
# from django.http import HttpResponseRedirect, HttpResponse
# from django.contrib.auth.models import User
# from django.shortcuts import get_object_or_404, render, redirect
# from django.contrib.auth import logout
# from django.contrib import messages
# from datetime import datetime

from django.contrib.auth.models import User
from django.db import IntegrityError
from django.views.decorators.http import require_POST

from django.http import JsonResponse
from django.contrib.auth import login, authenticate
import logging
import json
from django.views.decorators.csrf import csrf_exempt
from .models import CarMake, CarModel
from .populate import initiate
from .restapis import get_request, analyze_review_sentiments, post_review


# Get an instance of a logger
logger = logging.getLogger(__name__)


# Create your views here.

# Create a `login_request` view to handle sign in request
@csrf_exempt
def login_user(request):
    # Get username and password from request.POST dictionary
    data = json.loads(request.body)
    username = data['userName']
    password = data['password']
    # Try to check if provide credential can be authenticated
    user = authenticate(username=username, password=password)
    data = {"userName": username}
    if user is not None:
        # If user is valid, call login method to login current user
        login(request, user)
        data = {"userName": username, "status": "Authenticated"}
    return JsonResponse(data)

from django.contrib.auth import logout

def logout_request(request):
    logout(request)
    return JsonResponse({"userName": ""})

# Create a registration view to handle sign up requests
@csrf_exempt  # Lab compatibility only; use CSRF protection in production
@require_POST
def registration(request):
    try:
        data = json.loads(request.body)

        username = data.get("userName", "").strip()
        password = data.get("password", "")
        first_name = data.get("firstName", "").strip()
        last_name = data.get("lastName", "").strip()
        email = data.get("email", "").strip()

        if not username or not password:
            return JsonResponse(
                {"status": "Failed", "message": "Username and password are required"},
                status=400
            )

        if User.objects.filter(username=username).exists():
            return JsonResponse(
                {"status": "Failed", "message": "Username already exists"},
                status=409
            )

        user = User.objects.create_user(
            username=username,
            password=password,
            first_name=first_name,
            last_name=last_name,
            email=email
        )

        login(request, user)

        return JsonResponse({
            "userName": username,
            "status": "Authenticated"
        })

    except (json.JSONDecodeError, AttributeError):
        return JsonResponse(
            {"status": "Failed", "message": "Invalid JSON request"},
            status=400
        )

    except IntegrityError:
        return JsonResponse(
            {"status": "Failed", "message": "Username already exists"},
            status=409
        )


def get_cars(request):
    # Populate sample data if there are no car makes
    if CarMake.objects.count() == 0:
        initiate()

    # Retrieve car models with their related makes
    car_models = CarModel.objects.select_related('car_make')

    cars = []

    for car_model in car_models:
        cars.append({
            "CarModel": car_model.name,
            "CarMake": car_model.car_make.name
        })

    return JsonResponse({"CarModels": cars})


# # Update the `get_dealerships` view to render the index page with
# a list of dealerships
# def get_dealerships(request):
# ...

# Create a `get_dealer_reviews` view to render the reviews of a dealer
# def get_dealer_reviews(request,dealer_id):
# ...

# Create a `get_dealer_details` view to render the dealer details
# def get_dealer_details(request, dealer_id):
# ...

# Create a `add_review` view to submit a review
# def add_review(request):
# ...


def get_dealerships(request):
    """Retrieve dealerships from the Express/MongoDB backend."""
    if request.method != "GET":
        return JsonResponse(
            {"error": "Method not allowed"},
            status=405
        )

    dealerships = get_request("/fetchDealers")

    if dealerships is None:
        return JsonResponse(
            {"error": "Unable to retrieve dealerships"},
            status=502
        )

    return JsonResponse({"dealerships": dealerships})


def get_dealer_details(request, dealer_id):
    """Retrieve details for a specific dealership."""
    if request.method != "GET":
        return JsonResponse(
            {"error": "Method not allowed"},
            status=405
        )

    dealers = get_request(f"/fetchDealer/{dealer_id}")

    if dealers is None:
        return JsonResponse(
            {"error": "Unable to retrieve dealership details"},
            status=502
        )

    if not dealers:
        return JsonResponse(
            {"error": "Dealership not found"},
            status=404
        )

    return JsonResponse({"dealer": dealers[0]})


def get_dealer_reviews(request, dealer_id):
    """Retrieve dealer reviews with sentiment analysis."""
    if request.method != "GET":
        return JsonResponse(
            {"error": "Method not allowed"},
            status=405
        )

    reviews = get_request(f"/fetchReviews/dealer/{dealer_id}")

    if reviews is None:
        return JsonResponse(
            {"error": "Unable to retrieve dealership reviews"},
            status=502
        )

    for review in reviews:
        sentiment_result = analyze_review_sentiments(
            review.get("review", "")
        )

        review["sentiment"] = (
            sentiment_result.get("sentiment", "unknown")
            if isinstance(sentiment_result, dict)
            else "unknown"
        )

    return JsonResponse({"reviews": reviews})


@csrf_exempt  # Lab compatibility; enable CSRF protection for production
@require_POST
def add_review(request):
    """Submit a dealership review for an authenticated user."""
    if not request.user.is_authenticated:
        return JsonResponse(
            {"error": "Authentication required"},
            status=401
        )

    try:
        data = json.loads(request.body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return JsonResponse(
            {"error": "Invalid JSON"},
            status=400
        )

    if not isinstance(data, dict):
        return JsonResponse(
            {"error": "Review must be a JSON object"},
            status=400
        )

    required_fields = [
        "dealership", "review", "purchase",
        "purchase_date", "car_make", "car_model", "car_year"
    ]

    missing = [
        field for field in required_fields
        if field not in data or data[field] is None
    ]

    if missing:
        return JsonResponse(
            {"error": "Missing required fields", "fields": missing},
            status=400
        )

    data["name"] = request.user.username

    result = post_review(data)

    if result is None:
        return JsonResponse(
            {"error": "Unable to submit review"},
            status=502
        )

    return JsonResponse(result, status=201)
