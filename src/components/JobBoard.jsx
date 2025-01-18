import { useState, useEffect } from 'react';
import { fetchJobs } from '../utils/jobsData';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, getDoc, getDocs } from 'firebase/firestore';
import { storage, db, auth } from '../firebaseConfig';
import { useNavigate } from 'react-router-dom';

const DEFAULT_LOGO = 'https://via.placeholder.com/80?text=Logo';

function JobBoard() {
  const [jobs, setJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    industry: '',
    location: '',
    salary: '',
    experience: ''
  });
  const [showApplyPopup, setShowApplyPopup] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  
  useEffect(() => {
    const loadJobs = async () => {
      try {
        console.log("Starting to fetch jobs...");
        const jobsData = await fetchJobs();
        console.log("Fetched jobs data:", jobsData);
        setJobs(jobsData);
      } catch (error) {
        console.error("Error loading jobs:", error);
        setJobs([]);
      }
    };

    loadJobs();
    const interval = setInterval(loadJobs, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsAuthenticated(!!user);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (selectedJob) {
      console.log("Selected job details:", selectedJob);
      console.log("Company ID:", selectedJob.company_id);
    }
  }, [selectedJob]);

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      setResumeFile(file);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    console.log("Starting application submission process...");
    
    const currentUser = auth.currentUser;
    if (!currentUser) {
      console.error("No authenticated user found");
      alert("Please sign in to submit an application");
      return;
    }

    try {
      // First get the user_id from User-Details
      const userDocRef = doc(db, "User-Details", currentUser.uid);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error("User details not found");
      }

      const userData = userDoc.data();
      const user_id = userData.user_id; // This will be in format "USR_xxx"

      if (!user_id || !resumeFile || !selectedJob) {
        console.error("Missing required information:", {
          hasUserId: !!user_id,
          hasResumeFile: !!resumeFile,
          hasSelectedJob: !!selectedJob,
          hasJobId: !!selectedJob?.job_id
        });
        alert("Please ensure you're logged in and have attached a resume.");
        return;
      }

      const resume_id = `RESUME_${user_id}_${Date.now()}`;
      console.log("Generated temporary resume_id:", resume_id);

      const applicationData = {
        application_date: new Date().toISOString(),
        job_id: selectedJob.job_id,
        user_id: user_id,
        resume_id: resume_id
      };
      
      console.log("Preparing to submit application with data:", applicationData);

      const applicationsRef = collection(db, "applications-submitted");
      const docRef = await addDoc(applicationsRef, applicationData);
      console.log("Application submitted successfully with ID:", docRef.id);

      setShowApplyPopup(false);
      setResumeFile(null);
      alert("Application submitted successfully!");

    } catch (error) {
      console.error("Error in application submission:", error);
      console.error("Error details:", {
        code: error.code,
        message: error.message,
        stack: error.stack
      });
      alert(`Error submitting application: ${error.message}`);
    }
  };

  const getUniqueValues = (array, key) => {
    return [...new Set(array.map(item => item[key]))].filter(Boolean);
  };

  const uniqueIndustries = getUniqueValues(jobs, 'industry');
  const uniqueLocations = getUniqueValues(jobs, 'location');
  const uniqueExperienceLevels = getUniqueValues(jobs, 'experience_level');
  const uniqueSalaryRanges = getUniqueValues(jobs, 'salary_range');

  const isJobActive = (job) => {
    if (!job.job_deadline) return true; // If no deadline, show the job
    const deadline = new Date(job.job_deadline);
    const now = new Date();
    return deadline > now;
  };

  const filteredJobs = jobs.filter(job => {
    // First check if the job is still active (deadline hasn't passed)
    const isActive = isJobActive(job);
    if (!isActive) return false;

    const searchTerms = searchQuery.toLowerCase();
    const matchesSearch = searchQuery === '' || 
      (job.title?.toLowerCase() || '').includes(searchTerms) ||
      (job.company_name?.toLowerCase() || '').includes(searchTerms) ||
      (job.skills_required && Array.isArray(job.skills_required) && 
        job.skills_required.some(skill => 
          (skill?.toLowerCase() || '').includes(searchTerms)
        )
      ) ||
      (job.description?.toLowerCase() || '').includes(searchTerms);

    const matchesIndustry = !filters.industry || job.industry === filters.industry;
    const matchesLocation = !filters.location || job.location === filters.location;
    const matchesExperience = !filters.experience || job.experience_level === filters.experience;
    const matchesSalary = !filters.salary || job.salary_range === filters.salary;

    return matchesSearch && matchesIndustry && matchesLocation && matchesExperience && matchesSalary;
  });

  const renderCompanyInfo = (job) => {
    if (!isAuthenticated) {
      return (
        <h4 
          onClick={() => navigate('/login')} 
          style={{ cursor: 'pointer', color: '#0066cc' }}
        >
          [Sign in to view company]
        </h4>
      );
    }
    return <h4>{job.company}</h4>;
  };

  return (
    <>
      <div className="job-board">
        <div className="search-filters">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search for titles, skills, or companies"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filters">
            <select 
              value={filters.industry}
              onChange={(e) => handleFilterChange('industry', e.target.value)}
            >
              <option value="">All Industries</option>
              {uniqueIndustries.map(industry => (
                <option key={industry} value={industry}>
                  {industry}
                </option>
              ))}
            </select>

            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              <option value="">All Locations</option>
              {uniqueLocations.map(location => (
                <option key={location} value={location}>
                  {location}
                </option>
              ))}
            </select>

            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
            >
              <option value="">All Experience Levels</option>
              {uniqueExperienceLevels.map(level => (
                <option key={level} value={level}>
                  {level}
                </option>
              ))}
            </select>

            <select
              value={filters.salary}
              onChange={(e) => handleFilterChange('salary', e.target.value)}
            >
              <option value="">All Salary Ranges</option>
              {uniqueSalaryRanges.map(range => (
                <option key={range} value={range}>
                  {range}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="job-content">
          <div className="job-list">
            {filteredJobs.map(job => (
              <div 
                key={job.id} 
                className={`job-card ${selectedJob?.id === job.id ? 'selected' : ''}`}
                onClick={() => setSelectedJob(job)}
              >
                <div className="job-card-logo">
                  <img 
                    src={job.logo} 
                    alt={`${job.company} logo`}
                    onError={(e) => { e.target.src = DEFAULT_LOGO }}
                  />
                </div>
                <div className="job-card-content">
                  <h3>{job.title}</h3>
                  {renderCompanyInfo(job)}
                  <p>{job.description}</p>
                  <div className="job-card-footer">
                    <span>{job.salary_range}</span>
                    <span>{job.location}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="job-details">
            {selectedJob ? (
              <>
                <div className="job-header">
                  <div className="job-header-content">
                    <h2>{selectedJob.title || 'Untitled Position'}</h2>
                    {isAuthenticated ? (
                      <>
                        <h3>{selectedJob.company_name || 'Company name not available'}</h3>
                        <div className="job-header-info">
                          <span>{selectedJob.salary_range || 'Salary not specified'}</span>
                          <span>{selectedJob.location || 'Location not specified'}</span>
                        </div>
                      </>
                    ) : (
                      <>
                        <h3 
                          onClick={() => navigate('/login')} 
                          style={{ cursor: 'pointer', color: '#0066cc' }}
                        >
                          [Sign in to view company]
                        </h3>
                        <div className="job-header-info">
                          <span 
                            onClick={() => navigate('/login')} 
                            style={{ cursor: 'pointer', color: '#0066cc' }}
                          >
                            [Sign in to view]
                          </span>
                        </div>
                      </>
                    )}
                  </div>
                  <button 
                    className="apply-button"
                    onClick={() => setShowApplyPopup(true)}
                  >
                    Apply now!
                  </button>
                </div>

                <div className="job-meta-details">
                  <div className="meta-grid">
                    <div className="meta-item">
                      <span className="label">Posted</span>
                      <span>
                        {selectedJob.posting_date 
                          ? new Date(selectedJob.posting_date).toLocaleDateString()
                          : 'Date not available'}
                      </span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Experience Level</span>
                      <span>{selectedJob.experience_level || 'Not specified'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Location</span>
                      <span>{selectedJob.location || 'Not specified'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Industry</span>
                      <span>{selectedJob.industry || 'Not specified'}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Headquarters</span>
                      <span>{selectedJob.headquarters || 'Not specified'}</span>
                    </div>
                    {isAuthenticated && (
                      <div className="meta-item">
                        <span className="label">Website</span>
                        {selectedJob.website ? (
                          <a href={selectedJob.website} target="_blank" rel="noopener noreferrer">
                            {selectedJob.website}
                          </a>
                        ) : (
                          <span>Website not available</span>
                        )}
                      </div>
                    )}
                    <div className="meta-item">
                      <span className="label">Application Deadline</span>
                      <span>
                        {selectedJob.job_deadline 
                          ? new Date(selectedJob.job_deadline).toLocaleDateString()
                          : 'No deadline specified'}
                      </span>
                    </div>
                  </div>

                  <div className="required-skills">
                    <h3>Required Skills</h3>
                    <div className="skills-list">
                      {Array.isArray(selectedJob.skills_required) && selectedJob.skills_required.length > 0 ? (
                        selectedJob.skills_required.map((skill, index) => (
                          <span key={index} className="skill-tag">{skill}</span>
                        ))
                      ) : (
                        <span>No specific skills listed</span>
                      )}
                    </div>
                  </div>

                  <div className="job-description">
                    <section>
                      <h3>Job Description</h3>
                      <p>{selectedJob.job_description || 'No description available'}</p>
                    </section>
                    
                    <section>
                      <h3>About the Company</h3>
                      <p>{selectedJob.company_description || 'No company description available'}</p>
                    </section>
                  </div>
                </div>
              </>
            ) : (
              <div className="no-selection">
                <p>Select a job to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {showApplyPopup && (
        <div className="apply-popup-overlay">
          <div className="apply-popup">
            <h2>Apply to {selectedJob.title}</h2>
            <h3>{selectedJob.company}</h3>
            
            <form onSubmit={handleApplySubmit}>
              <div className="form-group">
                <label>Resume (PDF only)</label>
                <div className="file-input-container">
                  <button 
                    type="button" 
                    className="attach-resume-button"
                    onClick={() => document.getElementById('resume-input').click()}
                  >
                    {resumeFile ? 'Change Resume' : 'Attach Resume'}
                  </button>
                  <input
                    id="resume-input"
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    style={{ display: 'none' }}
                  />
                  {resumeFile && <span className="file-name">{resumeFile.name}</span>}
                </div>
              </div>
              
              <div className="popup-buttons">
                <button 
                  type="button" 
                  className="cancel-button"
                  onClick={() => setShowApplyPopup(false)}
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={!resumeFile}
                >
                  Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default JobBoard; 