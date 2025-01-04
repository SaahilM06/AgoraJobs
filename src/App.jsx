import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import JobBoard from './components/JobBoard';
import UserPortal from './components/UserPortal';
import UserDashboard from './components/UserDashboard';
import './App.css'
import UserSignUp from './components/UserSignUp';
import Welcome from './components/Welcome';
import ProfileSetup from './components/ProfileSetup';
import EmployerDashboard from './components/EmployerDashboard';

function App() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'student',
    university: '',
    graduation: ''
  })

  const [activeQuestion, setActiveQuestion] = useState(null);

  const toggleQuestion = (index) => {
    setActiveQuestion(activeQuestion === index ? null : index);
  };

  const handleSubmit = (e) => {
    e.preventDefault()
    console.log('Form submitted:', formData)
  }

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const testimonials = [
    {
      id: 1,
      name: "Sarah Chen",
      role: "Software Engineering Intern",
      company: "TechStart AI",
      image: "https://randomuser.me/api/portraits/women/1.jpg",
      text: "Through AgoraJobs, I landed my dream internship at an AI startup. The matching system is incredibly accurate, and the application process was seamless."
    },
    {
      id: 2,
      name: "James Rodriguez",
      role: "Product Manager",
      company: "FinoTech",
      image: "https://randomuser.me/api/portraits/men/2.jpg",
      text: "As a business student interested in tech, AgoraJobs helped me find the perfect product role. The startup exposure has been invaluable for my career."
    },
    {
      id: 3,
      name: "Emily Taylor",
      role: "Marketing Associate",
      company: "GrowthBase",
      image: "https://randomuser.me/api/portraits/women/3.jpg",
      text: "The personalized matching made job hunting so much easier. I found a role that perfectly matched my skills and interests."
    }
  ];

  const TestimonialsSection = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [touchStart, setTouchStart] = useState(0);
    const [touchEnd, setTouchEnd] = useState(0);

    const handleNext = () => {
      setCurrentIndex((prevIndex) => 
        prevIndex === testimonials.length - 1 ? 0 : prevIndex + 1
      );
    };

    const handlePrev = () => {
      setCurrentIndex((prevIndex) => 
        prevIndex === 0 ? testimonials.length - 1 : prevIndex - 1
      );
    };

    const handleTouchStart = (e) => {
      setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchMove = (e) => {
      setTouchEnd(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = () => {
      if (touchStart - touchEnd > 75) {
        handleNext();
      }
      if (touchStart - touchEnd < -75) {
        handlePrev();
      }
    };

    useEffect(() => {
      const interval = setInterval(handleNext, 5000); // Auto advance every 5 seconds
      return () => clearInterval(interval);
    }, []);

    return (
      <section className="testimonials-section">
        <h2>What Our Users Say</h2>
        <div 
          className="testimonials-container"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <button className="nav-button prev" onClick={handlePrev}>‹</button>
          <div className="testimonials-wrapper">
            {testimonials.map((testimonial, index) => (
              <div 
                key={testimonial.id}
                className={`testimonial-card ${index === currentIndex ? 'active' : ''}`}
                style={{
                  transform: `translateX(${(index - currentIndex) * 100}%)`
                }}
              >
                <div className="testimonial-content">
                  <div className="testimonial-text">"{testimonial.text}"</div>
                  <div className="testimonial-author">
                    <img src={testimonial.image} alt={testimonial.name} />
                    <div className="author-info">
                      <h4>{testimonial.name}</h4>
                      <p>{testimonial.role}</p>
                      <p className="company">{testimonial.company}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="nav-button next" onClick={handleNext}>›</button>
        </div>
        <div className="testimonial-dots">
          {testimonials.map((_, index) => (
            <button
              key={index}
              className={`dot ${index === currentIndex ? 'active' : ''}`}
              onClick={() => setCurrentIndex(index)}
            />
          ))}
        </div>
      </section>
    );
  };

  return (
    <Router>
      <div className="app">
        <header className="header">
          <div className="logo">AgoraJobs</div>
          <nav className="headers">
            <Link to="/">Home</Link>
            <Link to="/jobs">Jobs</Link>
            <a href="#contact">Contact</a>
            {localStorage.getItem('userLoggedIn') ? (
              <Link to="/dashboard">Dashboard</Link>
            ) : (
              <Link to="/login">Login</Link>
            )}
          </nav>
        </header>

        <Routes>
          <Route path="/" element={
            <>
              {/* Hero Section */}
              <section className="hero-section">
                <div className="hero-content">
                  <h1>Your bridge to startup opportunities.</h1>
                  <p className="hero-subtitle">Connect with innovative startups, land your dream internship or job, and kickstart your career journey.</p>
                  <button className="cta-button">Get Started - It's Free!</button>
                  <div className="trust-badge">
                    <span>⭐️⭐️⭐️⭐️⭐️</span>
                    <p>Trusted by 1000+ students and 100+ startups</p>
                  </div>
                </div>
              </section>

              {/* Features Section */}
              <section className="features-section">
                <h2>Why Choose AgoraJobs?</h2>
                <div className="features-grid">
                  <div className="feature-card">
                    <div className="feature-icon">🎯</div>
                    <h3>Personalized Matching</h3>
                    <p>AI-powered job matching based on your skills and interests</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">🚀</div>
                    <h3>Startup Focus</h3>
                    <p>Exclusive opportunities with vetted, growing startups</p>
                  </div>
                  <div className="feature-card">
                    <div className="feature-icon">📝</div>
                    <h3>Easy Applications</h3>
                    <p>One profile, seamless applications to multiple positions</p>
                  </div>
                </div>
              </section>

              {/* Stats Section with Animation */}
              <section className="stats-section">
                <div className="stat-item">
                  <div className="stat-number">500+</div>
                  <p>Active Students</p>
                </div>
                <div className="stat-item">
                  <div className="stat-number">100+</div>
                  <p>Partner Startups</p>
                </div>
                <div className="stat-item">
                  <div className="stat-number">200+</div>
                  <p>Successful Placements</p>
                </div>
              </section>

              {/* How It Works Section */}
              <section className="how-it-works">
                <h2>How It Works</h2>
                <div className="steps-container">
                  <div className="step">
                    <div className="step-number">1</div>
                    <h3>Create Your Profile</h3>
                    <p>Sign up and build your professional profile highlighting your skills and interests</p>
                  </div>
                  <div className="step">
                    <div className="step-number">2</div>
                    <h3>Get Matched</h3>
                    <p>Our AI matches you with relevant startup opportunities</p>
                  </div>
                  <div className="step">
                    <div className="step-number">3</div>
                    <h3>Apply & Connect</h3>
                    <p>Apply with one click and connect directly with startup founders</p>
                  </div>
                </div>
              </section>

              {/* FAQ Section */}
              <section className="faq-section">
                <h2>Got questions?</h2>
                <p className="faq-subtitle">Explore our FAQ section to learn more.</p>
                
                <div className="faq-container">
                  <div className={`faq-item ${activeQuestion === 0 ? 'active' : ''}`} onClick={() => toggleQuestion(0)}>
                    <div className="faq-question">
                      <span className="question-icon">💭</span>
                      <h3>Is AgoraJobs free? How do you make money?</h3>
                      <span className="toggle-icon">{activeQuestion === 0 ? '−' : '+'}</span>
                    </div>
                    <div className="faq-answer">
                      <p>The base version of AgoraJobs is and will be free forever. We make money by charging companies to post jobs and promote their openings. We don't sell your data. We also offer a premium subscription with additional AI features to enhance your job search.</p>
                    </div>
                  </div>

                  <div className={`faq-item ${activeQuestion === 1 ? 'active' : ''}`} onClick={() => toggleQuestion(1)}>
                    <div className="faq-question">
                      <span className="question-icon">🎯</span>
                      <h3>How does AgoraJobs work?</h3>
                      <span className="toggle-icon">{activeQuestion === 1 ? '−' : '+'}</span>
                    </div>
                    <div className="faq-answer">
                      <p>Our platform uses AI to match students with startup opportunities based on their skills, interests, and experience. Create a profile, and we'll connect you with relevant positions at vetted startups. Apply with one click and communicate directly with founders.</p>
                    </div>
                  </div>

                  <div className={`faq-item ${activeQuestion === 2 ? 'active' : ''}`} onClick={() => toggleQuestion(2)}>
                    <div className="faq-question">
                      <span className="question-icon">🔒</span>
                      <h3>How does AgoraJobs handle my data?</h3>
                      <span className="toggle-icon">{activeQuestion === 2 ? '−' : '+'}</span>
                    </div>
                    <div className="faq-answer">
                      <p>We take data privacy seriously. Your information is securely stored and only shared with startups when you apply to their positions. We never sell your data to third parties and comply with all relevant data protection regulations.</p>
                    </div>
                  </div>

                  <div className={`faq-item ${activeQuestion === 3 ? 'active' : ''}`} onClick={() => toggleQuestion(3)}>
                    <div className="faq-question">
                      <span className="question-icon">🎓</span>
                      <h3>What kind of opportunities can I find on AgoraJobs?</h3>
                      <span className="toggle-icon">{activeQuestion === 3 ? '−' : '+'}</span>
                    </div>
                    <div className="faq-answer">
                      <p>We offer a wide range of opportunities including internships, full-time positions, and part-time roles across various sectors in the startup ecosystem. From tech to marketing, business development to design - we've got opportunities for diverse skill sets.</p>
                    </div>
                  </div>
                </div>
              </section>

              <TestimonialsSection />
            </>
          } />
          <Route path="/jobs" element={<JobBoard />} />
          <Route path="/login" element={<UserPortal />} />
          <Route path="/dashboard" element={<UserDashboard />} />
          <Route path="/signup" element={<UserSignUp />} />
          <Route path="/welcome" element={<Welcome />} />
          <Route path="/setup-profile" element={<ProfileSetup />} />
          <Route path ="/employer/dashboard" element = {<EmployerDashboard/>} />
        </Routes>

        {/* Footer */}
        <footer className="footer">
          <div className="footer-content">
            <div className="footer-section">
              <h4>AgoraJobs</h4>
              <p>Connecting ambitious students with innovative startups</p>
            </div>
            
            <div className="footer-section">
              <h4>Quick Links</h4>
              <div className="footer-links">
                <a href="#about">About Us</a>
                <a href="#browse">Browse Jobs</a>
                <a href="#startups">For Startups</a>
              </div>
            </div>
            
            <div className="footer-section">
              <h4>Contact</h4>
              <p>hello@agorajobs.com</p>
              <div className="social-links">
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
              </div>
            </div>
          </div>
          
          <div className="footer-bottom">
            <p>&copy; 2024 AgoraJobs. All rights reserved.</p>
          </div>
        </footer>
      </div>
    </Router>
  )
}

export default App
