import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { collection, getDocs, query, where, deleteDoc, doc, updateDoc, addDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { auth } from '../firebaseConfig';

function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('users');
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
  const [unapprovedJobs, setUnapprovedJobs] = useState([]);
  const [approvedJobs, setApprovedJobs] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch users
        const usersRef = collection(db, "User-Details");
        const usersSnapshot = await getDocs(usersRef);
        const usersData = usersSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersData);

        // Fetch unapproved jobs
        const unapprovedJobsRef = collection(db, "agorajobs-postingdetails");
        const unapprovedSnapshot = await getDocs(unapprovedJobsRef);
        const unapprovedData = unapprovedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isApproved: false
        }));

        // Fetch approved jobs
        const approvedJobsRef = collection(db, "agorajobs-posting-official-approved");
        const approvedSnapshot = await getDocs(approvedJobsRef);
        const approvedData = approvedSnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          isApproved: true
        }));

        setUnapprovedJobs(unapprovedData);
        setApprovedJobs(approvedData);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login');
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
      // Update the job in agorajobs-postingdetails
      const jobDocRef = doc(db, "agorajobs-postingdetails", editingJob.id);
      await updateDoc(jobDocRef, {
        ...editForm,
        last_modified: new Date().toISOString()
      });

      // Check if this job was previously approved
      const approvedJobsRef = collection(db, "agorajobs-posting-official-approved");
      const q = query(approvedJobsRef, where("job_id", "==", editingJob.job_id));
      const querySnapshot = await getDocs(q);

      // If job was previously approved, update it in the approved collection
      if (!querySnapshot.empty) {
        const approvedJobDoc = querySnapshot.docs[0];
        await updateDoc(doc(db, "agorajobs-posting-official-approved", approvedJobDoc.id), {
          ...editForm,
          last_modified: new Date().toISOString()
        });
      }

      // Update local state
      setJobs(jobs.map(job => 
        job.id === editingJob.id ? { 
          ...job, 
          ...editForm,
          isApproved: false // Reset approval status after edit
        } : job
      ));
      
      setEditingJob(null);
      alert("Job updated successfully! Please re-approve the job to update the approved listing.");
    } catch (error) {
      console.error("Error updating job:", error);
      alert("Error updating job");
    }
  };

  const handleApproveJob = async (job) => {
    try {
      // First add to approved collection
      const approvedJobsRef = collection(db, "agorajobs-posting-official-approved");
      await addDoc(approvedJobsRef, {
        ...job,
        approved_date: new Date().toISOString(),
        approved_by: auth.currentUser.email,
        last_modified: new Date().toISOString()
      });

      // Delete from pending collection using the correct document ID
      const pendingJobsRef = collection(db, "agorajobs-postingdetails");
      const pendingQuery = query(pendingJobsRef, where("job_id", "==", job.job_id));
      const pendingSnapshot = await getDocs(pendingQuery);

      if (!pendingSnapshot.empty) {
        // Delete the pending job document
        await deleteDoc(doc(pendingJobsRef, pendingSnapshot.docs[0].id));
      } else {
        console.error("Could not find pending job to delete");
      }

      // Update local state
      const updatedJob = { ...job, isApproved: true };
      setUnapprovedJobs(unapprovedJobs.filter(j => j.job_id !== job.job_id));
      setApprovedJobs([...approvedJobs, updatedJob]);

      alert("Job approved successfully!");
    } catch (error) {
      console.error("Error approving job:", error);
      alert("Error approving job");
    }
  };

  const handleUnapproveJob = async (job) => {
    try {
      // First, add the job back to the pending collection (without approval fields)
      const { approved_by, approved_date, ...jobWithoutApproval } = job;
      const pendingJobsRef = collection(db, "agorajobs-postingdetails");
      await addDoc(pendingJobsRef, {
        ...jobWithoutApproval,
        last_modified: new Date().toISOString()
      });

      // Then delete from approved collection
      const approvedJobsRef = collection(db, "agorajobs-posting-official-approved");
      const q = query(approvedJobsRef, where("job_id", "==", job.job_id));
      const querySnapshot = await getDocs(q);

      if (!querySnapshot.empty) {
        await deleteDoc(doc(approvedJobsRef, querySnapshot.docs[0].id));
      }

      // Update local state
      setApprovedJobs(approvedJobs.filter(j => j.id !== job.id));
      setUnapprovedJobs([...unapprovedJobs, jobWithoutApproval]);

      alert("Job unapproved successfully!");
    } catch (error) {
      console.error("Error unapproving job:", error);
      alert("Error unapproving job");
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="admin-dashboard">
      <header className="header">
        <div className="logo">AgoraJobs</div>
        <nav className="headers">
          <Link to="/">Home</Link>
          <Link to="/jobs">Jobs</Link>
          <Link to="/contact">Contact</Link>
          <button 
            onClick={handleLogout}
            className="sign-out-button"
          >
            Sign Out
          </button>
        </nav>
      </header>

      <div className="admin-content">
        <h1>Admin Dashboard</h1>
        <div className="admin-tabs">
          <button 
            className={activeTab === 'users' ? 'active' : ''} 
            onClick={() => setActiveTab('users')}
          >
            Users
          </button>
          <button 
            className={activeTab === 'jobs' ? 'active' : ''} 
            onClick={() => setActiveTab('jobs')}
          >
            Jobs
          </button>
        </div>

        {activeTab === 'users' && (
          <div className="users-section">
            <h2>Users Management</h2>
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Name</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id}>
                    <td>{user.email}</td>
                    <td>{user.role}</td>
                    <td>{user.full_name || user.company_name || 'N/A'}</td>
                    <td>
                      <button onClick={() => console.log('View user:', user.id)}>
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'jobs' && (
          <div className="jobs-section">
            <h2>Jobs Management</h2>
            
            <div className="jobs-container">
              <div className="unapproved-jobs">
                <h3>Pending Approval</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Company</th>
                      <th>Posted Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {unapprovedJobs.map(job => (
                      <tr key={job.id}>
                        <td>{job.title}</td>
                        <td>{job.company_id}</td>
                        <td>{job.posting_date ? new Date(job.posting_date).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => setSelectedJob(job)} className="view-button">
                              View
                            </button>
                            <button onClick={() => handleApproveJob(job)} className="approve-button">
                              Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="approved-jobs">
                <h3>Approved Jobs</h3>
                <table>
                  <thead>
                    <tr>
                      <th>Title</th>
                      <th>Company</th>
                      <th>Approved Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {approvedJobs.map(job => (
                      <tr key={job.id}>
                        <td>{job.title}</td>
                        <td>{job.company_id}</td>
                        <td>{job.approved_date ? new Date(job.approved_date).toLocaleDateString() : 'N/A'}</td>
                        <td>
                          <div className="action-buttons">
                            <button onClick={() => setSelectedJob(job)} className="view-button">
                              View
                            </button>
                            <button 
                              onClick={() => handleUnapproveJob(job)} 
                              className="unapprove-button"
                            >
                              Unapprove
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Job Details Modal */}
            {selectedJob && !editingJob && (
              <div className="modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2>{selectedJob.title}</h2>
                    <button onClick={() => setSelectedJob(null)} className="close-button">×</button>
                  </div>
                  <div className="job-details">
                    <p><strong>Company ID:</strong> {selectedJob.company_id}</p>
                    <p><strong>Location:</strong> {selectedJob.location}</p>
                    <p><strong>Salary Range:</strong> {selectedJob.salary_range}</p>
                    <p><strong>Experience Level:</strong> {selectedJob.experience_level}</p>
                    <p><strong>Required Skills:</strong> {selectedJob.skills_required}</p>
                    <p><strong>Description:</strong> {selectedJob.job_description}</p>
                    <p><strong>Posted Date:</strong> {new Date(selectedJob.posting_date).toLocaleDateString()}</p>
                  </div>
                  <div className="modal-actions">
                    <button onClick={() => handleEditClick(selectedJob)} className="edit-button">
                      Edit
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Edit Job Modal */}
            {editingJob && (
              <div className="modal">
                <div className="modal-content">
                  <div className="modal-header">
                    <h2>Edit Job</h2>
                    <button onClick={() => setEditingJob(null)} className="close-button">×</button>
                  </div>
                  <form onSubmit={handleEditSubmit}>
                    <div className="form-group">
                      <label>Title</label>
                      <input
                        type="text"
                        value={editForm.title}
                        onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Location</label>
                      <input
                        type="text"
                        value={editForm.location}
                        onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Salary Range</label>
                      <input
                        type="text"
                        value={editForm.salary_range}
                        onChange={(e) => setEditForm({...editForm, salary_range: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Experience Level</label>
                      <input
                        type="text"
                        value={editForm.experience_level}
                        onChange={(e) => setEditForm({...editForm, experience_level: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Required Skills</label>
                      <input
                        type="text"
                        value={editForm.skills_required}
                        onChange={(e) => setEditForm({...editForm, skills_required: e.target.value})}
                        required
                      />
                    </div>
                    <div className="form-group">
                      <label>Job Description</label>
                      <textarea
                        value={editForm.job_description}
                        onChange={(e) => setEditForm({...editForm, job_description: e.target.value})}
                        required
                        rows="5"
                      />
                    </div>
                    <div className="modal-actions">
                      <button type="button" onClick={() => setEditingJob(null)} className="cancel-button">
                        Cancel
                      </button>
                      <button type="submit" className="save-button">
                        Save Changes
                      </button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default AdminDashboard; 