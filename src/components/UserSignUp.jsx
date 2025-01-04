import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { auth } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";

const UserSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");


    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      setSuccess(`User signed up: ${userCredential.user.email} as ${role}`);

      localStorage.setItem("userLoggedIn", "true");
      localStorage.setItem("employerId", "true")
      localStorage.setItem("userId", userCredential.user.uid);
      localStorage.setItem("userFullName", email.split("@")[0]); 
      localStorage.setItem("userRole", role);

      if (role === "employee") {
        navigate("/dashboard");
      } else if (role === "employer") {
        navigate("/employer/dashboard");
      }
    } catch (err) {
      setError(err.message);
    }
  };


  return (
    <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", backgroundColor: "#f8f9fc" }}>
      <div style={{ backgroundColor: "#fff", padding: "30px", borderRadius: "8px", boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)", width: "100%", maxWidth: "400px" }}>
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>User Sign Up</h2>
        <form onSubmit={handleSignUp} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "14px", fontWeight: "bold" }}>Email</label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              style={{ padding: "10px", fontSize: "14px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "14px", fontWeight: "bold" }}>Password</label>
            <input
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{ padding: "10px", fontSize: "14px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "14px", fontWeight: "bold" }}>Confirm Password</label>
            <input
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{ padding: "10px", fontSize: "14px", border: "1px solid #ccc", borderRadius: "4px" }}
            />
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
            <label style={{ fontSize: "14px", fontWeight: "bold" }}>Role</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
              style={{ padding: "10px", fontSize: "14px", border: "1px solid #ccc", borderRadius: "4px" }}
            >
              <option value="employee">Employee</option>
              <option value="employer">Employer</option>
            </select>
          </div>
          <button
            type="submit"
            style={{
              padding: "10px",
              fontSize: "16px",
              backgroundColor: "#007BFF",
              color: "#FFF",
              border: "none",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
          >
            Sign Up
          </button>
        </form>
        {error && <p style={{ color: "red", marginTop: "15px", textAlign: "center" }}>{error}</p>}
        {success && <p style={{ color: "green", marginTop: "15px", textAlign: "center" }}>{success}</p>}
        <div style={{ textAlign: "center", marginTop: "20px" }}>
          <button
            style={{
              backgroundColor: "transparent",
              border: "1px solid #007BFF",
              color: "#007BFF",
              padding: "10px 20px",
              borderRadius: "5px",
              cursor: "pointer",
              fontWeight: "bold",
            }}
            onClick={() => alert("Redirect to login page")}
          >
            Log In
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserSignUp;