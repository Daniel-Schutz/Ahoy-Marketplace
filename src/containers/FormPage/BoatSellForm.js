import React, { useState } from 'react';
import './BoatSellForm.css';

const BoatSellForm = ({ onSubmitCallback }) => {
  const handleSubmit = event => {
    event.preventDefault();
    console.log(formData);
    onSubmitCallback(); 
  };
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    address: '',
    city: '',
    state: '',
    zip: '',
    date: '',
    phoneNumber: ''
  });

  const handleInputChange = event => {
    const { name, value } = event.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };


  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h2 className="form-header">Boat Sale Form</h2>
      <div className="form-section">
        <input
          type="text"
          placeholder="Name"
          name="name"
          value={formData.name}
          onChange={handleInputChange}
        />
        <input
          type="email"
          placeholder="Email"
          name="email"
          value={formData.email}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="Address"
          name="address"
          value={formData.address}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="City"
          name="city"
          value={formData.city}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="State"
          name="state"
          value={formData.state}
          onChange={handleInputChange}
        />
        <input
          type="text"
          placeholder="Zip"
          name="zip"
          value={formData.zip}
          onChange={handleInputChange}
        />
        <input
          type="date"
          placeholder="Date"
          name="date"
          value={formData.date}
          onChange={handleInputChange}
        />
        <input
          type="tel"
          placeholder="Phone Number"
          name="phoneNumber"
          value={formData.phoneNumber}
          onChange={handleInputChange}
        />
      </div>
      <button type="submit" className="submit-button">Submit</button>
    </form>
  );
};

export default BoatSellForm;
