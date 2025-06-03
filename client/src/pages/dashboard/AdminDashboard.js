import React, { useEffect, useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { FaBell, FaCheckCircle, FaClipboardList, FaHourglassHalf, FaTimesCircle } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EarlyVacateHistory from '../../components/dashboard/EarlyVacateHistory';
import RequestFormModal from '../../components/modals/RequestFormModal';
import { fetchAdminStats } from '../../redux/slices/statsSlice';

const AdminDashboard = () => {
  const dispatch = useDispatch();
  const { adminStats: stats, loading, error } = useSelector((state) => state.stats);
  const [showRequestModal, setShowRequestModal] = useState(false);

  useEffect(() => {
    dispatch(fetchAdminStats());
  }, [dispatch]);

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error) {
    return (
      <div className="alert alert-danger">
        Error loading dashboard: {error}
      </div>
    );
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h4>Admin Dashboard</h4>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <h4>Admin Dashboard</h4>
              <p className="text-muted">
                Welcome to the admin dashboard. From here, you can create new accommodation requests.
              </p>
              <Button variant="primary" onClick={() => setShowRequestModal(true)}>
                Create New Request
              </Button>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Notifications Section */}
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Header className="d-flex align-items-center">
              <FaBell className="me-2" />
              <h5 className="mb-0">Notifications</h5>
            </Card.Header>
            <Card.Body>
              {stats?.pendingRequests > 0 && (
                <Alert variant="warning" className="d-flex align-items-center">
                  <FaHourglassHalf className="me-2" />
                  <div>
                    <strong>{stats.pendingRequests}</strong> pending accommodation requests require your attention.
                    <div className="mt-2">
                      <Button as={Link} to="/management/requests?status=Pending" variant="warning" size="sm">
                        Review Requests
                      </Button>
                    </div>
                  </div>
                </Alert>
              )}
              {stats?.blocks?.some(block => {
                const total = block.total || 0;
                const available = block.available || 0;
                const occupancyRate = total > 0 ? ((total - available) / total) * 100 : 0;
                return occupancyRate >= 90;
              }) && (
                <Alert variant="danger" className="d-flex align-items-center">
                  <FaTimesCircle className="me-2" />
                  <div>
                    <strong>High Occupancy Alert!</strong> Some blocks are reaching full capacity.
                    <div className="mt-2">
                      <Button as={Link} to="/management/blocks" variant="danger" size="sm">
                        View Blocks
                      </Button>
                    </div>
                  </div>
                </Alert>
              )}
              {(!stats?.pendingRequests || stats.pendingRequests === 0) && 
               !stats?.blocks?.some(block => {
                 const total = block.total || 0;
                 const available = block.available || 0;
                 const occupancyRate = total > 0 ? ((total - available) / total) * 100 : 0;
                 return occupancyRate >= 90;
               }) && (
                <Alert variant="info">
                  No new notifications at this time.
                </Alert>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row className="mb-4">
        {/* Total Requests Card */}
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100 dashboard-card">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-bg bg-primary text-white p-3 rounded me-3">
                  <FaClipboardList size={24} />
                </div>
                <div>
                  <h5 className="mb-0">Total Requests</h5>
                </div>
              </div>
              <Card.Text className="h2 mb-0">
                {stats?.totalRequests || 0}
              </Card.Text>
              <div className="mt-auto pt-3">
                <Button as={Link} to="/management/requests" variant="outline-primary" size="sm">
                  View All
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Pending Requests Card */}
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100 dashboard-card">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-bg bg-warning text-white p-3 rounded me-3">
                  <FaHourglassHalf size={24} />
                </div>
                <div>
                  <h5 className="mb-0">Pending</h5>
                </div>
              </div>
              <Card.Text className="h2 mb-0">
                {stats?.pendingRequests || 0}
              </Card.Text>
              <div className="mt-auto pt-3">
                <Button as={Link} to="/management/requests?status=Pending" variant="outline-warning" size="sm">
                  View Pending
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Approved Requests Card */}
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100 dashboard-card">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-bg bg-success text-white p-3 rounded me-3">
                  <FaCheckCircle size={24} />
                </div>
                <div>
                  <h5 className="mb-0">Approved</h5>
                </div>
              </div>
              <Card.Text className="h2 mb-0">
                {stats?.approvedRequests || 0}
              </Card.Text>
              <div className="mt-auto pt-3">
                <Button as={Link} to="/management/requests?status=Approved" variant="outline-success" size="sm">
                  View Approved
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Rejected Requests Card */}
        <Col lg={3} md={6} className="mb-4">
          <Card className="h-100 dashboard-card">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-bg bg-danger text-white p-3 rounded me-3">
                  <FaTimesCircle size={24} />
                </div>
                <div>
                  <h5 className="mb-0">Rejected</h5>
                </div>
              </div>
              <Card.Text className="h2 mb-0">
                {stats?.rejectedRequests || 0}
              </Card.Text>
              <div className="mt-auto pt-3">
                <Button as={Link} to="/management/requests?status=Rejected" variant="outline-danger" size="sm">
                  View Rejected
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={12}>
          <Card className="mb-4 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Facility Availability</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Block Name</th>
                      <th>Available Beds</th>
                      <th>Total Beds</th>
                      <th>Occupancy</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats?.blocks?.map(block => {
                      const total = block.total || 0;
                      const available = block.available || 0;
                      const occupied = total - available;
                      const occupancyRate = total > 0 ? (occupied / total) * 100 : 0;
                      let statusBadge;
                      
                      if (occupancyRate >= 90) {
                        statusBadge = <Badge bg="danger">Full</Badge>;
                      } else if (occupancyRate >= 70) {
                        statusBadge = <Badge bg="warning">Limited</Badge>;
                      } else {
                        statusBadge = <Badge bg="success">Available</Badge>;
                      }

                      return (
                        <tr key={block.id}>
                          <td>{block.name}</td>
                          <td>{available}</td>
                          <td>{total}</td>
                          <td>{occupancyRate.toFixed(1)}%</td>
                          <td>{statusBadge}</td>
                          <td>
                            <Button
                              as={Link}
                              to={`/management/select-room-for-beds/${block.id}`}
                              variant="outline-primary"
                              size="sm"
                            >
                              View Rooms
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Early Vacate History Section */}
      <Row className="mb-4">
        <Col>
          <Card className="shadow-sm">
            <Card.Header className="bg-white">
              <h5 className="mb-0">Early Vacate Records</h5>
            </Card.Header>
            <Card.Body>
              <EarlyVacateHistory />
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* Request Form Modal */}
      {showRequestModal && (
        <RequestFormModal
          show={showRequestModal}
          onClose={() => setShowRequestModal(false)}
          data={null}
        />
      )}
    </Container>
  );
};

export default AdminDashboard;
