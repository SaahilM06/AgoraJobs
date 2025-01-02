import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebaseConfig';

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
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      const { user } = userCredential;

      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('userEmail', user.email);

      navigate('/dashboard');
    } catch (error) {
      setError('Invalid email or password');
    }
  };

  const handleSignUp = () => {
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
