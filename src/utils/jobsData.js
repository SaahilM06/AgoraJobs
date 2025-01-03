import { getFirestore, collection, getDocs, addDoc } from 'firebase/firestore';
import app from '../firebaseConfig';

const db = getFirestore(app);

export async function fetchJobs() {
  try {
    const jobsCollection = collection(db, 'agorajobs-postingdetails');
    const querySnapshot = await getDocs(jobsCollection);
    
    const jobs = querySnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.job_description?.split('.')[0] || 'No Title', // Use first sentence as title
        company: data.company_name,
        description: data.job_description,
        posting_date: data.posting_date,
        closing_date: data.closing_date,
        job_type: data.job_type,
        salary_range: data.salary_range,
        location: data.location,
        remote_option: data.remote_option,
        experience_level: data.experience_level,
        skills_required: Array.isArray(data.skills_required) 
          ? data.skills_required 
          : data.skills_required?.split(',').map(skill => skill.trim()) || [],
        industry: data.industry,
        company_id: data.company_id,
        logo: `/company-logos/${data.company_id}.png`,
        fullDescription: {
          opportunity: data.job_description,
          responsibilities: [
            "Review and understand project requirements",
            "Collaborate with team members",
            "Contribute to project deliverables",
            "Participate in team meetings"
          ],
          qualifications: [
            "Currently enrolled in related degree program",
            "Strong analytical and problem-solving skills",
            "Excellent communication skills",
            "Ability to work independently and in a team"
          ]
        }
      };
    });

    return jobs;
  } catch (error) {
    console.error('Error fetching jobs from Firestore:', error);
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