import React, { useEffect } from 'react';
import { Card, Col, Container, Row } from 'react-bootstrap';
import { useDispatch, useSelector } from 'react-redux';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchStats } from '../../redux/slices/statsSlice';

const ReportsPage = () => {
  const dispatch = useDispatch();
  const { stats, loading, error } = useSelector((state) => state.stats);

  useEffect(() => {
    // Fetch stats if not already loaded
    if (!stats) {
       dispatch(fetchStats());
    }
  }, [dispatch, stats]);

  if (loading || !stats) {
    return <LoadingSpinner />;
  }

  if (error) {
    return <div className="alert alert-danger">Error loading reports: {error}</div>;
  }

  // Basic display of some stats as reports
  return (
    <Container fluid>
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <h4 className="mb-4">System Reports</h4>
          <Row>
            <Col md={4} className="mb-3">
              <Card bg="light">
                <Card.Body>
                  <Card.Title>Total Blocks</Card.Title>
                  <Card.Text>{stats.blockCount || 0}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
             <Col md={4} className="mb-3">
              <Card bg="light">
                <Card.Body>
                  <Card.Title>Total Rooms</Card.Title>
                  <Card.Text>{stats.roomCount || 0}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
             <Col md={4} className="mb-3">
              <Card bg="light">
                <Card.Body>
                  <Card.Title>Total Beds</Card.Title>
                  <Card.Text>{stats.bedCount || 0}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
           <Row>
             <Col md={4} className="mb-3">
              <Card bg="light">
                <Card.Body>
                  <Card.Title>Total Users</Card.Title>
                  <Card.Text>{stats.userCount || 0}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
             <Col md={4} className="mb-3">
              <Card bg="light">
                <Card.Body>
                  <Card.Title>Pending Requests</Card.Title>
                  <Card.Text>{stats.requestCount || 0}</Card.Text>
                </Card.Body>
              </Card>
            </Col>
          </Row>
          {/* Add more detailed reports here later */}
        </Card.Body>
      </Card>
    </Container>
  );
};

export default ReportsPage; 