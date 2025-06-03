import React, { useEffect } from 'react';
import { Button, Card, Col, Row } from 'react-bootstrap';
import { FaBed, FaBook, FaBuilding, FaChartBar, FaClipboardList, FaDoorOpen, FaUserPlus } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fetchStats } from '../../redux/slices/statsSlice';

// Import necessary actions for stats
const SystemAdminDashboard = () => {
  const dispatch = useDispatch();
  const stats = useSelector((state) => state.stats);
  const loading = useSelector((state) => state.stats.loading);
  const error = useSelector((state) => state.stats.error);

  useEffect(() => {
    dispatch(fetchStats());
  }, [dispatch]);

  if (stats.loading) {
    return <LoadingSpinner />;
  }

  return (
    <>
      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <h4>System Administrator Dashboard</h4>
              <p className="text-muted">
                Welcome to the system administrator dashboard. Here you can manage users, blocks, and infrastructure.
              </p>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        {/* User Management Card */}
        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100 dashboard-card">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-bg bg-primary text-white p-3 rounded me-3">
                  <FaUserPlus size={24} />
                </div>
                <div>
                  <h5 className="mb-0">User Management</h5>
                  <small className="text-muted">Manage system users</small>
                </div>
              </div>
              <Card.Text>
                <strong>{stats.userCount}</strong> active users in the system
              </Card.Text>
              <div className="mt-auto">
                <Button as={Link} to="/management/users" variant="outline-primary">
                  Manage Users
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Block Management Card */}
        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100 dashboard-card">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-bg bg-success text-white p-3 rounded me-3">
                  <FaBuilding size={24} />
                </div>
                <div>
                  <h5 className="mb-0">Block Management</h5>
                  <small className="text-muted">Manage accommodation blocks</small>
                </div>
              </div>
              <Card.Text>
                <strong>{stats.blockCount}</strong> blocks configured
              </Card.Text>
              <div className="mt-auto">
                <Button as={Link} to="/management/blocks" variant="outline-success">
                  Manage Blocks
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Room Management Card */}
        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100 dashboard-card">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-bg bg-info text-white p-3 rounded me-3">
                  <FaDoorOpen size={24} />
                </div>
                <div>
                  <h5 className="mb-0">Room Management</h5>
                  <small className="text-muted">Configure rooms in blocks</small>
                </div>
              </div>
              <Card.Text>
                <strong>{stats.roomCount}</strong> rooms across all blocks
              </Card.Text>
              <div className="mt-auto">
                <Button as={Link} to="/management/rooms" variant="outline-info">
                  Manage Rooms
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Bed Management Card */}
        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100 dashboard-card">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-bg bg-warning text-white p-3 rounded me-3">
                  <FaBed size={24} />
                </div>
                <div>
                  <h5 className="mb-0">Bed Management</h5>
                  <small className="text-muted">Configure beds in rooms</small>
                </div>
              </div>
              <Card.Text>
                <strong>{stats.bedCount}</strong> beds available in the system
              </Card.Text>
              <div className="mt-auto">
                <Button as={Link} to="/management/select-room-for-beds" variant="outline-warning">
                  Manage Beds
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Course Management Card */}
        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100 dashboard-card">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-bg bg-dark text-white p-3 rounded me-3">
                  <FaBook size={24} />
                </div>
                <div>
                  <h5 className="mb-0">Course Management</h5>
                  <small className="text-muted">Manage courses</small>
                </div>
              </div>
              <Card.Text>
                {/* Optional: Add course count stat if available */}
                Manage course details and information.
              </Card.Text>
              <div className="mt-auto">
                <Button as={Link} to="/management/courses" variant="outline-dark">
                  Manage Courses
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Request Management Card */}
        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100 dashboard-card">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-bg bg-danger text-white p-3 rounded me-3">
                  <FaClipboardList size={24} />
                </div>
                <div>
                  <h5 className="mb-0">Request Management</h5>
                  <small className="text-muted">View accommodation requests</small>
                </div>
              </div>
              <Card.Text>
                <strong>{stats.requestCount}</strong> pending accommodation requests
              </Card.Text>
              <div className="mt-auto">
                <Button as={Link} to="/management/requests" variant="outline-danger">
                  View Requests
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Reports Card */}
        <Col lg={4} md={6} className="mb-4">
          <Card className="h-100 dashboard-card">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-bg bg-secondary text-white p-3 rounded me-3">
                  <FaChartBar size={24} />
                </div>
                <div>
                  <h5 className="mb-0">Reports</h5>
                  <small className="text-muted">View system reports</small>
                </div>
              </div>
              <Card.Text>
                Generate occupancy and usage reports
              </Card.Text>
              <div className="mt-auto">
                <Button as={Link} to="/reports" variant="outline-secondary">
                  View Reports
                </Button>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </>
  );
};

export default SystemAdminDashboard;
