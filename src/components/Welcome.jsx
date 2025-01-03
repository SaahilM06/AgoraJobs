import { useNavigate } from 'react-router-dom';

function Welcome() {
  const navigate = useNavigate();

  return (
    <div className="welcome-container">
      <h1>Welcome to AgoraJobs!</h1>
      <p>Complete your profile to get started</p>
      <button 
        className="primary-button"
        onClick={() => navigate('/setup-profile')}
      >
        Set Up Profile
      </button>
    </div>
  );
}

export default Welcome; 