import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { assignBed, createBed, updateBed } from '../../redux/slices/bedSlice';

const BedFormModal = ({ show, onClose, data }) => {
  const initialState = {
    bedNumber: '',
    status: 'Available',
    occupant: {
      name: '',
      contactInfo: '',
      checkInDate: '',
      checkOutDate: '',
      purpose: ''
    }
  };

  const [formData, setFormData] = useState(initialState);
  const [validated, setValidated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isAssignMode, setIsAssignMode] = useState(false);
  const [localLoading, setLocalLoading] = useState(false);
  const [timeoutError, setTimeoutError] = useState(false);
  const [error, setError] = useState(null);

  const dispatch = useDispatch();
  const { loading, error: globalError } = useSelector((state) => state.beds);

  useEffect(() => {
    // Reset form when modal is shown for adding a new bed
    if (show && !data?.bed) {
        setFormData(initialState);
        setValidated(false);
        setIsEditMode(false);
        setIsAssignMode(false);
        setError(null);
        setTimeoutError(false);
    }
    // Populate form data when modal is shown for editing or assigning
    else if (show && data?.bed) {
      setFormData({
        ...data.bed,
        occupant: data.bed.occupant || initialState.occupant
      });
      setIsEditMode(true);
      setIsAssignMode(data?.mode === 'assign');
      setValidated(false);
      setError(null);
      setTimeoutError(false);
    }
    // Reset form when modal is hidden
    else if (!show) {
        setFormData(initialState);
        setValidated(false);
        setIsEditMode(false);
        setIsAssignMode(false);
        setError(null);
        setTimeoutError(false);
    }
  }, [show, data]); // Depend on show and data props

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name.startsWith('occupant.')) {
      const occupantField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        occupant: {
          ...prev.occupant,
          [occupantField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    setLocalLoading(true);
    setTimeoutError(false);
    setError(null); // Clear previous errors

    // Set a timeout to handle long-running operations
    const timeoutId = setTimeout(() => {
      setTimeoutError(true);
      setLocalLoading(false);
    }, 10000); // 10 seconds timeout

    try {
      let result;
      if (isAssignMode && data?.bed?._id) {
        result = await dispatch(assignBed({
          bedId: data.bed._id,
          occupantData: formData.occupant
        })).unwrap();
      } else if (isEditMode && data?.bed?._id) {
        result = await dispatch(updateBed({
          id: data.bed._id,
          bedData: formData
        })).unwrap();
      } else if (data?.roomId || data?.room?._id) {
        // Use either roomId from data or room._id
        const roomId = data.roomId || data.room._id;
        result = await dispatch(createBed({
          ...formData,
          room: roomId
        })).unwrap();
      } else {
        throw new Error('Missing required data for operation');
      }
      
      clearTimeout(timeoutId);
      setLocalLoading(false);
      // Close modal only on success
      onClose();

    } catch (err) {
      console.error('Failed to save bed:', err);
      clearTimeout(timeoutId);
      setLocalLoading(false);
      // Show error message to user
      const errorMessage = err.response?.data?.message || err.message || 'Failed to save bed';
      setError(errorMessage);
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

  const isLoading = localLoading || loading;

  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>
          {isAssignMode ? 'Assign Bed' : isEditMode ? 'Edit Bed' : 'Create New Bed'}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}
        {timeoutError && (
          <Alert variant="warning">
            The operation is taking longer than expected. Please try again or contact support if the issue persists.
          </Alert>
        )}
        
        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          {!isAssignMode && (
            <Form.Group className="mb-3" controlId="bedNumber">
              <Form.Label>Bed Number</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter bed number"
                name="bedNumber"
                value={formData.bedNumber}
                onChange={handleChange}
                required
                disabled={isEditMode}
              />
              <Form.Control.Feedback type="invalid">
                Please provide a bed number.
              </Form.Control.Feedback>
            </Form.Group>
          )}

          {isAssignMode && (
            <>
              <Form.Group className="mb-3" controlId="occupantName">
                <Form.Label>Occupant Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter occupant name"
                  name="occupant.name"
                  value={formData.occupant.name}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide occupant name.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="contactInfo">
                <Form.Label>Contact Information</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter contact information"
                  name="occupant.contactInfo"
                  value={formData.occupant.contactInfo}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide contact information.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="checkInDate">
                <Form.Label>Check-in Date</Form.Label>
                <Form.Control
                  type="date"
                  name="occupant.checkInDate"
                  value={formData.occupant.checkInDate}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide check-in date.
                </Form.Control.Feedback>
              </Form.Group>

              <Form.Group className="mb-3" controlId="checkOutDate">
                <Form.Label>Check-out Date</Form.Label>
                <Form.Control
                  type="date"
                  name="occupant.checkOutDate"
                  value={formData.occupant.checkOutDate}
                  onChange={handleChange}
                />
              </Form.Group>

              <Form.Group className="mb-3" controlId="purpose">
                <Form.Label>Purpose of Stay</Form.Label>
                <Form.Control
                  as="textarea"
                  rows={3}
                  placeholder="Enter purpose of stay"
                  name="occupant.purpose"
                  value={formData.occupant.purpose}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide purpose of stay.
                </Form.Control.Feedback>
              </Form.Group>
            </>
          )}

          {!isAssignMode && (
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
          )}

          <div className="d-flex justify-content-end">
            <Button 
              variant="secondary" 
              onClick={onClose} // Use the onClose prop to close the modal
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button variant="primary" type="submit" className="ms-2" disabled={isLoading}>
              {isLoading ? 'Saving...' : isAssignMode ? 'Assign Bed' : isEditMode ? 'Save Changes' : 'Create Bed'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default BedFormModal;
