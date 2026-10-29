
import React, { useState } from "react";
import "./Register.css";

function Register() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((previous) => ({
      ...previous,
      [name]: value
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (form.password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch("/djangoapp/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        credentials: "same-origin",
        body: JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          userName: form.userName,
          email: form.email,
          password: form.password
        })
      });

      const data = await response.json();

      if (!response.ok || data.status !== "Authenticated") {
        throw new Error(data.message || "Registration failed.");
      }

      sessionStorage.setItem("username", data.userName);
      window.location.href = "/";
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="register_container">
      <h1 className="header">Register</h1>

      <form className="inputs" onSubmit={handleSubmit}>
        {[
          ["firstName", "First Name"],
          ["lastName", "Last Name"],
          ["userName", "Username"],
          ["email", "Email"],
          ["password", "Password"],
          ["confirmPassword", "Confirm Password"]
        ].map(([name, placeholder]) => (
          <input
            key={name}
            className="input_field"
            name={name}
            type={
              name.toLowerCase().includes("password")
                ? "password"
                : name === "email"
                ? "email"
                : "text"
            }
            placeholder={placeholder}
            value={form[name]}
            onChange={handleChange}
            required
          />
        ))}

        {error && <p role="alert">{error}</p>}

        <div className="submit_panel">
          <button
            className="submit"
            type="submit"
            disabled={submitting}
          >
            {submitting ? "Registering..." : "Register"}
          </button>
        </div>
      </form>

      <p>
        Already registered? <a href="/login/">Login</a>
      </p>
    </div>
  );
}

export default Register;
