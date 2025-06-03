import React, { useState } from 'react';
import { Alert, Button, Form, Modal } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import { createCourse, resetCourseState } from '../../redux/slices/courseSlice';

const CourseFormModal = ({ show, onClose }) => {
  const [formData, setFormData] = useState({
    courseName: '',
    duration: '',
    date: '',
    coordinatorName: '',
  });
  const [validated, setValidated] = useState(false);

  const dispatch = useDispatch();
  const { loading, error, success } = useSelector((state) => state.courses);

  const handleChange = (e) => {
    const { name, value } = e.target;
    
    // For duration field, only allow numbers
    if (name === 'duration') {
      // Only allow positive numbers
      if (value === '' || /^\d+$/.test(value)) {
        setFormData({
          ...formData,
          [name]: value
        });
      }
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
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

    // Dispatch createCourse action
    await dispatch(createCourse(formData));

    // Close modal on success and reset form
    if (success) {
      onClose();
      setFormData({
        courseName: '',
        duration: '',
        date: '',
        coordinatorName: '',
      });
      setValidated(false);
      dispatch(resetCourseState()); // Reset success state
    }
  };

  // Reset form and state on modal close
  const handleClose = () => {
    setFormData({
      courseName: '',
      duration: '',
      date: '',
      coordinatorName: '',
    });
    setValidated(false);
    dispatch(resetCourseState()); // Reset loading/error/success state
    onClose();
  };

  return (
    <Modal show={show} onHide={handleClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>Add New Course</Modal.Title>
      </Modal.Header>
      <Form noValidate validated={validated} onSubmit={handleSubmit}>
        <Modal.Body>
          {error && <Alert variant="danger">{error}</Alert>}
          <Form.Group className="mb-3" controlId="courseName">
            <Form.Label>Course Name *</Form.Label>
            <Form.Control
              type="text"
              name="courseName"
              value={formData.courseName}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide a course name.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="duration">
            <Form.Label>Duration (days) *</Form.Label>
            <Form.Control
              type="text"
              name="duration"
              value={formData.duration}
              onChange={handleChange}
              required
              min="1"
              pattern="[0-9]*"
            />
            <Form.Control.Feedback type="invalid">
              Please provide a valid number of days.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="date">
            <Form.Label>Date *</Form.Label>
            <Form.Control
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide course date.
            </Form.Control.Feedback>
          </Form.Group>

          <Form.Group className="mb-3" controlId="coordinatorName">
            <Form.Label>Coordinator Name *</Form.Label>
            <Form.Control
              type="text"
              name="coordinatorName"
              value={formData.coordinatorName}
              onChange={handleChange}
              required
            />
            <Form.Control.Feedback type="invalid">
              Please provide coordinator name.
            </Form.Control.Feedback>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleClose} disabled={loading}>
            Cancel
          </Button>
          <Button variant="primary" type="submit" disabled={loading}>
            {loading ? 'Adding...' : 'Add Course'}
          </Button>
        </Modal.Footer>
      </Form>
    </Modal>
  );
};

export default CourseFormModal; 