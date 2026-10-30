
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import "./Dealers.css";
import "../assets/style.css";
import positive_icon from "../assets/positive.png";
import neutral_icon from "../assets/neutral.png";
import negative_icon from "../assets/negative.png";
import review_icon from "../assets/reviewbutton.png";
import Header from "../Header/Header";

const Dealer = () => {
  const { id } = useParams();

  const [dealer, setDealer] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isLoggedIn = Boolean(sessionStorage.getItem("username"));

  useEffect(() => {
    const controller = new AbortController();

    const loadDealer = async () => {
      try {
        const [dealerResponse, reviewsResponse] = await Promise.all([
          fetch(`/djangoapp/dealer/${id}`, {
            signal: controller.signal
          }),
          fetch(`/djangoapp/reviews/dealer/${id}`, {
            signal: controller.signal
          })
        ]);

        if (!dealerResponse.ok) {
          throw new Error(
            `Unable to load dealership (${dealerResponse.status})`
          );
        }

        if (!reviewsResponse.ok) {
          throw new Error(
            `Unable to load reviews (${reviewsResponse.status})`
          );
        }

        const dealerData = await dealerResponse.json();
        const reviewsData = await reviewsResponse.json();

        if (!dealerData.dealer ||
            typeof dealerData.dealer !== "object") {
          throw new Error("Unexpected dealership response");
        }

        if (!Array.isArray(reviewsData.reviews)) {
          throw new Error("Unexpected reviews response");
        }

        setDealer(dealerData.dealer);
        setReviews(reviewsData.reviews);
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

    loadDealer();

    return () => controller.abort();
  }, [id]);

  const sentimentIcon = sentiment => {
    switch (sentiment) {
      case "positive":
        return positive_icon;
      case "negative":
        return negative_icon;
      default:
        return neutral_icon;
    }
  };

  return (
    <div>
      <Header />

      <div style={{ margin: "20px" }}>
        {loading && <p>Loading dealership and reviews...</p>}
        {error && <p role="alert">{error}</p>}

        {!loading && !error && dealer && (
          <>
            <h1 style={{ color: "grey" }}>
              {dealer.full_name}

              {isLoggedIn && (
                <Link to={`/postreview/${id}`}>
                  <img
                    src={review_icon}
                    style={{
                      width: "60px",
                      marginLeft: "15px"
                    }}
                    alt="Post Review"
                  />
                </Link>
              )}
            </h1>

            <h4 style={{ color: "grey" }}>
              {dealer.city}, {dealer.address},
              Zip - {dealer.zip}, {dealer.state}
            </h4>

            <div className="reviews_panel">
              <h2>Customer Reviews</h2>

              {reviews.length === 0 ? (
                <p>No reviews yet!</p>
              ) : (
                reviews.map((review, index) => (
                  <div
                    className="review_panel"
                    key={review.id ?? index}
                  >
                    <img
                      src={sentimentIcon(review.sentiment)}
                      className="emotion_icon"
                      alt={`${review.sentiment || "neutral"} sentiment`}
                    />

                    <div className="review">
                      {review.review}
                    </div>

                    <div className="reviewer">
                      {review.name} — {review.car_make}{" "}
                      {review.car_model} {review.car_year}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Dealer;
