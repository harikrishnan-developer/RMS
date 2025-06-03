import React, { useEffect } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Row } from 'react-bootstrap';
import { FaBed, FaBell, FaDoorOpen, FaHourglassHalf } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import EarlyVacateHistory from '../../components/dashboard/EarlyVacateHistory';
import { fetchBlockHeadStats } from '../../redux/slices/statsSlice';

const BlockHeadDashboard = () => {
  const dispatch = useDispatch();
  const { blockHeadStats: stats, loading, error } = useSelector((state) => state.stats);
  const { user } = useSelector((state) => state.auth);

  useEffect(() => {
    dispatch(fetchBlockHeadStats());
  }, [dispatch]);

  // Calculate total stats from assigned blocks with validation
  const totalStats = user?.assignedBlocks?.reduce((acc, block) => {
    const totalBeds = Math.max(0, block.totalBeds || 0);
    const availableBeds = Math.min(totalBeds, Math.max(0, block.availableBeds || 0));
    const totalRooms = Math.max(0, block.totalRooms || 0);
    const availableRooms = Math.min(totalRooms, Math.max(0, block.availableRooms || 0));

    return {
      totalRooms: (acc.totalRooms || 0) + totalRooms,
      totalBeds: (acc.totalBeds || 0) + totalBeds,
      availableBeds: (acc.availableBeds || 0) + availableBeds,
      availableRooms: (acc.availableRooms || 0) + availableRooms
    };
  }, {}) || {};

  // Calculate occupied beds (ensure it's not negative)
  const occupiedBeds = Math.max(0, totalStats.totalBeds - totalStats.availableBeds);
  const occupiedRooms = Math.max(0, totalStats.totalRooms - totalStats.availableRooms);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <Container fluid>
      <Row className="mb-4">
        <Col>
          <h4>Block Head Dashboard</h4>
        </Col>
      </Row>

      <Row className="mb-4">
        <Col lg={12}>
          <Card className="shadow-sm">
            <Card.Body>
              <h4>Block Head Dashboard</h4>
              <p className="text-muted">
                Welcome to your block management dashboard. Here you can review and manage accommodation requests for your block.
              </p>
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
              {stats?.pendingRequests > 0 ? (
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
              ) : (
                <Alert variant="info">
                  No pending requests at this time.
            </Alert>
              )}
            </Card.Body>
          </Card>
          </Col>
        </Row>

      <Row className="mb-4">
        {/* Rooms Summary Card */}
        <Col lg={6} md={6} className="mb-4">
          <Card className="h-100 dashboard-card">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-bg bg-primary text-white p-3 rounded me-3">
                  <FaDoorOpen size={24} />
                </div>
                <div>
                  <h5 className="mb-0">Rooms</h5>
                </div>
              </div>
              <Card.Text>
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Rooms:</span>
                  <Badge bg="info">{totalStats.totalRooms}</Badge>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Available:</span>
                  <Badge bg="success">{totalStats.availableRooms}</Badge>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Occupied:</span>
                  <Badge bg="danger">{occupiedRooms}</Badge>
                </div>
              </Card.Text>
              <div className="mt-auto pt-2">
                {user?.assignedBlocks?.length > 0 && (
                  <Button as={Link} to={`/management/blocks/${user.assignedBlocks[0]._id}/rooms`} variant="outline-primary" size="sm">
                  Manage Rooms
                </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>

        {/* Beds Summary Card */}
        <Col lg={6} md={6} className="mb-4">
          <Card className="h-100 dashboard-card">
            <Card.Body className="d-flex flex-column">
              <div className="d-flex align-items-center mb-3">
                <div className="icon-bg bg-success text-white p-3 rounded me-3">
                  <FaBed size={24} />
                </div>
                <div>
                  <h5 className="mb-0">Beds</h5>
                </div>
              </div>
              <Card.Text>
                <div className="d-flex justify-content-between mb-2">
                  <span>Total Beds:</span>
                  <Badge bg="info">{totalStats.totalBeds}</Badge>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Available:</span>
                  <Badge bg="success">{totalStats.availableBeds}</Badge>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span>Occupied:</span>
                  <Badge bg="danger">{occupiedBeds}</Badge>
                </div>
              </Card.Text>
              <div className="mt-auto pt-2">
                 {user?.assignedBlocks?.length > 0 && (
                  <Button as={Link} to={`/management/blocks/${user.assignedBlocks[0]._id}/rooms`} variant="outline-success" size="sm">
                  Manage Beds
                </Button>
                )}
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Row>
        <Col lg={12}>
          <Card className="mb-4 shadow-sm">
            <Card.Header>
              <h5 className="mb-0">Block Status</h5>
            </Card.Header>
            <Card.Body>
              {error ? (
                <Alert variant="danger">{error}</Alert>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover">
                    <thead>
                      <tr>
                        <th>Block Name</th>
                        <th>Total Rooms</th>
                        <th>Available Rooms</th>
                        <th>Total Beds</th>
                        <th>Available Beds</th>
                        <th>Occupancy Rate</th>
                      </tr>
                    </thead>
                    <tbody>
                      {user?.assignedBlocks?.map((block) => {
                        const totalBeds = Math.max(0, block.totalBeds || 0);
                        const availableBeds = Math.min(totalBeds, Math.max(0, block.availableBeds || 0));
                        const totalRooms = Math.max(0, block.totalRooms || 0);
                        const availableRooms = Math.min(totalRooms, Math.max(0, block.availableRooms || 0));
                        const occupancyRate = totalBeds > 0 ? ((totalBeds - availableBeds) / totalBeds) * 100 : 0;

                        return (
                          <tr key={block._id}>
                            <td>{block.name}</td>
                            <td>{totalRooms}</td>
                            <td>{availableRooms}</td>
                            <td>{totalBeds}</td>
                            <td>{availableBeds}</td>
                            <td>
                              <div className="progress" style={{ height: '10px' }}>
                                <div 
                                  className={`progress-bar ${occupancyRate >= 90 ? 'bg-danger' : occupancyRate >= 70 ? 'bg-warning' : 'bg-success'}`}
                                  role="progressbar"
                                  style={{ width: `${occupancyRate}%` }}
                                  aria-valuenow={occupancyRate}
                                  aria-valuemin="0"
                                  aria-valuemax="100"
                                ></div>
                              </div>
                              <small>{occupancyRate.toFixed(0)}%</small>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
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
    </Container>
  );
};

export default BlockHeadDashboard;
