import Papa from 'papaparse';

export async function fetchJobs() {
  try {
    const response = await fetch('/data/jobs.csv');
    const csvText = await response.text();
    
    return new Promise((resolve) => {
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const jobs = results.data
            .filter(row => row.job_id) // Filter out empty rows
            .map(row => ({
              id: row.job_id,
              title: row.job_description.split('.')[0], // Use first sentence as title
              company: row.company_name,
              description: row.job_description,
              posting_date: row.posting_date,
              closing_date: row.closing_date,
              job_type: row.job_type,
              salary_range: row.salary_range,
              location: row.location,
              remote_option: row.remote_option,
              experience_level: row.experience_level,
              skills_required: row.skills_required.split(',').map(skill => skill.trim()),
              industry: row.industry,
              logo: `/company-logos/${row.company_id}.png`,
              fullDescription: {
                opportunity: row.job_description,
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
            }));
          resolve(jobs);
        }
      });
    });
  } catch (error) {
    console.error('Error fetching jobs:', error);
    return [];
  }
} 