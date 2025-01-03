import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function ProfileSetup() {
  const navigate = useNavigate();
  const [profileData, setProfileData] = useState({
    full_name: '',
    university: '',
    graduation: '',
    role: 'student' // default role
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    // Here you would typically make an API call to save the profile data
    try {
      // Add API call here
      navigate('/dashboard'); // Redirect to dashboard after successful setup
    } catch (error) {
      console.error('Error saving profile:', error);
    }
  };

  return (
    <div className="profile-setup-container">
      <h2>Complete Your Profile</h2>
      <form onSubmit={handleSubmit} className="profile-setup-form">
        <div className="form-group">
          <label>Full Name</label>
          <input
            type="text"
            value={profileData.full_name}
            onChange={(e) => setProfileData(prev => ({
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
            value={profileData.university}
            onChange={(e) => setProfileData(prev => ({
              ...prev,
              university: e.target.value
            }))}
            required
          />
        </div>

        <div className="form-group">
          <label>Expected Graduation Date</label>
          <input
            type="month"
            value={profileData.graduation}
            onChange={(e) => setProfileData(prev => ({
              ...prev,
              graduation: e.target.value
            }))}
            required
          />
        </div>

        <button type="submit" className="primary-button">
          Complete Setup
        </button>
      </form>
    </div>
  );
}

export default ProfileSetup; 