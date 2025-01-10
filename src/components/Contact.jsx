import React, { useState } from 'react';
import emailjs from 'emailjs-com';


const Contact = () => {
 const [formData, setFormData] = useState({
   name: '',
   email: '',
   phone: '',
   interest: '',
   message: '',
 });


 const handleChange = (e) => {
   const { name, value } = e.target;
   setFormData((prevData) => ({
     ...prevData,
     [name]: value,
   }));
 };


 const handleSubmit = (e) => {
   e.preventDefault();


   // EmailJS send method
   emailjs
     .send(
       'service_ywezvxl', //Service ID
       'template_4m1bnu2', //Template ID
       {
         name: formData.name,
         email: formData.email,
         phone: formData.phone,
         interest: formData.interest,
         message: formData.message,
       },
       'sLbR1LRj_8emm7Em9' //Public Key
     )
     .then(
       (response) => {
         alert('Message sent successfully!');
         setFormData({
           name: '',
           email: '',
           phone: '',
           interest: '',
           message: '',
         });
       },
       (error) => {
         alert('Failed to send the message, please try again.');
       }
     );
 };


 return (
   <div
     style={{
       fontFamily: 'Arial, sans-serif',
       padding: '40px',
       maxWidth: '600px',
       margin: '0 auto',
       textAlign: 'center',
     }}
   >
     {}
     <h2 style={{ marginTop: '60px', marginBottom: '40px' }}>Contact Us</h2>


     {}
     <form
       onSubmit={handleSubmit}
       style={{
         display: 'flex',
         flexDirection: 'column',
         gap: '15px',
       }}
     >
       <input
         type="text"
         name="name"
         placeholder="Name"
         value={formData.name}
         onChange={handleChange}
         required
         style={{
           padding: '10px',
           fontSize: '16px',
           border: '1px solid #ccc',
           borderRadius: '5px',
         }}
       />
       <input
         type="email"
         name="email"
         placeholder="Email"
         value={formData.email}
         onChange={handleChange}
         required
         style={{
           padding: '10px',
           fontSize: '16px',
           border: '1px solid #ccc',
           borderRadius: '5px',
         }}
       />
       <input
         type="tel"
         name="phone"
         placeholder="Phone"
         value={formData.phone}
         onChange={handleChange}
         required
         style={{
           padding: '10px',
           fontSize: '16px',
           border: '1px solid #ccc',
           borderRadius: '5px',
         }}
       />
       <select
         name="interest"
         value={formData.interest}
         onChange={handleChange}
         required
         style={{
           padding: '10px',
           fontSize: '16px',
           border: '1px solid #ccc',
           borderRadius: '5px',
           color: '#555',
         }}
       >
         <option value="">Select An Interest</option>
         <option>General Inquiry</option>
         <option>Application</option>
         <option>Support</option>
       </select>
       <textarea
         name="message"
         placeholder="Message"
         rows="5"
         value={formData.message}
         onChange={handleChange}
         required
         style={{
           padding: '10px',
           fontSize: '16px',
           border: '1px solid #ccc',
           borderRadius: '5px',
           resize: 'none',
         }}
       ></textarea>
       <button
         type="submit"
         style={{
           padding: '10px 20px',
           fontSize: '16px',
           backgroundColor: '#000',
           color: '#fff',
           border: 'none',
           borderRadius: '5px',
           cursor: 'pointer',
         }}
       >
         Submit
       </button>
     </form>
   </div>
 );
};


export default Contact;



