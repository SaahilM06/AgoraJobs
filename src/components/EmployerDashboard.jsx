import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { appendJob } from '../utils/jobsData';

function EmployerDashboard() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [jobForm, setJobForm] = useState({
    company_id: '',
    company_name: '',
    job_description: '',
    job_type: 'Paid Internship',
    salary_range: '',
    location: '',
    remote_option: 'No',
    experience_level: 'Entry-level',
    skills_required: '',
    industry: ''
  });

  useEffect(() => {
    // Check if employer is logged in
    const isLoggedIn = localStorage.getItem('employerLoggedIn');
    if (!isLoggedIn) {
      navigate('/employer');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Add posting_date and closing_date
    const newJob = {
      ...jobForm,
      posting_date: new Date().toISOString().split('T')[0],
      closing_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 30 days from now
    };

    try {
      await appendJob(newJob);
      alert('Job posted successfully!');
      setShowForm(false);
      setJobForm({
        company_id: '',
        company_name: '',
        job_description: '',
        job_type: 'Paid Internship',
        salary_range: '',
        location: '',
        remote_option: 'No',
        experience_level: 'Entry-level',
        skills_required: '',
        industry: ''
      });
    } catch (error) {
      alert('Error posting job: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('employerLoggedIn');
    navigate('/employer');
  };

  return (
    <div className="employer-dashboard">
      <div className="dashboard-header">
        <h2>Employer Dashboard</h2>
        <button onClick={handleLogout} className="logout-button">Logout</button>
      </div>

      {!showForm ? (
        <button onClick={() => setShowForm(true)} className="add-job-button">
          Post New Job
        </button>
      ) : (
        <form onSubmit={handleSubmit} className="job-form">
          <h3>Post New Job</h3>
          
          <div className="form-grid">
            <div className="form-group">
              <label>Company ID</label>
              <input
                type="text"
                value={jobForm.company_id}
                onChange={(e) => setJobForm(prev => ({...prev, company_id: e.target.value}))}
                required
              />
            </div>

            <div className="form-group">
              <label>Company Name</label>
              <input
                type="text"
                value={jobForm.company_name}
                onChange={(e) => setJobForm(prev => ({...prev, company_name: e.target.value}))}
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
            <button type="button" onClick={() => setShowForm(false)} className="cancel-button">
              Cancel
            </button>
            <button type="submit" className="submit-button">
              Post Job
            </button>
          </div>
        </form>
      )}
    </div>
  );
}

export default EmployerDashboard;