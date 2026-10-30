
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./Dealers.css";
import "../assets/style.css";
import Header from "../Header/Header";
import review_icon from "../assets/reviewicon.png";

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [selectedState, setSelectedState] = useState("All");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const controller = new AbortController();

    const loadDealers = async () => {
      try {
        const response = await fetch("/djangoapp/get_dealers", {
          signal: controller.signal
        });

        if (!response.ok) {
          throw new Error(`Unable to load dealers (${response.status})`);
        }

        const data = await response.json();
        if (!Array.isArray(data.dealerships)) {
          throw new Error("Unexpected dealership response format");
        }

        setDealersList(data.dealerships);
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

    loadDealers();

    return () => controller.abort();
  }, []);

  const states = [...new Set(
    dealersList.map(dealer => dealer.state).filter(Boolean)
  )].sort();

  const filteredDealers = selectedState === "All"
    ? dealersList
    : dealersList.filter(dealer => dealer.state === selectedState);

  const isLoggedIn = Boolean(sessionStorage.getItem("username"));

  return (
    <div>
      <Header />

      <div style={{ margin: "20px" }}>
        <h2>Dealerships</h2>

        {loading && <p>Loading dealerships...</p>}
        {error && <p role="alert">{error}</p>}

        {!loading && !error && (
          <>
            <label htmlFor="state-filter">Filter by state: </label>
            <select
              id="state-filter"
              value={selectedState}
              onChange={e => setSelectedState(e.target.value)}
            >
              <option value="All">All States</option>
              {states.map(state => (
                <option key={state} value={state}>{state}</option>
              ))}
            </select>

            <p>Showing {filteredDealers.length} dealerships</p>

            <table className="table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Dealer Name</th>
                  <th>City</th>
                  <th>Address</th>
                  <th>Zip</th>
                  <th>State</th>
                  {isLoggedIn && <th>Review Dealer</th>}
                </tr>
              </thead>
              <tbody>
                {filteredDealers.map(dealer => (
                  <tr key={dealer.id}>
                    <td>{dealer.id}</td>
                    <td>
                      <Link to={`/dealer/${dealer.id}`}>
                        {dealer.full_name}
                      </Link>
                    </td>
                    <td>{dealer.city}</td>
                    <td>{dealer.address}</td>
                    <td>{dealer.zip}</td>
                    <td>{dealer.state}</td>
                    {isLoggedIn && (
                      <td>
                        <Link to={`/postreview/${dealer.id}`}>
                          <img
                            src={review_icon}
                            className="review_icon"
                            alt="Post Review"
                          />
                        </Link>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        )}
      </div>
    </div>
  );
};

export default Dealers;
