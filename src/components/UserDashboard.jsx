import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

function UserDashboard() {
  const navigate = useNavigate();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    university: "",
    graduation: "",
    role: "student",
  });

  // Fetch user profile data when form opens
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (showProfileForm) {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
          const userDocRef = doc(db, "User-Details", userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setProfile({
              full_name: data.full_name || "",
              university: data.university || "",
              graduation: data.graduation || "",
              role: data.role || "student"
            });
          }
        } catch (error) {
          console.error("Error fetching user profile:", error);
        }
      }
    };

    fetchUserProfile();
  }, [showProfileForm]); // Re-run when form opens

  const handleLogout = () => {
    localStorage.removeItem("userLoggedIn");
    localStorage.removeItem("userId");
    navigate("/login");
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem("userId");
    const userEmail = localStorage.getItem("userEmail");

    if (!userId || !userEmail) {
      console.error("No user ID or email found in localStorage");
      return;
    }

    try {
      // Get reference to the user's document using their ID
      const userDocRef = doc(db, "User-Details", userId);

      // Update only the profile fields
      await updateDoc(userDocRef, {
        full_name: profile.full_name,
        university: profile.university,
        graduation: profile.graduation
      });

      console.log("Profile updated successfully!");
      setShowProfileForm(false);
    } catch (error) {
      console.error("Error updating profile:", error.message);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {profile.full_name || "User"}</h1>
        <div className="dashboard-actions">
          <button
            className="secondary-button"
            onClick={() => setShowProfileForm(true)}
          >
            Edit Profile
          </button>
          <button className="secondary-button" onClick={handleLogout}>
            Logout
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <h2>Your Applications</h2>
        {/* Applications list here */}
      </div>

      {showProfileForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Profile</h2>
              <button
                onClick={() => setShowProfileForm(false)}
                className="close-button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      full_name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>University</label>
                <input
                  type="text"
                  value={profile.university}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      university: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Expected Graduation</label>
                <input
                  type="month"
                  value={profile.graduation}
                  onChange={(e) =>
                    setProfile((prev) => ({
                      ...prev,
                      graduation: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowProfileForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default UserDashboard;
