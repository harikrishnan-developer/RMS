import React, { useEffect } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

// Import dashboard components for each role
import AdminDashboard from './AdminDashboard';
import BlockHeadDashboard from './BlockHeadDashboard';
import SystemAdminDashboard from './SystemAdminDashboard';

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const navigate = useNavigate();
  
  // Redirect to role-specific dashboard if needed
  useEffect(() => {
    if (user) {
      if (user.role === 'admin') {
        navigate('/admin/dashboard');
      } else if (user.role === 'blockHead') {
        navigate('/blockhead/dashboard');
      }
    }
  }, [user, navigate]);

  // Render appropriate dashboard based on user role
  const renderDashboard = () => {
    if (!user) return null;

    switch (user.role) {
      case 'systemAdmin':
        return <SystemAdminDashboard />;
      case 'admin':
        return <AdminDashboard />;
      case 'blockHead':
        return <BlockHeadDashboard />;
      default:
        return <DefaultDashboard />;
    }
  };

  return (
    <Container fluid>
      <h2 className="mb-4">Dashboard</h2>
      {renderDashboard()}
    </Container>
  );
};

// Default dashboard with basic information
const DefaultDashboard = () => {
  return (
    <Row>
      <Col md={12}>
        <Card className="mb-4 shadow-sm">
          <Card.Body>
            <Card.Title>Welcome to Room and Facility Management System</Card.Title>
            <Card.Text>
              This system helps manage accommodations, room assignments, and facility resources.
              Navigate using the sidebar to access your available features.
            </Card.Text>
          </Card.Body>
        </Card>
      </Col>
    </Row>
  );
};

export default Dashboard;
