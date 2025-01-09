import { getFirestore, collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import app from '../firebaseConfig';

const db = getFirestore(app);

export async function fetchJobs() {
  try {
    const jobsCollection = collection(db, 'agorajobs-postingdetails');
    const querySnapshot = await getDocs(jobsCollection);
    
    const jobs = await Promise.all(querySnapshot.docs.map(async doc => {
      const data = doc.data();
      console.log('Job posting data:', data); // Debug log
      
      // Fetch company details from User-Details collection
      const userDetailsRef = collection(db, 'User-Details');
      const userQuery = query(userDetailsRef, where('company_id', '==', data.company_id));
      console.log('Searching for company_id:', data.company_id); // Debug log
      
      const userSnapshot = await getDocs(userQuery);
      console.log('User query results:', userSnapshot.docs.map(d => d.data())); // Debug log
      
      let companyDetails = {};
      if (!userSnapshot.empty) {
        const companyData = userSnapshot.docs[0].data();
        console.log('Found company data:', companyData); // Debug log
        companyDetails = {
          company_description: companyData.description || '',
          headquarters: companyData.headquarters || '',
          industry: companyData.industry || '',
          website: companyData.website || '',
          company_name: companyData.company_name || ''
        };
      } else {
        console.log('No company found for company_id:', data.company_id); // Debug log
      }

      return {
        id: doc.id,
        job_id: data.job_id,
        title: data.title,
        experience_level: data.experience_level,
        job_description: data.job_description,
        location: data.location,
        posting_date: data.posting_date,
        salary_range: data.salary_range,
        skills_required: typeof data.skills_required === 'string' 
          ? data.skills_required.split(',').map(skill => skill.trim())
          : data.skills_required || [],
        ...companyDetails
      };
    }));
    
    return jobs;
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
}

export async function appendJob(newJob) {
  try {
    const jobsCollection = collection(db, 'agorajobs-postingdetails');
    const docRef = await addDoc(jobsCollection, {
      company_id: newJob.company_id,
      company_name: newJob.company_name,
      posting_date: new Date().toISOString(),
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