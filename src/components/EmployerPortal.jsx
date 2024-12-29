import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function EmployerPortal() {
  const [credentials, setCredentials] = useState({
    email: '',
    password: ''
  });
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    // In a real app, you would validate against a backend
    // For demo purposes, using a simple check
    if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
      localStorage.setItem('employerLoggedIn', 'true');
      navigate('/employer/dashboard');
    } else {
      alert('Invalid credentials');
    }
  };

  return (
    <div className="employer-portal">
      <div className="login-container">
        <h2>Employer Login</h2>
        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              type="email"
              id="email"
              value={credentials.email}
              onChange={(e) => setCredentials(prev => ({
                ...prev,
                email: e.target.value
              }))}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({
                ...prev,
                password: e.target.value
              }))}
              required
            />
          </div>
          <button type="submit" className="submit-button">Login</button>
        </form>
      </div>
    </div>
  );
}

export default EmployerPortal; 