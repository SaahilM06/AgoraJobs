import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function UserDashboard() {
  const navigate = useNavigate();
  
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('userLoggedIn');
    if (!isLoggedIn) {
      navigate('/login');
    }
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userId');
    localStorage.removeItem('userFullName');
    localStorage.removeItem('userRole');
    navigate('/login');
  };

  return (
    <div className="user-dashboard">
      <div className="dashboard-header">
        <h2>Welcome, {localStorage.getItem('userFullName')}</h2>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>
      <div className="dashboard-content">
        <h3>Your Applications</h3>
        {/* Add application tracking functionality here */}
      </div>
    </div>
  );
}

export default UserDashboard; 