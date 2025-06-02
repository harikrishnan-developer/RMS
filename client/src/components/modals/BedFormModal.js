import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { createBed, fetchBedsByRoom, updateBed } from '../../redux/slices/bedSlice';

const BedFormModal = ({ onClose, data }) => {
  const initialState = {
    bedNumber: '',
    room: '',
    status: 'Available'
  };

  const [formData, setFormData] = useState(initialState);
  const [validated, setValidated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.beds);

  useEffect(() => {
    if (data && data.bed) {
      setFormData({
        bedNumber: data.bed.bedNumber || '',
        room: data.bed.room?._id || data.bed.room || '',
        status: data.bed.status || 'Available'
      });
      setIsEditMode(true);
    } else if (data && data.roomId) {
      // Pre-select room if creating from room details page
      setFormData({
        ...initialState,
        room: data.roomId
      });
    }
  }, [data]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    try {
      // Ensure we have a valid room ID
      const roomId = data.roomId;
      if (!roomId) {
        throw new Error('Room ID is required');
      }

      const bedData = {
        ...formData,
        room: roomId
      };

      if (isEditMode) {
        await dispatch(updateBed({ id: data.bed._id, bedData })).unwrap();
      } else {
        await dispatch(createBed(bedData)).unwrap();
        // After creating a bed, fetch beds for the current room to update the list
        dispatch(fetchBedsByRoom(roomId));
      }
      onClose();
    } catch (error) {
      console.error('Error submitting bed form:', error);
    }
  };

  const getRoomDisplay = () => {
    if (!data?.room) {
      return 'Loading room information...';
    }
    const roomNumber = data.room.number;
    const blockName = data.room.block?.name;
    return `Room ${roomNumber || 'N/A'} (${blockName || 'N/A'})`;
  };

  return (
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Edit Bed' : 'Create New Bed'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger">{error.message || 'An error occurred'}</Alert>
        )}
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="bedNumber">
            <Form.Label>Bed Number/Identifier</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter bed number (e.g., A, B, 1, 2)"
              name="bedNumber"
              value={formData.bedNumber}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a bed number or identifier.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="room">
            <Form.Label>Room</Form.Label>
            <Form.Control
              type="text"
              value={getRoomDisplay()}
              disabled
            />
            <Form.Control.Feedback type="invalid">
              Please select a room.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="status">
            <Form.Label>Status</Form.Label>
            <Form.Select
              name="status"
              value={formData.status}
              onChange={handleChange}
              required
            >
              <option value="Available">Available</option>
              <option value="Occupied">Occupied</option>
              <option value="Under Maintenance">Under Maintenance</option>
            </Form.Select>
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              variant="primary" 
              type="submit" 
              disabled={loading || !data?.room}
            >
              {loading ? 'Saving...' : (isEditMode ? 'Update Bed' : 'Create Bed')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default BedFormModal;
