import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, addDoc, doc, updateDoc, serverTimestamp, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebaseConfig";

function EmployerDashboard() {
  const navigate = useNavigate();
  const [showForm, setShowForm] = useState(false);
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [companyProfile, setCompanyProfile] = useState({
    company_name: "",
    industry: "",
    description: "",
    headquarters: "",
    website: ""
  });
  const [loading, setLoading] = useState(true);
  const [jobForm, setJobForm] = useState({
    title: '',
    job_description: '',
    salary_range: '',
    location: '',
    skills_required: '',
    experience_level: '',
    job_deadline: ''
  });
  const [activeJobs, setActiveJobs] = useState([]);
  const [selectedJob, setSelectedJob] = useState(null);
  const [editingJob, setEditingJob] = useState(null);
  const [editForm, setEditForm] = useState({
    title: '',
    job_description: '',
    salary_range: '',
    location: '',
    skills_required: '',
    experience_level: ''
  });
  const [jobApplicants, setJobApplicants] = useState([]);
  const [customLocation, setCustomLocation] = useState(false);
  const [approvedJobs, setApprovedJobs] = useState([]);
  const [pendingJobs, setPendingJobs] = useState([]);
  const [schoolOrganizations, setSchoolOrganizations] = useState([]);

  // Predefined location options
  const locationOptions = [
    "Remote",
    "New York, NY",
    "San Francisco, CA",
    "Los Angeles, CA",
    "Chicago, IL",
    "Seattle, WA",
    "Austin, TX",
    "Boston, MA",
    "Denver, CO",
    "Other (specify)"
  ];

  // Fetch company profile data when form opens
  useEffect(() => {
    const fetchCompanyProfile = async () => {
      if (showProfileForm) {
        const userId = localStorage.getItem('userId');
        if (!userId) return;

        try {
          const userDocRef = doc(db, "User-Details", userId);
          const userDoc = await getDoc(userDocRef);
          
          if (userDoc.exists()) {
            const data = userDoc.data();
            setCompanyProfile({
              company_name: data.company_name || "",
              industry: data.industry || "",
              description: data.description || "",
              headquarters: data.headquarters || "",
              website: data.website || ""
            });
          }
        } catch (error) {
          console.error("Error fetching company profile:", error);
        }
      }
    };

    fetchCompanyProfile();
  }, [showProfileForm]); // Re-run when form opens

  // Add this useEffect to fetch jobs
  useEffect(() => {
    const fetchEmployerJobs = async () => {
      try {
        const userId = localStorage.getItem('userId');
        const userDocRef = doc(db, "User-Details", userId);
        const userDoc = await getDoc(userDocRef);
        
        if (!userDoc.exists()) {
          console.error("User details not found");
          return;
        }

        const companyData = userDoc.data();
        const company_id = companyData.company_id;

        // First fetch approved jobs
        const approvedJobsRef = collection(db, 'agorajobs-posting-official-approved');
        const approvedJobsQuery = query(approvedJobsRef, where('company_id', '==', company_id));
        const approvedSnapshot = await getDocs(approvedJobsQuery);
        
        const approvedJobsData = approvedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          status: 'approved'
        }));

        // Get the job_ids of approved jobs
        const approvedJobIds = approvedJobsData.map(job => job.job_id);
        console.log("Approved job IDs:", approvedJobIds); // Debug log

        // Fetch all pending jobs
        const pendingJobsRef = collection(db, 'agorajobs-postingdetails');
        const pendingJobsQuery = query(pendingJobsRef, where('company_id', '==', company_id));
        const pendingSnapshot = await getDocs(pendingJobsQuery);
        
        // Filter out jobs that are already approved
        const pendingJobsData = pendingSnapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data(),
            status: 'pending'
          }))
          .filter(job => !approvedJobIds.includes(job.job_id));

        console.log("Filtered pending jobs:", pendingJobsData); // Debug log
        
        setApprovedJobs(approvedJobsData);
        setPendingJobs(pendingJobsData);
      } catch (error) {
        console.error("Error fetching jobs:", error);
      }
    };

    fetchEmployerJobs();
  }, []);

  useEffect(() => {
    const fetchSchoolOrganizations = async () => {
      try {
        const organizationsRef = collection(db, "User-Details");
        const q = query(organizationsRef, where("role", "==", "school_organization"));
        const querySnapshot = await getDocs(q);
        
        const orgsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        
        setSchoolOrganizations(orgsData);
      } catch (error) {
        console.error("Error fetching school organizations:", error);
      }
    };

    fetchSchoolOrganizations();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('employerId');
    localStorage.removeItem('userLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');

    try {
      const userDocRef = doc(db, "User-Details", userId);
      await updateDoc(userDocRef, {
        company_name: companyProfile.company_name,
        industry: companyProfile.industry,
        description: companyProfile.description,
        headquarters: companyProfile.headquarters,
        website: companyProfile.website
      });

      console.log("Company profile updated successfully!");
      setShowProfileForm(false);
    } catch (error) {
      console.error("Error updating company profile:", error.message);
    }
  };

  const handleJobSubmit = async (e) => {
    e.preventDefault();
    const userId = localStorage.getItem('userId');

    try {
      // First get the company_id from User-Details
      const userDocRef = doc(db, "User-Details", userId);
      const userDoc = await getDoc(userDocRef);
      
      if (!userDoc.exists()) {
        throw new Error("Company details not found");
      }

      const companyData = userDoc.data();
      const company_id = companyData.company_id;

      // Generate a unique job_id
      const job_id = `JOB_${company_id.slice(4)}_${Date.now()}`;

      // Calculate deadJobDate (6 months after job_deadline)
      const jobDeadline = new Date(jobForm.job_deadline);
      const deadJobDate = new Date(jobDeadline);
      deadJobDate.setMonth(deadJobDate.getMonth() + 6);

      // Create the job posting document
      const jobData = {
        job_id: job_id,
        company_id: company_id,
        title: jobForm.title,
        experience_level: jobForm.experience_level,
        job_description: jobForm.job_description,
        location: jobForm.location,
        posting_date: new Date().toISOString(),
        job_deadline: jobForm.job_deadline,
        deadJobDate: deadJobDate.toISOString(), // Add the deadJobDate field
        salary_range: jobForm.salary_range,
        skills_required: jobForm.skills_required
      };

      // Add the document to the agorajobs-postingdetails collection
      const postingRef = collection(db, "agorajobs-postingdetails");
      await addDoc(postingRef, jobData);

      console.log("Job posted successfully with ID:", job_id);
      setShowForm(false);
      
      // Reset the form
      setJobForm({
        title: '',
        job_description: '',
        salary_range: '',
        location: '',
        skills_required: '',
        experience_level: '',
        job_deadline: ''
      });
    } catch (error) {
      console.error("Error posting job:", error.message);
    }
  };

  const handleEditClick = (job) => {
    setEditingJob(job);
    setEditForm({
      title: job.title,
      job_description: job.job_description,
      salary_range: job.salary_range,
      location: job.location,
      skills_required: job.skills_required,
      experience_level: job.experience_level
    });
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const jobDocRef = doc(db, "agorajobs-postingdetails", editingJob.id);
      await updateDoc(jobDocRef, {
        ...editForm,
        last_modified: new Date().toISOString()
      });

      // Update local state
      setActiveJobs(activeJobs.map(job => 
        job.id === editingJob.id ? { ...job, ...editForm } : job
      ));
      
      // Update selected job if it's the one being edited
      if (selectedJob && selectedJob.id === editingJob.id) {
        setSelectedJob({ ...selectedJob, ...editForm });
      }

      setEditingJob(null);
      console.log("Job updated successfully!");
    } catch (error) {
      console.error("Error updating job:", error);
    }
  };

  const fetchJobApplicants = async (jobId) => {
    try {
      const applicationsRef = collection(db, "applications-submitted");
      const q = query(applicationsRef, where("job_id", "==", jobId));
      const querySnapshot = await getDocs(q);
      
      const applicantsPromises = querySnapshot.docs.map(async (applicationDoc) => {
        const applicationData = applicationDoc.data();
        
        // Get applicant details from User-Details by querying for user_id
        const userDetailsRef = collection(db, "User-Details");
        const userQuery = query(userDetailsRef, where("user_id", "==", applicationData.user_id));
        const userSnapshot = await getDocs(userQuery);
        
        let userData = {};
        if (!userSnapshot.empty) {
          userData = userSnapshot.docs[0].data();
        }

        return {
          id: applicationDoc.id,
          ...applicationData,
          applicant_name: userData.full_name || "Unknown",
          university: userData.university || "Not specified",
          graduation: userData.graduation || "Not specified"
        };
      });

      const resolvedApplicants = await Promise.all(applicantsPromises);
      setJobApplicants(resolvedApplicants);
    } catch (error) {
      console.error("Error fetching applicants:", error);
    }
  };

  const handleJobSelect = async (job) => {
    setSelectedJob(job);
    await fetchJobApplicants(job.job_id);
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-header">
        <h1>Welcome, {companyProfile.company_name || "Company"}</h1>
        <div className="dashboard-actions">
          <button
            className="primary-button"
            onClick={() => setShowForm(true)}
          >
            Post New Job
          </button>
          <button
            className="secondary-button"
            onClick={() => setShowProfileForm(true)}
          >
            Edit Profile
          </button>
          <button className="secondary-button" onClick={handleLogout}>
            Sign Out
          </button>
        </div>
      </div>

      <div className="dashboard-content">
        <h2>Active Jobs</h2>
        <div className="jobs-container">
          <div className="jobs-list">
            {approvedJobs.map(job => (
              <div 
                key={job.id}
                className={`job-card ${selectedJob?.id === job.id ? 'selected' : ''}`}
                onClick={() => handleJobSelect(job)}
              >
                <h3>{job.title}</h3>
                <div className="job-card-details">
                  <span>{job.location}</span>
                  <span>{job.salary_range}</span>
                  <span>{new Date(job.posting_date).toLocaleDateString()}</span>
                  <span className="status approved">Approved</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <h2>Pending Job Approval</h2>
        <div className="jobs-container">
          <div className="jobs-list">
            {pendingJobs.map(job => (
              <div 
                key={job.id}
                className={`job-card ${selectedJob?.id === job.id ? 'selected' : ''}`}
                onClick={() => handleJobSelect(job)}
              >
                <h3>{job.title}</h3>
                <div className="job-card-details">
                  <span>{job.location}</span>
                  <span>{job.salary_range}</span>
                  <span>{new Date(job.posting_date).toLocaleDateString()}</span>
                  <span className="status pending">Pending Approval</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="organizations-section">
          <h2>School Organizations</h2>
          <div className="organizations-grid">
            {schoolOrganizations.map(org => (
              <div key={org.id} className="organization-card">
                <h3>{org.organization_name || 'Unnamed Organization'}</h3>
                <p><strong>University:</strong> {org.university}</p>
                <p className="org-description">{org.organization_description}</p>
              </div>
            ))}
          </div>
        </div>

        {selectedJob && (
          <div className="job-details-panel">
            <div className="job-header">
              <h2>{selectedJob.title}</h2>
              <div className="job-actions">
                <button onClick={() => handleEditClick(selectedJob)} className="edit-button">
                  Edit
                </button>
                <button onClick={() => setSelectedJob(null)} className="close-button">
                  ×
                </button>
              </div>
            </div>

            {editingJob?.id === selectedJob.id ? (
              <form onSubmit={handleEditSubmit} className="edit-form">
                <div className="form-group">
                  <label>Job Title</label>
                  <input
                    type="text"
                    value={editForm.title}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      title: e.target.value
                    }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Experience Level</label>
                  <select
                    value={editForm.experience_level}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      experience_level: e.target.value
                    }))}
                    required
                  >
                    <option value="">Select Level</option>
                    <option value="Entry-level">Entry-level</option>
                    <option value="Mid-level">Mid-level</option>
                    <option value="Senior">Senior</option>
                  </select>
                </div>

                <div className="form-group">
                  <label>Location</label>
                  <input
                    type="text"
                    value={editForm.location}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      location: e.target.value
                    }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Salary Range</label>
                  <input
                    type="text"
                    value={editForm.salary_range}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      salary_range: e.target.value
                    }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Required Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={editForm.skills_required}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      skills_required: e.target.value
                    }))}
                    required
                  />
                </div>

                <div className="form-group">
                  <label>Job Description</label>
                  <textarea
                    value={editForm.job_description}
                    onChange={(e) => setEditForm(prev => ({
                      ...prev,
                      job_description: e.target.value
                    }))}
                    required
                    rows="5"
                  />
                </div>

                <div className="form-buttons">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() => setEditingJob(null)}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="primary-button">
                    Save Changes
                  </button>
                </div>
              </form>
            ) : (
              <div className="job-content">
                <div className="job-info">
                  <div className="detail-item">
                    <label>Experience Level</label>
                    <p>{selectedJob.experience_level}</p>
                  </div>
                  <div className="detail-item">
                    <label>Location</label>
                    <p>{selectedJob.location}</p>
                  </div>
                  <div className="detail-item">
                    <label>Salary Range</label>
                    <p>{selectedJob.salary_range}</p>
                  </div>
                  <div className="detail-item">
                    <label>Posted On</label>
                    <p>{new Date(selectedJob.posting_date).toLocaleDateString()}</p>
                  </div>
                  <div className="detail-item">
                    <label>Required Skills</label>
                    <div className="skills-list">
                      {selectedJob.skills_required.split(',').map((skill, index) => (
                        <span key={index} className="skill-tag">{skill.trim()}</span>
                      ))}
                    </div>
                  </div>
                  <div className="detail-item">
                    <label>Job Description</label>
                    <p>{selectedJob.job_description}</p>
                  </div>

                  <div className="detail-item applicants-section">
                    <label>Applications ({jobApplicants.length})</label>
                    <div className="applicants-list">
                      {jobApplicants.length === 0 ? (
                        <p className="no-applicants">No applications yet</p>
                      ) : (
                        jobApplicants.map((applicant) => (
                          <div key={applicant.id} className="applicant-card">
                            <div className="applicant-header">
                              <h4>{applicant.applicant_name}</h4>
                              <span className="application-date">
                                Applied: {new Date(applicant.application_date).toLocaleDateString()}
                              </span>
                            </div>
                            <div className="applicant-details">
                              <p><strong>University:</strong> {applicant.university}</p>
                              <p><strong>Expected Graduation:</strong> {applicant.graduation}</p>
                            </div>
                            <div className="applicant-resume">
                              <span className="resume-id">
                                Resume ID: {applicant.resume_id}
                              </span>
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {showProfileForm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h2>Edit Company Profile</h2>
              <button
                onClick={() => setShowProfileForm(false)}
                className="close-button"
              >
                ×
              </button>
            </div>

            <form onSubmit={handleProfileSubmit} className="profile-form">
              <div className="form-group">
                <label>Company Name</label>
                <input
                  type="text"
                  value={companyProfile.company_name}
                  onChange={(e) =>
                    setCompanyProfile((prev) => ({
                      ...prev,
                      company_name: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Industry</label>
                <select
                  value={companyProfile.industry}
                  onChange={(e) =>
                    setCompanyProfile((prev) => ({
                      ...prev,
                      industry: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select Industry</option>
                  <option value="Information Technology">Information Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Finance">Finance</option>
                  <option value="Education">Education</option>
                  <option value="Manufacturing">Manufacturing</option>
                  <option value="Retail">Retail</option>
                  <option value="Robotics">Robotics</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="Telecommunications">Telecommunications</option>
                  <option value="Biotechnology">Biotechnology</option>
                  <option value="Real Estate">Real Estate</option>
                  <option value="Energy">Energy</option>
                  <option value="Transportation">Transportation</option>
                  <option value="Media & Entertainment">Media & Entertainment</option>
                </select>
              </div>

              <div className="form-group">
                <label>Company Description</label>
                <textarea
                  value={companyProfile.description}
                  onChange={(e) =>
                    setCompanyProfile((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  required
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Headquarters</label>
                <input
                  type="text"
                  value={companyProfile.headquarters}
                  onChange={(e) =>
                    setCompanyProfile((prev) => ({
                      ...prev,
                      headquarters: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Website</label>
                <input
                  type="url"
                  value={companyProfile.website}
                  onChange={(e) =>
                    setCompanyProfile((prev) => ({
                      ...prev,
                      website: e.target.value,
                    }))
                  }
                  placeholder="https://example.com"
                  required
                />
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowProfileForm(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="primary-button">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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

            <form onSubmit={handleJobSubmit} className="job-form">
              <div className="form-group">
                <label>Job Title</label>
                <input
                  type="text"
                  value={jobForm.title}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      title: e.target.value,
                    }))
                  }
                  required
                />
              </div>

              <div className="form-group">
                <label>Experience Level</label>
                <select
                  value={jobForm.experience_level}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      experience_level: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select Years of Experience</option>
                  <option value="0-1 years">0-1 years</option>
                  <option value="1-2 years">1-2 years</option>
                  <option value="2-3 years">2-3 years</option>
                  <option value="3-4 years">3-4 years</option>
                  <option value="4-5 years">4-5 years</option>
                  <option value="5+ years">5+ years</option>
                </select>
              </div>

              <div className="form-group">
                <label>Job Description</label>
                <textarea
                  value={jobForm.job_description}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      job_description: e.target.value,
                    }))
                  }
                  required
                  rows={4}
                />
              </div>

              <div className="form-group">
                <label>Salary Range (per hour)</label>
                <select
                  value={jobForm.salary_range}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      salary_range: e.target.value,
                    }))
                  }
                  required
                >
                  <option value="">Select Salary Range</option>
                  <option value="$11-$20/hr">$11-$20/hr</option>
                  <option value="$21-$30/hr">$21-$30/hr</option>
                  <option value="$31-$40/hr">$31-$40/hr</option>
                  <option value="$41-$50/hr">$41-$50/hr</option>
                  <option value="$51-$60/hr">$51-$60/hr</option>
                  <option value="$61+/hr">$61+/hr</option>
                </select>
              </div>

              <div className="form-group">
                <label>Location</label>
                {!customLocation ? (
                  <select
                    value={jobForm.location}
                    onChange={(e) => {
                      if (e.target.value === "Other (specify)") {
                        setCustomLocation(true);
                        setJobForm(prev => ({
                          ...prev,
                          location: ''
                        }));
                      } else {
                        setJobForm(prev => ({
                          ...prev,
                          location: e.target.value
                        }));
                      }
                    }}
                    required
                  >
                    <option value="">Select Location</option>
                    {locationOptions.map(location => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="custom-location-input">
                    <input
                      type="text"
                      value={jobForm.location}
                      onChange={(e) =>
                        setJobForm(prev => ({
                          ...prev,
                          location: e.target.value
                        }))
                      }
                      placeholder="Enter location"
                      required
                    />
                    <button
                      type="button"
                      className="secondary-button"
                      onClick={() => {
                        setCustomLocation(false);
                        setJobForm(prev => ({
                          ...prev,
                          location: ''
                        }));
                      }}
                    >
                      Back to List
                    </button>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label>Required Skills</label>
                <input
                  type="text"
                  value={jobForm.skills_required}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      skills_required: e.target.value,
                    }))
                  }
                  placeholder="e.g. React, Node.js, SQL"
                  required
                />
              </div>

              <div className="form-group">
                <label>Application Deadline</label>
                <input
                  type="date"
                  value={jobForm.job_deadline}
                  onChange={(e) =>
                    setJobForm((prev) => ({
                      ...prev,
                      job_deadline: e.target.value,
                    }))
                  }
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </div>

              <div className="form-buttons">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() => setShowForm(false)}
                >
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