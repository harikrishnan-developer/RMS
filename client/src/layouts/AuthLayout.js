import React from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import backgroundImage from '../2021-11-24_2021-11-21_about.jpg'; // Import the background image
import LoadingSpinner from '../components/common/LoadingSpinner';

const AuthLayout = () => {
  const { isAuthenticated, loading } = useSelector((state) => state.auth);

  // Redirect if already authenticated
  if (isAuthenticated) {
    return <Navigate to="/dashboard" />;
  }

  return (
    // Apply background image styles to the main container
    <div 
      style={{
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        minHeight: '100vh', // Ensure it covers the full viewport height
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 0' // Add some vertical padding
      }}
    >
      <Container>
        <Row className="vh-100 d-flex justify-content-center align-items-center">
          <Col md={10} lg={8} xl={7}>
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
