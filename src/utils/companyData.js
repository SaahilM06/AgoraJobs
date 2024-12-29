import Papa from 'papaparse';

export async function authenticateEmployer(email, password) {
  try {
    const response = await fetch('/data/company_details.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const company = results.data.find(
            row => row.email === email && row.password === password
          );
          
          if (company) {
            resolve({
              success: true,
              companyId: company.company_id
            });
          } else {
            reject(new Error('Invalid credentials'));
          }
        }
      });
    });
  } catch (error) {
    console.error('Error authenticating:', error);
    throw error;
  }
}

export async function fetchCompanyProfile(companyId) {
  try {
    const response = await fetch('/data/company_details.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const company = results.data.find(row => row.company_id === companyId);
          if (company) {
            // Remove sensitive data before sending
            const { password, ...safeCompanyData } = company;
            resolve(safeCompanyData);
          } else {
            reject(new Error('Company not found'));
          }
        }
      });
    });
  } catch (error) {
    console.error('Error fetching company profile:', error);
    throw error;
  }
}

export async function updateCompanyProfile(profileData) {
  try {
    const response = await fetch('/data/company_details.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const updatedData = results.data.map(row => {
            if (row.company_id === profileData.company_id) {
              return { ...row, ...profileData, password: row.password };
            }
            return row;
          });
          
          // Convert back to CSV
          const csv = Papa.unparse(updatedData);
          
          // In a real application, you would send this to a backend API
          // For now, we'll just simulate a successful update
          console.log('Updated CSV data:', csv);
          resolve({ success: true });
        }
      });
    });
  } catch (error) {
    console.error('Error updating profile:', error);
    throw error;
  }
} 