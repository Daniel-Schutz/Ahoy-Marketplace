import React, { useState } from 'react';
import './BoatReservationForm.css'; 


const BoatReservationForm = ({ onSubmitCallback }) => {
  const handleSubmit = event => {
    event.preventDefault();
    console.log("OK");
    onSubmitCallback(); 
  };
  const [primaryGuest, setPrimaryGuest] = useState({
    firstName: '',
    lastName: '',
    middleInitial: '',
    dateOfBirth: '',
    phone: '',
    email: '',
    address: '',
    city: '',
    state: '',
    country: '',
    citizenship: '',
    emergencyContact: {
      name: '',
      phone: ''
    }
  });

  const [secondaryGuests, setSecondaryGuests] = useState([{ firstName: '', lastName: '', emergencyContact: '' }]);

  const handlePrimaryInputChange = event => {
    const { name, value } = event.target;
    setPrimaryGuest({
      ...primaryGuest,
      [name]: value
    });
  };

  const handleEmergencyContactChange = event => {
    const { name, value } = event.target;
    setPrimaryGuest({
      ...primaryGuest,
      emergencyContact: {
        ...primaryGuest.emergencyContact,
        [name]: value
      }
    });
  };

  const handleSecondaryInputChange = (index, event) => {
    const { name, value } = event.target;
    const list = [...secondaryGuests];
    list[index][name] = value;
    setSecondaryGuests(list);
  };

  const handleAddGuest = () => {
    setSecondaryGuests([...secondaryGuests, { firstName: '', lastName: '', emergencyContact: '' }]);
  };

  const handleRemoveGuest = index => {
    const list = [...secondaryGuests];
    list.splice(index, 1);
    setSecondaryGuests(list);
  };

  return (
    <form className="form-container" onSubmit={handleSubmit}>
      <h2 className="form-header">Boat Rental Reservation Form</h2>
      <div className="form-section">
        <h3>Primary Guest Information:</h3>
        <div className="input-group">
          <input
            type="text"
            placeholder="First Name"
            name="firstName"
            value={primaryGuest.firstName}
            onChange={handlePrimaryInputChange}
          />
          <input
            type="text"
            placeholder="Last Name"
            name="lastName"
            value={primaryGuest.lastName}
            onChange={handlePrimaryInputChange}
          />
          <input
            type="text"
            placeholder="Middle Initial"
            name="middleInitial"
            value={primaryGuest.middleInitial}
            onChange={handlePrimaryInputChange}
          />
          <input
            type="text"
            placeholder="Date of Birth"
            name="dateOfBirth"
            value={primaryGuest.dateOfBirth}
            onChange={handlePrimaryInputChange}
          />
          <input
            type="text"
            placeholder="Phone"
            name="phone"
            value={primaryGuest.phone}
            onChange={handlePrimaryInputChange}
          />
          <input
            type="text"
            placeholder="Email"
            name="email"
            value={primaryGuest.email}
            onChange={handlePrimaryInputChange}
          />
          <input
            type="text"
            placeholder="Address"
            name="address"
            value={primaryGuest.address}
            onChange={handlePrimaryInputChange}
          />
          <input
            type="text"
            placeholder="City"
            name="city"
            value={primaryGuest.city}
            onChange={handlePrimaryInputChange}
          />
          <input
            type="text"
            placeholder="State"
            name="state"
            value={primaryGuest.state}
            onChange={handlePrimaryInputChange}
          />
          <input
            type="text"
            placeholder="Country"
            name="country"
            value={primaryGuest.country}
            onChange={handlePrimaryInputChange}
          />
          <input
            type="text"
            placeholder="Citizenship"
            name="citizenship"
            value={primaryGuest.citizenship}
            onChange={handlePrimaryInputChange}
          />
          <input
            type="text"
            placeholder="Emergency Contact Name"
            name="name"
            value={primaryGuest.emergencyContact.name}
            onChange={handleEmergencyContactChange}
          />
          <input
            type="text"
            placeholder="Emergency Contact Phone"
            name="phone"
            value={primaryGuest.emergencyContact.phone}
            onChange={handleEmergencyContactChange}
          />
        </div>
      </div>

      <div className="form-section">
        <h3>Secondary Guests Information:</h3>
        {secondaryGuests.map((guest, index) => (
          <div key={index} className="input-group">
            <input
              type="text"
              placeholder="First Name"
              name="firstName"
              value={guest.firstName}
              onChange={e => handleSecondaryInputChange(index, e)}
            />
            <input
              type="text"
              placeholder="Last Name"
              name="lastName"
              value={guest.lastName}
              onChange={e => handleSecondaryInputChange(index, e)}
            />
            <input
              type="text"
              placeholder="Emergency Contact"
              name="emergencyContact"
              value={guest.emergencyContact}
              onChange={e => handleSecondaryInputChange(index, e)}
            />
            <button type="button" className="remove-button" onClick={() => handleRemoveGuest(index)}>Remove</button>
          </div>
        ))}
        <button type="button" className="other-buttons" onClick={handleAddGuest}>Add Guest</button>
      </div>

      <button type="submit" className="other-buttons">Submit</button>
    </form>
  );
};

export default BoatReservationForm;
