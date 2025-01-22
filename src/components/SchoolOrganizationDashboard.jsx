import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';

function SchoolOrganizationDashboard() {
  const navigate = useNavigate();
  const [organizationProfile, setOrganizationProfile] = useState({
    university: '',
    organization_description: '',
    organization_name: '',
  });
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = () => {
      const userRole = localStorage.getItem('userRole');
      if (userRole !== 'school_organization') {
        navigate('/login');
      }
    };

    const fetchOrganizationProfile = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const userDoc = await getDoc(doc(db, "User-Details", userId));
        
        if (userDoc.exists()) {
          const userData = userDoc.data();
          setOrganizationProfile({
            university: userData.university || '',
            organization_description: userData.organization_description || '',
            organization_name: userData.organization_name || '',
          });
        }
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        setLoading(false);
      }
    };

    checkAuth();
    fetchOrganizationProfile();
  }, [navigate]);

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    try {
      const userId = localStorage.getItem('userId');
      await updateDoc(doc(db, "User-Details", userId), {
        university: organizationProfile.university,
        organization_description: organizationProfile.organization_description,
        organization_name: organizationProfile.organization_name,
      });
      setShowProfileForm(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="school-dashboard">
      <div className="dashboard-header">
        <h1>Welcome, {organizationProfile.organization_name || "School Organization"}</h1>
        <button className="logout-button" onClick={() => navigate('/login')}>
          Sign Out
        </button>
      </div>
      
      <div className="dashboard-content">
        <div className="profile-section">
          <h2>Organization Profile</h2>
          {!showProfileForm ? (
            <div className="profile-display">
              <p><strong>Organization Name:</strong> {organizationProfile.organization_name || 'Not set'}</p>
              <p><strong>University:</strong> {organizationProfile.university || 'Not set'}</p>
              <p><strong>Description:</strong> {organizationProfile.organization_description || 'Not set'}</p>
              <button className="edit-button" onClick={() => setShowProfileForm(true)}>Edit Profile</button>
            </div>
          ) : (
            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-group">
                <label>Organization Name</label>
                <input
                  type="text"
                  value={organizationProfile.organization_name}
                  onChange={(e) => setOrganizationProfile({
                    ...organizationProfile,
                    organization_name: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>University Name</label>
                <input
                  type="text"
                  value={organizationProfile.university}
                  onChange={(e) => setOrganizationProfile({
                    ...organizationProfile,
                    university: e.target.value
                  })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Organization Description</label>
                <textarea
                  value={organizationProfile.organization_description}
                  onChange={(e) => setOrganizationProfile({
                    ...organizationProfile,
                    organization_description: e.target.value
                  })}
                  required
                  rows="5"
                />
              </div>
              <div className="form-buttons">
                <button type="submit" className="save-button">Save Changes</button>
                <button type="button" onClick={() => setShowProfileForm(false)} className="cancel-button">
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

export default SchoolOrganizationDashboard;