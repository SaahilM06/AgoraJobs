import { useState } from 'react';

function JobBoard() {
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
  
  // Sample job data - in a real app, this would come from an API
  const jobs = [
    {
      id: 1,
      title: "Product Manager",
      company: "Texas Momentum",
      description: "Accelerator for early-stage student startups",
      location: "Austin, TX, USA",
      salary_range: "$20-30/hr",
      industry: "Technology",
      experience_level: "Entry Level",
      logo: "/path/to/logo.png",
      posting_date: "2024-03-15",
      closing_date: "2024-04-15",
      job_type: "Full-time",
      remote_option: "Hybrid",
      skills_required: ["Product Management", "Agile", "Data Analysis", "User Research"],
      fullDescription: {
        opportunity: "Companies can write whatever they want here. Number of sections and names of sections can be up to the company. Same for 'About the Company' page.",
        responsibilities: [
          "Bullet pointed list of responsibilities"
        ],
        qualifications: [
          "Bullet pointed list of required or preferred qualifications"
        ]
      }
    },
    // Add more sample jobs here
  ];

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

  const handleApplySubmit = (e) => {
    e.preventDefault();
    // Handle the application submission here
    console.log('Applying with resume:', resumeFile);
    setShowApplyPopup(false);
    setResumeFile(null);
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
                  <img src={job.logo} alt={`${job.company} logo`} />
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
                  <img src={selectedJob.logo} alt={`${selectedJob.company} logo`} />
                  <div className="job-header-content">
                    <h2>{selectedJob.title}</h2>
                    <h3>{selectedJob.company}</h3>
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
                      <span className="label">Closing Date</span>
                      <span>{new Date(selectedJob.closing_date).toLocaleDateString()}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Job Type</span>
                      <span>{selectedJob.job_type}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Remote Option</span>
                      <span>{selectedJob.remote_option}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Experience Level</span>
                      <span>{selectedJob.experience_level}</span>
                    </div>
                    <div className="meta-item">
                      <span className="label">Industry</span>
                      <span>{selectedJob.industry}</span>
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
                </div>

                <div className="job-tabs">
                  <button className="tab active">About the Position</button>
                  <button className="tab">About the Company</button>
                </div>
                
                <div className="job-description">
                  <section>
                    <h3>The Opportunity</h3>
                    <p>{selectedJob.fullDescription.opportunity}</p>
                  </section>
                  
                  <section>
                    <h3>What You'll Do</h3>
                    <ul>
                      {selectedJob.fullDescription.responsibilities.map((resp, i) => (
                        <li key={i}>{resp}</li>
                      ))}
                    </ul>
                  </section>
                  
                  <section>
                    <h3>Qualifications</h3>
                    <ul>
                      {selectedJob.fullDescription.qualifications.map((qual, i) => (
                        <li key={i}>{qual}</li>
                      ))}
                    </ul>
                  </section>
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