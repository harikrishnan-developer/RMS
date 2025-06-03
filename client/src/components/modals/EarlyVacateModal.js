import React, { useState } from 'react';
import { Button, Form, Modal } from 'react-bootstrap';

const EarlyVacateModal = ({ show, onClose, onConfirm, bedData }) => {
  const [formData, setFormData] = useState({
    reason: '',
    contactName: '',
    contactNumber: '',
    notes: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Submitting early vacate data:', formData);
    onConfirm(formData);
    setFormData({
      reason: '',
      contactName: '',
      contactNumber: '',
      notes: ''
    });
  };

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Early Vacate Form</Modal.Title>
      </Modal.Header>
      <Form onSubmit={handleSubmit}>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Reason for Early Vacate *</Form.Label>
            <Form.Control
              as="textarea"
              name="reason"
              value={formData.reason}
              onChange={handleChange}
              required
              placeholder="Please provide the reason for early vacate"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contact Person Name *</Form.Label>
            <Form.Control
              type="text"
              name="contactName"
              value={formData.contactName}
              onChange={handleChange}
              required
              placeholder="Enter contact person name"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Contact Number *</Form.Label>
            <Form.Control
              type="tel"
              name="contactNumber"
              value={formData.contactNumber}
              onChange={handleChange}
              required
              placeholder="Enter contact number"
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Additional Notes</Form.Label>
            <Form.Control
              as="textarea"
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="Any additional information"
            />
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" type="submit">
            Confirm Early Vacate
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default EarlyVacateModal; 