import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import LoadingSpinner from '../components/common/LoadingSpinner';

const AuthLayout = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    <div className="auth-page bg-light">
      <Container>
        <Row className="vh-100 d-flex justify-content-center align-items-center">
          <Col md={8} lg={6} xl={5}>
            <Card className="shadow-lg border-0 rounded-lg mt-5">
              <Card.Header className="bg-primary text-white text-center py-3">
                <h3 className="my-2">Room and Facility Management System</h3>
              </Card.Header>
              <Card.Body className="p-4">
                {loading ? <LoadingSpinner /> : <Outlet />}
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
    </div>
  );
};

export default AuthLayout;
