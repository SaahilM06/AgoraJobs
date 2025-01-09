import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db, auth } from "../firebaseConfig";

function UserDashboard() {
  const navigate = useNavigate();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profile, setProfile] = useState({
    full_name: "",
    university: "",
    graduation: "",
    role: "student",
  });
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Fetch user's applications
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const currentUser = auth.currentUser;
        if (!currentUser) return;

        // Get user_id from User-Details
        const userDocRef = doc(db, "User-Details", currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) return;
        
        const userData = userDoc.data();
        const user_id = userData.user_id;

        // Query applications for this user
        const applicationsRef = collection(db, "applications-submitted");
        const q = query(applicationsRef, where("user_id", "==", user_id));
        const querySnapshot = await getDocs(q);

        const applicationPromises = querySnapshot.docs.map(async (doc) => {
          const appData = doc.data();
          
          // Get job details
          const jobsRef = collection(db, "agorajobs-postingdetails");
          const jobQuery = query(jobsRef, where("job_id", "==", appData.job_id));
          const jobSnapshot = await getDocs(jobQuery);
          const jobData = jobSnapshot.docs[0]?.data() || {};

          return {
            id: doc.id,
            ...appData,
            job_title: jobData.title || "Unknown Job",
            company_name: jobData.company_name || "Unknown Company",
            status: "Pending" // You can add status logic here
          };
        });

        const resolvedApplications = await Promise.all(applicationPromises);
        setApplications(resolvedApplications);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching applications:", error);
        setLoading(false);
      }
    };

    fetchApplications();
  }, []);

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
        <div className="jobs-container">
          <div className="jobs-list">
            {loading ? (
              <p>Loading your applications...</p>
            ) : applications.length === 0 ? (
              <p>No applications submitted yet.</p>
            ) : (
              applications.map((application) => (
                <div 
                  key={application.id}
                  className="job-card"
                >
                  <h3>{application.job_title}</h3>
                  <div className="job-card-details">
                    <span className="company-name">{application.company_name}</span>
                    <span className="application-date">
                      Applied: {new Date(application.application_date).toLocaleDateString()}
                    </span>
                    <span className={`status-badge status-${application.status.toLowerCase()}`}>
                      {application.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
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
