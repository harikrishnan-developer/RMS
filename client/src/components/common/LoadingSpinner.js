import React from 'react';
import { Spinner } from 'react-bootstrap';

const LoadingSpinner = ({ overlay = false }) => {
  if (overlay) {
    return (
      <div className="spinner-overlay">
        <Spinner animation="border" role="status" variant="light">
          <span className="visually-hidden">Loading...</span>
        </Spinner>
      </div>
    );
  }

  return (
    <div className="d-flex justify-content-center my-4">
      <Spinner animation="border" role="status">
        <span className="visually-hidden">Loading...</span>
      </Spinner>
    </div>
  );
};

export default LoadingSpinner;
