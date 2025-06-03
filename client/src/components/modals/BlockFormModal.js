import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { createBlock, updateBlock } from '../../redux/slices/blockSlice';
import { fetchBlockHeads } from '../../redux/slices/userSlice';
// Import block actions (to be created in blockSlice)
// import { createBlock, updateBlock } from '../../redux/slices/blockSlice';

const BlockFormModal = ({ onClose, data }) => {
  const initialState = {
    name: '',
    type: 'Dormitory',
    description: ''
  };

  const [formData, setFormData] = useState(initialState);
  const [validated, setValidated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.blocks || {});
  const { blockHeads = [] } = useSelector((state) => state.users || {});
  const { user: currentUser } = useSelector((state) => state.auth);

  // Fetch block heads only once when component mounts
  useEffect(() => {
    console.log('Current blockHeads:', blockHeads);
    if (!blockHeads.length) {
      dispatch(fetchBlockHeads());
    }
  }, [dispatch, blockHeads.length]);

  // Handle form data initialization when data prop changes
  useEffect(() => {
    if (data && data.block) {
      setFormData({
        name: data.block.name || '',
        type: data.block.type || 'Dormitory',
        description: data.block.description || '',
        blockHead: data.block.blockHead?._id || data.block.blockHead || ''
      });
      setIsEditMode(true);
    }
  }, [data]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.currentTarget;

    if (form.checkValidity() === false) {
      e.stopPropagation();
      setValidated(true);
      return;
    }

    // Dispatch the appropriate action based on edit mode
    if (isEditMode) {
      dispatch(updateBlock({ id: data.block._id, blockData: formData }))
        .unwrap()
        .then(() => {
          onClose();
        })
        .catch(err => {
          console.error('Failed to update block:', err);
          // TODO: Handle error in UI (e.g., show an alert)
        });
    } else {
      dispatch(createBlock(formData))
        .unwrap()
        .then(() => {
          onClose();
        })
        .catch(err => {
          console.error('Failed to create block:', err);
          // TODO: Handle error in UI (e.g., show an alert)
        });
    }
  };

  return (
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Edit Block' : 'Create New Block'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error.message || 'An error occurred'}</Alert>}

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Block Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter block name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a block name.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="type">
            <Form.Label>Block Type</Form.Label>
            <Form.Select
              name="type"
              value={formData.type}
              onChange={handleChange}
              required
            >
              <option value="A Block">A Block</option>
              <option value="B Block">B Block</option>
              <option value="Guest House">Guest House</option>
              <option value="SO Mess">SO Mess</option>
              <option value="Dormitory">Dormitory</option>
            </Form.Select>
          </Form.Group>

          <Form.Group className="mb-3" controlId="description">
            <Form.Label>Description</Form.Label>
            <Form.Control
              as="textarea"
              rows={3}
              placeholder="Enter block description"
              name="description"
              value={formData.description}
              onChange={handleChange}
            />
          </Form.Group>

          {/* Show block head assignment only in edit mode for admins */}
          {isEditMode && currentUser?.role === 'admin' && (
            <Form.Group className="mb-3" controlId="blockHead">
              <Form.Label>Block Head</Form.Label>
              <Form.Select
                name="blockHead"
                value={formData.blockHead}
                onChange={handleChange}
              >
                <option value="">-- Select Block Head --</option>
                {Array.isArray(blockHeads) && blockHeads.length > 0 ? (
                  blockHeads.map(user => (
                    <option key={user._id} value={user._id}>
                      {user.name || 'Unnamed'} ({user.email || 'No email'})
                    </option>
                  ))
                ) : (
                  <option value="" disabled>Loading block heads...</option>
                )}
              </Form.Select>
              <Form.Text className="text-muted">
                Assign a block head to manage this block
              </Form.Text>
            </Form.Group>
          )}

          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditMode ? 'Update Block' : 'Create Block')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default BlockFormModal;
