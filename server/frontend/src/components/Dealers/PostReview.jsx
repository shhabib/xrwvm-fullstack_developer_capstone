
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "./Dealers.css";
import "../assets/style.css";
import Header from "../Header/Header";

const PostReview = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [dealer, setDealer] = useState(null);
  const [carModels, setCarModels] = useState([]);
  const [selectedCar, setSelectedCar] = useState("");
  const [review, setReview] = useState("");
  const [year, setYear] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const controller = new AbortController();

    const loadData = async () => {
      try {
        const [dealerResponse, carsResponse] = await Promise.all([
          fetch(`/djangoapp/dealer/${id}`, {
            signal: controller.signal
          }),
          fetch("/djangoapp/get_cars", {
            signal: controller.signal
          })
        ]);

        if (!dealerResponse.ok || !carsResponse.ok) {
          throw new Error("Unable to load dealership or car models.");
        }

        const dealerData = await dealerResponse.json();
        const carsData = await carsResponse.json();

        if (!dealerData.dealer) {
          throw new Error("Dealership not found.");
        }

        if (!Array.isArray(carsData.CarModels)) {
          throw new Error("Invalid car model response.");
        }

        setDealer(dealerData.dealer);
        setCarModels(carsData.CarModels);
      } catch (err) {
        if (err.name !== "AbortError") {
          setError(err.message);
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    };

    loadData();
    return () => controller.abort();
  }, [id]);

  const postReview = async event => {
    event.preventDefault();
    setError("");

    const carIndex = Number(selectedCar);
    const car = carModels[carIndex];

    if (!car || !review.trim() || !date || !year) {
      setError("All review details are mandatory.");
      return;
    }

    const carYear = Number(year);
    const currentYear = new Date().getFullYear();

    if (!Number.isInteger(carYear) ||
        carYear < 1900 ||
        carYear > currentYear + 1) {
      setError("Please enter a valid car year.");
      return;
    }

    const payload = {
      dealership: Number(id),
      review: review.trim(),
      purchase: true,
      purchase_date: date,
      car_make: car.CarMake,
      car_model: car.CarModel,
      car_year: carYear
    };

    setSubmitting(true);

    try {
      const response = await fetch("/djangoapp/add_review", {
        method: "POST",
        credentials: "same-origin",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.status === 401 || response.status === 403) {
        throw new Error("Please log in before submitting a review.");
      }

      if (!response.ok) {
        throw new Error(result.message || "Review submission failed.");
      }

      navigate(`/dealer/${id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <Header />

      <div style={{ margin: "5%" }}>
        <h1 style={{ color: "darkblue" }}>
          {dealer ? dealer.full_name : "Post Review"}
        </h1>

        {loading && <p>Loading review form...</p>}
        {error && <p role="alert">{error}</p>}

        {!loading && dealer && (
          <form onSubmit={postReview}>
            <div className="input_field">
              <label htmlFor="review">Your Review</label>
              <textarea
                id="review"
                rows="7"
                cols="50"
                value={review}
                onChange={e => setReview(e.target.value)}
                required
              />
            </div>

            <div className="input_field">
              <label htmlFor="purchase-date">Purchase Date</label>
              <input
                id="purchase-date"
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                required
              />
            </div>

            <div className="input_field">
              <label htmlFor="car-model">Car Make and Model</label>
              <select
                id="car-model"
                value={selectedCar}
                onChange={e => setSelectedCar(e.target.value)}
                required
              >
                <option value="">Choose Car Make and Model</option>
                {carModels.map((car, index) => (
                  <option key={index} value={index}>
                    {car.CarMake} {car.CarModel}
                  </option>
                ))}
              </select>
            </div>

            <div className="input_field">
              <label htmlFor="car-year">Car Year</label>
              <input
                id="car-year"
                type="number"
                min="1900"
                max={new Date().getFullYear() + 1}
                value={year}
                onChange={e => setYear(e.target.value)}
                required
              />
            </div>

            <button
              className="postreview"
              type="submit"
              disabled={submitting}
            >
              {submitting ? "Submitting..." : "Post Review"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PostReview;
