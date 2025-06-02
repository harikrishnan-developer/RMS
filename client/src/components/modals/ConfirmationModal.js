import React from 'react';
import { Button, Modal } from 'react-bootstrap';
import { FaExclamationTriangle } from 'react-icons/fa';

const ConfirmationModal = ({ show, onClose, onConfirm, title, message, confirmText, cancelText, variant }) => {
  
  const handleConfirm = () => {
    if (onConfirm) {
      onConfirm();
    }
    onClose();
  };
  
  return (
    <Modal show={show} onHide={onClose} centered>
      <Modal.Header closeButton>
        <Modal.Title>{title || 'Confirm Action'}</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <div className="d-flex align-items-center">
          <div className="me-3">
            <FaExclamationTriangle size={24} className="text-warning" />
          </div>
          <div>
            {message || 'Are you sure you want to proceed with this action?'}
          </div>
        </div>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={onClose}>
          {cancelText || 'Cancel'}
        </Button>
        <Button variant={variant || 'danger'} onClick={handleConfirm}>
          {confirmText || 'Confirm'}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default ConfirmationModal;
