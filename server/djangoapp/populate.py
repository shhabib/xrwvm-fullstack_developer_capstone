
from .models import CarMake, CarModel


def initiate():
    car_data = {
        "NISSAN": [
            ("Pathfinder", "SUV"),
            ("Qashqai", "SUV"),
            ("XTRAIL", "SUV"),
        ],
        "Mercedes": [
            ("A-Class", "SUV"),
            ("C-Class", "SUV"),
            ("E-Class", "SUV"),
        ],
        "Audi": [
            ("A4", "SUV"),
            ("A5", "SUV"),
            ("A6", "SUV"),
        ],
        "Kia": [
            ("Sorrento", "SUV"),
            ("Carnival", "SUV"),
            ("Cerato", "SEDAN"),
        ],
        "Toyota": [
            ("Corolla", "SEDAN"),
            ("Camry", "SEDAN"),
            ("Kluger", "SUV"),
        ],
    }

    for make_name, models in car_data.items():
        car_make, _ = CarMake.objects.get_or_create(
            name=make_name,
            defaults={
                "description": f"{make_name} car manufacturer"
            }
        )

        for model_name, car_type in models:
            CarModel.objects.get_or_create(
                car_make=car_make,
                name=model_name,
                defaults={
                    "type": car_type,
                    "year": 2023
                }
            )

    print("Car makes and models populated successfully.")
