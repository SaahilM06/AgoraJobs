import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../firebaseConfig";


function EmployerDashboard() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [companyProfile, setCompanyProfile] = useState(null);
  const [postedJobs, setPostedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [jobForm, setJobForm] = useState({
    company_id: '',
    company_name: '',
    job_description: '',
    salary_range: '',
    location: '',
    skills_required: '',
    industry: ''
  });

  useEffect(() => {
    const loadDashboard = async () => {
      const employerId = localStorage.getItem('employerId');
      if (!employerId) {
        navigate('/employer');
        return;
      }

      try {
        const profile = await fetchCompanyProfile(employerId);
        setCompanyProfile(profile);
        // In a real app, you'd also fetch posted jobs here
        setPostedJobs([
          // Placeholder data
          {
            id: 1,
            title: "Software Engineering Intern",
            applicants: 12,
            status: "Active",
            posted: "2024-03-01"
          },
          // Add more placeholder jobs as needed
        ]);
      } catch (error) {
        console.error('Error loading dashboard:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    try {
      
      await addDoc(collection(db, "agorajobs-postingdetails"), {
        ...jobForm,
        posting_date: serverTimestamp(), // default vals
        closing_date: jobForm.closing_date || null,
        remote_option: jobForm.remote_option || "No",
        experience_level: jobForm.experience_level || "Entry-level",
      });
  
      console.log("Job posted successfully!");
      setShowForm(false);
      setJobForm({
        company_id: "",
        company_name: "",
        job_description: "",
        salary_range: "",
        location: "",
        skills_required: "",
        industry: "",
      }); // Reset the form
    } catch (error) {
      console.error("Error posting job:", error);
      alert("Failed to post job. Please try again.");
    }
  };

  const handleSignOut = () => {
    // Clear all relevant localStorage items
    localStorage.removeItem('employerId');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  if (loading) {
    return <div className="dashboard-loading">Loading...</div>;
  }

  return (
    <div className="employer-dashboard">
      <div className="dashboard-header">
        <h1>Employer Dashboard</h1>
        <div className="dashboard-actions">
          <button onClick={() => setShowForm(true)} className="primary-button">
            Post New Job
          </button>
          <button onClick={handleSignOut} className="secondary-button">
            Sign Out
          </button>
        </div>
      </div>

      <div className="dashboard-grid">
        {/* Company Profile Summary */}
        <div className="dashboard-section company-summary">
          <h2>Company Profile</h2>
          <div className="profile-preview">
            <img 
              src={companyProfile?.logo_url || '/default-company-logo.png'} 
              alt="Company logo"
              className="company-logo"
            />
            <div className="profile-info">
              <h3>{companyProfile?.company_name}</h3>
              <p>{companyProfile?.industry}</p>
              <p>{companyProfile?.location}</p>
            </div>
          </div>
          <button onClick={() => navigate('/employer/profile')} className="edit-profile-button">
            Edit Profile
          </button>
        </div>

        {/* Job Postings Overview */}
        <div className="dashboard-section job-postings">
          <h2>Active Job Postings</h2>
          <div className="jobs-list">
            {postedJobs.map(job => (
              <div key={job.id} className="job-item">
                <div className="job-info">
                  <h3>{job.title}</h3>
                  <div className="job-meta">
                    <span>Posted: {new Date(job.posted).toLocaleDateString()}</span>
                    <span>Applicants: {job.applicants}</span>
                    <span className={`status ${job.status.toLowerCase()}`}>
                      {job.status}
                    </span>
                  </div>
                </div>
                <div className="job-actions">
                  <button className="view-applicants">View Applicants</button>
                  <button className="edit-job">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modal Form */}
      {showForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Post New Job</h2>
              <button 
                onClick={() => setShowForm(false)} 
                className="close-button"
              >
                ×
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="job-form">
              <div className="form-grid">
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    type="text"
                    value={jobForm.title}
                    onChange={(e) => setJobForm(prev => ({...prev, title: e.target.value}))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Job Description</label>
                  <textarea
                    value={jobForm.job_description}
                    onChange={(e) => setJobForm(prev => ({...prev, job_description: e.target.value}))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Salary Range</label>
                  <input
                    type="text"
                    value={jobForm.salary_range}
                    onChange={(e) => setJobForm(prev => ({...prev, salary_range: e.target.value}))}
                    placeholder="e.g. $20-$25/hr"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={jobForm.location}
                    onChange={(e) => setJobForm(prev => ({...prev, location: e.target.value}))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Skills Required</label>
                  <input
                    type="text"
                    value={jobForm.skills_required}
                    onChange={(e) => setJobForm(prev => ({...prev, skills_required: e.target.value}))}
                    placeholder="e.g. Python, Machine Learning"
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Industry</label>
                  <input
                    type="text"
                    value={jobForm.industry}
                    onChange={(e) => setJobForm(prev => ({...prev, industry: e.target.value}))}
                    required
                  />
                </div>
              </div>

              <div className="form-buttons">
                <button type="button" onClick={() => setShowForm(false)} className="secondary-button">
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Post Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default EmployerDashboard;