import React from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import EarlyVacateHistory from '../components/dashboard/EarlyVacateHistory';
// ... other imports ...

const Dashboard = () => {
  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h4>Dashboard</h4>
        </Col>
      </Row>

      {/* Other dashboard components */}
      
      <Row className="mb-4">
        <Col>
          <EarlyVacateHistory />
        </Col>
      </Row>
    </Container>
  );
};

export default Dashboard; 