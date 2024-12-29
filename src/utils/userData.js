import Papa from 'papaparse';

export async function authenticateUser(email, password) {
  try {
    const response = await fetch('/data/user_details.csv');
    const csvText = await response.text();
    
    return new Promise((resolve, reject) => {
      Papa.parse(csvText, {
        header: true,
        complete: (results) => {
          const user = results.data.find(
            row => row.email === email && row.password === password
          );
          
          if (user) {
            resolve({
              success: true,
              userId: user.user_id,
              fullName: user.full_name,
              role: user.role
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

export async function testDataAccess() {
  try {
    const response = await fetch('/data/user_details.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const text = await response.text();
    console.log('CSV data accessible:', text.substring(0, 100));
    return true;
  } catch (error) {
    console.error('Error accessing CSV:', error);
    return false;
  }
}