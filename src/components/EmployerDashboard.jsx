import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

function EmployerDashboard() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [companyProfile, setCompanyProfile] = useState({
    company_name: "",
    industry: "",
    description: "",
    headquarters: "",
    website: ""
  });
  const [loading, setLoading] = useState(true);
  const [jobForm, setJobForm] = useState({
    company_id: '',
    company_name: '',
    job_description: '',
    salary_range: '',
    location: '',
    skills_required: '',
    industry: ''
  });

  // Fetch company profile data when form opens
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (showProfileForm) {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
          const userDocRef = doc(db, "User-Details", userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCompanyProfile({
              company_name: data.company_name || "",
              industry: data.industry || "",
              description: data.description || "",
              headquarters: data.headquarters || "",
              website: data.website || ""
            });
          }
        } catch (error) {
          console.error("Error fetching company profile:", error);
        }
      }
    };

    fetchCompanyProfile();
  }, [showProfileForm]); // Re-run when form opens

  const handleLogout = () => {
    localStorage.removeItem('employerId');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');

    try {
      const userDocRef = doc(db, "User-Details", userId);
      await updateDoc(userDocRef, {
        company_name: companyProfile.company_name,
        industry: companyProfile.industry,
        description: companyProfile.description,
        headquarters: companyProfile.headquarters,
        website: companyProfile.website
      });

      console.log("Company profile updated successfully!");
      setShowProfileForm(false);
    } catch (error) {
      console.error("Error updating company profile:", error.message);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {companyProfile.company_name || "Company"}</h1>
        <div className="dashboard-actions">
          <button
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            Post New Job
          </button>
          <button
            className="secondary-button"
            onClick={() => setShowProfileForm(true)}
          >
            Edit Profile
          </button>
          <button className="secondary-button" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <h2>Active Job Postings</h2>
        {/* Job postings list here */}
      </div>

      {showProfileForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Company Profile</h2>
              <button
                onClick={() => setShowProfileForm(false)}
                className="close-button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={companyProfile.company_name}
                  onChange={(e) =>
                    setCompanyProfile((prev) => ({
                      ...prev,
                      company_name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Industry</label>
                <input
                  type="text"
                  value={companyProfile.industry}
                  onChange={(e) =>
                    setCompanyProfile((prev) => ({
                      ...prev,
                      industry: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Company Description</label>
                <textarea
                  value={companyProfile.description}
                  onChange={(e) =>
                    setCompanyProfile((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Headquarters</label>
                <input
                  type="text"
                  value={companyProfile.headquarters}
                  onChange={(e) =>
                    setCompanyProfile((prev) => ({
                      ...prev,
                      headquarters: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={companyProfile.website}
                  onChange={(e) =>
                    setCompanyProfile((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  placeholder="https://example.com"
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

      {/* Job posting form modal here */}
    </div>
  );
}

export default EmployerDashboard;