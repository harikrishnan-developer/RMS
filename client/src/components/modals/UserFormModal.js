import React, { useEffect, useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
// Import user actions from userSlice
import { createUser, fetchUsers, updateUser } from '../../redux/slices/userSlice';

const UserFormModal = ({ onClose, data }) => {
  const initialState = {
    name: '',
    email: '',
    password: '',
    role: 'blockHead'
  };

  const [formData, setFormData] = useState(initialState);
  const [validated, setValidated] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const dispatch = useDispatch();
  // Use Redux state for loading and error
  const { loading, error } = useSelector((state) => state.users);
  const { user: currentUser } = useSelector((state) => state.auth);

  useEffect(() => {
    if (data && data.user) {
      setFormData({
        name: data.user.name || '',
        email: data.user.email || '',
        password: '', // Don't populate password in edit mode
        role: data.user.role || 'blockHead'
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

    // Remove password if it's empty in edit mode
    let userData = { ...formData };
    if (isEditMode && !userData.password) {
      delete userData.password;
    }

    // Dispatch the appropriate action based on whether we're editing or creating
    if (isEditMode) {
      dispatch(updateUser({ id: data.user._id, userData }))
        .unwrap()
        .then(() => {
          onClose();
        })
        .catch(error => {
          console.error('Error updating user:', error);
        });
    } else {
      dispatch(createUser(userData))
        .unwrap()
        .then(() => {
          dispatch(fetchUsers()); // Refresh the user list
          onClose();
        })
        .catch(error => {
          console.error('Error creating user:', error);
        });
    }
  };

  return (
    <Modal show={true} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{isEditMode ? 'Edit User' : 'Create New User'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {error && <Alert variant="danger">{error}</Alert>}

        <Form noValidate validated={validated} onSubmit={handleSubmit}>
          <Form.Group className="mb-3" controlId="name">
            <Form.Label>Name</Form.Label>
            <Form.Control
              type="text"
              placeholder="Enter full name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a name.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="email">
            <Form.Label>Email</Form.Label>
            <Form.Control
              type="email"
              placeholder="Enter email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid email.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="password">
            <Form.Label>{isEditMode ? 'New Password (leave blank to keep current)' : 'Password'}</Form.Label>
            <Form.Control
              type="password"
              placeholder={isEditMode ? "Enter new password (optional)" : "Enter password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              required={!isEditMode}
              minLength={6}
            />
            <Form.Control.Feedback type="invalid">
              Password must be at least 6 characters.
            </Form.Control.Feedback>
          </Form.Group>

          {/* Only show role selection for system admins */}
          {currentUser?.role === 'systemAdmin' && (
            <Form.Group className="mb-3" controlId="role">
              <Form.Label>Role</Form.Label>
              <Form.Select
                name="role"
                value={formData.role}
                onChange={handleChange}
                required
              >
                <option value="systemAdmin">System Administrator</option>
                <option value="admin">Administrator</option>
                <option value="blockHead">Block Head</option>
              </Form.Select>
            </Form.Group>
          )}

          <div className="d-flex justify-content-end">
            <Button variant="secondary" className="me-2" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" disabled={loading}>
              {loading ? 'Saving...' : (isEditMode ? 'Update User' : 'Create User')}
            </Button>
          </div>
        </Form>
      </Modal.Body>
    </Modal>
  );
};

export default UserFormModal;
