import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { fetchCompanyProfile, updateCompanyProfile } from '../utils/companyData';

function CompanyProfile() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState({
    company_id: '',
    company_name: '',
    industry: '',
    description: '',
    headquarters: '',
    website: '',
    email: ''
  });
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const employerId = localStorage.getItem('employerId');
      if (!employerId) {
        navigate('/employer');
        return;
      }

      try {
        const companyData = await fetchCompanyProfile(employerId);
        setProfile(companyData);
        setLoading(false);
      } catch (error) {
        console.error('Error loading profile:', error);
        navigate('/employer');
      }
    };

    loadProfile();
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateCompanyProfile(profile);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Failed to update profile');
    }
  };

  if (loading) {
    return <div className="company-profile">Loading...</div>;
  }

  return (
    <div className="company-profile">
      <h2>Company Profile</h2>
      <form onSubmit={handleSubmit} className="profile-form">
        <div className="form-grid">
          <div className="form-group">
            <label>Company Name</label>
            <input
              type="text"
              name="company_name"
              value={profile.company_name}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>Industry</label>
            <input
              type="text"
              name="industry"
              value={profile.industry}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>Headquarters</label>
            <input
              type="text"
              name="headquarters"
              value={profile.headquarters}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>Website</label>
            <input
              type="url"
              name="website"
              value={profile.website}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>

          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              name="email"
              value={profile.email}
              onChange={handleChange}
              disabled={!isEditing}
              required
            />
          </div>
        </div>

        <div className="form-group">
          <label>Company Description</label>
          <textarea
            name="description"
            value={profile.description}
            onChange={handleChange}
            disabled={!isEditing}
            required
            rows={4}
          />
        </div>

        <div className="profile-buttons">
          {!isEditing ? (
            <button type="button" onClick={() => setIsEditing(true)} className="edit-button">
              Edit Profile
            </button>
          ) : (
            <>
              <button type="button" onClick={() => setIsEditing(false)} className="cancel-button">
                Cancel
              </button>
              <button type="submit" className="submit-button">
                Save Changes
              </button>
            </>
          )}
        </div>
      </form>
    </div>
  );
}

export default CompanyProfile; 