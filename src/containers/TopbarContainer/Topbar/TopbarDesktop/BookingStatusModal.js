import React from 'react';
import Modal from 'react-modal';

Modal.setAppElement('#root');  

const BookingStatusModal = ({ isOpen, onClose, bookingStatus }) => {
  return (
    <Modal
      isOpen={isOpen}
      onRequestClose={onClose}
      contentLabel="Booking Status"
      className="modal"
      overlayClassName="overlay"
    >
      <h2>Booking Status</h2>
      <p>{bookingStatus}</p>
      <button onClick={onClose}>Close</button>
    </Modal>
  );
};

export default BookingStatusModal;
