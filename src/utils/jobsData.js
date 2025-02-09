import { getFirestore, collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import app from '../firebaseConfig';

const db = getFirestore(app);

export async function fetchJobs() {
  try {
    const jobsCollection = collection(db, 'agorajobs-posting-official-approved');
    const querySnapshot = await getDocs(jobsCollection);
    
    const jobs = await Promise.all(querySnapshot.docs.map(async doc => {
      const data = doc.data();
      console.log("Job data:", data); // Debug log
      console.log("Company ID from job:", data.company_id); // Debug log
      
      // Fetch company details from User-Details collection
      const userDetailsRef = collection(db, 'User-Details');
      const userQuery = query(userDetailsRef, where('company_id', '==', data.company_id));
      const userSnapshot = await getDocs(userQuery);
      
      console.log("User-Details query results:", userSnapshot.docs.map(d => d.data())); // Debug log
      
      let companyDetails = {};
      if (!userSnapshot.empty) {
        const companyData = userSnapshot.docs[0].data();
        console.log("Found company data:", companyData); // Debug log
        
        companyDetails = {
          company_name: companyData.company_name,
          company_description: companyData.description,
          headquarters: companyData.headquarters,
          industry: companyData.industry,
          website: companyData.website
        };
      } else {
        console.log("No company found for ID:", data.company_id); // Debug log
      }

      const jobWithCompany = {
        id: doc.id,
        ...data,
        skills_required: Array.isArray(data.skills_required) 
          ? data.skills_required 
          : typeof data.skills_required === 'string'
            ? data.skills_required.split(',').map(skill => skill.trim())
            : [],
        ...companyDetails
      };

      console.log("Final job object:", jobWithCompany); // Debug log
      return jobWithCompany;
    }));
    
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    console.error('Error details:', error.stack); // More detailed error logging
    return [];
  }
}

export async function appendJob(newJob) {
  try {
    // Calculate deadJobDate (6 months after job_deadline)
    const jobDeadline = new Date(newJob.job_deadline);
    const deadJobDate = new Date(jobDeadline);
    deadJobDate.setMonth(deadJobDate.getMonth() + 6);

    const jobsCollection = collection(db, 'agorajobs-postingdetails');
    const docRef = await addDoc(jobsCollection, {
      company_id: newJob.company_id,
      company_name: newJob.company_name,
      posting_date: new Date().toISOString(),
      job_deadline: newJob.job_deadline,
      deadJobDate: deadJobDate.toISOString(),
      closing_date: newJob.closing_date,
      job_description: newJob.job_description,
      job_type: newJob.job_type,
      salary_range: newJob.salary_range,
      location: newJob.location,
      remote_option: newJob.remote_option,
      experience_level: newJob.experience_level,
      skills_required: newJob.skills_required,
      industry: newJob.industry
    });

    return { id: docRef.id, ...newJob };
  } catch (error) {
    console.error('Error adding job to Firestore:', error);
    throw error;
  }
} 