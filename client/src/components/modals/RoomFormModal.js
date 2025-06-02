import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlocks } from '../../redux/slices/blockSlice';
import { createRoom, updateRoom } from '../../redux/slices/roomSlice';

const RoomFormModal = ({ onClose, data }) => {
  const initialState = {
    number: '',
    block: '',
    type: 'Single',
    capacity: 1,
    description: '',
    pricePerDay: 0,
    amenities: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [validated, setValidated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.rooms || {});
  const { blocks = [] } = useSelector((state) => state.blocks || {});

  useEffect(() => {
    if (data && data.room) {
      setFormData({
        number: data.room.number || '',
        block: data.room.block?._id || data.room.block || '',
        type: data.room.type || 'Single',
        capacity: data.room.capacity || 1,
        description: data.room.description || '',
        pricePerDay: data.room.pricePerDay || 0,
        amenities: data.room.amenities ? data.room.amenities.join(', ') : ''
      });
      setIsEditMode(true);
    } else if (data && data.blockId) {
      // Pre-select block if creating from block details page
      setFormData({
        ...initialState,
        block: data.blockId
      });
    }
  }, [data]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    setFormData({
      ...formData,
      [name]: type === 'number' ? Number(value) : value
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
      // Convert pricePerDay to number
      const formDataToSubmit = {
        ...formData,
        pricePerDay: Number(formData.pricePerDay)
      };

      if (isEditMode) {
        await dispatch(updateRoom({ id: data.room._id, roomData: formDataToSubmit })).unwrap();
      } else {
        await dispatch(createRoom(formDataToSubmit)).unwrap();
        // After creating a room, fetch blocks to update room counts
        dispatch(fetchBlocks());
      }
      onClose();
    } catch (error) {
      console.error('Error submitting room form:', error);
    }
  };

  return (
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Edit Room' : 'Create New Room'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && (
          <Alert variant="danger">{error.message || 'An error occurred'}</Alert>
        )}
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="number">
            <Form.Label>Room Number</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter room number"
              name="number"
              value={formData.number}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a room number.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="block">
            <Form.Label>Block</Form.Label>
            <Form.Select
              name="block"
              value={formData.block}
              onChange={handleChange}
              required
              disabled={isEditMode} // Can't change block in edit mode
            >
              <option value="">-- Select Block --</option>
              {blocks.map(block => (
                <option key={block._id} value={block._id}>
                  {block.name} ({block.type})
                </option>
              ))}
            </Form.Select>
            <Form.Control.Feedback type="invalid">
              Please select a block.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="type">
            <Form.Label>Room Type</Form.Label>
            <Form.Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="Single">Single</option>
              <option value="Double">Double</option>
              <option value="Triple">Triple</option>
              <option value="Dormitory">Dormitory</option>
              <option value="VIP Suite">VIP Suite</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="capacity">
            <Form.Label>Capacity</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              required
              min={1}
              max={20}
            />
            <Form.Control.Feedback type="invalid">
              Capacity must be between 1 and 20.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="pricePerDay">
            <Form.Label>Price Per Day (₹)</Form.Label>
            <Form.Control
              type="number"
              placeholder="Enter price per day"
              name="pricePerDay"
              value={formData.pricePerDay}
              onChange={handleChange}
              min={0}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="amenities">
            <Form.Label>Amenities (comma-separated)</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. AC, TV, WiFi, Attached Bathroom"
              name="amenities"
              value={formData.amenities}
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter room description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditMode ? 'Update Room' : 'Create Room')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RoomFormModal;
