import React, { useEffect, useState } from 'react';
import { Alert, Button, Col, Form, Modal, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { fetchBlocks } from '../../redux/slices/blockSlice';
import { createRequest, updateRequest } from '../../redux/slices/requestSlice';

const RequestFormModal = ({ onClose, onSubmit, data }) => {
  const initialState = {
    requesterName: '',
    requesterContact: '',
    purpose: '',
    blockPreference: '',
    roomTypePreference: 'Single',
    checkInDate: '',
    checkOutDate: '',
    numberOfOccupants: 1,
    specialRequirements: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [validated, setValidated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.requests);
  const { blocks, loading: blocksLoading } = useSelector((state) => state.blocks);
  const { user } = useSelector((state) => state.auth);

  // Fetch blocks when modal opens
  useEffect(() => {
    dispatch(fetchBlocks());
  }, [dispatch]);

  // Show all blocks for all roles
  const availableBlocks = blocks || [];

  useEffect(() => {
    console.log('RequestFormModal useEffect - data:', data);
    if (data && Object.keys(data).length > 0 && !data.blockId) {
      console.log('RequestFormModal useEffect - entering edit mode logic');
      const checkInDate = new Date(data.checkInDate).toISOString().split('T')[0];
      const checkOutDate = new Date(data.checkOutDate).toISOString().split('T')[0];
      const newFormData = {
        requesterName: data.requesterName || '',
        requesterContact: data.requesterContact || '',
        purpose: data.purpose || '',
        blockPreference: data.blockPreference?._id || data.blockPreference || '',
        roomTypePreference: data.roomTypePreference || 'Single',
        checkInDate,
        checkOutDate,
        numberOfOccupants: data.numberOfOccupants || 1,
        specialRequirements: data.specialRequirements || ''
      };
      if (JSON.stringify(formData) !== JSON.stringify(newFormData)) {
        setFormData(newFormData);
        setIsEditMode(true);
      }
    } else if (data && data.blockId) {
      console.log('RequestFormModal useEffect - entering blockId logic');
      if (formData.blockPreference !== data.blockId) {
        setFormData(prevState => ({
          ...prevState,
          blockPreference: data.blockId
        }));
        setIsEditMode(false);
      }
    } else {
      console.log('RequestFormModal useEffect - entering create mode logic');
      if (!formData.checkInDate || !formData.checkOutDate) {
        const today = new Date();
        const formattedToday = today.toISOString().split('T')[0];
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        const formattedTomorrow = tomorrow.toISOString().split('T')[0];
        setFormData(prevState => ({
          ...prevState,
          checkInDate: formattedToday,
          checkOutDate: formattedTomorrow
        }));
        setIsEditMode(false);
      }
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
      if (isEditMode) {
        console.log('RequestFormModal handleSubmit - data for update:', data);
        await dispatch(updateRequest({ id: data._id, requestData: formData })).unwrap();
      } else {
        const requestNumber = `REQ-${Date.now()}`;
        const requestDataWithNumber = { ...formData, requestNumber };
        await dispatch(createRequest(requestDataWithNumber)).unwrap();
      }
      console.log('Request submitted successfully. Calling onClose().');
      onClose();
    } catch (error) {
      console.error('Failed to submit request:', error);
    }
  };

  return (
    <Modal show={true} onHide={onClose} centered size="lg">
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Edit Accommodation Request' : 'Create New Accommodation Request'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="requesterName">
                <Form.Label>Requester Name</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter full name"
                  name="requesterName"
                  value={formData.requesterName}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide the requester's name.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
            
            <Col md={6}>
              <Form.Group className="mb-3" controlId="requesterContact">
                <Form.Label>Contact Information</Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter email or phone number"
                  name="requesterContact"
                  value={formData.requesterContact}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please provide contact information.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="purpose">
            <Form.Label>Purpose of Stay</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter purpose of stay (e.g., Training, Official Visit)"
              name="purpose"
              value={formData.purpose}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide the purpose of stay.
            </Form.Control.Feedback>
          </Form.Group>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="blockPreference">
                <Form.Label>Preferred Block</Form.Label>
                <Form.Select
                  name="blockPreference"
                  value={formData.blockPreference}
                  onChange={handleChange}
                  required
                >
                  <option value="">Select a block</option>
                  {availableBlocks.map(block => (
                    <option key={block._id} value={block._id}>
                      {block.name}
                    </option>
                  ))}
                </Form.Select>
                <Form.Control.Feedback type="invalid">
                  Please select a preferred block.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="roomTypePreference">
                <Form.Label>Room Type Preference</Form.Label>
                <Form.Select
                  name="roomTypePreference"
                  value={formData.roomTypePreference}
                  onChange={handleChange}
                  required
                >
                  <option value="Single">Single</option>
                  <option value="Double">Double</option>
                  <option value="Triple">Triple</option>
                  <option value="Quad">Quad</option>
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="checkInDate">
                <Form.Label>Check-in Date</Form.Label>
                <Form.Control
                  type="date"
                  name="checkInDate"
                  value={formData.checkInDate}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please select a check-in date.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>

            <Col md={6}>
              <Form.Group className="mb-3" controlId="checkOutDate">
                <Form.Label>Check-out Date</Form.Label>
                <Form.Control
                  type="date"
                  name="checkOutDate"
                  value={formData.checkOutDate}
                  onChange={handleChange}
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please select a check-out date.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col md={6}>
              <Form.Group className="mb-3" controlId="numberOfOccupants">
                <Form.Label>Number of Occupants</Form.Label>
                <Form.Control
                  type="number"
                  name="numberOfOccupants"
                  value={formData.numberOfOccupants}
                  onChange={handleChange}
                  min="1"
                  required
                />
                <Form.Control.Feedback type="invalid">
                  Please specify the number of occupants.
                </Form.Control.Feedback>
              </Form.Group>
            </Col>
          </Row>

          <Form.Group className="mb-3" controlId="specialRequirements">
            <Form.Label>Special Requirements</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter any special requirements or preferences"
              name="specialRequirements"
              value={formData.specialRequirements}
              onChange={handleChange}
            />
          </Form.Group>

          <div className="d-flex justify-content-end gap-2">
            <Button variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Submitting...' : isEditMode ? 'Update Request' : 'Submit Request'}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default RequestFormModal;
