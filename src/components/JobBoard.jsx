import { useState, useEffect } from 'react';
import { fetchJobs } from '../utils/jobsData';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { collection, addDoc, doc, getDoc } from 'firebase/firestore';
import { storage, db, auth } from '../firebaseConfig';

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
  
  useEffect(() => {
    const loadJobs = async () => {
      const jobsData = await fetchJobs();
      setJobs(jobsData);
    };

    loadJobs();
    // Poll for updates every 5 minutes
    const interval = setInterval(loadJobs, 5 * 60 * 1000);
    
    return () => clearInterval(interval);
  }, []);

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

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesIndustry = !filters.industry || job.industry === filters.industry;
    const matchesLocation = !filters.location || job.location.includes(filters.location);
    const matchesSalary = !filters.salary || job.salary_range.includes(filters.salary);
    const matchesExperience = !filters.experience || job.experience_level === filters.experience;

    return matchesSearch && matchesIndustry && matchesLocation && 
           matchesSalary && matchesExperience;
  });

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
              <option value="">Industry</option>
              <option value="Technology">Technology</option>
              <option value="Finance">Finance</option>
              <option value="Healthcare">Healthcare</option>
            </select>

            <select
              value={filters.location}
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              <option value="">Location</option>
              <option value="Austin">Austin</option>
              <option value="Remote">Remote</option>
            </select>

            <select
              value={filters.salary}
              onChange={(e) => handleFilterChange('salary', e.target.value)}
            >
              <option value="">Salary</option>
              <option value="0-30">$0-30/hr</option>
              <option value="30-50">$30-50/hr</option>
              <option value="50+">$50+/hr</option>
            </select>

            <select
              value={filters.experience}
              onChange={(e) => handleFilterChange('experience', e.target.value)}
            >
              <option value="">Experience</option>
              <option value="Entry Level">Entry Level</option>
              <option value="Mid Level">Mid Level</option>
              <option value="Senior">Senior</option>
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
                  <h4>{job.company}</h4>
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
                    <h2>{selectedJob.title}</h2>
                    <h3>{selectedJob.company_name}</h3>
                    <div className="job-header-info">
                      <span>{selectedJob.salary_range}</span>
                      <span>{selectedJob.location}</span>
                    </div>
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
                      <span>{new Date(selectedJob.posting_date).toLocaleDateString()}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Experience Level</span>
                      <span>{selectedJob.experience_level}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Location</span>
                      <span>{selectedJob.location}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Industry</span>
                      <span>{selectedJob.industry}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Headquarters</span>
                      <span>{selectedJob.headquarters}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Website</span>
                      <a href={selectedJob.website} target="_blank" rel="noopener noreferrer">
                        {selectedJob.website}
                      </a>
                    </div>
                  </div>

                  <div className="required-skills">
                    <h3>Required Skills</h3>
                    <div className="skills-list">
                      {selectedJob.skills_required.map((skill, index) => (
                        <span key={index} className="skill-tag">{skill}</span>
                      ))}
                    </div>
                  </div>

                  <div className="job-description">
                    <section>
                      <h3>Job Description</h3>
                      <p>{selectedJob.job_description}</p>
                    </section>
                    
                    <section>
                      <h3>About the Company</h3>
                      <p>{selectedJob.company_description}</p>
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