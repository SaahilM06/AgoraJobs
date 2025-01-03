import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const navigate = useNavigate();
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profile, setProfile] = useState({
    full_name: '',
    university: '',
    graduation: '',
    role: 'student'
  });

  const handleLogout = () => {
    localStorage.removeItem('userLoggedIn');
    navigate('/login');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    // Add API call to save profile data
    console.log('Profile data:', profile);
    setShowProfileForm(false);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {profile.full_name || 'User'}</h1>
        <div className="dashboard-actions">
          <button 
            className="secondary-button"
            onClick={() => setShowProfileForm(true)}
          >
            Edit Profile
          </button>
          <button 
            className="secondary-button"
            onClick={handleLogout}
          >
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
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    full_name: e.target.value
                  }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>University</label>
                <input
                  type="text"
                  value={profile.university}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    university: e.target.value
                  }))}
                  required
                />
              </div>

              <div className="form-group">
                <label>Expected Graduation</label>
                <input
                  type="month"
                  value={profile.graduation}
                  onChange={(e) => setProfile(prev => ({
                    ...prev,
                    graduation: e.target.value
                  }))}
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
                <button 
                  type="submit" 
                  className="primary-button"
                >
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