import React, { useState } from "react";
import { useNavigate } from "react-router-dom"; 
import { auth, db } from "../firebaseConfig";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const UserSignUp = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [role, setRole] = useState("employee");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const generateRandomId = (prefix) => {
    const randomString = Math.random().toString(36).substring(2, 8);
    return `${prefix}_${randomString}`;
  };

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
      const user = userCredential.user;

      let userData;
      
      if (role === "employer") {
        userData = {
          email: email,
          role: role,
          company_id: generateRandomId('CMP'),
          company_name: "",
          industry: "",
          description: "",
          headquarters: "",
          website: "",
          createdAt: new Date().toISOString()
        };
      } else if (role === "school_organization") {
        userData = {
          email: email,
          role: role,
          organization_id: generateRandomId('ORG'),
          university: "",
          organization_description: "",
          createdAt: new Date().toISOString()
        };
      } else {
        userData = {
          email: email,
          role: role,
          user_id: generateRandomId('USR'),
          full_name: "",
          university: "",
          graduation: "",
          createdAt: new Date().toISOString()
        };
      }

      await setDoc(doc(db, "User-Details", user.uid), userData);

      setSuccess(`User signed up: ${email} as ${role}`);

      localStorage.setItem("userLoggedIn", "true");
      localStorage.setItem("userId", user.uid);
      localStorage.setItem("userRole", role);
      
      if (role === "employer") {
        localStorage.setItem("employerId", user.uid);
        navigate("/employer/dashboard");
      } else if (role === "school_organization") {
        localStorage.setItem("organizationId", user.uid);
        navigate("/organization/dashboard");
      } else {
        navigate("/dashboard");
      }
    } catch (err) {
      console.error("Signup error:", err);
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
              <option value="school_organization">School Organization</option>
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