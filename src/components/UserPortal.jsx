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
      // 1. First verify email/password with Firebase Auth
      const userCredential = await signInWithEmailAndPassword(
        auth,
        credentials.email,
        credentials.password
      );
      const { user } = userCredential;

      // 2. Query Firestore to get user's role using their email
      const usersRef = collection(db, "User-Details");
      const q = query(usersRef, where("email", "==", credentials.email));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        setError('User profile not found');
        return;
      }

      // Get the user data from the first matching document
      const userData = querySnapshot.docs[0].data();
      const userRole = userData.role;

      // 3. Set localStorage items
      localStorage.setItem('userLoggedIn', 'true');
      localStorage.setItem('userId', user.uid);
      localStorage.setItem('userEmail', user.email);
      localStorage.setItem('userRole', userRole);

      //4. Navigate based on role
      if (userRole === 'employer') {
        localStorage.setItem('employerId', user.uid);
        navigate('/employer/dashboard');
      } else {
        navigate('/dashboard');
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
