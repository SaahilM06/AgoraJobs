import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';

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

      const usersRef = collection(db, "User-Details");
      const q = query(usersRef, where("email", "==", credentials.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('User profile not found');
        return;
      }

      const userData = querySnapshot.docs[0].data();
      const userRole = userData.role;

      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', userRole);

      // Updated routing logic to include admin
      switch (userRole) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'employer':
          localStorage.setItem('employerId', user.uid);
          navigate('/employer/dashboard');
          break;
        case 'school_organization':
          localStorage.setItem('organizationId', user.uid);
          navigate('/organization/dashboard');
          break;
        case 'employee':
          navigate('/dashboard');
          break;
        default:
          setError('Invalid user role');
          break;
      }

    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid email or password');
    }
  };

  return (
    <div className="user-portal">
      <div className="login-container">
        <h2>Login</h2>
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
          <button onClick={() => navigate('/signup')} className="secondary-button">
            Sign Up
          </button>
        </div>
      </div>
    </div>
  );
}

export default UserPortal;
