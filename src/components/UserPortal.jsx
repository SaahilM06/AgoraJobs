import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authenticateUser } from '../utils/userData';

function UserPortal() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const result = await authenticateUser(credentials.email, credentials.password);
      if (result.success) {
        // Store user info in localStorage
        localStorage.setItem('userLoggedIn', 'true');
        localStorage.setItem('userId', result.userId);
        localStorage.setItem('userFullName', result.fullName);
        localStorage.setItem('userRole', result.role);

        // Redirect to user dashboard
        navigate('/dashboard');
      }
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  const handleSignUp = () => {
    // Navigate to the Sign Up page
    navigate('/signup');
  };

  return (
    <div className="user-portal">
      <div className="login-container">
        <h2>Student Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={credentials.email}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  email: e.target.value,
                }))
              }
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={credentials.password}
              onChange={(e) =>
                setCredentials((prev) => ({
                  ...prev,
                  password: e.target.value,
                }))
              }
              required
            />
          </div>
          {error && <div className="error-message">{error}</div>}
          <button type="submit" className="submit-button">
            Login
          </button>
        </form>
        <div className="button-group">
          <button onClick={handleSignUp} className="secondary-button">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserPortal;
