import React from 'react';
import { Container, Row, Col, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { FaHome } from 'react-icons/fa';

const NotFound = () => {
  return (
    <Container className="py-5">
      <Row className="justify-content-center text-center">
        <Col md={6}>
          <h1 className="display-1 fw-bold">404</h1>
          <h2 className="mb-4">Page Not Found</h2>
          <p className="lead mb-4">
            The page you are looking for doesn't exist or has been moved.
          </p>
          <Button as={Link} to="/dashboard" variant="primary">
            <FaHome className="me-2" />
            Back to Dashboard
          </Button>
        </Col>
      </Row>
    </Container>
  );
};

export default NotFound;
